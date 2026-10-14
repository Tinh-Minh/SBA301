package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum DisputeStatus {
    OPEN,
    UNDER_REVIEW,
    RESOLVED_REFUND,
    RESOLVED_PAYOUT,
    REJECTED;

    public boolean canTransitionTo(DisputeStatus next) {
        if (this == OPEN) {
            return next == UNDER_REVIEW || next == REJECTED;
        }
        if (this == UNDER_REVIEW) {
            return next == RESOLVED_REFUND || next == RESOLVED_PAYOUT || next == REJECTED;
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
