package com.carrental.enums;

import com.carrental.exception.AppException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SubscriptionStatusTest {

    @Test
    void pendingCanBePaidOrCancelled() {
        assertThat(SubscriptionStatus.PENDING_PAYMENT.canTransitionTo(SubscriptionStatus.ACTIVE)).isTrue();
        assertThat(SubscriptionStatus.PENDING_PAYMENT.canTransitionTo(SubscriptionStatus.CANCELLED)).isTrue();
        assertThat(SubscriptionStatus.PENDING_PAYMENT.canTransitionTo(SubscriptionStatus.EXPIRED)).isFalse();
    }

    @Test
    void activeCanExpireOrBeCancelled() {
        assertThat(SubscriptionStatus.ACTIVE.canTransitionTo(SubscriptionStatus.EXPIRED)).isTrue();
        assertThat(SubscriptionStatus.ACTIVE.canTransitionTo(SubscriptionStatus.CANCELLED)).isTrue();
        assertThat(SubscriptionStatus.ACTIVE.canTransitionTo(SubscriptionStatus.PENDING_PAYMENT)).isFalse();
    }

    @Test
    void expiredAndCancelledAreFinal() {
        for (SubscriptionStatus end : new SubscriptionStatus[]{SubscriptionStatus.EXPIRED, SubscriptionStatus.CANCELLED}) {
            for (SubscriptionStatus next : SubscriptionStatus.values()) {
                assertThat(end.canTransitionTo(next)).isFalse();
            }
        }
        assertThrows(AppException.class, () -> SubscriptionStatus.CANCELLED.validateTransitionTo(SubscriptionStatus.ACTIVE));
    }
}
