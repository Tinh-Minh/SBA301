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
        BigDecimal totalAmount) {
}
