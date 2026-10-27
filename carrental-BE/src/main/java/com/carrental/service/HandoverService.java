package com.carrental.service;

import com.carrental.dto.request.CreateHandoverRequest;
import com.carrental.dto.response.HandoverResponse;

import java.util.List;

/**
 * Bàn giao xe. Biên bản do người thuê hoặc chủ xe lập (người lập tự xác nhận phần mình),
 * bên còn lại xác nhận. Khi đủ 2 bên:
 * PICKUP: CONFIRMED -> ONGOING (ghi actual_start_time);
 * RETURN: ONGOING -> COMPLETED (ghi actual_end_time).
 */
public interface HandoverService {

    HandoverResponse createHandover(Long orderId, CreateHandoverRequest request);

    HandoverResponse confirmHandover(Long handoverId);

    List<HandoverResponse> getHandoversOfOrder(Long orderId);
}
