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

    @NotNull(message = "Mã đăng ký gói (subscriptionId) không được để trống")
    private Long subscriptionId;

    // Không bắt buộc: bỏ trống thì mặc định VNPAY (xem getMethod()).
    @Builder.Default
    private PaymentMethod method = PaymentMethod.VNPAY;

    private String bankCode;

    /** Jackson có thể gán null khi JSON không có trường method, nên mặc định hoá ở getter. */
    public PaymentMethod getMethod() {
        return method != null ? method : PaymentMethod.VNPAY;
    }
}
