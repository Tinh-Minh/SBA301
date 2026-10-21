package com.carrental.dto.response;

import com.carrental.entity.Car;
import com.carrental.entity.CarDocument;
import com.carrental.entity.CarImage;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.FuelType;
import com.carrental.enums.Transmission;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public record CarResponse(
        Long id,
        Long ownerId,
        String ownerFullName,
        Long driverId,
        String licensePlate,
        String brand,
        String model,
        Integer manufactureYear,
        CarType carType,
        Integer seats,
        Transmission transmission,
        FuelType fuelType,
        String color,
        String description,
        String features,
        String city,
        String district,
        String pickupAddress,
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal pricePerHour,
        BigDecimal pricePerDay,
        BigDecimal depositAmount,
        Integer kmLimitPerDay,
        BigDecimal extraKmFee,
        CarStatus status,
        List<CarImageResponse> images,
        List<CarDocumentResponse> documents,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CarResponse from(Car car) {
        return from(car, Collections.emptyList(), Collections.emptyList());
    }

    public static CarResponse from(Car car, List<CarImage> images, List<CarDocument> documents) {
        if (car == null) return null;

        List<CarImageResponse> imgList = images == null ? Collections.emptyList() :
                images.stream().map(CarImageResponse::from).toList();

        List<CarDocumentResponse> docList = documents == null ? Collections.emptyList() :
                documents.stream().map(CarDocumentResponse::from).toList();

        return new CarResponse(
                car.getId(),
                car.getOwner() != null ? car.getOwner().getId() : null,
                car.getOwner() != null ? car.getOwner().getFullName() : null,
                car.getDriver() != null ? car.getDriver().getId() : null,
                car.getLicensePlate(),
                car.getBrand(),
                car.getModel(),
                car.getManufactureYear(),
                car.getCarType(),
                car.getSeats(),
                car.getTransmission(),
                car.getFuelType(),
                car.getColor(),
                car.getDescription(),
                car.getFeatures(),
                car.getCity(),
                car.getDistrict(),
                car.getPickupAddress(),
                car.getLatitude(),
                car.getLongitude(),
                car.getPricePerHour(),
                car.getPricePerDay(),
                car.getDepositAmount(),
                car.getKmLimitPerDay(),
                car.getExtraKmFee(),
                car.getStatus(),
                imgList,
                docList,
                car.getCreatedAt(),
                car.getUpdatedAt()
        );
    }

    // Bản công khai cho khách vãng lai: ẩn licensePlate, driverId, documents (Phần 5.4)
    public static CarResponse publicView(Car car, List<CarImage> images) {
        if (car == null) return null;

        List<CarImageResponse> imgList = images == null ? Collections.emptyList() :
                images.stream().map(CarImageResponse::from).toList();

        return new CarResponse(
                car.getId(),
                car.getOwner() != null ? car.getOwner().getId() : null,
                car.getOwner() != null ? car.getOwner().getFullName() : null,
                null, // Ẩn driverId
                null, // Ẩn biển số xe
                car.getBrand(),
                car.getModel(),
                car.getManufactureYear(),
                car.getCarType(),
                car.getSeats(),
                car.getTransmission(),
                car.getFuelType(),
                car.getColor(),
                car.getDescription(),
                car.getFeatures(),
                car.getCity(),
                car.getDistrict(),
                car.getPickupAddress(),
                car.getLatitude(),
                car.getLongitude(),
                car.getPricePerHour(),
                car.getPricePerDay(),
                car.getDepositAmount(),
                car.getKmLimitPerDay(),
                car.getExtraKmFee(),
                car.getStatus(),
                imgList,
                Collections.emptyList(), // Ẩn giấy tờ xe
                car.getCreatedAt(),
                car.getUpdatedAt()
        );
    }
}
