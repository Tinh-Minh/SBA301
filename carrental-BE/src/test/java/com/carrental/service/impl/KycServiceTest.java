package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.enums.KycStatus;
import com.carrental.service.KycService;
import org.junit.jupiter.api.Test;

class KycServiceTest {

    @Test
    void validIdentityApprovalTakesPrecedenceOverPendingAndRejected() {
        assertThat(KycService.evaluateEvidence(true, true, true)).isEqualTo(KycStatus.VERIFIED);
    }

    @Test
    void pendingTakesPrecedenceOverRejectedWhenNoValidApprovalExists() {
        assertThat(KycService.evaluateEvidence(false, true, true)).isEqualTo(KycStatus.PENDING);
    }

    @Test
    void rejectedIsReturnedOnlyWhenNoValidApprovalOrPendingExists() {
        assertThat(KycService.evaluateEvidence(false, false, true)).isEqualTo(KycStatus.REJECTED);
    }

    @Test
    void noIdentityEvidenceReturnsNone() {
        assertThat(KycService.evaluateEvidence(false, false, false)).isEqualTo(KycStatus.NONE);
    }
}
