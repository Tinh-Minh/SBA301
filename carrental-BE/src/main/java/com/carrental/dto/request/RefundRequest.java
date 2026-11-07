package com.carrental.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class RefundRequest {
    @NotNull(message = "Mã giao dịch gốc không được để trống")
    private Long parentTransactionId;

    @Positive(message = "Số tiền hoàn phải lớn hơn 0")
    private BigDecimal amount;

    private String reason;
}
