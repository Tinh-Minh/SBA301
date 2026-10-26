package com.carrental.dto.response;

import com.carrental.entity.Car;
import com.carrental.entity.CarSlot;
import com.carrental.enums.RentalOption;
import com.carrental.enums.SlotStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CarSlotResponse(
        Long id,
        Long carId,
        String licensePlate,
        String brand,
        String model,
        LocalDateTime startTime,
        LocalDateTime endTime,
        BigDecimal pricePerHour,
        BigDecimal pricePerDay,
        RentalOption rentalOption,
        Integer minRentalHours,
        SlotStatus status,
        Long version,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CarSlotResponse from(CarSlot slot) {
        if (slot == null) return null;
        Car car = slot.getCar();
        return new CarSlotResponse(
                slot.getId(),
                car != null ? car.getId() : null,
                car != null ? car.getLicensePlate() : null,
                car != null ? car.getBrand() : null,
                car != null ? car.getModel() : null,
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getPricePerHour(),
                slot.getPricePerDay(),
                slot.getRentalOption(),
                slot.getMinRentalHours(),
                slot.getStatus(),
                slot.getVersion(),
                slot.getCreatedAt(),
                slot.getUpdatedAt()
        );
    }
}
