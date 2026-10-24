package com.carrental.controller;

import com.carrental.dto.request.CreateHandoverRequestDTO;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.HandoverResponseDTO;
import com.carrental.service.HandoverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Handovers API", description = "Bàn giao nhận/trả xe (Function 3)")
public class HandoverController {

    private final HandoverService handoverService;

    public HandoverController(HandoverService handoverService) {
        this.handoverService = handoverService;
    }

    @Operation(summary = "Lập biên bản bàn giao",
            description = "PICKUP khi đơn CONFIRMED, RETURN khi đơn ONGOING. Người lập tự xác nhận phần của mình")
    @PostMapping("/orders/{orderId}/handovers")
    public ResponseEntity<ApiResponse<HandoverResponseDTO>> createHandover(
            @PathVariable Long orderId,
            @Valid @RequestBody CreateHandoverRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Handover created successfully",
                handoverService.createHandover(orderId, request)));
    }

    @Operation(summary = "Danh sách biên bản của đơn")
    @GetMapping("/orders/{orderId}/handovers")
    public ResponseEntity<ApiResponse<List<HandoverResponseDTO>>> getHandovers(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.ok("Get handovers successfully",
                handoverService.getHandoversOfOrder(orderId)));
    }

    @Operation(summary = "Bên còn lại xác nhận biên bản",
            description = "Đủ 2 bên: PICKUP chuyển đơn sang ONGOING, RETURN chuyển đơn sang COMPLETED")
    @PutMapping("/handovers/{handoverId}/confirm")
    public ResponseEntity<ApiResponse<HandoverResponseDTO>> confirmHandover(@PathVariable Long handoverId) {
        return ResponseEntity.ok(ApiResponse.ok("Handover confirmed successfully",
                handoverService.confirmHandover(handoverId)));
    }
}
