package com.carrental.controller;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.CarReviewSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.ReviewEligibilityResponse;
import com.carrental.dto.response.ReviewResponse;
import com.carrental.service.ReviewService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER')")
    @PostMapping("/api/reviews")
    public ApiResponse<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ApiResponse.ok("Gửi đánh giá thành công", reviewService.createReview(request));
    }

    @GetMapping("/api/cars/{carId}/reviews")
    public ApiResponse<CarReviewSummaryResponse> getCarReviews(@PathVariable Long carId) {
        return ApiResponse.ok(reviewService.getReviewsByCarId(carId));
    }

    @GetMapping("/api/cars/{carId}/reviews/eligibility")
    public ApiResponse<ReviewEligibilityResponse> checkEligibility(@PathVariable Long carId) {
        return ApiResponse.ok(reviewService.checkEligibility(carId));
    }

    @GetMapping("/api/reviews/{id}")
    public ApiResponse<ReviewResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(reviewService.getById(id));
    }

    @GetMapping("/api/reviews")
    public ApiResponse<PageResponse<ReviewResponse>> getPaged(
            @RequestParam(required = false) Long carId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        Pageable pageable = PageRequestFactory.of(page, size, sort);
        return ApiResponse.ok(reviewService.getPaged(carId, customerId, pageable));
    }

    /** Chủ xe phản hồi đánh giá về xe của mình. Body: {"reply": "..."} */
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/api/reviews/{id}/reply")
    public ApiResponse<ReviewResponse> reply(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        return ApiResponse.ok("Đã gửi phản hồi", reviewService.replyAsOwner(id, body.get("reply")));
    }

    // Admin gỡ đánh giá rác / vi phạm
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.web.bind.annotation.DeleteMapping("/api/admin/reviews/{id}")
    public ApiResponse<Void> deleteByAdmin(@PathVariable Long id) {
        reviewService.deleteByAdmin(id);
        return ApiResponse.ok("Đã gỡ đánh giá", null);
    }

    // Admin duyệt đánh giá để hiển thị công khai
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.web.bind.annotation.PatchMapping("/api/admin/reviews/{id}/approve")
    public ApiResponse<ReviewResponse> approveByAdmin(@PathVariable Long id) {
        return ApiResponse.ok("Đã duyệt đánh giá", reviewService.approveByAdmin(id));
    }
}
