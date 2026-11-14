package com.carrental.controller;

import com.carrental.dto.request.safety.*;
import com.carrental.dto.response.safety.*;
import com.carrental.enums.*;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.enums.VerificationStatus;
import com.carrental.service.CarSafetyService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Hồ sơ an toàn của xe: đăng kiểm, bảo hiểm, bảo dưỡng, sửa chữa. */
@RestController
@RequiredArgsConstructor
public class CarSafetyController {

    private final CarSafetyService safetyService;

    // Công khai: khách xem tóm tắt an toàn của xe đã duyệt (chủ xe/admin thấy bản đầy đủ)
    @GetMapping("/api/cars/{carId}/safety")
    public ApiResponse<SafetySummaryResponse> getSummary(@PathVariable Long carId) {
        return ApiResponse.ok(safetyService.getSummary(carId));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/api/cars/{carId}/safety-records")
    public ApiResponse<SafetyRecordResponse> create(@PathVariable Long carId,
                                                    @Valid @RequestBody SafetyRecordRequest request) {
        return ApiResponse.ok("Đã thêm bản ghi, chờ CarDB xác minh", safetyService.create(carId, request));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/api/cars/{carId}/safety-records/{recordId}")
    public ApiResponse<SafetyRecordResponse> update(@PathVariable Long carId, @PathVariable Long recordId,
                                                    @Valid @RequestBody SafetyRecordRequest request) {
        return ApiResponse.ok("Đã cập nhật bản ghi, chờ CarDB xác minh lại",
                safetyService.update(carId, recordId, request));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping(path = "/api/cars/{carId}/safety-records/{recordId}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<SafetyRecordResponse> uploadFile(@PathVariable Long carId, @PathVariable Long recordId,
                                                        @RequestParam("file") MultipartFile file) {
        return ApiResponse.ok("Tải tệp chứng từ thành công", safetyService.uploadRecordFile(carId, recordId, file));
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/api/cars/{carId}/safety-records/{recordId}")
    public ApiResponse<Void> delete(@PathVariable Long carId, @PathVariable Long recordId) {
        safetyService.delete(carId, recordId);
        return ApiResponse.ok("Đã xoá bản ghi", null);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/safety-records")
    public ApiResponse<PageResponse<SafetyRecordResponse>> adminList(
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(safetyService.adminList(status, PageRequestFactory.of(page, size, "id,desc")));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/api/admin/cars/{carId}/safety-records/{recordId}/verify")
    public ApiResponse<SafetyRecordResponse> verify(@PathVariable Long carId, @PathVariable Long recordId,
                                                    @Valid @RequestBody SafetyVerifyRequest request) {
        return ApiResponse.ok("Đã cập nhật kết quả xác minh", safetyService.verify(carId, recordId, request));
    }
}
