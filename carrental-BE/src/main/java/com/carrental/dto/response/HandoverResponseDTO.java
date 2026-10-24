package com.carrental.dto.response;

import com.carrental.entity.HandoverImage;
import com.carrental.entity.OrderHandover;
import com.carrental.enums.HandoverType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverResponseDTO {

    private Long id;
    private Long orderId;
    private HandoverType handoverType;
    private Integer odometerKm;
    private Integer fuelPercent;
    private String conditionNote;
    private LocalDateTime handedAt;
    private LocalDateTime renterConfirmedAt;
    private LocalDateTime ownerConfirmedAt;
    private boolean fullyConfirmed;
    private LocalDateTime createdAt;
    private List<Image> images;

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Image {
        private Long id;
        private String imageUrl;
        private String caption;

        static Image fromEntity(HandoverImage img) {
            return new Image(img.getId(), img.getImageUrl(), img.getCaption());
        }
    }

    /** Biên bản chỉ có hiệu lực khi cả người thuê và chủ xe đều đã xác nhận. */
    public static boolean isFullyConfirmed(OrderHandover h) {
        return h.getRenterConfirmedAt() != null && h.getOwnerConfirmedAt() != null;
    }

    /** Entity OrderHandover dùng chung không giữ danh sách ảnh nên ảnh được truyền vào riêng. */
    public static HandoverResponseDTO fromEntity(OrderHandover h, List<HandoverImage> images) {
        return HandoverResponseDTO.builder()
                .id(h.getId())
                .orderId(h.getOrder().getId())
                .handoverType(h.getHandoverType())
                .odometerKm(h.getOdometerKm())
                .fuelPercent(h.getFuelPercent())
                .conditionNote(h.getConditionNote())
                .handedAt(h.getHandedAt())
                .renterConfirmedAt(h.getRenterConfirmedAt())
                .ownerConfirmedAt(h.getOwnerConfirmedAt())
                .fullyConfirmed(isFullyConfirmed(h))
                .createdAt(h.getCreatedAt())
                .images(images.stream().map(Image::fromEntity).toList())
                .build();
    }
}
