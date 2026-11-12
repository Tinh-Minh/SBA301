package com.carrental.controller;

import com.carrental.dto.request.CreateSubscriptionRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.SubscriptionPackageOption;
import com.carrental.dto.response.SubscriptionQuoteResponse;
import com.carrental.dto.response.SubscriptionResponse;
import com.carrental.service.CarSubscriptionService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class CarSubscriptionController {

    static final Set<String> SORT_FIELDS = Set.of("createdAt", "startDate", "endDate", "totalAmount", "status");

    private final CarSubscriptionService subscriptionService;

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/packages")
    public ApiResponse<List<SubscriptionPackageOption>> getPackages() {
        return ApiResponse.ok(subscriptionService.getPackages());
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/quote")
    public ApiResponse<SubscriptionQuoteResponse> quote(@Valid @RequestBody CreateSubscriptionRequest request) {
        return ApiResponse.ok(subscriptionService.quote(request));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SubscriptionResponse> create(@Valid @RequestBody CreateSubscriptionRequest request) {
        return ApiResponse.ok("Tạo yêu cầu mua gói thành công", subscriptionService.createSubscription(request));
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/my-subscriptions")
    public ApiResponse<PageResponse<SubscriptionResponse>> getMine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.ok(subscriptionService.getMySubscriptions(
                PageRequestFactory.of(page, size, sortBy, direction, SORT_FIELDS, "createdAt")));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<SubscriptionResponse> getDetail(@PathVariable Long id) {
        return ApiResponse.ok(subscriptionService.getSubscriptionDetail(id));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @PostMapping("/{id}/activate-slot")
    public ApiResponse<SubscriptionResponse> activateSlot(@PathVariable Long id) {
        return ApiResponse.ok("Kích hoạt slot thành công", subscriptionService.activateNextSlot(id));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @PutMapping("/{id}/cancel")
    public ApiResponse<SubscriptionResponse> cancel(@PathVariable Long id) {
        return ApiResponse.ok("Huỷ gói đăng tin thành công", subscriptionService.cancelSubscription(id));
    }
}
