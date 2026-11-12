package com.carrental.dto.response;

import com.carrental.entity.Car;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.FuelType;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.Transmission;

import java.math.BigDecimal;

public record CarSummaryResponse(
        Long id,
        String licensePlate,
        String brand,
        String model,
        CarType carType,
        Integer seats,
        Transmission transmission,
        FuelType fuelType,
        String city,
        String district,
        BigDecimal rentalPricePerDay,
        BigDecimal rentalPricePerMonth,
        String contactName,
        String contactPhone,
        String contactZalo,
        CarStatus status,
        ListingStatus listingStatus,
        BigDecimal pricePerHour,
        BigDecimal pricePerDay,
        String primaryImageUrl
) {
    public static CarSummaryResponse from(Car car) {
        return from(car, null);
    }

    public static CarSummaryResponse from(Car car, String primaryImageUrl) {
        if (car == null) return null;
        return build(car, car.getLicensePlate(), primaryImageUrl);
    }

    // Bản công khai cho tìm kiếm xe rao vặt
    public static CarSummaryResponse publicFrom(Car car, String primaryImageUrl) {
        if (car == null) return null;
        return build(car, null, primaryImageUrl);
    }

    private static CarSummaryResponse build(Car car, String licensePlate, String primaryImageUrl) {
        BigDecimal dayPrice = car.getRentalPricePerDay() != null ? car.getRentalPricePerDay() : BigDecimal.ZERO;
        return new CarSummaryResponse(
                car.getId(),
                licensePlate,
                car.getBrand(),
                car.getModel(),
                car.getCarType(),
                car.getSeats(),
                car.getTransmission(),
                car.getFuelType(),
                car.getCity(),
                car.getDistrict(),
                dayPrice,
                car.getRentalPricePerMonth(),
                car.getContactName(),
                car.getContactPhone(),
                car.getContactZalo(),
                car.getStatus(),
                car.getListingStatus(),
                com.carrental.util.RentalPricing.hourlyRate(dayPrice),
                dayPrice,
                primaryImageUrl
        );
    }
}
