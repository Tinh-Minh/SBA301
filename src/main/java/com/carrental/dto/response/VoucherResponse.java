package com.carrental.dto.response;

import com.carrental.enums.DiscountType;
import com.carrental.enums.VoucherStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Publicly serialized administrator voucher definition. */
public record VoucherResponse(long id, String code, String description, DiscountType discountType,
        BigDecimal discountValue, BigDecimal maxDiscount, BigDecimal minOrderAmount,
        LocalDateTime startAt, LocalDateTime endAt, Integer usageLimit, int perUserLimit, int usedCount,
        VoucherStatus status, LocalDateTime createdAt, LocalDateTime updatedAt,
        VoucherWindowState windowState, LocalDateTime evaluatedAt) { }
