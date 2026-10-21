package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum TransactionStatus {
    PENDING,
    SUCCESS,
    FAILED;

    public boolean canTransitionTo(TransactionStatus next) {
        if (this == PENDING) {
            return next == SUCCESS || next == FAILED;
        }
        return false;
    }

    public void validateTransitionTo(TransactionStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái giao dịch từ " + this + " sang " + next);
        }
    }
}
