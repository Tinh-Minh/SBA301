package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    REJECTED,
    EXPIRED,
    ONGOING,
    COMPLETED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus next) {
        if (this == PENDING) {
            return next == CONFIRMED || next == REJECTED || next == EXPIRED || next == CANCELLED;
        }
        if (this == CONFIRMED) {
            return next == ONGOING || next == CANCELLED;
        }
        if (this == ONGOING) {
            return next == COMPLETED;
        }
        return false; // REJECTED, EXPIRED, COMPLETED, CANCELLED là trạng thái cuối
    }

    public void validateTransitionTo(OrderStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái đơn thuê từ " + this + " sang " + next);
        }
    }
}
