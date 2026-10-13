package com.carrental.dto.response;

import com.carrental.entity.ActionLog;
import com.carrental.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ActionLogDTO {

    private Long id;
    private Long orderId;
    /** null = hệ thống. */
    private Long actorId;
    private String actorName;
    private String action;
    private OrderStatus fromStatus;
    private OrderStatus toStatus;
    private String note;
    private LocalDateTime createdAt;

    public static ActionLogDTO fromEntity(ActionLog log) {
        return new ActionLogDTO(
                log.getId(),
                log.getOrder().getId(),
                log.getActor() == null ? null : log.getActor().getId(),
                log.getActor() == null ? "Hệ thống" : log.getActor().getFullName(),
                log.getAction(),
                log.getFromStatus(),
                log.getToStatus(),
                log.getNote(),
                log.getCreatedAt()
        );
    }
}
