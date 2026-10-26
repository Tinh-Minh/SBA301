package com.carrental.dto.response;

import com.carrental.entity.Customer;

import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CustomerAdminResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        Role role,
        CustomerStatus status,
        KycStatus kycStatus,
        boolean emailVerified,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDate dateOfBirth,
        String address) {

    public static CustomerAdminResponse from(Customer customer) {
        return new CustomerAdminResponse(customer.getId(), customer.getFullName(), customer.getEmail(),
                customer.getPhone(), customer.getRole(), customer.getStatus(), customer.getKycStatus(),
                customer.getEmailVerified(), customer.getCreatedAt(), customer.getUpdatedAt(),
                customer.getDateOfBirth(), customer.getAddress());
    }
}
