package com.carrental.service;

import com.carrental.dto.request.CreateOrderRequestDTO;
import com.carrental.dto.request.QuoteRequestDTO;
import com.carrental.dto.response.ActionLogDTO;
import com.carrental.dto.response.OrderResponseDTO;
import com.carrental.dto.response.PageResponseDTO;
import com.carrental.dto.response.PriceQuoteDTO;
import com.carrental.enums.OrderStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

/** Đặt xe và vòng đời đơn thuê. */
public interface RentalOrderService {

    PriceQuoteDTO quote(QuoteRequestDTO request);

    OrderResponseDTO createOrder(CreateOrderRequestDTO request);

    /** Người thuê, chủ xe của đơn hoặc admin mới xem được. */
    OrderResponseDTO getOrder(Long orderId);

    PageResponseDTO<OrderResponseDTO> getMyRentals(OrderStatus status, Pageable pageable);

    PageResponseDTO<OrderResponseDTO> getOrdersOfMyCars(OrderStatus status, Pageable pageable);

    PageResponseDTO<OrderResponseDTO> getAllOrders(OrderStatus status, Pageable pageable);

    /** Chủ xe xác nhận đơn PENDING. */
    OrderResponseDTO confirmOrder(Long orderId, String note);

    /** Chủ xe từ chối đơn PENDING (bắt buộc lý do). */
    OrderResponseDTO rejectOrder(Long orderId, String reason);

    /** Người thuê / chủ xe / admin huỷ đơn PENDING hoặc CONFIRMED (chưa nhận xe). */
    OrderResponseDTO cancelOrder(Long orderId, String reason);

    /** Id các đơn PENDING đã quá hạn chủ xe xác nhận. */
    List<Long> findOverduePendingOrderIds();

    /**
     * Hệ thống chuyển một đơn PENDING quá hạn sang EXPIRED (mỗi đơn một transaction riêng
     * để một đơn lỗi/bị sửa đồng thời không làm hỏng cả lô). Trả về false nếu đơn không còn quá hạn.
     */
    boolean expireOrder(Long orderId);

    List<ActionLogDTO> getOrderLogs(Long orderId);
}
