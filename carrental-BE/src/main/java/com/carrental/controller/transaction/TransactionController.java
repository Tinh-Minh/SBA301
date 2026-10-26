package com.carrental.controller.transaction;

import com.carrental.dto.request.CreateDepositRequest;
import com.carrental.dto.request.CreatePaymentRequest;
import com.carrental.dto.request.MockPaymentProcessRequest;
import com.carrental.dto.request.RefundRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.service.transaction.TransactionService;
import com.carrental.web.VNPayHtmlRenderer;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @PostMapping("/deposit")
    public ApiResponse<TransactionResponse> createDeposit(@Valid @RequestBody CreateDepositRequest request) {
        return ApiResponse.ok("Tạo giao dịch đặt cọc thành công", transactionService.createDeposit(request));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @PostMapping("/payment")
    public ApiResponse<TransactionResponse> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ApiResponse.ok("Tạo giao dịch thanh toán thành công", transactionService.createPayment(request));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @PostMapping("/{id}/simulate-gateway")
    public ApiResponse<TransactionResponse> simulatePaymentGateway(
            @PathVariable Long id,
            @RequestBody(required = false) MockPaymentProcessRequest request) {
        MockPaymentProcessRequest req = request != null ? request : new MockPaymentProcessRequest();
        return ApiResponse.ok("Xử lý cổng thanh toán thành công", transactionService.simulatePaymentGateway(id, req));
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
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        return ApiResponse.ok(transactionService.getPaged(orderId, type, status, pageable));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @GetMapping("/{id}/vnpay-url")
    public ApiResponse<java.util.Map<String, String>> getVNPayUrl(
            @PathVariable Long id,
            @RequestParam(required = false) String bankCode,
            jakarta.servlet.http.HttpServletRequest request) {
        String url = transactionService.getVNPayUrl(id, bankCode, request);
        return ApiResponse.ok("Tạo link thanh toán VNPay thành công", java.util.Map.of("paymentUrl", url));
    }

    @GetMapping(value = "/vnpay-return")
    public org.springframework.http.ResponseEntity<?> handleVNPayReturn(
            @RequestParam java.util.Map<String, String> params,
            @RequestHeader(value = "Accept", required = false) String acceptHeader,
            @RequestParam(required = false, defaultValue = "") String format) {
        TransactionResponse response = transactionService.processVNPayReturn(params);
        boolean wantsJson = "json".equalsIgnoreCase(format)
                || (acceptHeader != null && acceptHeader.contains(org.springframework.http.MediaType.APPLICATION_JSON_VALUE));
        if (wantsJson) {
            return org.springframework.http.ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(ApiResponse.ok("Xử lý kết quả VNPay thành công", response));
        }

        String html = VNPayHtmlRenderer.renderResultHtml(response, params);
        return org.springframework.http.ResponseEntity.ok().contentType(org.springframework.http.MediaType.TEXT_HTML).body(html);
    }

    @GetMapping("/vnpay-ipn")
    public org.springframework.http.ResponseEntity<java.util.Map<String, String>> handleVNPayIpn(
            @RequestParam java.util.Map<String, String> params) {
        return org.springframework.http.ResponseEntity.ok(transactionService.processVNPayIpn(params));
    }
}
