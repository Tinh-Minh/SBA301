package com.carrental.dto.response;

import com.carrental.entity.DisputeEvidence;

import java.time.LocalDateTime;

public record DisputeEvidenceResponse(
        Long id,
        Long disputeId,
        Long uploadedById,
        String uploadedByName,
        String fileUrl,
        String fileType,
        String description,
        LocalDateTime createdAt
) {
    public static DisputeEvidenceResponse from(DisputeEvidence de) {
        if (de == null) return null;
        return new DisputeEvidenceResponse(
                de.getId(),
                de.getDispute() != null ? de.getDispute().getId() : null,
                de.getUploadedBy() != null ? de.getUploadedBy().getId() : null,
                de.getUploadedBy() != null ? de.getUploadedBy().getFullName() : null,
                de.getFileUrl(),
                de.getFileType() != null ? de.getFileType().name() : null,
                de.getDescription(),
                de.getCreatedAt()
        );
    }
}
