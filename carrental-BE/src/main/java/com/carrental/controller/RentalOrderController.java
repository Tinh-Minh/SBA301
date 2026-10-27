package com.carrental.controller;

import com.carrental.dto.request.CreateOrderRequestDTO;
import com.carrental.dto.request.OrderActionRequestDTO;
import com.carrental.dto.request.QuoteRequestDTO;
import com.carrental.dto.response.ActionLogDTO;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.OrderResponseDTO;
import com.carrental.dto.response.PageResponseDTO;
import com.carrental.dto.response.PriceQuoteDTO;
import com.carrental.enums.OrderStatus;
import com.carrental.service.RentalOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Rental Orders API", description = "Đặt xe và vòng đời đơn thuê (Function 3)")
public class RentalOrderController {

    private final RentalOrderService rentalOrderService;

    public RentalOrderController(RentalOrderService rentalOrderService) {
        this.rentalOrderService = rentalOrderService;
    }

    @Operation(summary = "Báo giá", description = "Tính tiền thuê theo giờ/ngày (làm tròn lên), áp voucher, chưa tạo đơn")
    @PostMapping("/quote")
    public ResponseEntity<ApiResponse<PriceQuoteDTO>> quote(@Valid @RequestBody QuoteRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.ok("Quote calculated successfully",
                rentalOrderService.quote(request)));
    }

    @Operation(summary = "Tạo đơn thuê", description = "Người thuê đặt một khoảng thời gian trong slot; đơn ở trạng thái PENDING chờ chủ xe xác nhận")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(@Valid @RequestBody CreateOrderRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Order created successfully",
                rentalOrderService.createOrder(request)));
    }

    @Operation(summary = "Chi tiết đơn", description = "Người thuê, chủ xe hoặc admin")
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.ok("Get order successfully",
                rentalOrderService.getOrder(orderId)));
    }

    @Operation(summary = "Đơn tôi đã thuê", description = "Danh sách đơn của người thuê đang đăng nhập, lọc theo trạng thái, phân trang")
    @GetMapping("/my-rentals")
    public ResponseEntity<ApiResponse<PageResponseDTO<OrderResponseDTO>>> getMyRentals(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(ApiResponse.ok("Get my rentals successfully",
                rentalOrderService.getMyRentals(status, PageableFactory.forOrders(page, size, sortBy, direction))));
    }

    @Operation(summary = "Đơn trên xe của tôi", description = "Danh sách đơn đặt các xe của chủ xe đang đăng nhập")
    @GetMapping("/my-cars")
    public ResponseEntity<ApiResponse<PageResponseDTO<OrderResponseDTO>>> getOrdersOfMyCars(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(ApiResponse.ok("Get orders of my cars successfully",
                rentalOrderService.getOrdersOfMyCars(status, PageableFactory.forOrders(page, size, sortBy, direction))));
    }

    @Operation(summary = "Tất cả đơn (admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<OrderResponseDTO>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(ApiResponse.ok("Get orders successfully",
                rentalOrderService.getAllOrders(status, PageableFactory.forOrders(page, size, sortBy, direction))));
    }

    @Operation(summary = "Chủ xe xác nhận đơn", description = "PENDING -> CONFIRMED")
    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> confirmOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody(required = false) OrderActionRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.ok("Order confirmed successfully",
                rentalOrderService.confirmOrder(orderId, request == null ? null : request.getReason())));
    }

    @Operation(summary = "Chủ xe từ chối đơn", description = "PENDING -> REJECTED, bắt buộc lý do")
    @PutMapping("/{orderId}/reject")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> rejectOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody(required = false) OrderActionRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.ok("Order rejected successfully",
                rentalOrderService.rejectOrder(orderId, request == null ? null : request.getReason())));
    }

    @Operation(summary = "Huỷ đơn", description = "PENDING/CONFIRMED -> CANCELLED. Chủ xe/admin huỷ phải có lý do")
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> cancelOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody(required = false) OrderActionRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully",
                rentalOrderService.cancelOrder(orderId, request == null ? null : request.getReason())));
    }

    @Operation(summary = "Lịch sử thao tác của đơn")
    @GetMapping("/{orderId}/logs")
    public ResponseEntity<ApiResponse<List<ActionLogDTO>>> getOrderLogs(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.ok("Get order logs successfully",
                rentalOrderService.getOrderLogs(orderId)));
    }
}
