package com.carrental.dto.request.listingpackage;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ListingPackageCreateRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 50) @Pattern(regexp = "[A-Za-z0-9_-]+") String code,
        @NotNull @DecimalMin("0") @Digits(integer = 14, fraction = 0) BigDecimal price,
        @NotNull @Positive Integer durationDays,
        @NotNull @Min(1) @Max(3) Integer priorityLevel,
        @Size(max = 50) String badgeLabel,
        String description,
        Boolean isActive,
        @Positive Integer slotCount,
        @Positive Integer durationDaysPerSlot) {

    public ListingPackageCreateRequest(
            String name,
            String code,
            BigDecimal price,
            Integer durationDays,
            Integer priorityLevel,
            String badgeLabel,
            String description,
            Boolean isActive) {
        this(name, code, price, durationDays, priorityLevel, badgeLabel, description, isActive, 1,
                durationDays != null ? durationDays : 7);
    }
}
