package com.carrental.dto.response;

import com.carrental.entity.Car;
import com.carrental.entity.CarDocument;
import com.carrental.entity.CarImage;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.FuelType;
import com.carrental.enums.ListingStatus;
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
        BigDecimal rentalPricePerDay,
        BigDecimal rentalPricePerMonth,
        String contactName,
        String contactPhone,
        String contactZalo,
        CarStatus status,
        ListingStatus listingStatus,
        Long currentSubscriptionId,
        BigDecimal pricePerHour,
        BigDecimal pricePerDay,
        BigDecimal depositAmount,
        Integer kmLimitPerDay,
        BigDecimal extraKmFee,
        BigDecimal lateFeePerHour,
        BigDecimal weekendPricePerDay,
        String rejectReason,
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
        Long driverId = null;
        return build(car, driverId, car.getLicensePlate(), images, documents, false);
    }

    // Bản công khai cho khách xem tin: KHÔNG lộ tên/số điện thoại/Zalo chủ xe (chỉ hiện sau khi khách đã cọc, trong đơn thuê).
    public static CarResponse publicView(Car car, List<CarImage> images) {
        if (car == null) return null;
        return build(car, null, null, images, Collections.emptyList(), true);
    }

    private static CarResponse build(
            Car car,
            Long driverId,
            String licensePlate,
            List<CarImage> images,
            List<CarDocument> documents,
            boolean hideOwnerContact
    ) {
        List<CarImageResponse> imgList = images == null ? Collections.emptyList() :
                images.stream().map(CarImageResponse::from).toList();

        List<CarDocumentResponse> docList = documents == null ? Collections.emptyList() :
                documents.stream().map(CarDocumentResponse::from).toList();

        BigDecimal dayPrice = car.getRentalPricePerDay() != null ? car.getRentalPricePerDay() : BigDecimal.ZERO;

        return new CarResponse(
                car.getId(),
                car.getOwner() != null ? car.getOwner().getId() : null,
                car.getOwner() != null && !hideOwnerContact ? car.getOwner().getFullName() : null,
                driverId,
                licensePlate,
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
                dayPrice,
                car.getRentalPricePerMonth(),
                hideOwnerContact ? null : car.getContactName(),
                hideOwnerContact ? null : car.getContactPhone(),
                hideOwnerContact ? null : car.getContactZalo(),
                car.getStatus(),
                car.getListingStatus(),
                car.getCurrentSubscriptionId(),
                com.carrental.util.RentalPricing.hourlyRate(dayPrice),
                dayPrice,
                car.getDepositAmount() != null ? car.getDepositAmount() : BigDecimal.ZERO,
                car.getKmLimitPerDay(),
                car.getExtraKmFee(),
                car.getLateFeePerHour(),
                car.getWeekendPricePerDay(),
                // Lý do từ chối chỉ dành cho chủ xe/admin (bản công khai không có biển số)
                licensePlate != null ? car.getRejectReason() : null,
                imgList,
                docList,
                car.getCreatedAt(),
                car.getUpdatedAt()
        );
    }
}
