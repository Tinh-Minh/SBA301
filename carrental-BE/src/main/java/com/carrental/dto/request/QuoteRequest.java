package com.carrental.dto.request;

import com.carrental.enums.RentalType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Yêu cầu báo giá trước khi đặt xe (không tạo đơn). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuoteRequest {

    @NotNull(message = "Vui lòng chọn slot")
    private Long carSlotId;

    @NotNull(message = "Vui lòng chọn hình thức thuê (HOURLY/DAILY)")
    private RentalType rentalType;

    @NotNull(message = "Vui lòng chọn giờ nhận xe")
    @Schema(example = "2026-10-20T08:00:00")
    private LocalDateTime startTime;

    @NotNull(message = "Vui lòng chọn giờ trả xe")
    @Schema(example = "2026-10-20T18:00:00")
    private LocalDateTime endTime;

    @Size(max = 50, message = "Mã voucher tối đa 50 ký tự")
    private String voucherCode;
}
