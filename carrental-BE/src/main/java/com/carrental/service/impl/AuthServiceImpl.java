package com.carrental.service.impl;

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
import com.carrental.web.RequestTraceFilter;
import jakarta.mail.MessagingException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

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
        if (jwt.getExpiresAt() == null || !jwt.getExpiresAt().isAfter(clock.instant())) {
            throw new AppException(ErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN);
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
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailFrom == null || mailFrom.isBlank()
                || mailUsername == null || mailUsername.isBlank()
                || mailPassword == null || mailPassword.isBlank()
                || mailSender == null) {
            throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE);
        }
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

        String plainText = "Xin chào " + customer.getFullName() + ",\n\n"
                + "Hãy xác minh địa chỉ email để hoàn tất đăng ký CarDB. Liên kết có hiệu lực trong 5 phút:\n"
                + verificationUrl + "\n\nNếu bạn không tạo tài khoản CarDB, hãy bỏ qua email này.";
        String html = verificationEmailHtml(customer.getFullName(), verificationUrl);
        try {
            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(mailFrom, "CarDB");
            helper.setTo(customer.getEmail());
            helper.setSubject("CarDB | Xác minh địa chỉ email");
            helper.setText(plainText, html);
            mailSender.send(message);
        } catch (MessagingException | MailException | UnsupportedEncodingException exception) {
            log.warn("Email delivery unavailable traceId={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), exception.getClass().getSimpleName());
            throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE, exception);
        }
    }

    private String verificationEmailHtml(String fullName, String verificationUrl) {
        return """
                <!doctype html>
                <html lang="vi">
                  <body style="margin:0;padding:32px 12px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#292d32;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e7e9ec;border-radius:12px;">
                      <tr><td style="padding:32px 36px 12px;">
                        <div style="font-size:25px;font-weight:700;letter-spacing:-1px;color:#252a30;">Car<span style="color:#ed7138;">DB</span></div>
                      </td></tr>
                      <tr><td style="padding:18px 36px 36px;">
                        <p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ed7138;">Hoàn tất đăng ký</p>
                        <h1 style="margin:0 0 18px;font-size:27px;line-height:1.3;color:#252a30;">Xác minh địa chỉ email</h1>
                        <p style="margin:0 0 12px;font-size:16px;line-height:1.6;">Xin chào %s,</p>
                        <p style="margin:0 0 26px;font-size:15px;line-height:1.7;color:#555d66;">Cảm ơn bạn đã đăng ký CarDB. Hãy xác minh email để hoàn tất tạo tài khoản.</p>
                        <p style="margin:0 0 26px;">
                          <a href="%s" style="display:inline-block;padding:14px 24px;border-radius:8px;background:#ed7138;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;">Xác minh email</a>
                        </p>
                        <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#555d66;">Liên kết này chỉ có hiệu lực trong <strong>5 phút</strong>. Sau thời gian đó, hãy yêu cầu gửi liên kết mới từ trang đăng nhập.</p>
                        <p style="margin:20px 0 0;padding-top:18px;border-top:1px solid #eceef0;font-size:13px;line-height:1.6;color:#737b84;">Nếu bạn không tạo tài khoản CarDB, hãy bỏ qua email này. Chúng tôi sẽ không xác minh tài khoản nếu không có thao tác của bạn.</p>
                      </td></tr>
                    </table>
                    <p style="margin:16px auto 0;max-width:600px;text-align:center;font-size:12px;color:#8b929a;">CarDB · Hỗ trợ khách hàng</p>
                  </body>
                </html>
                """.formatted(HtmlUtils.htmlEscape(fullName == null ? "bạn" : fullName),
                HtmlUtils.htmlEscape(verificationUrl));
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
