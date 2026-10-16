package com.carrental.dto.response;

import com.carrental.enums.DocumentVerifyStatus;
import com.carrental.enums.UserDocumentType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserDocumentDetailResponse(
        long id,
        long customerId,
        UserDocumentType docType,
        String docNumber,
        String fullNameOnDoc,
        LocalDate dateOfBirthOnDoc,
        String issuePlace,
        LocalDate issueDate,
        LocalDate expiresAt,
        String licenseClass,
        DocumentVerifyStatus verifyStatus,
        String rejectReason,
        Long verifiedById,
        LocalDateTime verifiedAt,
        boolean hasFrontImage,
        boolean hasBackImage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
