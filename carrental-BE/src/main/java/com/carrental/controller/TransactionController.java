package com.carrental.controller;

import com.carrental.dto.request.BookingDepositPaymentRequest;
import com.carrental.dto.request.PackagePaymentRequest;
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
    private final com.carrental.service.BookingService bookingService;

    /** Admin xác nhận đã chuyển tiền hoàn cọc cho khách. Body: {"providerRef": "mã chuyển khoản"}. */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/confirm-refund")
    public ApiResponse<TransactionResponse> confirmRefund(@PathVariable Long id,
                                                         @RequestBody Map<String, String> body) {
        return ApiResponse.ok("Đã xác nhận hoàn tiền", bookingService.confirmRefund(id, body.get("providerRef")));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/package-payment")
    public ApiResponse<TransactionResponse> createPackagePayment(
            @Valid @RequestBody PackagePaymentRequest request,
            HttpServletRequest servletRequest) {
        return ApiResponse.ok("Tạo giao dịch thanh toán gói thành công",
                transactionService.createPackagePayment(request, servletRequest));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    @PostMapping("/booking-deposit")
    public ApiResponse<TransactionResponse> createBookingDepositPayment(
            @Valid @RequestBody BookingDepositPaymentRequest request,
            HttpServletRequest servletRequest) {
        return ApiResponse.ok("Tạo giao dịch thanh toán tiền cọc thành công",
                transactionService.createBookingDepositPayment(request, servletRequest));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    @GetMapping("/{id}/vnpay-url")
    public ApiResponse<Map<String, String>> getVNPayUrl(
            @PathVariable Long id,
            @RequestParam(required = false) String bankCode,
            HttpServletRequest request) {
        String paymentUrl = transactionService.getVNPayUrl(id, bankCode, request);
        return ApiResponse.ok(Map.of("paymentUrl", paymentUrl));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<TransactionResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(transactionService.getById(id));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<TransactionResponse>> getPaged(
            @RequestParam(required = false) Long subscriptionId,
            @RequestParam(required = false) Long bookingId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        Pageable pageable = PageRequestFactory.of(page, size, sort,
                java.util.Set.of("id", "amount", "status", "transactionType", "method", "paidAt", "createdAt"));
        return ApiResponse.ok(transactionService.getPaged(subscriptionId, bookingId, type, status, pageable));
    }
}
