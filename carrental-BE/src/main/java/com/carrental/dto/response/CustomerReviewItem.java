package com.carrental.dto.response;

import java.time.LocalDateTime;
import com.carrental.dto.request.*;

public record CustomerReviewItem(Long id, Long bookingId, Long ownerId, String ownerName,
                                 Integer rating, String comment, LocalDateTime createdAt) {}
