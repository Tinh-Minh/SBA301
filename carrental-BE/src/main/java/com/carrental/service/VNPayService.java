package com.carrental.service;

import com.carrental.dto.response.TransactionResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface VNPayService {

    String createPaymentUrl(Long transactionId, String bankCode, HttpServletRequest request);

    String createPaymentUrl(Long transactionId, String bankCode);

    TransactionResponse processReturn(Map<String, String> queryParams);

    Map<String, String> processIpn(Map<String, String> queryParams);
}
