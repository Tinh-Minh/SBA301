package com.carrental.mapper;

import com.carrental.config.security.BootstrapAdminProperties;
import com.carrental.dto.request.auth.AuthInputNormalizer;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.dto.request.customer.UpdateProfileRequest;
import com.carrental.dto.response.CustomerAdminResponse;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.KycSummaryResponse;
import com.carrental.dto.response.CustomerSummaryResponse;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import java.time.LocalDate;
import java.util.Objects;

/** Explicit account response allowlists; entity associations and password data are never serialized. */
public final class CustomerMapper {

    private CustomerMapper() { }

    public record BootstrapAdminValues(String fullName, String email, String phone) { }

    public record ProfileUpdateValues(String fullName, LocalDate dateOfBirth, String address, String email,
            String phone, String avatarUrl) { }

    public static Customer toNewEntity(RegisterRequest request, String encodedPassword) {
        Customer customer = new Customer();
        customer.setFullName(AuthInputNormalizer.trimmed(request.getFullName()));
        customer.setEmail(AuthInputNormalizer.email(request.getEmail()));
        customer.setPhone(AuthInputNormalizer.trimmed(request.getPhone()));
        customer.setPasswordHash(encodedPassword);
        customer.setRole(Role.CUSTOMER);
        customer.setStatus(CustomerStatus.ACTIVE);
        customer.setKycStatus(KycStatus.NONE);
        customer.setEmailVerified(false);
        return customer;
    }

    public static BootstrapAdminValues bootstrapAdminValues(BootstrapAdminProperties properties) {
        return new BootstrapAdminValues(AuthInputNormalizer.trimmed(properties.getFullName()),
                AuthInputNormalizer.email(properties.getEmail()), AuthInputNormalizer.trimmed(properties.getPhone()));
    }

    public static RegisterRequest toBootstrapValidationRequest(BootstrapAdminProperties properties) {
        RegisterRequest request = new RegisterRequest();
        request.setFullName(properties.getFullName());
        request.setEmail(properties.getEmail());
        request.setPhone(properties.getPhone());
        request.setPassword(properties.getPassword());
        return request;
    }

    public static Customer toBootstrapAdminEntity(BootstrapAdminValues values, String encodedPassword) {
        Customer customer = new Customer();
        customer.setFullName(values.fullName());
        customer.setEmail(values.email());
        customer.setPhone(values.phone());
        customer.setPasswordHash(encodedPassword);
        customer.setRole(Role.ADMIN);
        customer.setStatus(CustomerStatus.ACTIVE);
        customer.setKycStatus(KycStatus.NONE);
        customer.setEmailVerified(false);
        return customer;
    }

    public static boolean applyProfileUpdate(Customer customer, UpdateProfileRequest request,
            ProfileUpdateValues values) {
        boolean changed = false;
        if (request.fullNameWasProvided() && !Objects.equals(values.fullName(), customer.getFullName())) {
            customer.setFullName(values.fullName());
            changed = true;
        }
        if (request.dateOfBirthWasProvided() && !Objects.equals(values.dateOfBirth(), customer.getDateOfBirth())) {
            customer.setDateOfBirth(values.dateOfBirth());
            changed = true;
        }
        if (request.addressWasProvided() && !Objects.equals(values.address(), customer.getAddress())) {
            customer.setAddress(values.address());
            changed = true;
        }
        if (request.emailWasProvided() && !values.email().equalsIgnoreCase(customer.getEmail())) {
            customer.setEmail(values.email());
            customer.setEmailVerified(false);
            changed = true;
        }
        if (request.phoneWasProvided() && !Objects.equals(values.phone(), customer.getPhone())) {
            customer.setPhone(values.phone());
            changed = true;
        }
        if (request.avatarUrlWasProvided() && !Objects.equals(values.avatarUrl(), customer.getAvatarUrl())) {
            customer.setAvatarUrl(values.avatarUrl());
            changed = true;
        }
        return changed;
    }

    public static CustomerProfileResponse toProfile(Customer customer) {
        return new CustomerProfileResponse(customer.getId(), customer.getFullName(), customer.getEmail(),
                customer.getPhone(), customer.getDateOfBirth(), customer.getAddress(), customer.getAvatarUrl(),
                customer.getEmailVerified(), customer.getKycStatus(), customer.getRole(), customer.getStatus(),
                customer.getCreatedAt(), customer.getUpdatedAt());
    }

    public static CustomerSummaryResponse toSummary(Customer customer) {
        return new CustomerSummaryResponse(customer.getId(), customer.getFullName(), customer.getEmail(),
                customer.getPhone(), customer.getRole(), customer.getStatus(), customer.getKycStatus(),
                customer.getEmailVerified(), customer.getCreatedAt(), customer.getUpdatedAt());
    }

    public static CustomerAdminResponse toAdmin(Customer customer) {
        return new CustomerAdminResponse(customer.getId(), customer.getFullName(), customer.getEmail(),
                customer.getPhone(), customer.getRole(), customer.getStatus(), customer.getKycStatus(),
                customer.getEmailVerified(), customer.getCreatedAt(), customer.getUpdatedAt(),
                customer.getDateOfBirth(), customer.getAddress());
    }
    public static KycSummaryResponse toKycSummary(
            Customer customer, KycStatus status, LocalDate today) {
        return new KycSummaryResponse(customer.getId(), customer.getStatus(), status, today);
    }
}
