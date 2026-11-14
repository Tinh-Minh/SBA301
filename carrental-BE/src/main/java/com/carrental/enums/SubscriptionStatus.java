package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

public enum SubscriptionStatus {
    PENDING_PAYMENT,
    ACTIVE,
    EXPIRED,
    CANCELLED;

    public boolean canTransitionTo(SubscriptionStatus next) {
        if (this == PENDING_PAYMENT) {
            return next == ACTIVE || next == CANCELLED;
        }
        if (this == ACTIVE) {
            return next == EXPIRED || next == CANCELLED;
        }
        return false; // EXPIRED, CANCELLED là trạng thái cuối
    }

    public void validateTransitionTo(SubscriptionStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái gói đăng tin từ " + this + " sang " + next);
        }
    }
}
