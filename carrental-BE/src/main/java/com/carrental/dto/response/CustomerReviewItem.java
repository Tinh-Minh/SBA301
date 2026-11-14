package com.carrental.dto.response;

import java.time.LocalDateTime;

public record CustomerReviewItem(
        Long id,
        Long bookingId,
        String bookingCode,
        String carName,
        Long ownerId,
        String ownerName,
        Long customerId,
        String customerName,
        Integer rating,
        String comment,
        Boolean approved,
        LocalDateTime createdAt
) {}
