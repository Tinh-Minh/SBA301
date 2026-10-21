package com.carrental.dto.response;

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
}
