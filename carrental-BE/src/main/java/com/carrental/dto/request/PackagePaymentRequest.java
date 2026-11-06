package com.carrental.dto.request;

import com.carrental.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackagePaymentRequest {

    @NotNull(message = "subscriptionId không được để trống")
    private Long subscriptionId;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod method;

    private String bankCode;
}

