package com.carrental.service.impl;

import com.carrental.config.security.BootstrapAdminProperties;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.mapper.CustomerMapper;
import com.carrental.repository.CustomerRepository;
import com.carrental.service.AdminBootstrapService;
import jakarta.validation.Validator;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBootstrapServiceImpl implements AdminBootstrapService {
    private final CustomerRepository customers;
    private final PasswordEncoder passwordEncoder;
    private final Validator validator;

    public AdminBootstrapServiceImpl(CustomerRepository customers, PasswordEncoder passwordEncoder,
            Validator validator) {
        this.customers = customers;
        this.passwordEncoder = passwordEncoder;
        this.validator = validator;
    }

    @Transactional
    @Override
    public AdminBootstrapService.Result ensureAdmin(BootstrapAdminProperties properties) {
        if (!properties.isEnabled()) {
            return AdminBootstrapService.Result.DISABLED;
        }
        validate(properties);
        CustomerMapper.BootstrapAdminValues values = CustomerMapper.bootstrapAdminValues(properties);
        String email = values.email();
        var existing = customers.findByEmailIgnoreCase(email);
        if (existing.isPresent()) {
            Customer account = existing.get();
            if (account.getRole() == Role.ADMIN && account.getStatus() == CustomerStatus.ACTIVE) {
                return AdminBootstrapService.Result.ALREADY_PRESENT;
            }
            throw new IllegalStateException("Bootstrap admin email belongs to an account that cannot be changed");
        }
        String phone = values.phone();
        if (customers.existsByPhone(phone)) {
            throw new IllegalStateException("Bootstrap admin phone conflicts with an existing account");
        }

        Customer admin = CustomerMapper.toBootstrapAdminEntity(values, passwordEncoder.encode(properties.getPassword()));
        try {
            customers.saveAndFlush(admin);
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException("Bootstrap admin initialization failed due to an identity conflict");
        }
        return AdminBootstrapService.Result.CREATED;
    }

    private void validate(BootstrapAdminProperties properties) {
        if (!validator.validate(CustomerMapper.toBootstrapValidationRequest(properties)).isEmpty()) {
            throw new IllegalStateException("Bootstrap admin configuration is incomplete or invalid");
        }
    }
}
