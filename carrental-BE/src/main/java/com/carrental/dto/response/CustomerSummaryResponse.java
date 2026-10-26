package com.carrental.dto.response;

import com.carrental.entity.Customer;

import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import java.time.LocalDateTime;

public record CustomerSummaryResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        Role role,
        CustomerStatus status,
        KycStatus kycStatus,
        boolean emailVerified,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static CustomerSummaryResponse from(Customer customer) {
        return new CustomerSummaryResponse(customer.getId(), customer.getFullName(), customer.getEmail(),
                customer.getPhone(), customer.getRole(), customer.getStatus(), customer.getKycStatus(),
                customer.getEmailVerified(), customer.getCreatedAt(), customer.getUpdatedAt());
    }
}
