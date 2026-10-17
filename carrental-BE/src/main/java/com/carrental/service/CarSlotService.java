package com.carrental.service;

import com.carrental.dto.request.CarSlotCreateRequest;
import com.carrental.dto.request.CarSlotSearchRequest;
import com.carrental.dto.request.CarSlotUpdateRequest;
import com.carrental.dto.response.AvailableSlotResponse;
import com.carrental.dto.response.CarSlotResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.CarSlot;
import org.springframework.data.domain.Pageable;

public interface CarSlotService {

    CarSlotResponse createSlot(Long ownerId, CarSlotCreateRequest request);

    CarSlotResponse updateSlot(Long ownerId, Long slotId, CarSlotUpdateRequest request);

    CarSlotResponse closeSlot(Long ownerId, Long slotId);

    CarSlotResponse cancelSlot(Long ownerId, Long slotId);

    CarSlotResponse reopenSlot(Long ownerId, Long slotId);

    CarSlotResponse getSlotById(Long slotId, Long requesterId);

    PageResponse<CarSlotResponse> getSlotsByCarId(Long ownerId, Long carId, Pageable pageable);

    PageResponse<AvailableSlotResponse> searchAvailableSlots(CarSlotSearchRequest request);

    // Method cung cấp cho Người 3 để kiểm tra và lấy Slot khi đặt xe
    CarSlot getOpenSlotForRental(Long slotId);

    CarSlot findSlotOrThrow(Long slotId);
}
