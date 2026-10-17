package com.carrental.controller;

import com.carrental.dto.request.CreateDepositRequest;
import com.carrental.dto.request.CreatePaymentRequest;
import com.carrental.dto.request.MockPaymentProcessRequest;
import com.carrental.dto.request.RefundRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ApiResponse<TransactionResponse> createDeposit(@Valid @RequestBody CreateDepositRequest request) {
        return ApiResponse.ok("Tạo giao dịch đặt cọc thành công", transactionService.createDeposit(request));
    }

    @PostMapping("/payment")
    public ApiResponse<TransactionResponse> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ApiResponse.ok("Tạo giao dịch thanh toán thành công", transactionService.createPayment(request));
    }

    @PostMapping("/{id}/simulate-gateway")
    public ApiResponse<TransactionResponse> simulatePaymentGateway(
            @PathVariable Long id,
            @RequestBody(required = false) MockPaymentProcessRequest request) {
        MockPaymentProcessRequest req = request != null ? request : new MockPaymentProcessRequest();
        return ApiResponse.ok("Xử lý cổng thanh toán thành công", transactionService.simulatePaymentGateway(id, req));
    }

    @PostMapping("/refund")
    public ApiResponse<TransactionResponse> refund(@Valid @RequestBody RefundRequest request) {
        return ApiResponse.ok("Hoàn tiền thành công", transactionService.refund(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<TransactionResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(transactionService.getById(id));
    }

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
}
