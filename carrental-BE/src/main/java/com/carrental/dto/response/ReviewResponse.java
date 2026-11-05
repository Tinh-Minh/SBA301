package com.carrental.dto.response;

import com.carrental.entity.Review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long carId,
        String carName,
        Long customerId,
        String customerName,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
    public static ReviewResponse from(Review r) {
        if (r == null) return null;
        String carName = null;
        if (r.getCar() != null) {
            carName = (r.getCar().getBrand() != null ? r.getCar().getBrand() + " " : "")
                    + (r.getCar().getModel() != null ? r.getCar().getModel() : "");
            carName = carName.trim();
        }
        return new ReviewResponse(
                r.getId(),
                r.getCar() != null ? r.getCar().getId() : null,
                carName,
                r.getCustomer() != null ? r.getCustomer().getId() : null,
                r.getCustomer() != null ? r.getCustomer().getFullName() : null,
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}
