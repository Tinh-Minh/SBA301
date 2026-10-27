package com.carrental.dto.response;

import com.carrental.entity.HandoverImage;
import com.carrental.entity.OrderHandover;
import com.carrental.enums.HandoverType;

import java.time.LocalDateTime;
import java.util.List;

/** Biên bản bàn giao nhận/trả xe kèm ảnh. */
public record HandoverResponse(
        Long id,
        Long orderId,
        HandoverType handoverType,
        Integer odometerKm,
        Integer fuelPercent,
        String conditionNote,
        LocalDateTime handedAt,
        LocalDateTime renterConfirmedAt,
        LocalDateTime ownerConfirmedAt,
        boolean fullyConfirmed,
        LocalDateTime createdAt,
        List<Image> images) {

    public record Image(Long id, String imageUrl, String caption) {
        static Image from(HandoverImage img) {
            return new Image(img.getId(), img.getImageUrl(), img.getCaption());
        }
    }

    /** Biên bản chỉ có hiệu lực khi cả người thuê và chủ xe đều đã xác nhận. */
    public static boolean isFullyConfirmed(OrderHandover h) {
        return h.getRenterConfirmedAt() != null && h.getOwnerConfirmedAt() != null;
    }

    /** Entity OrderHandover dùng chung không giữ danh sách ảnh nên ảnh được truyền vào riêng. */
    public static HandoverResponse from(OrderHandover h, List<HandoverImage> images) {
        return new HandoverResponse(
                h.getId(),
                h.getOrder().getId(),
                h.getHandoverType(),
                h.getOdometerKm(),
                h.getFuelPercent(),
                h.getConditionNote(),
                h.getHandedAt(),
                h.getRenterConfirmedAt(),
                h.getOwnerConfirmedAt(),
                isFullyConfirmed(h),
                h.getCreatedAt(),
                images.stream().map(Image::from).toList());
    }
}
