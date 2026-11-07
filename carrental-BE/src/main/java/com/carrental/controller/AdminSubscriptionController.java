package com.carrental.controller;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.SubscriptionResponse;
import com.carrental.enums.SubscriptionStatus;
import com.carrental.service.CarSubscriptionService;
import com.carrental.util.PageRequestFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/subscriptions")
@RequiredArgsConstructor
public class AdminSubscriptionController {

    private final CarSubscriptionService subscriptionService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<SubscriptionResponse>> getAll(
            @RequestParam(required = false) SubscriptionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.ok(subscriptionService.getAllSubscriptions(status,
                PageRequestFactory.of(page, size, sortBy, direction, CarSubscriptionController.SORT_FIELDS, "createdAt")));
    }
}
