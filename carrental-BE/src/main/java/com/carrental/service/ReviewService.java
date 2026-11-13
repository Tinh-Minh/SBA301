package com.carrental.service;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.CarReviewSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.ReviewEligibilityResponse;
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

    /** Admin duyệt đánh giá để hiển thị công khai. */
    ReviewResponse approveByAdmin(Long id);

    /** Chủ xe phản hồi (hoặc sửa phản hồi) cho đánh giá về xe của mình. */
    ReviewResponse replyAsOwner(Long id, String reply);

    /** Kiểm tra xem tài khoản hiện tại có đủ điều kiện đánh giá xe hay không. */
    ReviewEligibilityResponse checkEligibility(Long carId);
}
