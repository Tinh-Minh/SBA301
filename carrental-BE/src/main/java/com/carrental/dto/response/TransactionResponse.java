package com.carrental.dto.response;

import com.carrental.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        Long subscriptionId,
        String subscriptionCode,
        Long carId,
        String carLicensePlate,
        String carBrandModel,
        String carName,
        String packageName,
        String transactionType,
        BigDecimal amount,
        String method,
        String status,
        String providerRef,
        LocalDateTime paidAt,
        LocalDateTime createdAt,
        String paymentUrl,
        /** Trạng thái gói đăng tin của giao dịch, để phân biệt giao dịch thất bại với giao dịch bị huỷ theo gói. */
        String subscriptionStatus,
        Long bookingId,
        String bookingCode
) {
    public TransactionResponse(Long id, Long subscriptionId, String subscriptionCode, Long carId,
            String carLicensePlate, String carBrandModel, String carName, String packageName,
            String transactionType, BigDecimal amount, String method, String status,
            String providerRef, LocalDateTime paidAt, LocalDateTime createdAt, String paymentUrl,
            String subscriptionStatus) {
        this(id, subscriptionId, subscriptionCode, carId, carLicensePlate, carBrandModel, carName, packageName,
                transactionType, amount, method, status, providerRef, paidAt, createdAt, paymentUrl, subscriptionStatus,
                null, null);
    }

    public static TransactionResponse from(Transaction t) {
        return from(t, null);
    }

    public static TransactionResponse from(Transaction t, String paymentUrl) {
        if (t == null) return null;
        Long subId = t.getSubscription() != null ? t.getSubscription().getId() : null;
        String subCode = t.getSubscription() != null ? t.getSubscription().getSubscriptionCode() : null;
        Long bookingId = t.getBooking() != null ? t.getBooking().getId() : null;
        String bookingCode = t.getBooking() != null ? t.getBooking().getBookingCode() : null;
        Long carId = (t.getSubscription() != null && t.getSubscription().getCar() != null)
                ? t.getSubscription().getCar().getId() : null;
        String pkgName = null;
        String licensePlate = null;
        String carBrandModel = null;
        String carName = null;
        if (t.getSubscription() != null) {
            if (t.getSubscription().getListingPackage() != null) {
                pkgName = t.getSubscription().getListingPackage().getName();
            }
            if (t.getSubscription().getCar() != null) {
                var car = t.getSubscription().getCar();
                licensePlate = car.getLicensePlate();
                carBrandModel = ((car.getBrand() != null ? car.getBrand() + " " : "")
                        + (car.getModel() != null ? car.getModel() : "")).trim();
                carName = carBrandModel;
            }
        } else if (t.getBooking() != null && t.getBooking().getCar() != null) {
            var car = t.getBooking().getCar();
            carId = car.getId();
            licensePlate = car.getLicensePlate();
            carBrandModel = ((car.getBrand() != null ? car.getBrand() + " " : "")
                    + (car.getModel() != null ? car.getModel() : "")).trim();
            carName = carBrandModel;
        }
        return new TransactionResponse(
                t.getId(),
                subId,
                subCode,
                carId,
                licensePlate,
                carBrandModel,
                carName,
                pkgName,
                t.getTransactionType() != null ? t.getTransactionType().name() : null,
                t.getAmount(),
                t.getMethod() != null ? t.getMethod().name() : null,
                t.getStatus() != null ? t.getStatus().name() : null,
                t.getProviderRef(),
                t.getPaidAt(),
                t.getCreatedAt(),
                paymentUrl,
                t.getSubscription() != null && t.getSubscription().getStatus() != null
                        ? t.getSubscription().getStatus().name() : null,
                bookingId,
                bookingCode
        );
    }
}
