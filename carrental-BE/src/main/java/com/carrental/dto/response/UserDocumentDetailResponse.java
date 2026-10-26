package com.carrental.dto.response;

import com.carrental.entity.UserDocument;

import com.carrental.enums.DocumentType;
import com.carrental.enums.VerificationStatus;
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

    public static UserDocumentDetailResponse from(UserDocument document) {
        return new UserDocumentDetailResponse(document.getId(), document.getCustomer().getId(), document.getDocType(),
                document.getDocNumber(), document.getFullNameOnDoc(), document.getDateOfBirthOnDoc(), document.getIssuePlace(),
                document.getIssueDate(), document.getExpiresAt(), document.getLicenseClass(), document.getVerifyStatus(),
                document.getRejectReason(), document.getVerifiedBy() == null ? null : document.getVerifiedBy().getId(),
                document.getVerifiedAt(), true, document.getBackImageUrl() != null,
                document.getCreatedAt(), document.getUpdatedAt());
    }
}
