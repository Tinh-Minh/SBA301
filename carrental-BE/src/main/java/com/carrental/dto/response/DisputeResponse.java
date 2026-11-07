package com.carrental.dto.response;

import com.carrental.entity.Dispute;
import com.carrental.entity.DisputeEvidence;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public record DisputeResponse(
        Long id,
        Long orderId,
        String orderCode,
        Long extraFeeId,
        Long raisedById,
        String raisedByName,
        String reason,
        String description,
        String status,
        String resolutionNote,
        Long resolvedById,
        String resolvedByName,
        LocalDateTime resolvedAt,
        LocalDateTime createdAt,
        List<DisputeEvidenceResponse> evidences
) {
    public static DisputeResponse from(Dispute d) {
        return from(d, Collections.emptyList());
    }

    public static DisputeResponse from(Dispute d, List<DisputeEvidence> evidences) {
        if (d == null) return null;
        List<DisputeEvidenceResponse> evidenceResponses = evidences != null
                ? evidences.stream().map(DisputeEvidenceResponse::from).toList()
                : Collections.emptyList();

        return new DisputeResponse(
                d.getId(),
                d.getOrder() != null ? d.getOrder().getId() : null,
                d.getOrder() != null ? d.getOrder().getOrderCode() : null,
                d.getExtraFee() != null ? d.getExtraFee().getId() : null,
                d.getRaisedBy() != null ? d.getRaisedBy().getId() : null,
                d.getRaisedBy() != null ? d.getRaisedBy().getFullName() : null,
                d.getReason(),
                d.getDescription(),
                d.getStatus() != null ? d.getStatus().name() : null,
                d.getResolutionNote(),
                d.getResolvedBy() != null ? d.getResolvedBy().getId() : null,
                d.getResolvedBy() != null ? d.getResolvedBy().getFullName() : null,
                d.getResolvedAt(),
                d.getCreatedAt(),
                evidenceResponses
        );
    }
}
