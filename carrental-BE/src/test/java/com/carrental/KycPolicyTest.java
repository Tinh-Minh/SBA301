package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.enums.KycStatus;
import com.carrental.service.KycPolicy;
import org.junit.jupiter.api.Test;

class KycPolicyTest {
    private final KycPolicy policy = new KycPolicy();

    @Test
    void validIdentityApprovalTakesPrecedenceOverPendingAndRejected() {
        assertThat(policy.evaluate(true, true, true)).isEqualTo(KycStatus.VERIFIED);
    }

    @Test
    void pendingTakesPrecedenceOverRejectedWhenNoValidApprovalExists() {
        assertThat(policy.evaluate(false, true, true)).isEqualTo(KycStatus.PENDING);
    }

    @Test
    void rejectedIsReturnedOnlyWhenNoValidApprovalOrPendingExists() {
        assertThat(policy.evaluate(false, false, true)).isEqualTo(KycStatus.REJECTED);
    }

    @Test
    void noIdentityEvidenceReturnsNone() {
        assertThat(policy.evaluate(false, false, false)).isEqualTo(KycStatus.NONE);
    }
}
