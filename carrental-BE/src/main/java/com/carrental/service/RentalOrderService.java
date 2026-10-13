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

    List<ActionLogDTO> getOrderLogs(Long orderId);
}
