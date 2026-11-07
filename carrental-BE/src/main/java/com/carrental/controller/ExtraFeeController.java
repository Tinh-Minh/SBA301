package com.carrental.controller;

import com.carrental.dto.request.CreateExtraFeeRequest;
import com.carrental.dto.request.PayExtraFeeRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.ExtraFeeResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.service.ExtraFeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/extra-fees")
@RequiredArgsConstructor
public class ExtraFeeController {

    private final ExtraFeeService extraFeeService;

    @PostMapping
    public ApiResponse<ExtraFeeResponse> createExtraFee(@Valid @RequestBody CreateExtraFeeRequest request) {
        return ApiResponse.ok("Tạo phí phát sinh thành công", extraFeeService.createExtraFee(request));
    }

    @PostMapping("/{id}/pay")
    public ApiResponse<ExtraFeeResponse> payExtraFee(
            @PathVariable Long id,
            @RequestBody(required = false) PayExtraFeeRequest request) {
        return ApiResponse.ok("Thanh toán phí phát sinh thành công", extraFeeService.payExtraFee(id, request));
    }

    @PutMapping("/{id}/waive")
    public ApiResponse<ExtraFeeResponse> waiveExtraFee(
            @PathVariable Long id,
            @RequestParam(required = false) String note) {
        return ApiResponse.ok("Miễn trừ phí phát sinh thành công", extraFeeService.waiveExtraFee(id, note));
    }

    @GetMapping("/{id}")
    public ApiResponse<ExtraFeeResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(extraFeeService.getById(id));
    }

    @GetMapping
    public ApiResponse<PageResponse<ExtraFeeResponse>> getPaged(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        return ApiResponse.ok(extraFeeService.getPaged(orderId, status, pageable));
    }
}
