package com.carrental.dto.response;

import java.util.List;

public record CarReviewSummaryResponse(
        Long carId,
        Double averageRating,
        long totalReviews,
        List<ReviewResponse> reviews
) {}

