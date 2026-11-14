package com.carrental.dto.response;

import com.carrental.dto.request.*;

public record BookingCustomerReview(CustomerReviewItem review, boolean canReview, CustomerRatingSummary customer) {}
