package com.carrental.dto.response;

import java.util.List;
import com.carrental.dto.request.*;

public record CustomerRatingSummary(Long customerId, String customerName, double averageRating,
                                    long totalReviews, List<CustomerReviewItem> reviews) {}
