package com.carrental.dto.response;

import com.carrental.entity.CarDocument;
import com.carrental.enums.CarDocumentType;
import com.carrental.enums.VerificationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CarDocumentResponse(
        Long id,
        CarDocumentType docType,
        String fileUrl,
        LocalDate expiresAt,
        VerificationStatus verifyStatus,
        String rejectReason,
        Long verifiedById,
        LocalDateTime verifiedAt,
        LocalDateTime createdAt
) {
    public static CarDocumentResponse from(CarDocument doc) {
        if (doc == null) return null;
        return new CarDocumentResponse(
                doc.getId(),
                doc.getDocType(),
                doc.getFileUrl(),
                doc.getExpiresAt(),
                doc.getVerifyStatus(),
                doc.getRejectReason(),
                doc.getVerifiedBy() != null ? doc.getVerifiedBy().getId() : null,
                doc.getVerifiedAt(),
                doc.getCreatedAt()
        );
    }
}
