package com.carrental.service;

import com.carrental.dto.request.CreateDepositRequest;
import com.carrental.dto.request.CreatePaymentRequest;
import com.carrental.dto.request.RefundRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface TransactionService {

    TransactionResponse createDeposit(CreateDepositRequest request);

    TransactionResponse createPayment(CreatePaymentRequest request);

    TransactionResponse refund(RefundRequest request);

    TransactionResponse getById(Long id);

    PageResponse<TransactionResponse> getPaged(Long orderId, String transactionType, String status, Pageable pageable);

    String getVNPayUrl(Long transactionId, String bankCode, HttpServletRequest request);

    TransactionResponse simulateGateway(Long id, com.carrental.dto.request.SimulateGatewayRequest request);
}
