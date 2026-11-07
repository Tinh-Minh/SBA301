package com.carrental.controller;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.ReviewResponse;
import com.carrental.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ApiResponse<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ApiResponse.ok("Gửi đánh giá thành công", reviewService.createReview(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<ReviewResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(reviewService.getById(id));
    }

    @GetMapping
    public ApiResponse<PageResponse<ReviewResponse>> getPaged(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) Long revieweeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        return ApiResponse.ok(reviewService.getPaged(orderId, revieweeId, pageable));
    }
}
