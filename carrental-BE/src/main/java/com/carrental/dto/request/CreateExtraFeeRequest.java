package com.carrental.dto.request;

import com.carrental.entity.ExtraFee;
import com.carrental.enums.ExtraFeeStatus;
import com.carrental.enums.ExtraFeeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

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
        extraFee.setFeeType(this.feeType != null ? this.feeType : ExtraFeeType.OTHER.name());
        extraFee.setAmount(this.amount);
        extraFee.setDescription(this.description);
        extraFee.setStatus(ExtraFeeStatus.PENDING.name());
        extraFee.setCreatedAt(Instant.now());
        extraFee.setUpdatedAt(Instant.now());
        return extraFee;
    }
}
