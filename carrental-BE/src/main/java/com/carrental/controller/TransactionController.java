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



    @GetMapping("/{id}/vnpay-url")
    public ApiResponse<java.util.Map<String, String>> getVNPayUrl(
            @PathVariable Long id,
            @RequestParam(required = false) String bankCode,
            jakarta.servlet.http.HttpServletRequest request) {
        String url = transactionService.getVNPayUrl(id, bankCode, request);
        return ApiResponse.ok("Tạo link thanh toán VNPay thành công", java.util.Map.of("paymentUrl", url));
    }

    @GetMapping(value = "/vnpay-return", produces = {org.springframework.http.MediaType.TEXT_HTML_VALUE, org.springframework.http.MediaType.APPLICATION_JSON_VALUE})
    public org.springframework.http.ResponseEntity<?> handleVNPayReturn(
            @RequestParam java.util.Map<String, String> params,
            @RequestHeader(value = "Accept", defaultValue = "") String acceptHeader,
            @RequestParam(required = false, defaultValue = "") String format) {
        TransactionResponse response = transactionService.processVNPayReturn(params);
        if ("json".equalsIgnoreCase(format) || acceptHeader.contains("application/json")) {
            return org.springframework.http.ResponseEntity.ok(ApiResponse.ok("Xử lý kết quả VNPay thành công", response));
        }

        boolean isSuccess = "SUCCESS".equalsIgnoreCase(response.status());
        String html = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Kết quả thanh toán VNPay</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f0f2f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 480px; width: 90%%; text-align: center; }
                        .icon { width: 72px; height: 72px; border-radius: 50%%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 36px; }
                        .success { background: #e6f7ed; color: #10b981; }
                        .failed { background: #fee2e2; color: #ef4444; }
                        h2 { margin: 0 0 12px; color: #1f2937; }
                        p { margin: 0 0 24px; color: #6b7280; font-size: 15px; }
                        .info-table { width: 100%%; border-collapse: collapse; margin-bottom: 24px; text-align: left; }
                        .info-table td { padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
                        .info-table td:last-child { text-align: right; font-weight: 600; color: #111827; }
                        .btn { display: inline-block; background: #0066cc; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: background 0.2s; }
                        .btn:hover { background: #0052a3; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="icon %s">%s</div>
                        <h2>%s</h2>
                        <p>%s</p>
                        <table class="info-table">
                            <tr><td>Mã giao dịch:</td><td>#%s</td></tr>
                            <tr><td>Mã đơn hàng:</td><td>%s</td></tr>
                            <tr><td>Loại giao dịch:</td><td>%s</td></tr>
                            <tr><td>Số tiền:</td><td>%s VND</td></tr>
                            <tr><td>Ngân hàng:</td><td>%s</td></tr>
                            <tr><td>Mã tham chiếu VNPay:</td><td>%s</td></tr>
                        </table>
                        <a href="javascript:window.close();" class="btn">Đóng trang</a>
                    </div>
                </body>
                </html>
                """.formatted(
                isSuccess ? "success" : "failed",
                isSuccess ? "✓" : "✕",
                isSuccess ? "Thanh toán thành công!" : "Thanh toán không thành công",
                isSuccess ? "Giao dịch thanh toán qua cổng VNPay Sandbox đã hoàn tất." : "Giao dịch đã bị huỷ hoặc có lỗi xảy ra.",
                response.id(),
                response.orderCode() != null ? response.orderCode() : "N/A",
                response.transactionType(),
                String.format("%,d", response.amount() != null ? response.amount().longValue() : 0),
                params.getOrDefault("vnp_BankCode", "NCB"),
                response.providerRef() != null ? response.providerRef() : "N/A"
        );
        return org.springframework.http.ResponseEntity.ok().contentType(org.springframework.http.MediaType.TEXT_HTML).body(html);
    }

    @GetMapping("/vnpay-ipn")
    public org.springframework.http.ResponseEntity<java.util.Map<String, String>> handleVNPayIpn(
            @RequestParam java.util.Map<String, String> params) {
        return org.springframework.http.ResponseEntity.ok(transactionService.processVNPayIpn(params));
    }
}
