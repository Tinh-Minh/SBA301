package com.carrental.enums;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    REJECTED,
    EXPIRED,
    ONGOING,
    COMPLETED,
    CANCELLED;

    /** Đơn ở các trạng thái này đang giữ lịch xe (khớp điều kiện của EXCLUDE rental_orders_no_overlap). */
    public static final Set<OrderStatus> HOLDING_SCHEDULE =
            Collections.unmodifiableSet(EnumSet.of(PENDING, CONFIRMED, ONGOING));

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
