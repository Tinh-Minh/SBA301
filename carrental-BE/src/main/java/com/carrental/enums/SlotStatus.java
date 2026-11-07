package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum SlotStatus {
    OPEN,
    CLOSED,
    CANCELLED;

    public boolean canTransitionTo(SlotStatus next) {
        if (this == OPEN) {
            return next == CLOSED || next == CANCELLED;
        }
        if (this == CLOSED) {
            return next == OPEN || next == CANCELLED;
        }
        return false;
    }

    public void validateTransitionTo(SlotStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái slot từ " + this + " sang " + next);
        }
    }
}
