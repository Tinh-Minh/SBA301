package com.carrental.controller;

import com.carrental.dto.request.CreateHandoverRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.HandoverResponse;
import com.carrental.service.HandoverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Handovers API", description = "Bàn giao nhận/trả xe (Function 3)")
public class HandoverController {

    private final HandoverService handoverService;

    @Operation(summary = "Lập biên bản bàn giao",
            description = "PICKUP khi đơn CONFIRMED, RETURN khi đơn ONGOING. Người lập tự xác nhận phần của mình")
    @PostMapping("/orders/{orderId}/handovers")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<HandoverResponse> createHandover(
            @PathVariable Long orderId,
            @Valid @RequestBody CreateHandoverRequest request) {
        return ApiResponse.created("Lập biên bản bàn giao thành công", handoverService.createHandover(orderId, request));
    }

    @Operation(summary = "Danh sách biên bản của đơn")
    @GetMapping("/orders/{orderId}/handovers")
    public ApiResponse<List<HandoverResponse>> getHandovers(@PathVariable Long orderId) {
        return ApiResponse.ok("Lấy biên bản bàn giao thành công", handoverService.getHandoversOfOrder(orderId));
    }

    @Operation(summary = "Bên còn lại xác nhận biên bản",
            description = "Đủ 2 bên: PICKUP chuyển đơn sang ONGOING, RETURN chuyển đơn sang COMPLETED")
    @PutMapping("/handovers/{handoverId}/confirm")
    public ApiResponse<HandoverResponse> confirmHandover(@PathVariable Long handoverId) {
        return ApiResponse.ok("Xác nhận biên bản bàn giao thành công", handoverService.confirmHandover(handoverId));
    }
}
