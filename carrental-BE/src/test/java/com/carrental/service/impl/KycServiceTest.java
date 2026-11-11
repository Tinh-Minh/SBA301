package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.entity.UserDocument;
import com.carrental.enums.KycStatus;
import com.carrental.enums.VerificationStatus;
import com.carrental.service.KycService;
import com.carrental.service.KycService.RejectionBanStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

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

    @Test
    void blocksVerificationForOneMonthAfterThreeRejections() {
        LocalDateTime base = LocalDateTime.of(2026, 11, 11, 10, 0);
        List<UserDocument> twoRejected = List.of(
                reviewedDoc(1L, VerificationStatus.REJECTED, base),
                reviewedDoc(2L, VerificationStatus.REJECTED, base.plusHours(1)));

        RejectionBanStatus beforeThreshold = KycService.evaluateRejectionBan(twoRejected, base.plusHours(2));
        assertThat(beforeThreshold.blocked()).isFalse();
        assertThat(beforeThreshold.rejectedAttempts()).isEqualTo(2);
        assertThat(beforeThreshold.blockedUntil()).isNull();

        List<UserDocument> threeRejected = List.of(
                twoRejected.get(0),
                twoRejected.get(1),
                reviewedDoc(3L, VerificationStatus.REJECTED, base.plusHours(2)));

        RejectionBanStatus activeBan = KycService.evaluateRejectionBan(threeRejected, base.plusDays(10));
        assertThat(activeBan.blocked()).isTrue();
        assertThat(activeBan.rejectedAttempts()).isEqualTo(3);
        assertThat(activeBan.blockedUntil()).isEqualTo(base.plusHours(2).plusMonths(1));

        RejectionBanStatus expiredBan = KycService.evaluateRejectionBan(threeRejected, base.plusHours(2).plusMonths(1));
        assertThat(expiredBan.blocked()).isFalse();
        assertThat(expiredBan.rejectedAttempts()).isEqualTo(0);
        assertThat(expiredBan.blockedUntil()).isNull();
    }

    @Test
    void approvalResetsRejectionStreakAndNewCycleStartsAfterBanExpires() {
        LocalDateTime base = LocalDateTime.of(2026, 11, 11, 10, 0);
        List<UserDocument> withApproval = List.of(
                reviewedDoc(1L, VerificationStatus.REJECTED, base),
                reviewedDoc(2L, VerificationStatus.REJECTED, base.plusHours(1)),
                reviewedDoc(3L, VerificationStatus.APPROVED, base.plusHours(2)),
                reviewedDoc(4L, VerificationStatus.REJECTED, base.plusHours(3)));

        RejectionBanStatus afterApproval = KycService.evaluateRejectionBan(withApproval, base.plusHours(4));
        assertThat(afterApproval.blocked()).isFalse();
        assertThat(afterApproval.rejectedAttempts()).isEqualTo(1);

        List<UserDocument> postBanCycle = List.of(
                reviewedDoc(10L, VerificationStatus.REJECTED, base),
                reviewedDoc(11L, VerificationStatus.REJECTED, base.plusHours(1)),
                reviewedDoc(12L, VerificationStatus.REJECTED, base.plusHours(2)),
                reviewedDoc(13L, VerificationStatus.REJECTED, base.plusHours(2).plusMonths(1).plusDays(1)));

        RejectionBanStatus nextCycle = KycService.evaluateRejectionBan(
                postBanCycle, base.plusHours(2).plusMonths(1).plusDays(2));
        assertThat(nextCycle.blocked()).isFalse();
        assertThat(nextCycle.rejectedAttempts()).isEqualTo(1);
    }

    @Test
    void pendingDocumentDoesNotClearActiveRejectionBan() {
        LocalDateTime base = LocalDateTime.of(2026, 11, 11, 16, 53, 44);
        List<UserDocument> docs = List.of(
                reviewedDoc(23L, VerificationStatus.REJECTED, base),
                reviewedDoc(24L, VerificationStatus.REJECTED, base.plusMinutes(2)),
                reviewedDoc(25L, VerificationStatus.REJECTED, base.plusMinutes(3)),
                reviewedDoc(26L, VerificationStatus.PENDING, null));

        RejectionBanStatus ban = KycService.evaluateRejectionBan(docs, base.plusMinutes(4));
        assertThat(ban.blocked()).isTrue();
        assertThat(ban.rejectedAttempts()).isEqualTo(3);
        assertThat(ban.blockedUntil()).isEqualTo(base.plusMinutes(3).plusMonths(1));
    }

    private static UserDocument reviewedDoc(long id, VerificationStatus status, LocalDateTime verifiedAt) {
        UserDocument doc = new UserDocument();
        ReflectionTestUtils.setField(doc, "id", id);
        doc.setVerifyStatus(status);
        doc.setVerifiedAt(verifiedAt);
        return doc;
    }
}
