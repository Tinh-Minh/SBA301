package com.carrental.util;

import jakarta.servlet.http.HttpServletRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public final class VNPayUtil {

    private VNPayUtil() {}

    public static String hmacSHA512(String key, String data) {
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

    public static String hashAllFields(String hashSecret, Map<String, String> fields) {
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
        return hmacSHA512(hashSecret, sb.toString());
    }

    public static String getIpAddress(HttpServletRequest request, String fallbackIp) {
        if (request == null) {
            return fallbackIp != null ? fallbackIp : "127.0.0.1";
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
