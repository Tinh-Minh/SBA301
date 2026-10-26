package com.carrental.mapper;

import com.carrental.dto.response.VoucherResponse;
import com.carrental.dto.request.voucher.CreateVoucherRequest;
import com.carrental.dto.request.voucher.UpdateVoucherAdminRequest;
import com.carrental.dto.response.VoucherWindowState;
import com.carrental.entity.Voucher;
import com.carrental.enums.VoucherStatus;
import java.time.LocalDateTime;
import java.util.Objects;

public final class VoucherMapper {
    private VoucherMapper() { }

    public static Voucher toNewEntity(CreateVoucherRequest values) {
        Voucher voucher = new Voucher();
        voucher.setCode(values.getCode().strip());
        voucher.setDescription(description(values.getDescription()));
        voucher.setDiscountType(values.getDiscountType());
        voucher.setDiscountValue(values.getDiscountValue());
        voucher.setMaxDiscount(values.getMaxDiscount());
        voucher.setMinOrderAmount(values.getMinOrderAmount());
        voucher.setStartAt(values.getStartAt());
        voucher.setEndAt(values.getEndAt());
        voucher.setUsageLimit(values.getUsageLimit());
        voucher.setPerUserLimit(values.getPerUserLimit());
        voucher.setUsedCount(0);
        voucher.setStatus(VoucherStatus.ACTIVE);
        return voucher;
    }

    public static boolean applyAdminUpdate(Voucher voucher, UpdateVoucherAdminRequest values) {
        boolean changed = !Objects.equals(voucher.getDescription(), description(values.getDescription()))
                || !Objects.equals(voucher.getUsageLimit(), values.getUsageLimit());
        if (changed) {
            voucher.setDescription(description(values.getDescription()));
            voucher.setUsageLimit(values.getUsageLimit());
        }
        return changed;
    }

    private static String description(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

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
