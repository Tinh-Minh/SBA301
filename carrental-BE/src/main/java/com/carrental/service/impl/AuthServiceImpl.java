package com.carrental.service.impl;

import com.carrental.config.security.JwtProperties;
import com.carrental.dto.request.auth.AuthInputNormalizer;
import com.carrental.dto.request.auth.ChangePasswordRequest;
import com.carrental.dto.request.auth.LoginRequest;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.dto.response.TokenResponse;
import com.carrental.entity.Customer;
import com.carrental.enums.Role;
import com.carrental.enums.CustomerStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.AuthService;
import com.carrental.service.EmailService;
import com.carrental.service.MailRateLimiter;
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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mail.MailException;
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
import org.springframework.web.util.HtmlUtils;
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
    private static final Duration EMAIL_VERIFICATION_TTL = Duration.ofMinutes(5);
    private static final Duration RESEND_COOLDOWN = Duration.ofMinutes(1);

    private final CustomerRepository customers;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final JwtProperties jwtProperties;
    private final Clock clock;
    private final EmailService emailService;
    private final String frontendBaseUrl;
    private final MailRateLimiter mailRateLimiter;
    private final Map<String, Instant> resendRequests = new HashMap<>();

    public AuthServiceImpl(CustomerRepository customers, PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            JwtDecoder jwtDecoder, JwtProperties jwtProperties, Clock clock,
            EmailService emailService,
            String frontendBaseUrl) {
        this(customers, passwordEncoder, jwtEncoder, jwtDecoder, jwtProperties, clock,
                emailService, frontendBaseUrl,
                new MailRateLimiter(clock));
    }

    @Autowired
    public AuthServiceImpl(CustomerRepository customers, PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            JwtDecoder jwtDecoder, JwtProperties jwtProperties, Clock clock,
            EmailService emailService,
            @Value("${app.frontend.base-url:http://localhost:3000}") String frontendBaseUrl,
            MailRateLimiter mailRateLimiter) {
        this.customers = customers;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
        this.jwtProperties = jwtProperties;
        this.clock = clock;
        this.emailService = emailService;
        this.frontendBaseUrl = frontendBaseUrl;
        this.mailRateLimiter = mailRateLimiter != null ? mailRateLimiter : new MailRateLimiter(clock);
    }

    @Override
    @Transactional
    public CustomerProfileResponse register(RegisterRequest request) {
        return register(request, "127.0.0.1");
    }

    @Override
    @Transactional
    public CustomerProfileResponse register(RegisterRequest request, String clientIp) {
        Customer customer = request.toEntity(passwordEncoder.encode(request.getPassword()));
        if (customers.existsByEmailIgnoreCase(customer.getEmail()) || customers.existsByPhone(customer.getPhone())) {
            throw new AppException(ErrorCode.ACCOUNT_ALREADY_EXISTS);
        }
        mailRateLimiter.checkAndRecord(customer.getEmail(), clientIp);
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
        resendVerification(email, "127.0.0.1");
    }

    @Override
    @Transactional
    public void resendVerification(String email, String clientIp) {
        String normalizedEmail = AuthInputNormalizer.email(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) return;

        mailRateLimiter.checkAndRecord(normalizedEmail, clientIp);

        customers.findByEmailIgnoreCase(normalizedEmail)
                .filter(customer -> customer.getRole() == Role.CUSTOMER)
                .filter(customer -> !Boolean.TRUE.equals(customer.getEmailVerified()))
                .ifPresent(this::sendVerificationEmail);
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

        if (emailService == null || !emailService.isConfigured()) {
            log.warn("auth-verification-email-skipped reason=mail_unconfigured customerId={}", customer.getId());
            throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE);
        }

        String subject = "Xác minh email CarDB";
        String plainTextBody = "Xin chào " + customer.getFullName() + ",\n\n"
                + "Vui lòng mở liên kết sau để xác minh email CarDB của bạn (có hiệu lực trong 5 phút):\n"
                + verificationUrl + "\n\nNếu bạn không tạo tài khoản, hãy bỏ qua email này.";
        String safeName = HtmlUtils.htmlEscape(customer.getFullName() == null ? "Quý khách" : customer.getFullName());
        String safeUrl = HtmlUtils.htmlEscape(verificationUrl);
        String htmlBody = """
                <!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,sans-serif;color:#252525">
                  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
                    <div style="font-size:24px;font-weight:700;color:#f2763d">CarDB</div>
                    <h1 style="font-size:24px;margin:24px 0 12px">Xác minh email</h1>
                    <p>Xin chào %s,</p>
                    <p>Vui lòng xác minh địa chỉ email để hoàn tất đăng ký tài khoản CarDB.</p>
                    <p style="margin:28px 0"><a href="%s" style="display:inline-block;background:#f2763d;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:8px">Xác minh email</a></p>
                    <p style="color:#666">Liên kết có hiệu lực trong 5 phút. Nếu bạn không tạo tài khoản, hãy bỏ qua email này.</p>
                    <p style="font-size:12px;color:#777">Trân trọng,<br>Đội ngũ CarDB</p>
                  </div>
                </body></html>
                """.formatted(safeName, safeUrl);
        try {
            emailService.sendHtmlEmail(customer.getEmail(), subject, plainTextBody, htmlBody);
        } catch (MailException exception) {
            log.warn("Email delivery unavailable traceId={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(),
                    exception.getClass().getSimpleName());
            throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE, exception);
        }
    }

    private TokenResponse issueToken(Customer customer) {
        Instant issuedAt = clock.instant().truncatedTo(ChronoUnit.SECONDS);
        Instant expiresAt = issuedAt.plus(jwtProperties.accessTokenTtl());
        long pwdEpoch = customer.getPasswordChangedAt() != null
                ? customer.getPasswordChangedAt().atZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).toEpochSecond()
                : 0L;
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(jwtProperties.issuer())
                .audience(List.of(jwtProperties.audience()))
                .subject(customer.getId().toString())
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .claim("pca", pwdEpoch)
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

        // 1. Kiểm tra mật khẩu cũ khớp BCrypt không
        if (!passwordEncoder.matches(request.getCurrentPassword(), customer.getPasswordHash())) {
            throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT, "Mật khẩu hiện tại không chính xác",
                    List.of(new FieldErrorResponse("currentPassword", "Mật khẩu hiện tại không chính xác")));
        }

        // 2. Không cho trùng mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), customer.getPasswordHash())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mật khẩu mới không được trùng với mật khẩu hiện tại",
                    List.of(new FieldErrorResponse("newPassword", "Mật khẩu mới không được trùng với mật khẩu hiện tại")));
        }

        // 3. Cập nhật mật khẩu mới và thời điểm đổi mật khẩu để vô hiệu hóa token cũ
        customer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        java.time.LocalDateTime newChangedAt = java.time.LocalDateTime.ofInstant(
                clock.instant().truncatedTo(ChronoUnit.SECONDS), java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        if (customer.getPasswordChangedAt() != null && !newChangedAt.isAfter(customer.getPasswordChangedAt())) {
            newChangedAt = customer.getPasswordChangedAt().plusSeconds(1);
        }
        customer.setPasswordChangedAt(newChangedAt);
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
