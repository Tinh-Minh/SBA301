package com.carrental.service;

import com.carrental.dto.request.CreatePayoutRequest;
import com.carrental.dto.request.ProcessPayoutRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.PayoutResponse;
import org.springframework.data.domain.Pageable;

public interface PayoutService {

    PayoutResponse createPayout(CreatePayoutRequest request);

    PayoutResponse processPayout(Long payoutId, ProcessPayoutRequest request);

    PayoutResponse getById(Long id);

    PageResponse<PayoutResponse> getPaged(Long recipientId, Long orderId, String status, Pageable pageable);
}
