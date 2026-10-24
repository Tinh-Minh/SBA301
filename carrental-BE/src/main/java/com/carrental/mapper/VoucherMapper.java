package com.carrental.mapper;

import com.carrental.dto.response.VoucherResponse;
import com.carrental.dto.response.VoucherWindowState;
import com.carrental.entity.Voucher;
import java.time.LocalDateTime;

public final class VoucherMapper {
    private VoucherMapper() { }

    public static VoucherResponse toResponse(Voucher voucher, LocalDateTime evaluatedAt) {
        VoucherWindowState state = evaluatedAt.isBefore(voucher.getStartAt()) ? VoucherWindowState.UPCOMING
                : evaluatedAt.isBefore(voucher.getEndAt()) ? VoucherWindowState.CURRENT : VoucherWindowState.ENDED;
        return new VoucherResponse(voucher.getId(), voucher.getCode(), voucher.getDescription(),
                voucher.getDiscountType(), voucher.getDiscountValue(), voucher.getMaxDiscount(),
                voucher.getMinOrderAmount(), voucher.getStartAt(), voucher.getEndAt(), voucher.getUsageLimit(),
                voucher.getPerUserLimit(), voucher.getUsedCount(), voucher.getStatus(), voucher.getCreatedAt(),
                voucher.getUpdatedAt(), state, evaluatedAt);
    }
}
