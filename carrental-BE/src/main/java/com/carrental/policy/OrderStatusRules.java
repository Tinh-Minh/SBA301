package com.carrental.policy;

import com.carrental.enums.OrderStatus;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Quy tắc chuyển trạng thái đơn thuê (enum OrderStatus dùng chung của nhóm chỉ khai báo giá trị):
 * <pre>
 * PENDING   -> CONFIRMED | REJECTED | CANCELLED | EXPIRED
 * CONFIRMED -> ONGOING   | CANCELLED
 * ONGOING   -> COMPLETED
 * REJECTED, EXPIRED, COMPLETED, CANCELLED: trạng thái cuối
 * </pre>
 */
public final class OrderStatusRules {

    /** Đơn ở các trạng thái này đang giữ lịch xe (khớp WHERE của EXCLUDE rental_orders_no_overlap). */
    public static final Set<OrderStatus> ACTIVE_STATUSES =
            EnumSet.of(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.ONGOING);

    private static final Map<OrderStatus, Set<OrderStatus>> TRANSITIONS = Map.of(
            OrderStatus.PENDING, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.REJECTED,
                    OrderStatus.CANCELLED, OrderStatus.EXPIRED),
            OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.ONGOING, OrderStatus.CANCELLED),
            OrderStatus.ONGOING, EnumSet.of(OrderStatus.COMPLETED)
    );

    private OrderStatusRules() {
    }

    public static boolean canTransition(OrderStatus from, OrderStatus to) {
        return TRANSITIONS.getOrDefault(from, Set.of()).contains(to);
    }

    public static boolean isFinal(OrderStatus status) {
        return !TRANSITIONS.containsKey(status);
    }
}
