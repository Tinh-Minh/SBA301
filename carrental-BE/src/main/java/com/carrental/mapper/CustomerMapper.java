package com.carrental.mapper;

import com.carrental.dto.response.CustomerAdminResponse;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.CustomerSummaryResponse;
import com.carrental.entity.Customer;

/** Explicit account response allowlists; entity associations and password data are never serialized. */
public final class CustomerMapper {

    private CustomerMapper() { }

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
}
