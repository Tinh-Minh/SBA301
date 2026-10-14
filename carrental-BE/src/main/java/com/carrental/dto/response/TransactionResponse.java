package com.carrental.dto.response;

import com.carrental.entity.Transaction;

import java.math.BigDecimal;
import java.time.Instant;

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
        Instant paidAt,
        Instant createdAt
) {
    public static TransactionResponse from(Transaction t) {
        if (t == null) return null;
        return new TransactionResponse(
                t.getId(),
                t.getOrder() != null ? t.getOrder().getId() : null,
                t.getOrder() != null ? t.getOrder().getOrderCode() : null,
                t.getTransactions() != null ? t.getTransactions().getId() : null,
                t.getTransactionType(),
                t.getAmount(),
                t.getMethod(),
                t.getStatus(),
                t.getProviderRef(),
                t.getPaidAt(),
                t.getCreatedAt()
        );
    }
}
