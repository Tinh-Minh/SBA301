package com.carrental.service;

import com.carrental.dto.response.KycSummaryResponse;
import com.carrental.entity.UserDocument;
import com.carrental.enums.DocumentType;
import com.carrental.enums.KycStatus;
import com.carrental.enums.VerificationStatus;
import com.carrental.security.CurrentAccount;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public interface KycService {
    int MAX_REJECTION_ATTEMPTS = 3;
    int VERIFICATION_BAN_MONTHS = 1;

    record RejectionBanStatus(int rejectedAttempts, int maxAttempts, boolean blocked, LocalDateTime blockedUntil) { }

    KycSummaryResponse getMe(CurrentAccount account);
    KycSummaryResponse getCustomer(long customerId);

    /** Called inside the review transaction after document flush. */
    KycStatus currentStatus(long customerId, LocalDate evaluatedOn);

    static RejectionBanStatus evaluateRejectionBan(List<UserDocument> documents, LocalDateTime now) {
        if (documents == null || documents.isEmpty()) {
            return new RejectionBanStatus(0, MAX_REJECTION_ATTEMPTS, false, null);
        }
        List<UserDocument> reviewed = documents.stream()
                .filter(doc -> doc.getVerifyStatus() == VerificationStatus.APPROVED
                        || doc.getVerifyStatus() == VerificationStatus.REJECTED)
                .sorted(Comparator
                        .comparing(KycService::decisionTimestamp, Comparator.nullsFirst(Comparator.naturalOrder()))
                        .thenComparing(UserDocument::getId, Comparator.nullsFirst(Comparator.naturalOrder())))
                .toList();

        int streak = 0;
        LocalDateTime blockedUntil = null;
        for (UserDocument doc : reviewed) {
            if (doc.getVerifyStatus() == VerificationStatus.APPROVED) {
                streak = 0;
                blockedUntil = null;
                continue;
            }
            LocalDateTime rejectedAt = decisionTimestamp(doc);
            if (blockedUntil != null && rejectedAt != null && !rejectedAt.isBefore(blockedUntil)) {
                // Previous 1-month ban has already elapsed; begin a fresh attempt streak.
                streak = 1;
                blockedUntil = null;
            } else {
                streak++;
            }
            if (streak >= MAX_REJECTION_ATTEMPTS && rejectedAt != null) {
                blockedUntil = rejectedAt.plusMonths(VERIFICATION_BAN_MONTHS);
            }
        }
        if (blockedUntil != null && now != null && !now.isBefore(blockedUntil)) {
            return new RejectionBanStatus(0, MAX_REJECTION_ATTEMPTS, false, null);
        }
        boolean blocked = blockedUntil != null && now != null && now.isBefore(blockedUntil);
        return new RejectionBanStatus(streak, MAX_REJECTION_ATTEMPTS, blocked, blocked ? blockedUntil : null);
    }

    private static LocalDateTime decisionTimestamp(UserDocument doc) {
        if (doc.getVerifiedAt() != null) return doc.getVerifiedAt();
        if (doc.getUpdatedAt() != null) return doc.getUpdatedAt();
        return doc.getCreatedAt();
    }

    static KycStatus evaluateDocuments(List<UserDocument> documents, LocalDate today) {
        boolean approved = false, pending = false, rejected = false;
        for (UserDocument document : documents) {
            if (document.getDocType() != DocumentType.CITIZEN_ID && document.getDocType() != DocumentType.PASSPORT) continue;
            switch (document.getVerifyStatus()) {
                case APPROVED -> approved |= document.getExpiresAt() == null || !document.getExpiresAt().isBefore(today);
                case PENDING -> pending = true;
                case REJECTED -> rejected = true;
            }
        }
        return evaluateEvidence(approved, pending, rejected);
    }

    static KycStatus evaluateEvidence(boolean hasValidApprovedIdentity, boolean hasPendingIdentity,
            boolean hasRejectedIdentity) {
        if (hasValidApprovedIdentity) return KycStatus.VERIFIED;
        if (hasPendingIdentity) return KycStatus.PENDING;
        if (hasRejectedIdentity) return KycStatus.REJECTED;
        return KycStatus.NONE;
    }
}
