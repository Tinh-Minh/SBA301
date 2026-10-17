package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum PayoutStatus {
    PENDING,
    PROCESSING,
    PAID,
    FAILED;

    public boolean canTransitionTo(PayoutStatus next) {
        if (this == PENDING) {
            return next == PROCESSING || next == FAILED;
        }
        if (this == PROCESSING) {
            return next == PAID || next == FAILED;
        }
        return false;
    }

    public void validateTransitionTo(PayoutStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái chi trả từ " + this + " sang " + next);
        }
    }
}
