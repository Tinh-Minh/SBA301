package com.carrental.service.impl;

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

@Service
public class AdminBootstrapService {
    public enum Result { CREATED, ALREADY_PRESENT, DISABLED }

    private final CustomerRepository customers;
    private final PasswordEncoder passwordEncoder;
    private final Validator validator;

    public AdminBootstrapService(CustomerRepository customers, PasswordEncoder passwordEncoder,
            Validator validator) {
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

        Customer admin = new Customer();
        admin.setFullName(AuthInputNormalizer.trimmed(properties.getFullName()));
        admin.setEmail(email);
        admin.setPhone(phone);
        admin.setPasswordHash(passwordEncoder.encode(properties.getPassword()));
        admin.setRole(Role.ADMIN);
        admin.setStatus(CustomerStatus.ACTIVE);
        admin.setKycStatus(KycStatus.NONE);
        admin.setEmailVerified(false);
        try {
            customers.saveAndFlush(admin);
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException("Bootstrap admin initialization failed due to an identity conflict");
        }
        return Result.CREATED;
    }

    private void validate(BootstrapAdminProperties properties) {
        RegisterRequest candidate = new RegisterRequest();
        candidate.setFullName(properties.getFullName());
        candidate.setEmail(properties.getEmail());
        candidate.setPhone(properties.getPhone());
        candidate.setPassword(properties.getPassword());
        if (!validator.validate(candidate).isEmpty()) {
            throw new IllegalStateException("Bootstrap admin configuration is incomplete or invalid");
        }
    }
}
