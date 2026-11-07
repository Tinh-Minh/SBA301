package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum DisputeStatus {
    OPEN,
    IN_REVIEW,
    RESOLVED,
    REJECTED;

    public boolean canTransitionTo(DisputeStatus next) {
        if (this == OPEN) {
            return next == IN_REVIEW || next == RESOLVED || next == REJECTED;
        }
        if (this == IN_REVIEW) {
            return next == RESOLVED || next == REJECTED;
        }
        return false;
    }

    public void validateTransitionTo(DisputeStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái khiếu nại từ " + this + " sang " + next);
        }
    }
}
