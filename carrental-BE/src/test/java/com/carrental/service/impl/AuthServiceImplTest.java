package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.carrental.config.security.JwtProperties;
import com.carrental.dto.request.auth.LoginRequest;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.dto.response.TokenResponse;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.service.EmailService;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.mockito.ArgumentCaptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

class AuthServiceImplTest {

    private final CustomerRepository customers = mock(CustomerRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final JwtEncoder jwtEncoder = mock(JwtEncoder.class);
    private final JwtDecoder jwtDecoder = mock(JwtDecoder.class);
    private final EmailService emailService = mock(EmailService.class);
    private final Instant now = Instant.parse("2026-01-01T00:00:00Z");
    private AuthServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AuthServiceImpl(customers, passwordEncoder, jwtEncoder, jwtDecoder,
                new JwtProperties("issuer", "audience", Duration.ofMinutes(30), Duration.ZERO, "x".repeat(32)),
                Clock.fixed(now, ZoneOffset.UTC), emailService, "http://localhost:3000");
        when(emailService.isConfigured()).thenReturn(true);
    }

    @Test
    void loginUsesNormalizedEmailAndReturnsDatabaseAccountSummary() {
        Customer customer = customer(CustomerStatus.ACTIVE, "$2a$10$" + "A".repeat(53));
        when(customers.findByEmailIgnoreCase("user@example.test")).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches("correct password", customer.getPasswordHash())).thenReturn(true);
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(
                Jwt.withTokenValue("test-access-token").header("alg", "HS256").subject("42").build());

        LoginRequest request = new LoginRequest();
        request.setEmail("  USER@EXAMPLE.TEST  ");
        request.setPassword("correct password");

        TokenResponse response = service.login(request);

        verify(customers).findByEmailIgnoreCase("user@example.test");
        verify(passwordEncoder).matches("correct password", customer.getPasswordHash());
        assertThat(response.accessToken()).isEqualTo("test-access-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.expiresIn()).isEqualTo(1800);
        assertThat(response.account()).isEqualTo(new TokenResponse.AccountSummary(42L, "Test Customer", Role.CUSTOMER));
    }

    @Test
    void unknownLockedAndWrongPasswordLoginsShareTheSameFailure() {
        LoginRequest request = loginRequest("password");
        when(customers.findByEmailIgnoreCase("user@example.test"))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(customer(CustomerStatus.LOCKED, "$2a$10$" + "B".repeat(53))))
                .thenReturn(Optional.of(customer(CustomerStatus.ACTIVE, "$2a$10$" + "C".repeat(53))));
        when(passwordEncoder.matches("password", "$2a$10$" + "C".repeat(53))).thenReturn(false);

        AppException unknown = loginFailure(request);
        AppException locked = loginFailure(request);
        AppException wrongPassword = loginFailure(request);

