package com.carrental.dto.request;

import com.carrental.entity.Car;
import com.carrental.entity.CarSlot;
import com.carrental.enums.RentalOption;
import com.carrental.enums.SlotStatus;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class CarSlotCreateRequest {

    @NotNull(message = "ID xe không được để trống")
    private Long carId;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @Future(message = "Thời gian bắt đầu phải ở tương lai")
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endTime;

    @Builder.Default
    private RentalOption rentalOption = RentalOption.BOTH;

    @Min(value = 1, message = "Số giờ thuê tối thiểu phải >= 1")
    @Builder.Default
    private Integer minRentalHours = 1;

    @PositiveOrZero(message = "Giá thuê theo giờ phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Giá thuê theo giờ không có số lẻ")
    private BigDecimal customPricePerHour;

    @PositiveOrZero(message = "Giá thuê theo ngày phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Giá thuê theo ngày không có số lẻ")
    private BigDecimal customPricePerDay;

    public RentalOption resolvedRentalOption() {
        return this.rentalOption != null ? this.rentalOption : RentalOption.BOTH;
    }

    public int resolvedMinRentalHours() {
        return this.minRentalHours != null ? this.minRentalHours : 1;
    }

    public CarSlot toEntity(Car car) {
        BigDecimal finalPricePerHour = this.customPricePerHour != null ? this.customPricePerHour : car.getPricePerHour();
        BigDecimal finalPricePerDay = this.customPricePerDay != null ? this.customPricePerDay : car.getPricePerDay();

        return CarSlot.builder()
                .car(car)
                .startTime(this.startTime)
                .endTime(this.endTime)
                .pricePerHour(finalPricePerHour)
                .pricePerDay(finalPricePerDay)
                .rentalOption(resolvedRentalOption())
                .minRentalHours(resolvedMinRentalHours())
                .status(SlotStatus.OPEN)
                .build();
    }
}
