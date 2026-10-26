package com.carrental.dto.response;

import com.carrental.entity.Voucher;

import com.carrental.enums.VoucherWindowState;

import com.carrental.enums.DiscountType;
import com.carrental.enums.VoucherStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VoucherResponse(long id, String code, String description, DiscountType discountType,
        BigDecimal discountValue, BigDecimal maxDiscount, BigDecimal minOrderAmount,
        LocalDateTime startAt, LocalDateTime endAt, Integer usageLimit, int perUserLimit, int usedCount,
        VoucherStatus status, LocalDateTime createdAt, LocalDateTime updatedAt,
        VoucherWindowState windowState, LocalDateTime evaluatedAt) {

    public static VoucherResponse from(Voucher voucher, LocalDateTime evaluatedAt) {
        VoucherWindowState state = evaluatedAt.isBefore(voucher.getStartAt()) ? VoucherWindowState.UPCOMING
                : evaluatedAt.isBefore(voucher.getEndAt()) ? VoucherWindowState.CURRENT : VoucherWindowState.ENDED;
        return new VoucherResponse(voucher.getId(), voucher.getCode(), voucher.getDescription(),
                voucher.getDiscountType(), voucher.getDiscountValue(), voucher.getMaxDiscount(),
                voucher.getMinOrderAmount(), voucher.getStartAt(), voucher.getEndAt(), voucher.getUsageLimit(),
                voucher.getPerUserLimit(), voucher.getUsedCount(), voucher.getStatus(), voucher.getCreatedAt(),
                voucher.getUpdatedAt(), state, evaluatedAt);
    }
}
