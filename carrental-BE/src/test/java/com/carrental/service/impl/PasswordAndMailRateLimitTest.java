package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.carrental.config.CustomerProperties;
import com.carrental.config.security.JwtProperties;
import com.carrental.dto.request.auth.ChangePasswordRequest;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.dto.response.TokenResponse;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.security.CurrentAccountJwtAuthenticationConverter;
import com.carrental.security.InvalidCurrentAccountException;
import com.carrental.service.MailRateLimiter;
import com.carrental.service.PublicImageStorageService;
import jakarta.persistence.EntityManager;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.util.ReflectionTestUtils;

class PasswordAndMailRateLimitTest {

    private final AtomicReference<Instant> currentInstant = new AtomicReference<>(Instant.parse("2026-06-01T10:00:00Z"));
    private final Clock clock = new Clock() {
        @Override public ZoneId getZone() { return ZoneId.of("Asia/Ho_Chi_Minh"); }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return currentInstant.get(); }
    };

    private MailRateLimiter rateLimiter;
    private CustomerRepository customers;
    private PasswordEncoder passwordEncoder;
    private JwtEncoder jwtEncoder;
    private JwtDecoder jwtDecoder;
    private ObjectProvider<JavaMailSender> mailSenderProvider;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        rateLimiter = new MailRateLimiter(clock);
        customers = mock(CustomerRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        jwtEncoder = mock(JwtEncoder.class);
        jwtDecoder = mock(JwtDecoder.class);
        mailSenderProvider = mock(ObjectProvider.class);

        JwtProperties jwtProps = new JwtProperties("test-issuer", "test-audience", Duration.ofMinutes(30), Duration.ZERO, "x".repeat(32));
        authService = new AuthServiceImpl(
                customers, passwordEncoder, jwtEncoder, jwtDecoder, jwtProps, clock,
                mailSenderProvider, "http://localhost:3000", "sender@test.local",
                "key", "secret", rateLimiter);
    }

    // =========================================================================
    // Issue 5: Mail Rate Limiter Tests
    // =========================================================================

    @Test
    @DisplayName("Email rate limiter: First 3 sends with cooldown pass, 4th send within 10 minutes throws 429")
    void emailRateLimiterEnforcesCooldownAndMaxLimit() {
        String email = "customer@test.local";
        String ip = "1.2.3.4";

        // 1st send: OK
        rateLimiter.checkAndRecord(email, ip);

        // Immediate 2nd send: fails with cooldown 429
        assertThatThrownBy(() -> rateLimiter.checkAndRecord(email, "5.6.7.8"))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                    assertThat(appEx.errorCode()).isEqualTo(ErrorCode.TOO_MANY_REQUESTS);
                    assertThat(appEx.getMessage()).contains("Vui lòng chờ");
                });

        // Advance 61 seconds: cooldown expired
        currentInstant.set(currentInstant.get().plusSeconds(61));

        // 2nd send after cooldown: OK
        rateLimiter.checkAndRecord(email, "5.6.7.8");

        // Advance another 61 seconds
        currentInstant.set(currentInstant.get().plusSeconds(61));

        // 3rd send: OK (now 3 sends used in 10-minute window)
        rateLimiter.checkAndRecord(email, "9.10.11.12");

        // Advance another 61 seconds (total elapsed = ~3 minutes, still within 10-min window)
        currentInstant.set(currentInstant.get().plusSeconds(61));

        // 4th send: exceeds 3 attempts in 10 minutes -> 429
        assertThatThrownBy(() -> rateLimiter.checkAndRecord(email, "13.14.15.16"))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                    assertThat(appEx.errorCode()).isEqualTo(ErrorCode.TOO_MANY_REQUESTS);
                    assertThat(appEx.getMessage()).contains("vượt quá giới hạn 3 lần");
                });

        // Advance 10 minutes from the first attempt
        currentInstant.set(Instant.parse("2026-06-01T10:10:01Z"));

        // Window has slid, oldest attempt pruned -> succeeds!
        rateLimiter.checkAndRecord(email, "13.14.15.16");
    }

    @Test
    @DisplayName("IP rate limiter: Blocks requests exceeding IP rate limit")
    void ipRateLimiterEnforcesIpLimit() {
        String ip = "192.168.1.100";

        for (int i = 0; i < MailRateLimiter.MAX_IP_ATTEMPTS; i++) {
            currentInstant.set(currentInstant.get().plusSeconds(6)); // beyond 5s IP cooldown
            rateLimiter.checkAndRecord("user" + i + "@test.local", ip);
        }

        // 11th request from same IP within 10 minutes
        currentInstant.set(currentInstant.get().plusSeconds(6));
        assertThatThrownBy(() -> rateLimiter.checkAndRecord("another@test.local", ip))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                    assertThat(appEx.errorCode()).isEqualTo(ErrorCode.TOO_MANY_REQUESTS);
                    assertThat(appEx.getMessage()).contains("Địa chỉ IP của bạn đã gửi quá nhiều yêu cầu");
                });
    }

    // =========================================================================
    // Issue 1: Password Change & Token Invalidation Tests
    // =========================================================================

    @Test
    @DisplayName("Change password: Wrong current password throws 401 with field currentPassword")
    void changePasswordWrongCurrentPasswordThrows401WithField() {
        Customer customer = Customer.builder()
                .email("test@example.com")
                .passwordHash(passwordEncoder.encode("OldPassword123"))
                .role(Role.CUSTOMER)
                .status(CustomerStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(customer, "id", 10L);
        when(customers.findWithLockById(10L)).thenReturn(Optional.of(customer));

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("IncorrectOldPassword");
        request.setNewPassword("NewSecurePassword456");

        CurrentAccount account = new CurrentAccount(10L, Role.CUSTOMER);

        assertThatThrownBy(() -> authService.changePassword(account, request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.errorCode()).isEqualTo(ErrorCode.AUTHENTICATION_FAILED);
                    assertThat(appEx.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(appEx.fieldErrors()).isNotEmpty();
                    assertThat(appEx.fieldErrors().get(0).field()).isEqualTo("currentPassword");
                });
    }

    @Test
    @DisplayName("Change password: New password same as old password throws 400 with field newPassword")
    void changePasswordSameAsOldPasswordThrows400WithField() {
        Customer customer = Customer.builder()
                .email("test@example.com")
                .passwordHash(passwordEncoder.encode("SameOldPassword123"))
                .role(Role.CUSTOMER)
                .status(CustomerStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(customer, "id", 10L);
        when(customers.findWithLockById(10L)).thenReturn(Optional.of(customer));

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("SameOldPassword123");
        request.setNewPassword("SameOldPassword123");

        CurrentAccount account = new CurrentAccount(10L, Role.CUSTOMER);

        assertThatThrownBy(() -> authService.changePassword(account, request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.errorCode()).isEqualTo(ErrorCode.VALIDATION_ERROR);
                    assertThat(appEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(appEx.fieldErrors()).isNotEmpty();
                    assertThat(appEx.fieldErrors().get(0).field()).isEqualTo("newPassword");
                    assertThat(appEx.getMessage()).contains("Mật khẩu mới không được trùng");
                });
    }

    @Test
    @DisplayName("Change password: Old token is immediately invalidated by JwtAuthenticationConverter")
    void changePasswordInvalidatesOldToken() {
        Customer customer = Customer.builder()
                .email("test@example.com")
                .passwordHash(passwordEncoder.encode("ValidOldPass123"))
                .role(Role.CUSTOMER)
                .status(CustomerStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(customer, "id", 10L);
        when(customers.findWithLockById(10L)).thenReturn(Optional.of(customer));
        when(customers.findById(10L)).thenReturn(Optional.of(customer));

        // Token issued prior to change (pca = 0 or epoch T0)
        Jwt oldJwt = mock(Jwt.class);
        when(oldJwt.getSubject()).thenReturn("10");
        when(oldJwt.getIssuedAt()).thenReturn(currentInstant.get());
        when(oldJwt.getClaims()).thenReturn(Map.of("pca", 0L));

        CurrentAccountJwtAuthenticationConverter converter = new CurrentAccountJwtAuthenticationConverter(customers);

        // Before change: old token is valid
        assertThat(converter.convert(oldJwt)).isNotNull();

        // Perform password change
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("ValidOldPass123");
        request.setNewPassword("BrandNewPass456");
        authService.changePassword(new CurrentAccount(10L, Role.CUSTOMER), request);

        // Verify customer password hash updated and passwordChangedAt set
        assertThat(customer.getPasswordChangedAt()).isNotNull();
        assertThat(passwordEncoder.matches("BrandNewPass456", customer.getPasswordHash())).isTrue();

        // After change: Old token convert must throw InvalidCurrentAccountException
        assertThatThrownBy(() -> converter.convert(oldJwt))
                .isInstanceOf(InvalidCurrentAccountException.class);

        // New token with current pca is valid
        long newPca = customer.getPasswordChangedAt().atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toEpochSecond();
        Jwt newJwt = mock(Jwt.class);
        when(newJwt.getSubject()).thenReturn("10");
        when(newJwt.getIssuedAt()).thenReturn(currentInstant.get());
        when(newJwt.getClaims()).thenReturn(Map.of("pca", newPca));

        assertThat(converter.convert(newJwt)).isNotNull();
    }

    // =========================================================================
    // Issue 6: Avatar Upload & URL rejection Tests
    // =========================================================================

    @Test
    @DisplayName("Customer service: uploadAvatar saves file through PublicImageStorageService and sets avatarUrl")
    void uploadAvatarSavesFileAndSetsCustomerAvatar() {
        PublicImageStorageService storage = mock(PublicImageStorageService.class);
        EntityManager em = mock(EntityManager.class);
        CustomerProperties props = new CustomerProperties();

        Customer customer = Customer.builder()
                .email("user@test.local")
                .role(Role.CUSTOMER)
                .status(CustomerStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(customer, "id", 15L);

        when(customers.findWithLockById(15L)).thenReturn(Optional.of(customer));
        when(storage.storeImage(any())).thenReturn("/api/uploads/files/11111111-2222-3333-4444-555555555555.jpg");

        CustomerServiceImpl customerService = new CustomerServiceImpl(
                customers, em, props, clock, authService, null, storage);

        MockMultipartFile file = new MockMultipartFile("file", "avatar.jpg", "image/jpeg", new byte[]{1, 2, 3});
        CustomerProfileResponse res = customerService.uploadAvatar(new CurrentAccount(15L, Role.CUSTOMER), file);

        assertThat(res.avatarUrl()).isEqualTo("/api/uploads/files/11111111-2222-3333-4444-555555555555.jpg");
        assertThat(customer.getAvatarUrl()).isEqualTo("/api/uploads/files/11111111-2222-3333-4444-555555555555.jpg");
    }

    @Test
    @DisplayName("Validation: Rejects external URLs and accepts server-generated internal paths across all photo/doc DTOs")
    void beanValidationRejectsExternalUrlsInAllPhotoAndDocumentRequests() {
        jakarta.validation.Validator validator = jakarta.validation.Validation.buildDefaultValidatorFactory().getValidator();

        // 1. CarImageRequest
        com.carrental.dto.request.CarImageRequest badCarImg = com.carrental.dto.request.CarImageRequest.builder()
                .imageUrl("https://cdn.attacker.com/car.jpg")
                .build();
        assertThat(validator.validate(badCarImg)).isNotEmpty();

        com.carrental.dto.request.CarImageRequest goodCarImg = com.carrental.dto.request.CarImageRequest.builder()
                .imageUrl("/api/uploads/files/12345678-1234-1234-1234-123456789abc.jpg")
                .build();
        assertThat(validator.validate(goodCarImg)).isEmpty();

        // 2. CarDocumentRequest
        com.carrental.dto.request.CarDocumentRequest badCarDoc = com.carrental.dto.request.CarDocumentRequest.builder()
                .docType(com.carrental.enums.CarDocumentType.REGISTRATION)
                .fileUrl("http://evil.com/doc.png")
                .build();
        assertThat(validator.validate(badCarDoc)).isNotEmpty();

        com.carrental.dto.request.CarDocumentRequest goodCarDoc = com.carrental.dto.request.CarDocumentRequest.builder()
                .docType(com.carrental.enums.CarDocumentType.REGISTRATION)
                .fileUrl("/api/uploads/files/cavet-123.jpg")
                .build();
        assertThat(validator.validate(goodCarDoc)).isEmpty();

        // 3. SafetyRecordRequest
        com.carrental.dto.safety.SafetyDtos.SafetyRecordRequest badSafety = new com.carrental.dto.safety.SafetyDtos.SafetyRecordRequest(
                com.carrental.enums.SafetyRecordType.INSPECTION,
                java.time.LocalDate.now(),
                null, "Provider", "REF123", 1000,
                com.carrental.enums.SafetyRecordResult.PASSED, "Note",
                "https://unsafe.com/report.pdf");
        assertThat(validator.validate(badSafety)).isNotEmpty();

        com.carrental.dto.safety.SafetyDtos.SafetyRecordRequest goodSafety = new com.carrental.dto.safety.SafetyDtos.SafetyRecordRequest(
                com.carrental.enums.SafetyRecordType.INSPECTION,
                java.time.LocalDate.now(),
                null, "Provider", "REF123", 1000,
                com.carrental.enums.SafetyRecordResult.PASSED, "Note",
                "/api/uploads/files/safety-report.jpg");
        assertThat(validator.validate(goodSafety)).isEmpty();

        // 4. HandoverItemInput
        com.carrental.dto.booking.BookingDtos.HandoverItemInput badHandover =
                new com.carrental.dto.booking.BookingDtos.HandoverItemInput(
                        com.carrental.enums.HandoverCategory.EXTERIOR_FRONT,
                        "https://external.com/front.jpg",
                        "Clean");
        assertThat(validator.validate(badHandover)).isNotEmpty();

        com.carrental.dto.booking.BookingDtos.HandoverItemInput goodHandover =
                new com.carrental.dto.booking.BookingDtos.HandoverItemInput(
                        com.carrental.enums.HandoverCategory.EXTERIOR_FRONT,
                        "/api/uploads/files/handover-front.jpg",
                        "Clean");
        assertThat(validator.validate(goodHandover)).isEmpty();
    }
}
