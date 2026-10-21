package com.carrental.dto.response;

import com.carrental.entity.Car;
import com.carrental.entity.CarSlot;
import com.carrental.enums.CarType;
import com.carrental.enums.FuelType;
import com.carrental.enums.RentalOption;
import com.carrental.enums.Transmission;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AvailableSlotResponse(
        Long slotId,
        Long carId,
        String brand,
        String model,
        CarType carType,
        Integer seats,
        Transmission transmission,
        FuelType fuelType,
        String city,
        String district,
        String pickupAddress,
        String primaryImageUrl,
        LocalDateTime slotStartTime,
        LocalDateTime slotEndTime,
        BigDecimal pricePerHour,
        BigDecimal pricePerDay,
        RentalOption rentalOption,
        Integer minRentalHours
) {
    public static AvailableSlotResponse from(CarSlot slot, String primaryImageUrl) {
        if (slot == null) return null;
        Car c = slot.getCar();
        return new AvailableSlotResponse(
                slot.getId(),
                c != null ? c.getId() : null,
                c != null ? c.getBrand() : null,
                c != null ? c.getModel() : null,
                c != null ? c.getCarType() : null,
                c != null ? c.getSeats() : null,
                c != null ? c.getTransmission() : null,
                c != null ? c.getFuelType() : null,
                c != null ? c.getCity() : null,
                c != null ? c.getDistrict() : null,
                c != null ? c.getPickupAddress() : null,
                primaryImageUrl,
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getPricePerHour(),
                slot.getPricePerDay(),
                slot.getRentalOption(),
                slot.getMinRentalHours()
        );
    }
}
