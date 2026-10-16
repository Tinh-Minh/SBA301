package com.carrental.dto.response;

import com.carrental.entity.Review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long orderId,
        String orderCode,
        Long reviewerId,
        String reviewerName,
        Long revieweeId,
        String revieweeName,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
    public static ReviewResponse from(Review r) {
        if (r == null) return null;
        return new ReviewResponse(
                r.getId(),
                r.getOrder() != null ? r.getOrder().getId() : null,
                r.getOrder() != null ? r.getOrder().getOrderCode() : null,
                r.getReviewer() != null ? r.getReviewer().getId() : null,
                r.getReviewer() != null ? r.getReviewer().getFullName() : null,
                r.getReviewee() != null ? r.getReviewee().getId() : null,
                r.getReviewee() != null ? r.getReviewee().getFullName() : null,
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}
