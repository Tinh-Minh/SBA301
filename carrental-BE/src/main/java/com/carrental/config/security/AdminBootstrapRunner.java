package com.carrental.config.security;

import com.carrental.dto.request.auth.AuthInputNormalizer;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.repository.CustomerRepository;
import jakarta.validation.Validator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Initializes the configured administrator account during application startup. */
@Slf4j
@Component
public class AdminBootstrapRunner implements ApplicationRunner {

    public enum Result { CREATED, ALREADY_PRESENT, DISABLED }

    private final BootstrapAdminProperties properties;
    private final CustomerRepository customers;
    private final PasswordEncoder passwordEncoder;
    private final Validator validator;

    public AdminBootstrapRunner(BootstrapAdminProperties properties, CustomerRepository customers,
            PasswordEncoder passwordEncoder, Validator validator) {
        this.properties = properties;
        this.customers = customers;
        this.passwordEncoder = passwordEncoder;
        this.validator = validator;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!properties.isEnabled()) {
            return;
        }
        log.info("Bootstrap admin initialization result={}", ensureAdmin(properties));
    }

    @Transactional
    public Result ensureAdmin(BootstrapAdminProperties properties) {
        if (!properties.isEnabled()) {
            return Result.DISABLED;
        }
        validate(properties);
        String fullName = AuthInputNormalizer.trimmed(properties.getFullName());
        String email = AuthInputNormalizer.email(properties.getEmail());
        var existing = customers.findByEmailIgnoreCase(email);
        if (existing.isPresent()) {
            Customer account = existing.get();
            if (account.getRole() == Role.ADMIN && account.getStatus() == CustomerStatus.ACTIVE) {
                return Result.ALREADY_PRESENT;
            }
            throw new IllegalStateException("Bootstrap admin email belongs to an account that cannot be changed");
        }
        String phone = AuthInputNormalizer.trimmed(properties.getPhone());
        if (customers.existsByPhone(phone)) {
            throw new IllegalStateException("Bootstrap admin phone conflicts with an existing account");
        }

        Customer admin = newAdmin(fullName, email, phone, passwordEncoder.encode(properties.getPassword()));
        try {
            customers.saveAndFlush(admin);
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException("Bootstrap admin initialization failed due to an identity conflict");
        }
        return Result.CREATED;
    }

    private void validate(BootstrapAdminProperties properties) {
        if (!validator.validate(validationRequest(properties)).isEmpty()) {
            throw new IllegalStateException("Bootstrap admin configuration is incomplete or invalid");
        }
    }

    private static RegisterRequest validationRequest(BootstrapAdminProperties properties) {
        RegisterRequest request = new RegisterRequest();
        request.setFullName(properties.getFullName());
        request.setEmail(properties.getEmail());
        request.setPhone(properties.getPhone());
        request.setPassword(properties.getPassword());
        return request;
    }

    private static Customer newAdmin(String fullName, String email, String phone, String encodedPassword) {
        Customer customer = new Customer();
        customer.setFullName(fullName);
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setPasswordHash(encodedPassword);
        customer.setRole(Role.ADMIN);
        customer.setStatus(CustomerStatus.ACTIVE);
        customer.setKycStatus(KycStatus.NONE);
        customer.setEmailVerified(false);
        return customer;
    }
}
