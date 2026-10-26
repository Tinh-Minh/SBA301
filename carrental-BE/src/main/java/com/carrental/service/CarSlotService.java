package com.carrental.service;

import com.carrental.dto.request.CarSlotCreateRequest;
import com.carrental.dto.request.CarSlotSearchRequest;
import com.carrental.dto.request.CarSlotUpdateRequest;
import com.carrental.dto.response.AvailableSlotResponse;
import com.carrental.dto.response.CarSlotResponse;
import com.carrental.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface CarSlotService {

    CarSlotResponse createSlot(CarSlotCreateRequest request);

    CarSlotResponse updateSlot(Long slotId, CarSlotUpdateRequest request);

    CarSlotResponse closeSlot(Long slotId);

    CarSlotResponse cancelSlot(Long slotId);

    CarSlotResponse reopenSlot(Long slotId);

    CarSlotResponse getSlotById(Long slotId);

    PageResponse<CarSlotResponse> getSlotsByCarId(Long carId, Pageable pageable);

    PageResponse<AvailableSlotResponse> searchAvailableSlots(CarSlotSearchRequest request);
}
