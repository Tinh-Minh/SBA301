package com.carrental.dto.response;

public record ReviewEligibilityResponse(
        boolean canReview,
        String reason,
        boolean hasCompletedTrip,
        boolean alreadyReviewed,
        boolean isOwner
) {}
