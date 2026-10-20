package com.carrental.dto.request;

import com.carrental.entity.ExtraFee;
import com.carrental.enums.ExtraFeeStatus;
import com.carrental.enums.FeeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CreateExtraFeeRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    private Long createdById;

    @NotBlank(message = "Loại phí không được để trống")
    private String feeType;

    @NotNull(message = "Số tiền phí không được để trống")
    @Positive(message = "Số tiền phí phải lớn hơn 0")
    private BigDecimal amount;

    private String description;

    public ExtraFee toEntity() {
        ExtraFee extraFee = new ExtraFee();
        FeeType type = FeeType.OTHER;
        if (this.feeType != null) {
            try {
                type = FeeType.valueOf(this.feeType.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        extraFee.setFeeType(type);
        extraFee.setAmount(this.amount);
        extraFee.setDescription(this.description);
        extraFee.setStatus(ExtraFeeStatus.PENDING);
        extraFee.setCreatedAt(LocalDateTime.now());
        extraFee.setUpdatedAt(LocalDateTime.now());
        return extraFee;
    }
}
