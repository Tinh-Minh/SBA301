package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum PaymentStatus {
    UNPAID,
    PAID,
    REFUNDED;

    public boolean canTransitionTo(PaymentStatus next) {
        if (this == UNPAID) {
            return next == PAID;
        }
        if (this == PAID) {
            return next == REFUNDED;
        }
        return false;
    }

    public void validateTransitionTo(PaymentStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái thanh toán từ " + this + " sang " + next);
        }
    }
}
