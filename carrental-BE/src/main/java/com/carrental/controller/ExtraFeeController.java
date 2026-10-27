package com.carrental.controller;

import com.carrental.dto.request.CreateExtraFeeRequest;
import com.carrental.dto.request.PayExtraFeeRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.ExtraFeeResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.service.ExtraFeeService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/extra-fees")
@RequiredArgsConstructor
public class ExtraFeeController {

    private final ExtraFeeService extraFeeService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ApiResponse<ExtraFeeResponse> createExtraFee(@Valid @RequestBody CreateExtraFeeRequest request) {
        return ApiResponse.ok("Tạo phí phát sinh thành công", extraFeeService.createExtraFee(request));
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/{id}/pay")
    public ApiResponse<ExtraFeeResponse> payExtraFee(
            @PathVariable Long id,
            @RequestBody(required = false) PayExtraFeeRequest request) {
        return ApiResponse.ok("Thanh toán phí phát sinh thành công", extraFeeService.payExtraFee(id, request));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @PutMapping("/{id}/waive")
    public ApiResponse<ExtraFeeResponse> waiveExtraFee(
            @PathVariable Long id,
            @RequestParam(required = false) String note) {
        return ApiResponse.ok("Miễn trừ phí phát sinh thành công", extraFeeService.waiveExtraFee(id, note));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<ExtraFeeResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(extraFeeService.getById(id));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<ExtraFeeResponse>> getPaged(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        Pageable pageable = com.carrental.util.PageRequestFactory.of(page, size, sort);
        return ApiResponse.ok(extraFeeService.getPaged(orderId, status, pageable));
    }
}
