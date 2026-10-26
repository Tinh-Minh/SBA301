package com.carrental.controller;

import com.carrental.dto.request.CreateDepositRequest;
import com.carrental.dto.request.CreatePaymentRequest;
import com.carrental.dto.request.RefundRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.service.TransactionService;
import com.carrental.util.PageRequestFactory;
import com.carrental.web.VNPayHtmlRenderer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/deposit")
    public ApiResponse<TransactionResponse> createDeposit(@Valid @RequestBody CreateDepositRequest request) {
        return ApiResponse.ok("Tạo giao dịch đặt cọc thành công", transactionService.createDeposit(request));
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/payment")
    public ApiResponse<TransactionResponse> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ApiResponse.ok("Tạo giao dịch thanh toán thành công", transactionService.createPayment(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/refund")
    public ApiResponse<TransactionResponse> refund(@Valid @RequestBody RefundRequest request) {
        return ApiResponse.ok("Hoàn tiền thành công", transactionService.refund(request));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<TransactionResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(transactionService.getById(id));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<TransactionResponse>> getPaged(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        Pageable pageable = PageRequestFactory.of(page, size, sort);
        return ApiResponse.ok(transactionService.getPaged(orderId, type, status, pageable));
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
}
