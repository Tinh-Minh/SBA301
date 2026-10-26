package com.carrental.service;

import com.carrental.config.security.BootstrapAdminProperties;
import com.carrental.dto.request.auth.AuthInputNormalizer;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.repository.CustomerRepository;
import jakarta.validation.Validator;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Initializes the configured administrator account during application startup. */
@Service
public class AdminBootstrapService {

    public enum Result { CREATED, ALREADY_PRESENT, DISABLED }

    private final CustomerRepository customers;
    private final PasswordEncoder passwordEncoder;
    private final Validator validator;

    public AdminBootstrapService(CustomerRepository customers, PasswordEncoder passwordEncoder, Validator validator) {
        this.customers = customers;
        this.passwordEncoder = passwordEncoder;
        this.validator = validator;
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