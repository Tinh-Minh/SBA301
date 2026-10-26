package com.carrental.dto.request.voucher;

import com.carrental.entity.Voucher;
import com.carrental.enums.DiscountType;
import com.carrental.enums.VoucherStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateVoucherRequest {
    @NotBlank @Size(max = 50)
    private String code;
    @Size(max = 300)
    private String description;
    @NotNull
    private DiscountType discountType;
    @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 14, fraction = 0)
    private BigDecimal discountValue;
    @DecimalMin("0") @Digits(integer = 14, fraction = 0)
    private BigDecimal maxDiscount;
    @NotNull @DecimalMin("0") @Digits(integer = 14, fraction = 0)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;
    @NotNull
    private LocalDateTime startAt;
    @NotNull
    private LocalDateTime endAt;
    @Positive
    private Integer usageLimit;
    @NotNull @Positive
    private Integer perUserLimit = 1;

    public void setCode(String value) { code = value == null ? null : value.strip(); }
    public void setDescription(String value) { description = value == null ? null : value.strip(); }

    // 1.0 and 1e0 are valid whole amounts; fractional input is never rounded.
    public void setDiscountValue(BigDecimal value) { discountValue = normalize(value); }
    public void setMaxDiscount(BigDecimal value) { maxDiscount = normalize(value); }
    public void setMinOrderAmount(BigDecimal value) { minOrderAmount = normalize(value); }

    private static BigDecimal normalize(BigDecimal value) {
        return value == null ? null : value.stripTrailingZeros();
    }

    public Voucher toEntity() {
        Voucher voucher = new Voucher();
        voucher.setCode(getCode().strip());
        voucher.setDescription(getDescription() == null || getDescription().isBlank() ? null : getDescription().strip());
        voucher.setDiscountType(getDiscountType());
        voucher.setDiscountValue(getDiscountValue());
        voucher.setMaxDiscount(getMaxDiscount());
        voucher.setMinOrderAmount(getMinOrderAmount());
        voucher.setStartAt(getStartAt());
        voucher.setEndAt(getEndAt());
        voucher.setUsageLimit(getUsageLimit());
        voucher.setPerUserLimit(getPerUserLimit());
        voucher.setUsedCount(0);
        voucher.setStatus(VoucherStatus.ACTIVE);
        return voucher;
    }
}
