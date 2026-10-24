package com.carrental.controller;

import com.carrental.dto.request.*;
import com.carrental.dto.response.*;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.service.CarService;
import com.carrental.service.CurrentUserService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;
    private final CurrentUserService currentUserService;

    private static final Set<String> ALLOWED_CAR_SORT_FIELDS = Set.of("createdAt", "pricePerHour", "pricePerDay", "brand", "seats");

    // Khách vãng lai xem chi tiết xe (ẩn biển số, giấy tờ; chủ xe/admin xem đầy đủ)
    @GetMapping("/{id}")
    public ApiResponse<CarResponse> getCarById(@PathVariable Long id) {
        Long requesterId = currentUserService.optionalCurrentUser().map(user -> user.getId()).orElse(null);
        return ApiResponse.ok(carService.getCarById(id, requesterId));
    }

    // Khách vãng lai tìm kiếm xe kèm bộ lọc và phân trang an toàn
    @GetMapping("/search")
    public ApiResponse<PageResponse<CarSummaryResponse>> searchCars(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) CarType carType,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer seats,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, ALLOWED_CAR_SORT_FIELDS, "createdAt");
        return ApiResponse.ok(carService.searchCars(city, carType, brand, seats, pageable));
    }

    // Chủ xe xem danh sách xe của mình (hỗ trợ lọc status)
    @GetMapping("/my-cars")
    public ApiResponse<PageResponse<CarSummaryResponse>> getMyCars(
            @RequestParam(required = false) CarStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, ALLOWED_CAR_SORT_FIELDS, "createdAt");
        return ApiResponse.ok(carService.getMyCars(currentUserId(), status, pageable));
    }

    // Chủ xe đăng ký xe mới
    @PostMapping
    public ApiResponse<CarResponse> createCar(
            @Valid @RequestBody CarCreateRequest request
    ) {
        return ApiResponse.ok("Đăng ký xe thành công, chờ admin duyệt", carService.createCar(currentUserId(), request));
    }

    // Chủ xe cập nhật thông tin xe
    @PutMapping("/{id}")
    public ApiResponse<CarResponse> updateCar(
            @PathVariable Long id,
            @Valid @RequestBody CarUpdateRequest request
    ) {
        return ApiResponse.ok("Cập nhật thông tin xe thành công", carService.updateCar(currentUserId(), id, request));
    }

    // Chủ xe tạm dừng hoặc kích hoạt lại xe (ACTIVE <-> INACTIVE)
    @PatchMapping("/{id}/status")
    public ApiResponse<CarResponse> updateCarStatus(
            @PathVariable Long id,
            @RequestParam CarStatus status
    ) {
        return ApiResponse.ok("Cập nhật trạng thái xe thành công", carService.updateCarStatusByOwner(currentUserId(), id, status));
    }

    // Thêm hình ảnh xe
    @PostMapping("/{id}/images")
    public ApiResponse<List<CarImageResponse>> addCarImages(
            @PathVariable Long id,
            @RequestBody @Valid List<@Valid CarImageRequest> requests
    ) {
        return ApiResponse.ok("Thêm ảnh xe thành công", carService.addCarImages(currentUserId(), id, requests));
    }

    // Xoá hình ảnh xe
    @DeleteMapping("/{id}/images/{imageId}")
    public ApiResponse<Void> deleteCarImage(
            @PathVariable Long id,
            @PathVariable Long imageId
    ) {
        carService.deleteCarImage(currentUserId(), id, imageId);
        return ApiResponse.ok("Xoá ảnh xe thành công", null);
    }

    // Đặt ảnh đại diện (Primary)
    @PatchMapping("/{id}/images/{imageId}/primary")
    public ApiResponse<CarImageResponse> setPrimaryCarImage(
            @PathVariable Long id,
            @PathVariable Long imageId
    ) {
        return ApiResponse.ok("Đặt ảnh đại diện thành công", carService.setPrimaryCarImage(currentUserId(), id, imageId));
    }

    // Tải lên giấy tờ xe
    @PostMapping("/{id}/documents")
    public ApiResponse<CarDocumentResponse> addCarDocument(
            @PathVariable Long id,
            @Valid @RequestBody CarDocumentRequest request
    ) {
        return ApiResponse.ok("Tải lên giấy tờ xe thành công, chờ duyệt", carService.addCarDocument(currentUserId(), id, request));
    }

    // Xem danh sách giấy tờ xe (chỉ chủ xe hoặc admin)
    @GetMapping("/{id}/documents")
    public ApiResponse<List<CarDocumentResponse>> getCarDocuments(
            @PathVariable Long id
    ) {
        return ApiResponse.ok(carService.getCarDocuments(currentUserId(), id));
    }

    private Long currentUserId() {
        return currentUserService.getCurrentUser().getId();
    }
}
