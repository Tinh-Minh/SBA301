package com.carrental.dto.response;

import java.math.BigDecimal;

/** Số tiền cần trả cho một gói trên một xe, chưa ghi DB. */
public record SubscriptionQuoteResponse(
        Long carId,
        Long packageId,
        String packageName,
        Integer durationDays,
        String voucherCode,
        BigDecimal packagePrice,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        Integer slotCount,
        Integer durationDaysPerSlot) {

    public SubscriptionQuoteResponse(
            Long carId,
            Long packageId,
            String packageName,
            Integer durationDays,
            String voucherCode,
            BigDecimal packagePrice,
            BigDecimal discountAmount,
            BigDecimal totalAmount) {
        this(carId, packageId, packageName, durationDays, voucherCode, packagePrice, discountAmount, totalAmount, 1,
                durationDays != null ? durationDays : 7);
    }
}
