package com.carrental.enums;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Trạng thái đơn thuê (khớp CHECK rental_orders.status) và các bước chuyển hợp lệ:
 * <pre>
 * PENDING   -> CONFIRMED | REJECTED | CANCELLED | EXPIRED
 * CONFIRMED -> ONGOING   | CANCELLED
 * ONGOING   -> COMPLETED
 * REJECTED, EXPIRED, COMPLETED, CANCELLED: trạng thái cuối
 * </pre>
 */
public enum OrderStatus {
    PENDING, CONFIRMED, REJECTED, EXPIRED, ONGOING, COMPLETED, CANCELLED;

    /** Đơn ở các trạng thái này đang giữ lịch xe (khớp WHERE của EXCLUDE rental_orders_no_overlap). */
    public static final Set<OrderStatus> ACTIVE_STATUSES = EnumSet.of(PENDING, CONFIRMED, ONGOING);

    private static final Map<OrderStatus, Set<OrderStatus>> TRANSITIONS = Map.of(
            PENDING, EnumSet.of(CONFIRMED, REJECTED, CANCELLED, EXPIRED),
            CONFIRMED, EnumSet.of(ONGOING, CANCELLED),
            ONGOING, EnumSet.of(COMPLETED)
    );

    public boolean canTransitionTo(OrderStatus target) {
        return TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public boolean isFinal() {
        return !TRANSITIONS.containsKey(this);
    }
}
