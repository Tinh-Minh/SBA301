package com.carrental.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Chủ xe chọn xe, gói cước và mã giảm giá (dùng cho cả báo giá và tạo yêu cầu mua gói). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubscriptionRequest {

    @NotNull(message = "Vui lòng chọn xe cần đăng tin")
    private Long carId;

    @NotNull(message = "Vui lòng chọn gói đăng tin")
    private Long packageId;

    @Size(max = 50, message = "Mã voucher tối đa 50 ký tự")
    private String voucherCode;
}
