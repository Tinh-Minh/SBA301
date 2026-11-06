package com.carrental.controller;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.CarReviewSummaryResponse;
import com.carrental.dto.response.PageResponse;
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

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/api/reviews")
    public ApiResponse<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ApiResponse.ok("Gửi đánh giá thành công", reviewService.createReview(request));
    }

    @GetMapping("/api/cars/{carId}/reviews")
    public ApiResponse<CarReviewSummaryResponse> getCarReviews(@PathVariable Long carId) {
        return ApiResponse.ok(reviewService.getReviewsByCarId(carId));
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
}
