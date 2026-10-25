package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.carrental.config.security.JwtProperties;
import com.carrental.dto.request.auth.LoginRequest;
import com.carrental.dto.response.TokenResponse;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

class AuthServiceImplTest {

    private final CustomerRepository customers = mock(CustomerRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final JwtEncoder jwtEncoder = mock(JwtEncoder.class);
    private final Instant now = Instant.parse("2026-01-01T00:00:00Z");
    private AuthServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AuthServiceImpl(customers, passwordEncoder, jwtEncoder,
                new JwtProperties("issuer", "audience", Duration.ofMinutes(30), Duration.ZERO, "x".repeat(32)),
                Clock.fixed(now, ZoneOffset.UTC));
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
        return customer;
    }
}
