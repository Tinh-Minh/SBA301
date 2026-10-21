package com.carrental.dto.request;

import com.carrental.enums.CarType;
import com.carrental.enums.RentalType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private RentalType rentalType; // HOURLY hoặc DAILY
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 10;
}
