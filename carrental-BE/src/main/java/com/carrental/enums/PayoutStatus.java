package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum PayoutStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    REJECTED;

    public boolean canTransitionTo(PayoutStatus next) {
        if (this == PENDING) {
            return next == PROCESSING || next == REJECTED;
        }
        if (this == PROCESSING) {
            return next == COMPLETED || next == REJECTED;
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
