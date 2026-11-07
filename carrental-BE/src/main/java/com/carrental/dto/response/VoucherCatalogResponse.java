package com.carrental.dto.response;

import com.carrental.entity.Voucher;
import com.carrental.enums.DiscountType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Customer-facing voucher information; usage counters and internal administration fields are omitted. */
public record VoucherCatalogResponse(
        long id,
        String code,
        String description,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal maxDiscount,
        BigDecimal minOrderAmount,
        LocalDateTime startAt,
        LocalDateTime endAt) {

    public static VoucherCatalogResponse from(Voucher voucher) {
        return new VoucherCatalogResponse(voucher.getId(), voucher.getCode(), voucher.getDescription(),
                voucher.getDiscountType(), voucher.getDiscountValue(), voucher.getMaxDiscount(),
                voucher.getMinOrderAmount(), voucher.getStartAt(), voucher.getEndAt());
    }
}
