package com.carrental.service;

import com.carrental.dto.response.ActionLogResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.OrderAction;
import com.carrental.enums.OrderStatus;

import java.util.List;

/** Ghi và đọc lịch sử thao tác của đơn thuê (bảng action_logs). */
public interface ActionLogService {

    /**
     * Ghi một dòng lịch sử cho đơn.
     *
     * @param actor null nếu là hệ thống
     */
    void log(RentalOrder order, Customer actor, OrderAction action,
             OrderStatus fromStatus, OrderStatus toStatus, String note);

    List<ActionLogResponse> getLogsOfOrder(Long orderId);
}
