package com.carrental.service;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.CarReviewSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.ReviewResponse;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);

    ReviewResponse getById(Long id);

    CarReviewSummaryResponse getReviewsByCarId(Long carId);

    PageResponse<ReviewResponse> getPaged(Long carId, Long customerId, Pageable pageable);

    default PageResponse<ReviewResponse> getPagedReviews(Long carId, Long customerId, Pageable pageable) {
        return getPaged(carId, customerId, pageable);
    }

    /** Admin gỡ đánh giá vi phạm / rác. */
    void deleteByAdmin(Long id);
}
