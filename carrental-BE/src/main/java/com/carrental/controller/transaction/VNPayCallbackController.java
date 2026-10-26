package com.carrental.controller.transaction;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.service.transaction.TransactionService;
import com.carrental.web.VNPayHtmlRenderer;
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

    @GetMapping(value = "/return")
    public ResponseEntity<?> handleVNPayReturn(
            @RequestParam Map<String, String> params,
            @RequestHeader(value = "Accept", required = false) String acceptHeader,
            @RequestParam(required = false, defaultValue = "") String format) {
        TransactionResponse response = transactionService.processVNPayReturn(params);
        boolean wantsJson = "json".equalsIgnoreCase(format)
                || (acceptHeader != null && acceptHeader.contains(MediaType.APPLICATION_JSON_VALUE));
        if (wantsJson) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ApiResponse.ok("Xử lý kết quả VNPay thành công", response));
        }

        String html = VNPayHtmlRenderer.renderResultHtml(response, params);
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleVNPayIpn(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(transactionService.processVNPayIpn(params));
    }
}
