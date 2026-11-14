package com.carrental.service;

import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

public interface CustomerReviewService {

    CustomerReviewItem create(Long bookingId, Integer rating, String comment);

    BookingCustomerReview forBooking(Long bookingId);

    CustomerRatingSummary forCustomer(Long customerId);
}
