package com.carrental.controller;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class VNPayCallbackController {

    private final VNPayService vnPayService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @GetMapping(value = "/return")
    public ResponseEntity<?> handleVNPayReturn(
            @RequestParam Map<String, String> params,
            @RequestHeader(value = "Accept", required = false) String acceptHeader,
            @RequestParam(required = false, defaultValue = "") String format,
            HttpServletRequest servletRequest) {
        boolean wantsJson = "json".equalsIgnoreCase(format)
                || (acceptHeader != null && acceptHeader.contains(MediaType.APPLICATION_JSON_VALUE)
                    && !acceptHeader.contains(MediaType.TEXT_HTML_VALUE));
        if (wantsJson) {
            TransactionResponse response = vnPayService.processReturn(params);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ApiResponse.ok("Xử lý kết quả VNPay thành công", response));
        }

        // Xử lý cập nhật trạng thái giao dịch ngay khi VNPay redirect về, sau đó chuyển hướng sang trang Payment của Frontend
        try {
            vnPayService.processReturn(params);
        } catch (Exception ignored) {
            // Trang FE sẽ gọi lại với format=json để hiển thị thông báo lỗi chi tiết nếu có
        }

        String base = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        String query = servletRequest != null && servletRequest.getQueryString() != null
                ? "?" + servletRequest.getQueryString()
                : "";
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, URI.create(base + "/payment" + query).toString())
                .build();
    }

    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleVNPayIpn(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(vnPayService.processIpn(params));
    }
}
