package com.carrental.dto.response;

import com.carrental.entity.Payout;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PayoutResponse(
        Long id,
        Long orderId,
        String orderCode,
        Long recipientId,
        String recipientName,
        Long bankAccountId,
        BigDecimal grossAmount,
        BigDecimal platformFee,
        BigDecimal netAmount,
        String status,
        String note,
        LocalDateTime paidAt,
        LocalDateTime createdAt
) {
    public static PayoutResponse from(Payout p) {
        if (p == null) return null;
        return new PayoutResponse(
                p.getId(),
                p.getOrder() != null ? p.getOrder().getId() : null,
                p.getOrder() != null ? p.getOrder().getOrderCode() : null,
                p.getRecipient() != null ? p.getRecipient().getId() : null,
                p.getRecipient() != null ? p.getRecipient().getFullName() : null,
                p.getBankAccount() != null ? p.getBankAccount().getId() : null,
                p.getGrossAmount(),
                p.getPlatformFee(),
                p.getNetAmount(),
                p.getStatus() != null ? p.getStatus().name() : null,
                p.getNote(),
                p.getPaidAt(),
                p.getCreatedAt()
        );
    }
}
