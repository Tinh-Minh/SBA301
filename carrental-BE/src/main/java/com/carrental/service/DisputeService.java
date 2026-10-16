package com.carrental.service;

import com.carrental.dto.request.CreateDisputeRequest;
import com.carrental.dto.request.DisputeEvidenceRequest;
import com.carrental.dto.request.ResolveDisputeRequest;
import com.carrental.dto.response.DisputeEvidenceResponse;
import com.carrental.dto.response.DisputeResponse;
import com.carrental.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface DisputeService {

    DisputeResponse createDispute(CreateDisputeRequest request);

    DisputeEvidenceResponse addEvidence(Long disputeId, DisputeEvidenceRequest request);

    DisputeResponse resolveDispute(Long disputeId, ResolveDisputeRequest request);

    DisputeResponse getById(Long id);

    PageResponse<DisputeResponse> getPaged(Long orderId, Long raisedById, String status, Pageable pageable);
}
