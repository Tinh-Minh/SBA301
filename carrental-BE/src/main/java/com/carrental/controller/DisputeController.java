package com.carrental.controller;

import com.carrental.dto.request.CreateDisputeRequest;
import com.carrental.dto.request.DisputeEvidenceRequest;
import com.carrental.dto.request.ResolveDisputeRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.DisputeEvidenceResponse;
import com.carrental.dto.response.DisputeResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.service.DisputeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    public ApiResponse<DisputeResponse> createDispute(@Valid @RequestBody CreateDisputeRequest request) {
        return ApiResponse.ok("Mở khiếu nại thành công", disputeService.createDispute(request));
    }

    @PostMapping("/{id}/evidences")
    public ApiResponse<DisputeEvidenceResponse> addEvidence(
            @PathVariable Long id,
            @Valid @RequestBody DisputeEvidenceRequest request) {
        return ApiResponse.ok("Thêm bằng chứng khiếu nại thành công", disputeService.addEvidence(id, request));
    }

    @PutMapping("/{id}/resolve")
    public ApiResponse<DisputeResponse> resolveDispute(
            @PathVariable Long id,
            @Valid @RequestBody ResolveDisputeRequest request) {
        return ApiResponse.ok("Giải quyết khiếu nại thành công", disputeService.resolveDispute(id, request));
    }

    @GetMapping("/{id}")
    public ApiResponse<DisputeResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(disputeService.getById(id));
    }

    @GetMapping
    public ApiResponse<PageResponse<DisputeResponse>> getPaged(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) Long raisedById,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        return ApiResponse.ok(disputeService.getPaged(orderId, raisedById, status, pageable));
    }
}
