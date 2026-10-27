package com.carrental.enums;

import com.carrental.exception.AppException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Luật chuyển trạng thái đơn thuê nằm trong enum OrderStatus (quy ước nhóm mục 4). */
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
            for (OrderStatus t : OrderStatus.values()) {
                assertThat(s.canTransitionTo(t)).isFalse();
            }
        }
    }

    @Test
    void validateTransitionToRejectsInvalidMoveWith400() {
        assertThatThrownBy(() -> OrderStatus.CANCELLED.validateTransitionTo(OrderStatus.CONFIRMED))
                .isInstanceOf(AppException.class)
                .satisfies(e -> assertThat(((AppException) e).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void holdingScheduleMatchesDbExcludeConstraint() {
        assertThat(OrderStatus.HOLDING_SCHEDULE)
                .containsExactlyInAnyOrder(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.ONGOING);
    }
}
