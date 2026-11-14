package com.carrental.service;

import com.carrental.dto.response.*;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface CustomerReviewService {

    CustomerReviewItem create(Long bookingId, Integer rating, String comment);

    BookingCustomerReview forBooking(Long bookingId);

    CustomerRatingSummary forCustomer(Long customerId);

    List<CustomerReviewItem> myGivenReviews();

    PageResponse<CustomerReviewItem> getPagedForAdmin(Pageable pageable);

    CustomerReviewItem approveByAdmin(Long id);

    void deleteByAdmin(Long id);
}
