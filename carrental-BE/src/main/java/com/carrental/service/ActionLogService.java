package com.carrental.service;

import com.carrental.dto.response.ActionLogDTO;
import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.OrderStatus;

import java.util.List;

/** Ghi và đọc lịch sử thao tác của đơn thuê (bảng action_logs). */
public interface ActionLogService {

    /** Tên các hành động ghi vào cột action. */
    String CREATE = "CREATE";
    String CONFIRM = "CONFIRM";
    String REJECT = "REJECT";
    String CANCEL = "CANCEL";
    String EXPIRE = "EXPIRE";
    String HANDOVER_CREATE = "HANDOVER_CREATE";
    String HANDOVER_CONFIRM = "HANDOVER_CONFIRM";
    String PICKUP = "PICKUP";
    String RETURN = "RETURN";

    /**
     * @param actor null nếu là hệ thống
     */
    void log(RentalOrder order, Customer actor, String action,
             OrderStatus fromStatus, OrderStatus toStatus, String note);

    List<ActionLogDTO> getLogsOfOrder(Long orderId);
}
