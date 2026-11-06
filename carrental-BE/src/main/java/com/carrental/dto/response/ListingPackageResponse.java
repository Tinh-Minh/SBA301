package com.carrental.dto.response;

import com.carrental.entity.ListingPackage;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ListingPackageResponse(
        long id,
        String name,
        String code,
        BigDecimal price,
        int durationDays,
        int priorityLevel,
        String badgeLabel,
        String description,
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static ListingPackageResponse from(ListingPackage listingPackage) {
        return new ListingPackageResponse(listingPackage.getId(), listingPackage.getName(), listingPackage.getCode(),
                listingPackage.getPrice(), listingPackage.getDurationDays(), listingPackage.getPriorityLevel(),
                listingPackage.getBadgeLabel(), listingPackage.getDescription(), listingPackage.getIsActive(),
                listingPackage.getCreatedAt(), listingPackage.getUpdatedAt());
    }
}
