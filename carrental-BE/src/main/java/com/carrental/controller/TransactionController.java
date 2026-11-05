package com.carrental.controller;

import com.carrental.dto.request.PackagePaymentRequest;
import com.carrental.dto.request.SimulateGatewayRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.service.TransactionService;
import com.carrental.util.PageRequestFactory;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/package-payment")
    public ApiResponse<TransactionResponse> createPackagePayment(@Valid @RequestBody PackagePaymentRequest request) {
        return ApiResponse.ok("Tạo giao dịch thanh toán gói thành công", transactionService.createPackagePayment(request));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<TransactionResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(transactionService.getById(id));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<TransactionResponse>> getPaged(
            @RequestParam(required = false) Long subscriptionId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        Pageable pageable = PageRequestFactory.of(page, size, sort);
        return ApiResponse.ok(transactionService.getPaged(subscriptionId, type, status, pageable));
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{id}/vnpay-url")
    public ApiResponse<Map<String, String>> getVNPayUrl(
            @PathVariable Long id,
            @RequestParam(required = false) String bankCode,
            HttpServletRequest request) {
        String url = transactionService.getVNPayUrl(id, bankCode, request);
        return ApiResponse.ok("Tạo link thanh toán VNPay thành công", Map.of("paymentUrl", url));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @PostMapping("/{id}/simulate-gateway")
    public ApiResponse<TransactionResponse> simulateGateway(
            @PathVariable Long id,
            @RequestBody(required = false) SimulateGatewayRequest request) {
        return ApiResponse.ok("Giả lập cổng thanh toán thành công", transactionService.simulateGateway(id, request));
    }
}
