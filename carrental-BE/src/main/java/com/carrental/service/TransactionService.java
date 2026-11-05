package com.carrental.service;

import com.carrental.dto.request.PackagePaymentRequest;
import com.carrental.dto.request.SimulateGatewayRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Pageable;

public interface TransactionService {

    TransactionResponse createPackagePayment(PackagePaymentRequest request);

    TransactionResponse getById(Long id);

    PageResponse<TransactionResponse> getPaged(Long subscriptionId, String transactionType, String status, Pageable pageable);

    String getVNPayUrl(Long transactionId, String bankCode, HttpServletRequest request);

    TransactionResponse simulateGateway(Long id, SimulateGatewayRequest request);
}
