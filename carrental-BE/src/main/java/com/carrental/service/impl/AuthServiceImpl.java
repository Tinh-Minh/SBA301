package com.carrental.service.impl;

import com.carrental.config.MailEnvironmentStartupLogger;
import com.carrental.config.security.JwtProperties;
import com.carrental.dto.request.auth.AuthInputNormalizer;
import com.carrental.dto.request.auth.ChangePasswordRequest;
import com.carrental.dto.request.auth.LoginRequest;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.TokenResponse;
import com.carrental.entity.Customer;
import com.carrental.enums.Role;
import com.carrental.enums.CustomerStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.AuthService;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import com.carrental.web.RequestTraceFilter;

@Slf4j
@Service
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private static final List<String> UNIQUE_CONSTRAINTS = List.of("uq_customers_email_lower", "customers_phone_key");
    private static final Pattern BCRYPT_HASH = Pattern.compile(
            "^\\$2[aby]\\$(0[4-9]|[12][0-9]|3[01])\\$[./A-Za-z0-9]{53}$");
    private static final String EMAIL_VERIFICATION_PURPOSE = "email_verification";
    private static final String EMAIL_VERIFICATION_AUDIENCE = "email-verification";
    private static final Duration EMAIL_VERIFICATION_TTL = Duration.ofMinutes(30);
    private static final Duration RESEND_COOLDOWN = Duration.ofMinutes(1);

    private final CustomerRepository customers;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final JwtProperties jwtProperties;
    private final Clock clock;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String frontendBaseUrl;
    private final String mailFrom;
    private final String mailUsername;
    private final String mailPassword;
    private final Map<String, Instant> resendRequests = new HashMap<>();

    @Autowired
    public AuthServiceImpl(CustomerRepository customers, PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            JwtDecoder jwtDecoder, JwtProperties jwtProperties, Clock clock,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.frontend.base-url:http://localhost:3000}") String frontendBaseUrl,
            @Value("${app.mail.from:}") String mailFrom,
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${spring.mail.password:}") String mailPassword) {
        this.customers = customers;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
        this.jwtProperties = jwtProperties;
        this.clock = clock;
        this.mailSenderProvider = mailSenderProvider;
        this.frontendBaseUrl = frontendBaseUrl;
        this.mailFrom = mailFrom;
        this.mailUsername = mailUsername;
        this.mailPassword = mailPassword;
    }

    @Override
    @Transactional
    public CustomerProfileResponse register(RegisterRequest request) {
        Customer customer = request.toEntity(passwordEncoder.encode(request.getPassword()));
        if (customers.existsByEmailIgnoreCase(customer.getEmail()) || customers.existsByPhone(customer.getPhone())) {
            throw new AppException(ErrorCode.ACCOUNT_ALREADY_EXISTS);
        }
        try {
            Customer saved = customers.saveAndFlush(customer);
            sendVerificationEmail(saved);
            log.info("auth-register customerId={}", saved.getId());
            return CustomerProfileResponse.from(saved);
        } catch (DataIntegrityViolationException exception) {
            if (isAccountUniqueViolation(exception)) throw new AppException(ErrorCode.ACCOUNT_ALREADY_EXISTS, exception);
            throw exception;
        }
    }

    @Override
    public TokenResponse login(LoginRequest request) {
        String email = AuthInputNormalizer.email(request.getEmail());
        Customer customer = customers.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHENTICATION_FAILED));
        String passwordHash = customer.getPasswordHash();
        if (customer.getStatus() != CustomerStatus.ACTIVE
                || passwordHash == null
                || !BCRYPT_HASH.matcher(passwordHash).matches()
                || !passwordEncoder.matches(request.getPassword(), passwordHash)) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        }
        if (customer.getRole() == Role.CUSTOMER
                && !Boolean.TRUE.equals(customer.getEmailVerified())) {
            throw new AppException(ErrorCode.EMAIL_VERIFICATION_REQUIRED);
        }
        return issueToken(customer);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        Jwt jwt;
        try {
            jwt = jwtDecoder.decode(token);
        } catch (JwtException | IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN, exception);
        }
        String email = jwt.getClaimAsString("email");
        List<String> audience = jwt.getAudience();
        if (!EMAIL_VERIFICATION_PURPOSE.equals(jwt.getClaimAsString("purpose"))
                || audience == null || !audience.contains(EMAIL_VERIFICATION_AUDIENCE)
                || email == null || email.isBlank()) {
            throw new AppException(ErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN);
        }

        long customerId;
        try {
            customerId = Long.parseLong(jwt.getSubject());
            if (customerId <= 0) throw new NumberFormatException();
        } catch (RuntimeException exception) {
            throw new AppException(ErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN, exception);
        }
        Customer customer = customers.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN));
        if (customer.getRole() != Role.CUSTOMER
                || !customer.getEmail().equalsIgnoreCase(email)) {
            throw new AppException(ErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN);
        }
        if (!Boolean.TRUE.equals(customer.getEmailVerified())) {
            customer.setEmailVerified(true);
            customers.flush();
        }
        log.info("auth-email-verified customerId={}", customerId);
    }

    @Override
    @Transactional
    public void resendVerification(String email) {
        String normalizedEmail = AuthInputNormalizer.email(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) return;
        customers.findByEmailIgnoreCase(normalizedEmail)
                .filter(customer -> customer.getRole() == Role.CUSTOMER)
                .filter(customer -> !Boolean.TRUE.equals(customer.getEmailVerified()))
                .ifPresent(customer -> {
                    Instant now = clock.instant();
                    if (!claimResend(normalizedEmail, now)) return;
                    try {
                        sendVerificationEmail(customer);
                    } catch (RuntimeException exception) {
                        releaseResend(normalizedEmail, now);
                        throw exception;
                    }
                });
    }

    private boolean claimResend(String email, Instant now) {
        synchronized (resendRequests) {
            resendRequests.entrySet().removeIf(entry ->
                    !entry.getValue().plus(RESEND_COOLDOWN).isAfter(now));
            Instant previous = resendRequests.get(email);
            if (previous != null && previous.plus(RESEND_COOLDOWN).isAfter(now)) return false;
            resendRequests.put(email, now);
            return true;
        }
    }

    private void releaseResend(String email, Instant attemptedAt) {
        synchronized (resendRequests) {
            resendRequests.remove(email, attemptedAt);
        }
    }

    private void sendVerificationEmail(Customer customer) {
        Instant issuedAt = clock.instant().truncatedTo(ChronoUnit.SECONDS);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(jwtProperties.issuer())
                .audience(List.of(jwtProperties.audience(), EMAIL_VERIFICATION_AUDIENCE))
                .subject(customer.getId().toString())
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(EMAIL_VERIFICATION_TTL))
                .id(UUID.randomUUID().toString())
                .claim("purpose", EMAIL_VERIFICATION_PURPOSE)
                .claim("email", customer.getEmail())
                .build();
        JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
        String baseUrl = frontendBaseUrl.replaceAll("/+$", "");
        String verificationUrl = UriComponentsBuilder.fromUriString(baseUrl)
                .path("/verify-email")
                .fragment("token=" + token)
                .build()
                .toUriString();

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailFrom == null || mailFrom.isBlank()
                || mailUsername == null || mailUsername.isBlank()
                || mailPassword == null || mailPassword.isBlank()
                || mailSender == null) {
            log.warn("Dịch vụ gửi email chưa được cấu hình. Link xác minh email cho {}: {}", customer.getEmail(), verificationUrl);
            customer.setEmailVerified(true);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(customer.getEmail());
        message.setSubject("Xác minh email CarDB");
        message.setText("Xin chào " + customer.getFullName() + ",\n\n"
                + "Vui lòng mở liên kết sau để xác minh email CarDB của bạn (có hiệu lực trong 30 phút):\n"
                + verificationUrl + "\n\nNếu bạn không tạo tài khoản, hãy bỏ qua email này.");
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            log.warn("Email delivery unavailable traceId={} exceptionType={} detail={}",
                    RequestTraceFilter.currentTraceId(),
                    exception.getClass().getSimpleName(),
                    MailEnvironmentStartupLogger.summarizeMailFailure(exception, customer.getEmail()));
            throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE, exception);
        }
    }

    private TokenResponse issueToken(Customer customer) {
        Instant issuedAt = clock.instant().truncatedTo(ChronoUnit.SECONDS);
        Instant expiresAt = issuedAt.plus(jwtProperties.accessTokenTtl());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(jwtProperties.issuer())
                .audience(List.of(jwtProperties.audience()))
                .subject(customer.getId().toString())
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .build();
        JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
        return new TokenResponse(token, "Bearer", jwtProperties.accessTokenTtl().toSeconds(),
                new TokenResponse.AccountSummary(customer.getId(), customer.getFullName(), customer.getRole()));
    }

    @Override
    @Transactional
    public void changePassword(CurrentAccount account, ChangePasswordRequest request) {
        if (account == null) throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        Customer customer = customers.findWithLockById(account.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.AUTHENTICATION_FAILED));
        if (customer.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        if (!passwordEncoder.matches(request.getCurrentPassword(), customer.getPasswordHash())) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        }
        customer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        // Vô hiệu mọi token đã cấp trước lần đổi mật khẩu này (làm tròn xuống giây vì iat của JWT tính theo giây)
        customer.setPasswordChangedAt(java.time.LocalDateTime.ofInstant(
                clock.instant().truncatedTo(ChronoUnit.SECONDS), java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
        log.info("auth-change-password customerId={}", customer.getId());
    }

    private boolean isAccountUniqueViolation(Throwable exception) {
        for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
            if (cause instanceof ConstraintViolationException violation && violation.getSQLException() != null
                    && "23505".equals(violation.getSQLException().getSQLState())
                    && UNIQUE_CONSTRAINTS.contains(violation.getConstraintName())) return true;
        }
        return false;
    }
}
