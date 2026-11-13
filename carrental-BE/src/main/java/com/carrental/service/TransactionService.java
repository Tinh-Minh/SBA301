package com.carrental.service;

import com.carrental.dto.request.BookingDepositPaymentRequest;
import com.carrental.dto.request.PackagePaymentRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Pageable;

public interface TransactionService {

    TransactionResponse createPackagePayment(PackagePaymentRequest request, HttpServletRequest servletRequest);

    default TransactionResponse createPackagePayment(PackagePaymentRequest request) {
        return createPackagePayment(request, null);
    }

    TransactionResponse createBookingDepositPayment(BookingDepositPaymentRequest request, HttpServletRequest servletRequest);

    default TransactionResponse createBookingDepositPayment(BookingDepositPaymentRequest request) {
        return createBookingDepositPayment(request, null);
    }

    TransactionResponse getById(Long id);

    PageResponse<TransactionResponse> getPaged(Long subscriptionId, String transactionType, String status, Pageable pageable);

    PageResponse<TransactionResponse> getPaged(Long subscriptionId, Long bookingId, String transactionType, String status, Pageable pageable);

    String getVNPayUrl(Long transactionId, String bankCode, HttpServletRequest request);

    TransactionResponse simulateGateway(Long transactionId);

    /** @param success false để giả lập cổng thanh toán báo thất bại */
    TransactionResponse simulateGateway(Long transactionId, boolean success);
}
