package com.carrental.controller;

import com.carrental.dto.request.CarSlotCreateRequest;
import com.carrental.dto.request.CarSlotSearchRequest;
import com.carrental.dto.request.CarSlotUpdateRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.AvailableSlotResponse;
import com.carrental.dto.response.CarSlotResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.enums.CarType;
import com.carrental.enums.RentalType;
import com.carrental.service.CarSlotService;
import com.carrental.service.CurrentUserService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class CarSlotController {

    private final CarSlotService carSlotService;
    private final CurrentUserService currentUserService;

    private static final Set<String> ALLOWED_SLOT_SORT_FIELDS = Set.of("startTime", "endTime", "pricePerHour", "pricePerDay", "createdAt");

    // Khách vãng lai tìm kiếm slot trống qua GET request (dễ cache và lưu link)
    @GetMapping("/search")
    public ApiResponse<PageResponse<AvailableSlotResponse>> searchAvailableSlots(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) CarType carType,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) BigDecimal maxPricePerHour,
            @RequestParam(required = false) BigDecimal maxPricePerDay,
            @RequestParam(required = false) RentalType rentalType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        CarSlotSearchRequest request = CarSlotSearchRequest.builder()
                .city(city)
                .carType(carType)
                .seats(seats)
                .maxPricePerHour(maxPricePerHour)
                .maxPricePerDay(maxPricePerDay)
                .rentalType(rentalType)
                .startTime(startTime)
                .endTime(endTime)
                .page(page)
                .size(size)
                .build();

        return ApiResponse.ok(carSlotService.searchAvailableSlots(request));
    }

    // Xem chi tiết một slot (công khai chỉ xem slot OPEN của xe ACTIVE; chủ xe/admin xem đầy đủ)
    @GetMapping("/{id}")
    public ApiResponse<CarSlotResponse> getSlotById(
            @PathVariable Long id
    ) {
        Long requesterId = currentUserService.optionalCurrentUser().map(user -> user.getId()).orElse(null);
        return ApiResponse.ok(carSlotService.getSlotById(id, requesterId));
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
        return ApiResponse.ok(carSlotService.getSlotsByCarId(currentUserId(), carId, pageable));
    }

    // Chủ xe mở slot mới
    @PostMapping
    public ApiResponse<CarSlotResponse> createSlot(
            @Valid @RequestBody CarSlotCreateRequest request
    ) {
        return ApiResponse.ok("Mở khung giờ cho thuê thành công", carSlotService.createSlot(currentUserId(), request));
    }

    // Chủ xe chỉnh sửa slot
    @PutMapping("/{id}")
    public ApiResponse<CarSlotResponse> updateSlot(
            @PathVariable Long id,
            @Valid @RequestBody CarSlotUpdateRequest request
    ) {
        return ApiResponse.ok("Cập nhật khung giờ thành công", carSlotService.updateSlot(currentUserId(), id, request));
    }

    // Chủ xe đóng slot (tạm thời không cho đặt nữa)
    @PatchMapping("/{id}/close")
    public ApiResponse<CarSlotResponse> closeSlot(
            @PathVariable Long id
    ) {
        return ApiResponse.ok("Đóng slot thành công", carSlotService.closeSlot(currentUserId(), id));
    }

    // Chủ xe huỷ slot
    @PatchMapping("/{id}/cancel")
    public ApiResponse<CarSlotResponse> cancelSlot(
            @PathVariable Long id
    ) {
        return ApiResponse.ok("Huỷ slot thành công", carSlotService.cancelSlot(currentUserId(), id));
    }

    // Chủ xe mở lại slot đã đóng
    @PatchMapping("/{id}/reopen")
    public ApiResponse<CarSlotResponse> reopenSlot(
            @PathVariable Long id
    ) {
        return ApiResponse.ok("Mở lại slot thành công", carSlotService.reopenSlot(currentUserId(), id));
    }

    private Long currentUserId() {
        return currentUserService.getCurrentUser().getId();
    }
}
