package com.carrental.controller;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.service.VNPayService;
import com.carrental.web.VNPayHtmlRenderer;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class VNPayCallbackController {

    private final VNPayService vnPayService;

    @Value("${app.payment.success-redirect-url:http://localhost:3000/owner/subscriptions}")
    private String successRedirectUrl = "http://localhost:3000/owner/subscriptions";

    @GetMapping(value = "/return")
    public ResponseEntity<?> handleVNPayReturn(
            @RequestParam Map<String, String> params,
            @RequestHeader(value = "Accept", required = false) String acceptHeader,
            @RequestParam(required = false, defaultValue = "") String format) {
        TransactionResponse response = vnPayService.processReturn(params);
        boolean wantsJson = "json".equalsIgnoreCase(format)
                || (acceptHeader != null && acceptHeader.contains(MediaType.APPLICATION_JSON_VALUE));
        if (wantsJson) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ApiResponse.ok("Xử lý kết quả VNPay thành công", response));
        }

        if ("SUCCESS".equalsIgnoreCase(response.status())) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(successRedirectUrl))
                    .build();
        }

        String html = VNPayHtmlRenderer.renderResultHtml(response, params);
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleVNPayIpn(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(vnPayService.processIpn(params));
    }
}
