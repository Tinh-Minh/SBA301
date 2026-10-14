package com.carrental.dto.response;

import com.carrental.entity.ExtraFee;

import java.math.BigDecimal;
import java.time.Instant;

public record ExtraFeeResponse(
        Long id,
        Long orderId,
        String orderCode,
        Long createdById,
        String createdByName,
        String feeType,
        BigDecimal amount,
        String description,
        String status,
        Instant createdAt
) {
    public static ExtraFeeResponse from(ExtraFee ef) {
        if (ef == null) return null;
        return new ExtraFeeResponse(
                ef.getId(),
                ef.getOrder() != null ? ef.getOrder().getId() : null,
                ef.getOrder() != null ? ef.getOrder().getOrderCode() : null,
                ef.getCreatedBy() != null ? ef.getCreatedBy().getId() : null,
                ef.getCreatedBy() != null ? ef.getCreatedBy().getFullName() : null,
                ef.getFeeType(),
                ef.getAmount(),
                ef.getDescription(),
                ef.getStatus(),
                ef.getCreatedAt()
        );
    }
}