        assertThat(List.of(unknown, locked, wrongPassword))
                .extracting(AppException::errorCode)
                .containsOnly(ErrorCode.AUTHENTICATION_FAILED);
        assertThat(List.of(unknown, locked, wrongPassword))
                .extracting(AppException::getStatus)
                .containsOnly(ErrorCode.AUTHENTICATION_FAILED.status());
        assertThat(List.of(unknown, locked, wrongPassword))
                .extracting(Throwable::getMessage)
                .containsOnly(ErrorCode.AUTHENTICATION_FAILED.message());
        verify(passwordEncoder, never()).matches("password", "$2a$10$" + "B".repeat(53));
    }

    @Test
    void malformedOrPrefixedHashIsRejectedBeforePasswordMatching() {
        Customer customer = customer(CustomerStatus.ACTIVE, "{bcrypt}$2a$10$" + "D".repeat(53));
        when(customers.findByEmailIgnoreCase("user@example.test")).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> service.login(loginRequest("password")))
                .isInstanceOf(AppException.class)
                .extracting(exception -> ((AppException) exception).errorCode())
                .isEqualTo(ErrorCode.AUTHENTICATION_FAILED);
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void unverifiedCustomerCannotLoginEvenWithCorrectPassword() {
        Customer customer = customer(CustomerStatus.ACTIVE, "$2a$10$" + "E".repeat(53));
        customer.setEmailVerified(false);
        when(customers.findByEmailIgnoreCase("user@example.test")).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches("password", customer.getPasswordHash())).thenReturn(true);

        assertThatThrownBy(() -> service.login(loginRequest("password")))
                .isInstanceOf(AppException.class)
                .extracting(exception -> ((AppException) exception).errorCode())
                .isEqualTo(ErrorCode.EMAIL_VERIFICATION_REQUIRED);
    }

    @Test
    void registrationSendsSignedVerificationLinkAndReturnsUnverifiedProfile() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("New Customer");
        request.setEmail("new@example.test");
        request.setPhone("0912345678");
        request.setPassword("Good password 123!");
        when(passwordEncoder.encode(request.getPassword())).thenReturn("$2a$10$" + "F".repeat(53));
        when(customers.existsByEmailIgnoreCase(request.getEmail())).thenReturn(false);
        when(customers.existsByPhone(request.getPhone())).thenReturn(false);
        when(customers.saveAndFlush(any(Customer.class))).thenAnswer(invocation -> {
            Customer saved = invocation.getArgument(0);
            saved.setId(43L);
            return saved;
        });
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(
                Jwt.withTokenValue("signed-verification-token").header("alg", "HS256")
                        .subject("43").build());

        var response = service.register(request);

        assertThat(response.emailVerified()).isFalse();
        ArgumentCaptor<String> subject = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> plainText = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> html = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendHtmlEmail(eq("new@example.test"), subject.capture(), plainText.capture(), html.capture());
        assertThat(subject.getValue()).isEqualTo("Xác minh email CarDB");
        assertThat(plainText.getValue()).contains(
                "http://localhost:3000/verify-email#token=signed-verification-token",
                "5 phút");
        assertThat(html.getValue()).contains("Xác minh email", "href=", "5 phút")
                .doesNotContain("<script>");
        ArgumentCaptor<JwtEncoderParameters> jwtParameters = ArgumentCaptor.forClass(JwtEncoderParameters.class);
        verify(jwtEncoder).encode(jwtParameters.capture());
        assertThat(jwtParameters.getValue().getClaims().getExpiresAt()).isEqualTo(now.plusSeconds(300));
    }

    @Test
    void verifyEmailMarksTheMatchingCurrentCustomerVerified() {
        Customer customer = customer(CustomerStatus.ACTIVE, "$2a$10$" + "G".repeat(53));
        customer.setEmailVerified(false);
        when(jwtDecoder.decode("verification-token")).thenReturn(Jwt.withTokenValue("verification-token")
                .header("alg", "HS256")
                .issuer("issuer")
                .audience(List.of("audience", "email-verification"))
                .subject("42")
                .issuedAt(now)
                .expiresAt(now.plus(Duration.ofMinutes(30)))
                .claim("purpose", "email_verification")
                .claim("email", "user@example.test")
                .build());
        when(customers.findById(42L)).thenReturn(Optional.of(customer));

        service.verifyEmail("verification-token");

        assertThat(customer.getEmailVerified()).isTrue();
        verify(customers).flush();
    }

    private AppException loginFailure(LoginRequest request) {
        try {
            service.login(request);
            throw new AssertionError("Login should be rejected");
        } catch (AppException exception) {
            return exception;
        }
    }

    private LoginRequest loginRequest(String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.test");
        request.setPassword(password);
        return request;
    }

    private Customer customer(CustomerStatus status, String passwordHash) {
        Customer customer = new Customer();
        customer.setId(42L);
        customer.setEmail("user@example.test");
        customer.setFullName("Test Customer");
        customer.setPasswordHash(passwordHash);
        customer.setRole(Role.CUSTOMER);
        customer.setStatus(status);
        customer.setEmailVerified(true);
        return customer;
    }
}
