package com.carrental.enums;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OrderStatusTest {

    @Test
    void pendingTransitions() {
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.CONFIRMED)).isTrue();
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.REJECTED)).isTrue();
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.EXPIRED)).isTrue();
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.ONGOING)).isFalse();
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.COMPLETED)).isFalse();
    }

    @Test
    void confirmedTransitions() {
        assertThat(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.ONGOING)).isTrue();
        assertThat(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.EXPIRED)).isFalse();
        assertThat(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.COMPLETED)).isFalse();
    }

    @Test
    void ongoingOnlyCompletes() {
        assertThat(OrderStatus.ONGOING.canTransitionTo(OrderStatus.COMPLETED)).isTrue();
        assertThat(OrderStatus.ONGOING.canTransitionTo(OrderStatus.CANCELLED)).isFalse();
    }

    @Test
    void finalStatesCannotMove() {
        for (OrderStatus s : new OrderStatus[]{OrderStatus.REJECTED, OrderStatus.EXPIRED,
                OrderStatus.COMPLETED, OrderStatus.CANCELLED}) {
            assertThat(s.isFinal()).isTrue();
            for (OrderStatus t : OrderStatus.values()) {
                assertThat(s.canTransitionTo(t)).isFalse();
            }
        }
    }

    @Test
    void activeStatusesMatchDbExcludeConstraint() {
        assertThat(OrderStatus.ACTIVE_STATUSES)
                .containsExactlyInAnyOrder(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.ONGOING);
    }
}
