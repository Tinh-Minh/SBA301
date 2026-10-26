package com.carrental.dto.response;

import com.carrental.entity.Customer;

import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CustomerProfileResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        LocalDate dateOfBirth,
        String address,
        String avatarUrl,
        boolean emailVerified,
        KycStatus kycStatus,
        Role role,
        CustomerStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static CustomerProfileResponse from(Customer customer) {
        return new CustomerProfileResponse(customer.getId(), customer.getFullName(), customer.getEmail(),
                customer.getPhone(), customer.getDateOfBirth(), customer.getAddress(), customer.getAvatarUrl(),
                customer.getEmailVerified(), customer.getKycStatus(), customer.getRole(), customer.getStatus(),
                customer.getCreatedAt(), customer.getUpdatedAt());
    }
}
