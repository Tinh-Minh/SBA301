package com.carrental.dto.response;

import com.carrental.enums.VerificationStatus;
import com.carrental.enums.DocumentType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserDocumentDetailResponse(
        long id,
        long customerId,
        DocumentType docType,
        String docNumber,
        String fullNameOnDoc,
        LocalDate dateOfBirthOnDoc,
        String issuePlace,
        LocalDate issueDate,
        LocalDate expiresAt,
        String licenseClass,
        VerificationStatus verifyStatus,
        String rejectReason,
        Long verifiedById,
        LocalDateTime verifiedAt,
        boolean hasFrontImage,
        boolean hasBackImage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
