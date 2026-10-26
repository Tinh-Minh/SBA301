package com.carrental.service.impl;

import com.carrental.dto.response.ActionLogDTO;
import com.carrental.entity.ActionLog;
import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.OrderStatus;
import com.carrental.repository.ActionLogRepository;
import com.carrental.service.ActionLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActionLogServiceImpl implements ActionLogService {
    private final ActionLogRepository actionLogRepository;

    public ActionLogServiceImpl(ActionLogRepository actionLogRepository) {
        this.actionLogRepository = actionLogRepository;
    }

    @Override
    @Transactional
    public void log(RentalOrder order, Customer actor, String action,
                    OrderStatus fromStatus, OrderStatus toStatus, String note) {
        // Entity ActionLog dùng chung lưu trạng thái dạng chuỗi; created_at do @CreationTimestamp tự điền.
        actionLogRepository.save(ActionLog.builder()
                .order(order)
                .actor(actor)
                .action(action)
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
        return note.length() <= 500 ? note : note.substring(0, 500);
    }
}
