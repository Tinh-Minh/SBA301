package com.carrental.dto.response;

import com.carrental.entity.Dispute;

import java.time.Instant;
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
        Instant resolvedAt,
        Instant createdAt,
        List<DisputeEvidenceResponse> evidences
) {
    public static DisputeResponse from(Dispute d) {
        if (d == null) return null;
        List<DisputeEvidenceResponse> evidenceResponses = d.getEvidences() != null
                ? d.getEvidences().stream().map(DisputeEvidenceResponse::from).toList()
                : Collections.emptyList();

        return new DisputeResponse(
                d.getId(),
                d.getOrder() != null ? d.getOrder().getId() : null,
                d.getOrder() != null ? d.getOrder().getOrderCode() : null,
                d.getExtraFees() != null ? d.getExtraFees().getId() : null,
                d.getRaisedBy() != null ? d.getRaisedBy().getId() : null,
                d.getRaisedBy() != null ? d.getRaisedBy().getFullName() : null,
                d.getReason(),
                d.getDescription(),
                d.getStatus(),
                d.getResolutionNote(),
                d.getResolvedBy() != null ? d.getResolvedBy().getId() : null,
                d.getResolvedBy() != null ? d.getResolvedBy().getFullName() : null,
                d.getResolvedAt(),
                d.getCreatedAt(),
                evidenceResponses
        );
    }
}
