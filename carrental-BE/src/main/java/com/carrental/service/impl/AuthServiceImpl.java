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
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.regex.Pattern;
import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
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
    private static final Pattern BCRYPT_HASH = Pattern.compile(
            "^\\$2[aby]\\$(0[4-9]|[12][0-9]|3[01])\\$[./A-Za-z0-9]{53}$");

    private final CustomerRepository customers;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;
    private final Clock clock;

    public AuthServiceImpl(CustomerRepository customers, PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder, JwtProperties jwtProperties, Clock clock) {
        this.customers = customers;
        this.passwordEncoder = passwordEncoder;
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
        Customer customer = customers.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHENTICATION_FAILED));
        String passwordHash = customer.getPasswordHash();
        if (customer.getStatus() != CustomerStatus.ACTIVE
                || passwordHash == null
                || !BCRYPT_HASH.matcher(passwordHash).matches()
                || !passwordEncoder.matches(request.getPassword(), passwordHash)) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        }
        return issueToken(customer);
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
