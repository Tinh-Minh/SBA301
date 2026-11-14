package com.carrental.controller;

import com.carrental.dto.request.*;
import com.carrental.dto.response.*;
import com.carrental.service.CustomerReviewService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Chủ xe đánh giá khách thuê (đánh giá 2 chiều) & Admin kiểm duyệt đánh giá khách thuê. */
@RestController
@RequiredArgsConstructor
public class CustomerReviewController {

    private final CustomerReviewService customerReviewService;

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/api/bookings/{id}/customer-review")
    public ApiResponse<CustomerReviewItem> create(@PathVariable Long id, @Valid @RequestBody CustomerReviewRequest request) {
        return ApiResponse.ok("Đã gửi đánh giá khách thuê, đang chờ Admin kiểm duyệt", customerReviewService.create(id, request.rating(), request.comment()));
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

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/api/customer-reviews/my-given")
    public ApiResponse<List<CustomerReviewItem>> myGivenReviews() {
        return ApiResponse.ok(customerReviewService.myGivenReviews());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/customer-reviews")
    public ApiResponse<PageResponse<CustomerReviewItem>> getPagedForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        Pageable pageable = PageRequestFactory.of(page, size, sort);
        return ApiResponse.ok(customerReviewService.getPagedForAdmin(pageable));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/api/admin/customer-reviews/{id}/approve")
    public ApiResponse<CustomerReviewItem> approveByAdmin(@PathVariable Long id) {
        return ApiResponse.ok("Đã duyệt đánh giá khách thuê", customerReviewService.approveByAdmin(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/admin/customer-reviews/{id}")
    public ApiResponse<Void> deleteByAdmin(@PathVariable Long id) {
        customerReviewService.deleteByAdmin(id);
        return ApiResponse.ok("Đã gỡ đánh giá khách thuê", null);
    }
}
