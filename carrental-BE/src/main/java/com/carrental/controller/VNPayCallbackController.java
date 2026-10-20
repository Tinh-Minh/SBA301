package com.carrental.controller;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class VNPayCallbackController {

    private final TransactionService transactionService;

    @GetMapping(value = "/return", produces = {MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> handleVNPayReturn(
            @RequestParam Map<String, String> params,
            @RequestHeader(value = "Accept", defaultValue = "") String acceptHeader,
            @RequestParam(required = false, defaultValue = "") String format) {
        TransactionResponse response = transactionService.processVNPayReturn(params);
        if ("json".equalsIgnoreCase(format) || acceptHeader.contains("application/json")) {
            return ResponseEntity.ok(ApiResponse.ok("Xử lý kết quả VNPay thành công", response));
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
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleVNPayIpn(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(transactionService.processVNPayIpn(params));
    }
}
