package com.carrental.service;

import com.carrental.dto.request.CreateDepositRequest;
import com.carrental.dto.request.CreatePaymentRequest;
import com.carrental.dto.request.MockPaymentProcessRequest;
import com.carrental.dto.request.RefundRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import org.springframework.data.domain.Pageable;

public interface TransactionService {

    TransactionResponse createDeposit(CreateDepositRequest request);

    TransactionResponse createPayment(CreatePaymentRequest request);

    TransactionResponse simulatePaymentGateway(Long transactionId, MockPaymentProcessRequest request);

    TransactionResponse refund(RefundRequest request);

    TransactionResponse getById(Long id);

    PageResponse<TransactionResponse> getPaged(Long orderId, String transactionType, String status, Pageable pageable);
}
