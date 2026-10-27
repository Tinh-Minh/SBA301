package com.carrental.service;

import com.carrental.dto.request.CreateOrderRequest;
import com.carrental.dto.request.QuoteRequest;
import com.carrental.dto.response.ActionLogResponse;
import com.carrental.dto.response.OrderResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.PriceQuoteResponse;
import com.carrental.enums.OrderStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

/** Đặt xe và vòng đời đơn thuê. */
public interface RentalOrderService {

    PriceQuoteResponse quote(QuoteRequest request);

    OrderResponse createOrder(CreateOrderRequest request);

    /** Người thuê, chủ xe của đơn hoặc admin mới xem được. */
    OrderResponse getOrder(Long orderId);

    PageResponse<OrderResponse> getMyRentals(OrderStatus status, Pageable pageable);

    PageResponse<OrderResponse> getOrdersOfMyCars(OrderStatus status, Pageable pageable);

    PageResponse<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable);

    /** Chủ xe xác nhận đơn PENDING. */
    OrderResponse confirmOrder(Long orderId, String note);

    /** Chủ xe từ chối đơn PENDING (bắt buộc lý do). */
    OrderResponse rejectOrder(Long orderId, String reason);

    /** Người thuê / chủ xe / admin huỷ đơn PENDING hoặc CONFIRMED (chưa nhận xe). */
    OrderResponse cancelOrder(Long orderId, String reason);

    /** Id các đơn PENDING đã quá hạn chủ xe xác nhận. */
    List<Long> findOverduePendingOrderIds();

    /**
     * Hệ thống chuyển một đơn PENDING quá hạn sang EXPIRED (mỗi đơn một transaction riêng
     * để một đơn lỗi/bị sửa đồng thời không làm hỏng cả lô). Trả về false nếu đơn không còn quá hạn.
     */
    boolean expireOrder(Long orderId);

    List<ActionLogResponse> getOrderLogs(Long orderId);
}
