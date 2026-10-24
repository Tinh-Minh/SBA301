package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum ExtraFeeStatus {
    PENDING,
    PAID,
    WAIVED,
    DISPUTED;

    public boolean canTransitionTo(ExtraFeeStatus next) {
        if (this == PENDING) {
            return next == PAID || next == WAIVED || next == DISPUTED;
        }
        if (this == DISPUTED) {
            return next == PAID || next == WAIVED;
        }
        return false;
    }

    public void validateTransitionTo(ExtraFeeStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái phí phát sinh từ " + this + " sang " + next);
        }
    }
}
