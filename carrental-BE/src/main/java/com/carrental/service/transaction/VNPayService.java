package com.carrental.service.transaction;

import com.carrental.dto.response.TransactionResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface VNPayService {

    String createPaymentUrl(Long transactionId, String bankCode, HttpServletRequest request);

    TransactionResponse processReturn(Map<String, String> queryParams);

    Map<String, String> processIpn(Map<String, String> queryParams);
}
