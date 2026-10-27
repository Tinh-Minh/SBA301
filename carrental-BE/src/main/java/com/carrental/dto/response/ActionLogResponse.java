package com.carrental.dto.response;

import com.carrental.entity.ActionLog;

import java.time.LocalDateTime;

/**
 * Một dòng lịch sử thao tác của đơn.
 *
 * @param actorId null nếu thao tác do hệ thống thực hiện
 */
public record ActionLogResponse(
        Long id,
        Long orderId,
        Long actorId,
        String actorName,
        String action,
        String fromStatus,
        String toStatus,
        String note,
        LocalDateTime createdAt) {

    public static ActionLogResponse from(ActionLog log) {
        return new ActionLogResponse(
                log.getId(),
                log.getOrder().getId(),
                log.getActor() == null ? null : log.getActor().getId(),
                log.getActor() == null ? "Hệ thống" : log.getActor().getFullName(),
                log.getAction(),
                log.getFromStatus(),
                log.getToStatus(),
                log.getNote(),
                log.getCreatedAt());
    }
}
