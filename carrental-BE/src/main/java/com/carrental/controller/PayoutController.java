package com.carrental.controller;

import com.carrental.dto.request.CreatePayoutRequest;
import com.carrental.dto.request.ProcessPayoutRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.PayoutResponse;
import com.carrental.service.PayoutService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payouts")
@RequiredArgsConstructor
public class PayoutController {

    private final PayoutService payoutService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<PayoutResponse> createPayout(@Valid @RequestBody CreatePayoutRequest request) {
        return ApiResponse.ok("Tạo yêu cầu chi trả thành công", payoutService.createPayout(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/process")
    public ApiResponse<PayoutResponse> processPayout(
            @PathVariable Long id,
            @Valid @RequestBody ProcessPayoutRequest request) {
        return ApiResponse.ok("Cập nhật trạng thái chi trả thành công", payoutService.processPayout(id, request));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<PayoutResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(payoutService.getById(id));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<PayoutResponse>> getPaged(
            @RequestParam(required = false) Long recipientId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        Pageable pageable = PageRequestFactory.of(page, size, sort);
        return ApiResponse.ok(payoutService.getPaged(recipientId, orderId, status, pageable));
    }
}
