package com.carrental.dto.request;

import com.carrental.enums.RentalOption;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarSlotUpdateRequest {

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @PositiveOrZero(message = "Giá thuê theo giờ phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Giá thuê theo giờ không có số lẻ")
    private BigDecimal pricePerHour;

    @PositiveOrZero(message = "Giá thuê theo ngày phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Giá thuê theo ngày không có số lẻ")
    private BigDecimal pricePerDay;

    private RentalOption rentalOption;

    @Min(value = 1, message = "Số giờ thuê tối thiểu phải >= 1")
    private Integer minRentalHours;
}
