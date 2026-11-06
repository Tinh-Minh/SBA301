package com.carrental.dto.response;

import com.carrental.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        Long subscriptionId,
        String subscriptionCode,
        String packageName,
        String carLicensePlate,
        String carBrandModel,
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
        Long subId = t.getSubscription() != null ? t.getSubscription().getId() : null;
        String subCode = t.getSubscription() != null ? t.getSubscription().getSubscriptionCode() : null;
        String pkgName = null;
        String licensePlate = null;
        String carBrandModel = null;
        if (t.getSubscription() != null) {
            if (t.getSubscription().getListingPackage() != null) {
                pkgName = t.getSubscription().getListingPackage().getName();
            }
            if (t.getSubscription().getCar() != null) {
                licensePlate = t.getSubscription().getCar().getLicensePlate();
                carBrandModel = t.getSubscription().getCar().getBrand() + " " + t.getSubscription().getCar().getModel();
            }
        }
        return new TransactionResponse(
                t.getId(),
                subId,
                subCode,
                pkgName,
                licensePlate,
                carBrandModel,
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
