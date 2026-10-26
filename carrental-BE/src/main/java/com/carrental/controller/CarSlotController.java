package com.carrental.controller;

import com.carrental.dto.request.CarSlotCreateRequest;
import com.carrental.dto.request.CarSlotSearchRequest;
import com.carrental.dto.request.CarSlotUpdateRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.AvailableSlotResponse;
import com.carrental.dto.response.CarSlotResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.service.CarSlotService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class CarSlotController {

    private final CarSlotService carSlotService;

    private static final Set<String> ALLOWED_SLOT_SORT_FIELDS = Set.of("startTime", "endTime", "pricePerHour", "pricePerDay", "createdAt");

    // Khách vãng lai tìm kiếm slot trống qua GET request (dễ cache và lưu link)
    @GetMapping("/search")
    public ApiResponse<PageResponse<AvailableSlotResponse>> searchAvailableSlots(
            @ModelAttribute CarSlotSearchRequest request
    ) {
        return ApiResponse.ok(carSlotService.searchAvailableSlots(request));
    }

    // Xem chi tiết một slot (công khai chỉ xem slot OPEN của xe ACTIVE; chủ xe/admin xem đầy đủ)
    @GetMapping("/{id}")
    public ApiResponse<CarSlotResponse> getSlotById(
            @PathVariable Long id
    ) {
        return ApiResponse.ok(carSlotService.getSlotById(id));
    }

    // Chủ xe xem danh sách slot của một xe (kèm phân trang an toàn)
    @GetMapping("/car/{carId}")
    public ApiResponse<PageResponse<CarSlotResponse>> getSlotsByCarId(
            @PathVariable Long carId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction
    ) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, ALLOWED_SLOT_SORT_FIELDS, "startTime");
        return ApiResponse.ok(carSlotService.getSlotsByCarId(carId, pageable));
    }

    // Chủ xe mở slot mới
    @PostMapping
    public ApiResponse<CarSlotResponse> createSlot(
            @Valid @RequestBody CarSlotCreateRequest request
    ) {
        return ApiResponse.ok("Mở khung giờ cho thuê thành công", carSlotService.createSlot(request));
    }

    // Chủ xe chỉnh sửa slot
    @PutMapping("/{id}")
    public ApiResponse<CarSlotResponse> updateSlot(
            @PathVariable Long id,
            @Valid @RequestBody CarSlotUpdateRequest request
    ) {
        return ApiResponse.ok("Cập nhật khung giờ thành công", carSlotService.updateSlot(id, request));
    }

    // Chủ xe đóng slot (tạm thời không cho đặt nữa)
    @PatchMapping("/{id}/close")
    public ApiResponse<CarSlotResponse> closeSlot(
            @PathVariable Long id
    ) {
        return ApiResponse.ok("Đóng slot thành công", carSlotService.closeSlot(id));
    }

    // Chủ xe huỷ slot
    @PatchMapping("/{id}/cancel")
    public ApiResponse<CarSlotResponse> cancelSlot(
            @PathVariable Long id
    ) {
        return ApiResponse.ok("Huỷ slot thành công", carSlotService.cancelSlot(id));
    }

    // Chủ xe mở lại slot đã đóng
    @PatchMapping("/{id}/reopen")
    public ApiResponse<CarSlotResponse> reopenSlot(
            @PathVariable Long id
    ) {
        return ApiResponse.ok("Mở lại slot thành công", carSlotService.reopenSlot(id));
    }
}
