package com.carrental.service;

import com.carrental.dto.request.CreateHandoverRequestDTO;
import com.carrental.dto.response.HandoverResponseDTO;

import java.util.List;

/**
 * Bàn giao xe. Biên bản do người thuê hoặc chủ xe lập (người lập tự xác nhận phần mình),
 * bên còn lại xác nhận. Khi đủ 2 bên:
 * PICKUP: CONFIRMED -> ONGOING (ghi actual_start_time);
 * RETURN: ONGOING -> COMPLETED (ghi actual_end_time).
 */
public interface HandoverService {

    HandoverResponseDTO createHandover(Long orderId, CreateHandoverRequestDTO request);

    HandoverResponseDTO confirmHandover(Long handoverId);

    List<HandoverResponseDTO> getHandoversOfOrder(Long orderId);
}
