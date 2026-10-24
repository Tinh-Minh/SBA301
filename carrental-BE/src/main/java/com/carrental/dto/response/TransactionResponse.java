package com.carrental.dto.response;

import com.carrental.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        Long orderId,
        String orderCode,
        Long parentTransactionId,
        String transactionType,
        BigDecimal amount,
        String method,
        String status,
        String providerRef,
        LocalDateTime paidAt,
        LocalDateTime createdAt,
        String paymentUrl
) {
    public static TransactionResponse from(Transaction t) {
        return from(t, null);
    }

    public static TransactionResponse from(Transaction t, String paymentUrl) {
        if (t == null) return null;
        return new TransactionResponse(
                t.getId(),
                t.getOrder() != null ? t.getOrder().getId() : null,
                t.getOrder() != null ? t.getOrder().getOrderCode() : null,
                t.getRefundOf() != null ? t.getRefundOf().getId() : null,
                t.getTransactionType() != null ? t.getTransactionType().name() : null,
                t.getAmount(),
                t.getMethod() != null ? t.getMethod().name() : null,
                t.getStatus() != null ? t.getStatus().name() : null,
                t.getProviderRef(),
                t.getPaidAt(),
                t.getCreatedAt(),
                paymentUrl
        );
    }
}
