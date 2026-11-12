package com.carrental.controller;

import com.carrental.dto.request.CarApprovalRequest;
import com.carrental.dto.request.CarDocumentVerifyRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.CarDocumentResponse;
import com.carrental.dto.response.CarResponse;
import com.carrental.dto.response.CarSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.enums.CarStatus;
import com.carrental.service.CarService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/admin/cars")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCarController {

    private final CarService carService;

    private static final Set<String> ALLOWED_ADMIN_CAR_SORT_FIELDS = Set.of("createdAt", "brand", "model", "status");

    // Admin xem danh sách xe kèm lọc theo trạng thái
    @GetMapping
    public ApiResponse<PageResponse<CarSummaryResponse>> getCars(
            @RequestParam(required = false) CarStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, ALLOWED_ADMIN_CAR_SORT_FIELDS, "createdAt");
        return ApiResponse.ok(carService.getCarsByStatus(status, pageable));
    }

    // Admin duyệt xe
    @PostMapping("/{id}/approve")
    public ApiResponse<CarResponse> approveCar(
            @PathVariable Long id
    ) {
        return ApiResponse.ok("Duyệt xe thành công", carService.approveCar(id));
    }

    // Admin từ chối xe kèm lý do
    @PostMapping("/{id}/reject")
    public ApiResponse<CarResponse> rejectCar(
            @PathVariable Long id,
            @Valid @RequestBody CarApprovalRequest request
    ) {
        return ApiResponse.ok("Từ chối duyệt xe thành công", carService.rejectCar(id, request.getReason()));
    }

    // Admin duyệt hoặc từ chối giấy tờ xe
    @PatchMapping("/{id}/documents/{docId}/verify")
    public ApiResponse<CarDocumentResponse> verifyCarDocument(
            @PathVariable Long id,
            @PathVariable Long docId,
            @Valid @RequestBody CarDocumentVerifyRequest request
    ) {
        return ApiResponse.ok("Xác minh giấy tờ xe thành công", carService.verifyCarDocumentByAdmin(id, docId, request));
    }
}
