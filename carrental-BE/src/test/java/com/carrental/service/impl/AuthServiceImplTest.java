package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.carrental.config.security.JwtProperties;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import java.sql.SQLException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;

class AuthServiceImplTest {

    private final CustomerRepository customers = mock(CustomerRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final JwtEncoder jwtEncoder = mock(JwtEncoder.class);
    private final AuthServiceImpl service = new AuthServiceImpl(
            customers,
            passwordEncoder,
            jwtEncoder,
            new JwtProperties("issuer", "audience", Duration.ofMinutes(30), Duration.ofSeconds(30), "secret"),
            Clock.fixed(Instant.parse("2026-11-11T09:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh")));

    @Test
    void registerReportsExactDuplicateField() {
        when(passwordEncoder.encode("Password123@")).thenReturn("hashed");

        RegisterRequest request = registerRequest("new@example.com", "0939374773");

        when(customers.existsByEmailIgnoreCase("new@example.com")).thenReturn(false);
        when(customers.existsByPhone("0939374773")).thenReturn(true);
        assertThatThrownBy(() -> service.register(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.errorCode()).isEqualTo(ErrorCode.ACCOUNT_ALREADY_EXISTS);
                    assertThat(appEx.getMessage()).contains("Số điện thoại");
                });

        when(customers.existsByEmailIgnoreCase("new@example.com")).thenReturn(true);
        when(customers.existsByPhone("0939374773")).thenReturn(false);
        assertThatThrownBy(() -> service.register(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.errorCode()).isEqualTo(ErrorCode.ACCOUNT_ALREADY_EXISTS);
                    assertThat(appEx.getMessage()).contains("Email");
                });
    }

    @Test
    void concurrentUniqueConstraintMapsEmailOrPhoneSpecifically() {
        when(passwordEncoder.encode("Password123@")).thenReturn("hashed");
        when(customers.existsByEmailIgnoreCase("new@example.com")).thenReturn(false);
        when(customers.existsByPhone("0988777666")).thenReturn(false);

        SQLException sqlEx = new SQLException("duplicate key", "23505");
        ConstraintViolationException cve = new ConstraintViolationException("dup", sqlEx, "customers_phone_key");
        when(customers.saveAndFlush(org.mockito.ArgumentMatchers.any()))
                .thenThrow(new DataIntegrityViolationException("dup", cve));

        assertThatThrownBy(() -> service.register(registerRequest("new@example.com", "0988777666")))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.errorCode()).isEqualTo(ErrorCode.ACCOUNT_ALREADY_EXISTS);
                    assertThat(appEx.getMessage()).contains("Số điện thoại");
                });
    }

    private static RegisterRequest registerRequest(String email, String phone) {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("New User");
        req.setEmail(email);
        req.setPhone(phone);
        req.setPassword("Password123@");
        return req;
    }
}
