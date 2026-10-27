package com.carrental.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Lý do/ghi chú khi xác nhận, từ chối hoặc huỷ đơn. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderActionRequest {

    @Size(max = 500, message = "Lý do tối đa 500 ký tự")
    private String reason;

    /** Body là tuỳ chọn: không gửi body thì lý do là null. */
    public static String reasonOf(OrderActionRequest request) {
        return request == null ? null : request.getReason();
    }
}
