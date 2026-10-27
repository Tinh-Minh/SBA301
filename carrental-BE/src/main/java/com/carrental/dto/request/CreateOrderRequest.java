package com.carrental.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Tạo đơn thuê = thông tin báo giá + ghi chú cho chủ xe. */
@Getter
@Setter
@NoArgsConstructor
public class CreateOrderRequest extends QuoteRequest {

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String note;
}
