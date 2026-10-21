package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum VerificationStatus {
    PENDING,
    APPROVED,
    REJECTED;

    public boolean canTransitionTo(VerificationStatus next) {
        if (this == PENDING) return next == APPROVED || next == REJECTED;
        if (this == APPROVED) return next == PENDING; // Khi nộp lại giấy tờ
        if (this == REJECTED) return next == PENDING; // Khi nộp lại giấy tờ
        return false;
    }

    public void validateTransitionTo(VerificationStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái xác minh từ " + this + " sang " + next);
        }
    }
}
