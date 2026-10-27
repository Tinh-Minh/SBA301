package com.carrental.service.impl;

import com.carrental.dto.response.ActionLogDTO;
import com.carrental.entity.ActionLog;
import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.OrderAction;
import com.carrental.enums.OrderStatus;
import com.carrental.repository.ActionLogRepository;
import com.carrental.service.ActionLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActionLogServiceImpl implements ActionLogService {

    private static final int NOTE_MAX_LENGTH = 500;

    private final ActionLogRepository actionLogRepository;

    /**
     * Chạy trong transaction của hàm gọi (tạo/xác nhận/huỷ đơn...), nên lỗi ở đây làm rollback cả thao tác.
     * Cột action, from_status, to_status là chuỗi vì bảng action_logs dùng chung; giá trị lấy từ enum.
     */
    @Override
    @Transactional
    public void log(RentalOrder order, Customer actor, OrderAction action,
                    OrderStatus fromStatus, OrderStatus toStatus, String note) {
        actionLogRepository.save(ActionLog.builder()
                .order(order)
                .actor(actor)
                .action(action.name())
                .fromStatus(fromStatus == null ? null : fromStatus.name())
                .toStatus(toStatus == null ? null : toStatus.name())
                .note(truncate(note))
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActionLogDTO> getLogsOfOrder(Long orderId) {
        return actionLogRepository.findByOrderIdOrderByCreatedAtAscIdAsc(orderId).stream()
                .map(ActionLogDTO::fromEntity)
                .toList();
    }

    private static String truncate(String note) {
        if (note == null) return null;
        return note.length() <= NOTE_MAX_LENGTH ? note : note.substring(0, NOTE_MAX_LENGTH);
    }
}
