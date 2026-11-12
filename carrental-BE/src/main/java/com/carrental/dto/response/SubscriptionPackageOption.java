package com.carrental.dto.response;

import com.carrental.entity.ListingPackage;

import java.math.BigDecimal;

/** Một gói cước chủ xe có thể chọn khi mua gói đăng tin. */
public record SubscriptionPackageOption(
        Long id,
        String code,
        String name,
        BigDecimal price,
        Integer durationDays,
        Integer priorityLevel,
        String badgeLabel,
        String description,
        Integer slotCount,
        Integer durationDaysPerSlot) {

    public static SubscriptionPackageOption from(ListingPackage listingPackage) {
        int slots = listingPackage.getSlotCount() != null ? listingPackage.getSlotCount() : 1;
        int slotDays = listingPackage.getDurationDaysPerSlot() != null ? listingPackage.getDurationDaysPerSlot() : 7;
        return new SubscriptionPackageOption(
                listingPackage.getId(),
                listingPackage.getCode(),
                listingPackage.getName(),
                listingPackage.getPrice(),
                listingPackage.getDurationDays(),
                listingPackage.getPriorityLevel(),
                listingPackage.getBadgeLabel(),
                listingPackage.getDescription(),
                slots,
                slotDays);
    }
}
