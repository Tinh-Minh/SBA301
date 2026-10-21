package com.carrental.service;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.ReviewResponse;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);

    ReviewResponse getById(Long id);

    PageResponse<ReviewResponse> getPaged(Long orderId, Long revieweeId, Pageable pageable);
}
