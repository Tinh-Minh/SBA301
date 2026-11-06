package com.carrental.dto.response;

import com.carrental.entity.Review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long carId,
        String carLicensePlate,
        String carBrandModel,
        Long customerId,
        String customerName,
        String customerAvatar,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
    public static ReviewResponse from(Review r) {
        if (r == null) return null;
        Long carId = r.getCar() != null ? r.getCar().getId() : null;
        String licensePlate = r.getCar() != null ? r.getCar().getLicensePlate() : null;
        String carBrandModel = r.getCar() != null ? (r.getCar().getBrand() + " " + r.getCar().getModel()) : null;
        Long customerId = r.getCustomer() != null ? r.getCustomer().getId() : null;
        String customerName = r.getCustomer() != null ? r.getCustomer().getFullName() : null;
        String customerAvatar = r.getCustomer() != null ? r.getCustomer().getAvatarUrl() : null;

        return new ReviewResponse(
                r.getId(),
                carId,
                licensePlate,
                carBrandModel,
                customerId,
                customerName,
                customerAvatar,
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}
