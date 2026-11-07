package com.carrental.dto.response;

import com.carrental.entity.CarImage;
import lombok.Builder;

public record CarImageResponse(
        Long id,
        String imageUrl,
        Boolean isPrimary,
        Integer sortOrder
) {
    public static CarImageResponse from(CarImage img) {
        if (img == null) return null;
        return new CarImageResponse(
                img.getId(),
                img.getImageUrl(),
                img.getIsPrimary(),
                img.getSortOrder()
        );
    }
}
