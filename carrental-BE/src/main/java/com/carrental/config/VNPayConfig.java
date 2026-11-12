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
        return com.carrental.util.VNPayUtil.hmacSHA512(key, data);
    }

    public String hashAllFields(Map<String, String> fields) {
        return com.carrental.util.VNPayUtil.hashAllFields(this.hashSecret, fields);
    }

    public String getIpAddress(HttpServletRequest request) {
        return com.carrental.util.VNPayUtil.getIpAddress(request, this.refundIpAddress);
    }
}
