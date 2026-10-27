package com.carrental.controller;

import com.carrental.dto.request.CreateOrderRequest;
import com.carrental.dto.request.OrderActionRequest;
import com.carrental.dto.request.QuoteRequest;
import com.carrental.dto.response.ActionLogResponse;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.OrderResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.PriceQuoteResponse;
import com.carrental.enums.OrderStatus;
import com.carrental.service.RentalOrderService;
import com.carrental.util.PageRequestFactory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Rental Orders API", description = "Đặt xe và vòng đời đơn thuê (Function 3)")
public class RentalOrderController {

    /** Cột được phép sắp xếp danh sách đơn; giá trị khác dùng mặc định createdAt. */
    private static final Set<String> ORDER_SORT_FIELDS =
            Set.of("createdAt", "startTime", "endTime", "totalAmount", "status", "orderCode");

    private final RentalOrderService rentalOrderService;

    @Operation(summary = "Báo giá", description = "Tính tiền thuê theo giờ/ngày (làm tròn lên), áp voucher, chưa tạo đơn")
    @PostMapping("/quote")
    public ApiResponse<PriceQuoteResponse> quote(@Valid @RequestBody QuoteRequest request) {
        return ApiResponse.ok("Tính giá thuê thành công", rentalOrderService.quote(request));
    }

    @Operation(summary = "Tạo đơn thuê", description = "Người thuê đặt một khoảng thời gian trong slot; đơn ở trạng thái PENDING chờ chủ xe xác nhận")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ApiResponse.created("Tạo đơn thuê thành công, chờ chủ xe xác nhận", rentalOrderService.createOrder(request));
    }

    @Operation(summary = "Chi tiết đơn", description = "Người thuê, chủ xe hoặc admin")
    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponse> getOrder(@PathVariable Long orderId) {
        return ApiResponse.ok("Lấy chi tiết đơn thuê thành công", rentalOrderService.getOrder(orderId));
    }

    @Operation(summary = "Đơn tôi đã thuê", description = "Danh sách đơn của người thuê đang đăng nhập, lọc theo trạng thái, phân trang")
    @GetMapping("/my-rentals")
    public ApiResponse<PageResponse<OrderResponse>> getMyRentals(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.ok("Lấy danh sách đơn đã thuê thành công",
                rentalOrderService.getMyRentals(status, orderPage(page, size, sortBy, direction)));
    }

    @Operation(summary = "Đơn trên xe của tôi", description = "Danh sách đơn đặt các xe của chủ xe đang đăng nhập")
    @GetMapping("/my-cars")
    public ApiResponse<PageResponse<OrderResponse>> getOrdersOfMyCars(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.ok("Lấy danh sách đơn trên xe của tôi thành công",
                rentalOrderService.getOrdersOfMyCars(status, orderPage(page, size, sortBy, direction)));
    }

    @Operation(summary = "Tất cả đơn (admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<OrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.ok("Lấy danh sách đơn thành công",
                rentalOrderService.getAllOrders(status, orderPage(page, size, sortBy, direction)));
    }

    @Operation(summary = "Chủ xe xác nhận đơn", description = "PENDING -> CONFIRMED")
    @PutMapping("/{orderId}/confirm")
    public ApiResponse<OrderResponse> confirmOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody(required = false) OrderActionRequest request) {
        return ApiResponse.ok("Xác nhận đơn thuê thành công",
                rentalOrderService.confirmOrder(orderId, OrderActionRequest.reasonOf(request)));
    }

    @Operation(summary = "Chủ xe từ chối đơn", description = "PENDING -> REJECTED, bắt buộc lý do")
    @PutMapping("/{orderId}/reject")
    public ApiResponse<OrderResponse> rejectOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody(required = false) OrderActionRequest request) {
        return ApiResponse.ok("Từ chối đơn thuê thành công",
                rentalOrderService.rejectOrder(orderId, OrderActionRequest.reasonOf(request)));
    }

    @Operation(summary = "Huỷ đơn", description = "PENDING/CONFIRMED -> CANCELLED. Chủ xe/admin huỷ phải có lý do")
    @PutMapping("/{orderId}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody(required = false) OrderActionRequest request) {
        return ApiResponse.ok("Huỷ đơn thuê thành công",
                rentalOrderService.cancelOrder(orderId, OrderActionRequest.reasonOf(request)));
    }

    @Operation(summary = "Lịch sử thao tác của đơn")
    @GetMapping("/{orderId}/logs")
    public ApiResponse<List<ActionLogResponse>> getOrderLogs(@PathVariable Long orderId) {
        return ApiResponse.ok("Lấy lịch sử đơn thuê thành công", rentalOrderService.getOrderLogs(orderId));
    }

    private static Pageable orderPage(int page, int size, String sortBy, String direction) {
        return PageRequestFactory.of(page, size, sortBy, direction, ORDER_SORT_FIELDS, "createdAt");
    }
}
