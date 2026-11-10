package com.carrental.dto.response;

import com.carrental.entity.Car;
import com.carrental.entity.CarSubscription;
import com.carrental.entity.ListingPackage;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.SubscriptionStatus;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

public record SubscriptionResponse(
        Long id,
        String subscriptionCode,
        Long customerId,
        String customerName,
        Long carId,
        String carName,
        String licensePlate,
        Long packageId,
        String packageName,
        Integer durationDays,
        String badgeLabel,
        String voucherCode,
        BigDecimal basePrice,
        BigDecimal packagePrice,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        SubscriptionStatus status,
        PaymentStatus paymentStatus,
        LocalDateTime startDate,
        LocalDateTime endDate,
        LocalDateTime activatedAt,
        LocalDateTime createdAt,
        LocalDateTime paymentDeadline,
        Long daysRemaining) {

    public static SubscriptionResponse from(CarSubscription subscription, LocalDateTime now) {
        return from(subscription, now, 30L);
    }

    public static SubscriptionResponse from(CarSubscription subscription, LocalDateTime now, long paymentTimeoutMinutes) {
        Car car = subscription.getCar();
        ListingPackage listingPackage = subscription.getListingPackage();
        LocalDateTime deadline = subscription.getStatus() == SubscriptionStatus.PENDING_PAYMENT
                && subscription.getCreatedAt() != null
                ? subscription.getCreatedAt().plusMinutes(paymentTimeoutMinutes)
                : null;
        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getSubscriptionCode(),
                subscription.getCustomer().getId(),
                subscription.getCustomer().getFullName(),
                car.getId(),
                car.getBrand() + " " + car.getModel(),
                car.getLicensePlate(),
                listingPackage.getId(),
                listingPackage.getName(),
                listingPackage.getDurationDays(),
                listingPackage.getBadgeLabel(),
                subscription.getVoucher() == null ? null : subscription.getVoucher().getCode(),
                subscription.getPackagePrice(),
                subscription.getPackagePrice(),
                subscription.getDiscountAmount(),
                subscription.getTotalAmount(),
                subscription.getStatus(),
                subscription.getPaymentStatus(),
                subscription.getStartDate(),
                subscription.getEndDate(),
                subscription.getActivatedAt(),
                subscription.getCreatedAt(),
                deadline,
                daysRemaining(subscription, now));
    }

    /** Số ngày còn hiển thị, làm tròn lên; null khi gói không còn hiệu lực. */
    private static Long daysRemaining(CarSubscription subscription, LocalDateTime now) {
        if (subscription.getStatus() != SubscriptionStatus.ACTIVE || subscription.getEndDate() == null) {
            return null;
        }
        long seconds = Duration.between(now, subscription.getEndDate()).getSeconds();
        return seconds <= 0 ? 0 : (seconds + 86399) / 86400;
    }
}
