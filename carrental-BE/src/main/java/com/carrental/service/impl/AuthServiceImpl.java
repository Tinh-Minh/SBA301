package com.carrental.service.impl;

import com.carrental.config.security.JwtProperties;
import com.carrental.dto.request.auth.AuthInputNormalizer;
import com.carrental.dto.request.auth.ChangePasswordRequest;
import com.carrental.dto.request.auth.LoginRequest;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.TokenResponse;
import com.carrental.mapper.CustomerMapper;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.security.AccountUserDetails;
import com.carrental.service.AuthService;
import com.carrental.security.CurrentAccount;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
public class AuthServiceImpl implements AuthService {

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
        Customer customer = CustomerMapper.toNewEntity(request, passwordEncoder.encode(request.getPassword()));
        if (customers.existsByEmailIgnoreCase(customer.getEmail()) || customers.existsByPhone(customer.getPhone())) {
            throw new AppException(ErrorCode.ACCOUNT_ALREADY_EXISTS);
        }
        try {
            return CustomerMapper.toProfile(customers.saveAndFlush(customer));
        } catch (DataIntegrityViolationException exception) {
            if (isAccountUniqueViolation(exception)) throw new AppException(ErrorCode.ACCOUNT_ALREADY_EXISTS, exception);
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
                    UsernamePasswordAuthenticationToken.unauthenticated(email, request.getPassword()));
        } catch (BadCredentialsException | LockedException | DisabledException | UsernameNotFoundException exception) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        }

        if (!(authentication.getPrincipal() instanceof AccountUserDetails account)) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        }
        return issueToken(account);
    }

    private TokenResponse issueToken(AccountUserDetails account) {
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
