package com.carrental.service;

import com.carrental.dto.request.CreateExtraFeeRequest;
import com.carrental.dto.request.PayExtraFeeRequest;
import com.carrental.dto.response.ExtraFeeResponse;
import com.carrental.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface ExtraFeeService {

    ExtraFeeResponse createExtraFee(CreateExtraFeeRequest request);

    ExtraFeeResponse payExtraFee(Long extraFeeId, PayExtraFeeRequest request);

    ExtraFeeResponse waiveExtraFee(Long extraFeeId, String note);

    ExtraFeeResponse getById(Long id);

    PageResponse<ExtraFeeResponse> getPaged(Long orderId, String status, Pageable pageable);
}
