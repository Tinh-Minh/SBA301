package com.carrental.controller;

import com.carrental.dto.response.ApiResponse;
import com.carrental.service.CustomerReviewService;
import com.carrental.service.CustomerReviewService.BookingCustomerReview;
import com.carrental.service.CustomerReviewService.CustomerRatingSummary;
import com.carrental.service.CustomerReviewService.CustomerReviewItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Chủ xe đánh giá khách thuê (đánh giá 2 chiều). */
@RestController
@RequiredArgsConstructor
public class CustomerReviewController {

    public record CustomerReviewRequest(
            @NotNull(message = "Vui lòng chọn số sao")
            @Min(value = 1, message = "Số sao tối thiểu là 1") @Max(value = 5, message = "Số sao tối đa là 5")
            @tools.jackson.databind.annotation.JsonDeserialize(using = com.carrental.validation.StrictIntegerDeserializer.class)
            Integer rating,
            @Size(max = 1000, message = "Nhận xét tối đa 1000 ký tự") String comment) {}

    private final CustomerReviewService customerReviewService;

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/api/bookings/{id}/customer-review")
    public ApiResponse<CustomerReviewItem> create(@PathVariable Long id, @Valid @RequestBody CustomerReviewRequest request) {
        return ApiResponse.ok("Đã đánh giá khách thuê", customerReviewService.create(id, request.rating(), request.comment()));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/bookings/{id}/customer-review")
    public ApiResponse<BookingCustomerReview> forBooking(@PathVariable Long id) {
        return ApiResponse.ok(customerReviewService.forBooking(id));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/customers/{id}/reviews")
    public ApiResponse<CustomerRatingSummary> forCustomer(@PathVariable Long id) {
        return ApiResponse.ok(customerReviewService.forCustomer(id));
    }
}
