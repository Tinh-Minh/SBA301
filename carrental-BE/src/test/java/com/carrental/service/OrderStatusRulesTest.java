package com.carrental.service;

import com.carrental.enums.OrderStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OrderStatusRulesTest {

    @Test
    void pendingTransitions() {
        assertThat(OrderStatusRules.canTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED)).isTrue();
        assertThat(OrderStatusRules.canTransition(OrderStatus.PENDING, OrderStatus.REJECTED)).isTrue();
        assertThat(OrderStatusRules.canTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatusRules.canTransition(OrderStatus.PENDING, OrderStatus.EXPIRED)).isTrue();
        assertThat(OrderStatusRules.canTransition(OrderStatus.PENDING, OrderStatus.ONGOING)).isFalse();
        assertThat(OrderStatusRules.canTransition(OrderStatus.PENDING, OrderStatus.COMPLETED)).isFalse();
    }

    @Test
    void confirmedTransitions() {
        assertThat(OrderStatusRules.canTransition(OrderStatus.CONFIRMED, OrderStatus.ONGOING)).isTrue();
        assertThat(OrderStatusRules.canTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatusRules.canTransition(OrderStatus.CONFIRMED, OrderStatus.EXPIRED)).isFalse();
        assertThat(OrderStatusRules.canTransition(OrderStatus.CONFIRMED, OrderStatus.COMPLETED)).isFalse();
    }

    @Test
    void ongoingOnlyCompletes() {
        assertThat(OrderStatusRules.canTransition(OrderStatus.ONGOING, OrderStatus.COMPLETED)).isTrue();
        assertThat(OrderStatusRules.canTransition(OrderStatus.ONGOING, OrderStatus.CANCELLED)).isFalse();
    }

    @Test
    void finalStatesCannotMove() {
        for (OrderStatus s : new OrderStatus[]{OrderStatus.REJECTED, OrderStatus.EXPIRED,
                OrderStatus.COMPLETED, OrderStatus.CANCELLED}) {
            assertThat(OrderStatusRules.isFinal(s)).isTrue();
            for (OrderStatus t : OrderStatus.values()) {
                assertThat(OrderStatusRules.canTransition(s, t)).isFalse();
            }
        }
    }

    @Test
    void activeStatusesMatchDbExcludeConstraint() {
        assertThat(OrderStatusRules.ACTIVE_STATUSES)
                .containsExactlyInAnyOrder(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.ONGOING);
    }
}
