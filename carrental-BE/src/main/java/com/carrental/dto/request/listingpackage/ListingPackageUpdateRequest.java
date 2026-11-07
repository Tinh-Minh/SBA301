package com.carrental.dto.request.listingpackage;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ListingPackageUpdateRequest(
        @NotBlank @Size(max = 100) String name,
        @NotNull @DecimalMin("0") @Digits(integer = 14, fraction = 0) BigDecimal price,
        @NotNull @Positive Integer durationDays,
        @NotNull @Min(1) @Max(3) Integer priorityLevel,
        @Size(max = 50) String badgeLabel,
        String description,
        @NotNull Boolean isActive) {
}
