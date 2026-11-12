package com.carrental.dto.response;

import com.carrental.entity.UserDocument;

import com.carrental.enums.DocumentType;
import com.carrental.enums.VerificationStatus;
import java.time.LocalDateTime;

public record UserDocumentSummaryResponse(
        long id,
        long customerId,
        DocumentType docType,
        String docNumberMasked,
        VerificationStatus verifyStatus,
        boolean hasFrontImage,
        boolean hasBackImage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static UserDocumentSummaryResponse from(UserDocument document) {
        return new UserDocumentSummaryResponse(document.getId(), document.getCustomer().getId(), document.getDocType(),
                mask(document.getDocNumber()), document.getVerifyStatus(), true, document.getBackImageUrl() != null,
                document.getCreatedAt(), document.getUpdatedAt());
    }

    public static String mask(String value) {
        if (value == null || value.length() <= 4) return value == null ? "" : "*".repeat(value.length());
        int visible = Math.min(4, value.length());
        return "*".repeat(value.length() - visible) + value.substring(value.length() - visible);
    }
}
