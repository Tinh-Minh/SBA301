package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum CarStatus {
    PENDING_APPROVAL,
    ACTIVE,
    INACTIVE,
    REJECTED;

    public boolean canTransitionTo(CarStatus next) {
        if (this == PENDING_APPROVAL) {
            return next == ACTIVE || next == REJECTED;
        }
        if (this == ACTIVE) {
            return next == INACTIVE;
        }
        if (this == INACTIVE) {
            return next == ACTIVE;
        }
        if (this == REJECTED) {
            return next == PENDING_APPROVAL; // Sau khi bị từ chối, chủ xe sửa và gửi duyệt lại
        }
        return false;
    }

    public void validateTransitionTo(CarStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái xe từ " + this + " sang " + next);
        }
    }
}
