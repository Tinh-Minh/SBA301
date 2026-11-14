package com.carrental.dto.request.booking;

import com.carrental.entity.Booking;
import com.carrental.entity.Handover;
import com.carrental.entity.HandoverItem;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.HandoverCategory;
import com.carrental.enums.HandoverItemStatus;
import com.carrental.enums.HandoverStatus;
import com.carrental.enums.HandoverType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.carrental.dto.response.booking.*;

public record CreateBookingRequest(
        @NotNull(message = "Vui lòng chọn xe") Long carId,
        @NotNull(message = "Vui lòng chọn thời gian nhận xe") LocalDateTime pickupAt,
        @NotNull(message = "Vui lòng chọn thời gian trả xe") LocalDateTime returnAt,
        @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
        @Pattern(regexp = "^$|^\\s*(\\+84|0)[0-9]{9,10}\\s*$", message = "Số điện thoại không hợp lệ") String contactPhone,
        @Size(max = 1000, message = "Lời nhắn tối đa 1000 ký tự")
        @Pattern(regexp = "^[^<>]*$", message = "Lời nhắn không được chứa ký tự < hoặc >") String customerNote,
        @Size(max = 50, message = "Mã voucher tối đa 50 ký tự") String voucherCode,
        /* Giao xe tận nơi (tuỳ chọn): bỏ trống toạ độ = khách tự đến lấy xe tại địa chỉ của xe. */
        @Size(max = 300, message = "Địa chỉ giao xe tối đa 300 ký tự")
        @Pattern(regexp = "^[^<>]*$", message = "Địa chỉ giao xe không được chứa ký tự < hoặc >") String deliveryAddress,
        @DecimalMin(value = "-90", message = "Vĩ độ không hợp lệ") @DecimalMax(value = "90", message = "Vĩ độ không hợp lệ") BigDecimal deliveryLatitude,
        @DecimalMin(value = "-180", message = "Kinh độ không hợp lệ") @DecimalMax(value = "180", message = "Kinh độ không hợp lệ") BigDecimal deliveryLongitude) {

    /** Tương thích chỗ gọi cũ (không giao xe). */
    public CreateBookingRequest(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt, String contactPhone,
            String customerNote, String voucherCode) {
        this(carId, pickupAt, returnAt, contactPhone, customerNote, voucherCode, null, null, null);
    }
}
