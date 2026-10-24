package com.carrental.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Getter
@Setter
@Configuration
public class VNPayConfig {

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    @Value("${vnpay.api-url:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String apiUrl;

    @Value("${vnpay.return-url:http://localhost:3000/thanh-toan}")
    private String returnUrl;

    @Value("${vnpay.tmn-code:${VNPAY_TMN_CODE:UWOEOW84}}")
    private String tmnCode;

    @Value("${vnpay.hash-secret:${VNPAY_HASH_SECRET:MVAVXHAMRBICGXOCXCVBVWDWZOEFARUM}}")
    private String hashSecret;

    @Value("${vnpay.version:2.1.0}")
    private String version;

    @Value("${vnpay.command:pay}")
    private String command;

    @Value("${vnpay.refund-create-by:${VNPAY_REFUND_CREATE_BY:CinePrime}}")
    private String refundCreateBy;

    @Value("${vnpay.refund-ip-address:${VNPAY_REFUND_IP_ADDRESS:127.0.0.1}}")
    private String refundIpAddress;

    public String hmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) {
                return "";
            }
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    public String hashAllFields(Map<String, String> fields) {
        StringBuilder sb = new StringBuilder();
        fields.forEach((k, v) -> {
            if (v != null && !v.isEmpty() && !k.equals("vnp_SecureHash") && !k.equals("vnp_SecureHashType")) {
                try {
                    String encodedKey = URLEncoder.encode(k, StandardCharsets.US_ASCII.toString());
                    String encodedValue = URLEncoder.encode(v, StandardCharsets.US_ASCII.toString());
                    if (sb.length() > 0) {
                        sb.append("&");
                    }
                    sb.append(encodedKey).append("=").append(encodedValue);
                } catch (Exception ignored) {}
            }
        });
        return hmacSHA512(this.hashSecret, sb.toString());
    }

    public String getIpAddress(HttpServletRequest request) {
        if (request == null) {
            return this.refundIpAddress != null ? this.refundIpAddress : "127.0.0.1";
        }
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip) || ip == null) {
            ip = "127.0.0.1";
        }
        return ip.contains(",") ? ip.split(",")[0].trim() : ip;
    }
}
