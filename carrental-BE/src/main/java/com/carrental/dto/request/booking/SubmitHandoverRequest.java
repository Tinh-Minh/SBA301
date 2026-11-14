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

public record SubmitHandoverRequest(
        @NotNull(message = "Vui lòng nhập số km trên đồng hồ")
        @Min(value = 0, message = "Số km không được âm") @Max(value = 2_000_000) Integer odometerKm,
        @NotNull(message = "Vui lòng nhập mức nhiên liệu/pin")
        @Min(value = 0, message = "Nhiên liệu từ 0 đến 100%") @Max(value = 100, message = "Nhiên liệu từ 0 đến 100%")
        Integer fuelPercent,
        @Size(max = 1000) String ownerNote,
        @Min(0) BigDecimal otherFeeAmount,
        @Size(max = 500) String otherFeeNote,
        @NotEmpty(message = "Biên bản cần ít nhất một hạng mục có ảnh") List<@Valid HandoverItemInput> items) {}
