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
        String primaryImageUrl,
        BigDecimal latitude,
        BigDecimal longitude
) {
    public static CarSummaryResponse from(Car car) {
        return from(car, null);
    }

    public static CarSummaryResponse from(Car car, String primaryImageUrl) {
        if (car == null) return null;
        return build(car, car.getLicensePlate(), primaryImageUrl, false);
    }

    // Bản công khai cho tìm kiếm xe rao vặt
    public static CarSummaryResponse publicFrom(Car car, String primaryImageUrl) {
        if (car == null) return null;
        return build(car, null, primaryImageUrl, true);
    }

    private static CarSummaryResponse build(Car car, String licensePlate, String primaryImageUrl, boolean hideOwnerContact) {
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
                hideOwnerContact ? null : car.getContactName(),
                hideOwnerContact ? null : car.getContactPhone(),
                hideOwnerContact ? null : car.getContactZalo(),
                car.getStatus(),
                car.getListingStatus(),
                com.carrental.util.RentalPricing.hourlyRate(dayPrice),
                dayPrice,
                primaryImageUrl,
                car.getLatitude(),
                car.getLongitude()
        );
    }
}
