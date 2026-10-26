package com.carrental.dto.request;

import com.carrental.enums.CarType;
import com.carrental.enums.RentalType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarSlotSearchRequest {

    private String city;
    private CarType carType;
    private Integer seats;
    private BigDecimal maxPricePerHour;
    private BigDecimal maxPricePerDay;
    private RentalType rentalType;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startTime;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endTime;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 10;
}
