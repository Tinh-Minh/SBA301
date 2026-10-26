package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.enums.KycStatus;
import org.junit.jupiter.api.Test;

class KycServiceTest {

    @Test
    void validIdentityApprovalTakesPrecedenceOverPendingAndRejected() {
        assertThat(KycServiceImpl.evaluateEvidence(true, true, true)).isEqualTo(KycStatus.VERIFIED);
    }

    @Test
    void pendingTakesPrecedenceOverRejectedWhenNoValidApprovalExists() {
        assertThat(KycServiceImpl.evaluateEvidence(false, true, true)).isEqualTo(KycStatus.PENDING);
    }

    @Test
    void rejectedIsReturnedOnlyWhenNoValidApprovalOrPendingExists() {
        assertThat(KycServiceImpl.evaluateEvidence(false, false, true)).isEqualTo(KycStatus.REJECTED);
    }

    @Test
    void noIdentityEvidenceReturnsNone() {
        assertThat(KycServiceImpl.evaluateEvidence(false, false, false)).isEqualTo(KycStatus.NONE);
    }
}
