package com.carrental.service.impl;

import com.carrental.config.security.JwtProperties;
import com.carrental.dto.request.auth.AuthInputNormalizer;
import com.carrental.dto.request.auth.LoginRequest;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.TokenResponse;
import com.carrental.mapper.CustomerMapper;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.security.AccountUserDetails;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements com.carrental.service.AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final List<String> UNIQUE_CONSTRAINTS = List.of("uq_customers_email_lower", "customers_phone_key");

    private final CustomerRepository customers;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;
    private final Clock clock;

    public AuthServiceImpl(CustomerRepository customers, PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager, JwtEncoder jwtEncoder,
            JwtProperties jwtProperties, Clock clock) {
        this.customers = customers;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.jwtProperties = jwtProperties;
        this.clock = clock;
    }

    @Override
    @Transactional
    public CustomerProfileResponse register(RegisterRequest request) {
        String email = AuthInputNormalizer.email(request.getEmail());
        String fullName = AuthInputNormalizer.trimmed(request.getFullName());
        String phone = AuthInputNormalizer.trimmed(request.getPhone());
        if (customers.existsByEmailIgnoreCase(email) || customers.existsByPhone(phone)) {
            throw new AppException(ErrorCode.ACCOUNT_ALREADY_EXISTS);
        }

        Customer customer = new Customer();
        customer.setFullName(fullName);
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        customer.setRole(Role.CUSTOMER);
        customer.setStatus(CustomerStatus.ACTIVE);
        customer.setKycStatus(KycStatus.NONE);
        customer.setEmailVerified(false);
        try {
            Customer saved = customers.saveAndFlush(customer);
            return CustomerMapper.toProfile(saved);
        } catch (DataIntegrityViolationException exception) {
            String constraint = recognizedUniqueConstraint(exception);
            if (constraint != null) {
                log.info("Registration conflict traceId={} constraint={}", com.carrental.web.RequestTraceFilter.currentTraceId(), constraint);
                throw new AppException(ErrorCode.ACCOUNT_ALREADY_EXISTS, exception);
            }
            throw exception;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        String email = AuthInputNormalizer.email(request.getEmail());
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    org.springframework.security.authentication.UsernamePasswordAuthenticationToken.unauthenticated(
                            email, request.getPassword()));
        } catch (BadCredentialsException | LockedException | DisabledException | UsernameNotFoundException exception) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        }

        if (!(authentication.getPrincipal() instanceof AccountUserDetails account)) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        }
        Instant issuedAt = clock.instant().truncatedTo(ChronoUnit.SECONDS);
        Instant expiresAt = issuedAt.plus(jwtProperties.accessTokenTtl());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(jwtProperties.issuer())
                .audience(List.of(jwtProperties.audience()))
                .subject(account.customerId().toString())
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .build();
        JwsHeader headers = JwsHeader.with(SignatureAlgorithm.RS256).keyId("carrental-rs256").build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
        return new TokenResponse(token, "Bearer", jwtProperties.accessTokenTtl().toSeconds(),
                new TokenResponse.AccountSummary(account.customerId(), account.fullName(), account.role()));
    }

    private String recognizedUniqueConstraint(DataIntegrityViolationException exception) {
        for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
            if (cause instanceof ConstraintViolationException constraintViolation) {
                String name = constraintViolation.getConstraintName();
                SQLException sqlException = constraintViolation.getSQLException();
                if ("23505".equals(sqlException == null ? null : sqlException.getSQLState())
                        && UNIQUE_CONSTRAINTS.contains(name)) {
                    return name;
                }
            }
        }
        return null;
    }
}
