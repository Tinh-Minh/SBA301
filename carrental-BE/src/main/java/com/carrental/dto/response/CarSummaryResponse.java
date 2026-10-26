package com.carrental.dto.response;

import com.carrental.entity.Car;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.FuelType;
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
        BigDecimal pricePerHour,
        BigDecimal pricePerDay,
        CarStatus status,
        String primaryImageUrl
) {
    public static CarSummaryResponse from(Car car) {
        return from(car, null);
    }

    public static CarSummaryResponse from(Car car, String primaryImageUrl) {
        if (car == null) return null;
        return build(car, car.getLicensePlate(), primaryImageUrl);
    }

    // Bản công khai cho tìm kiếm xe: ẩn biển số xe
    public static CarSummaryResponse publicFrom(Car car, String primaryImageUrl) {
        if (car == null) return null;
        return build(car, null, primaryImageUrl);
    }

    private static CarSummaryResponse build(Car car, String licensePlate, String primaryImageUrl) {
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
                car.getPricePerHour(),
                car.getPricePerDay(),
                car.getStatus(),
                primaryImageUrl
        );
    }
}
