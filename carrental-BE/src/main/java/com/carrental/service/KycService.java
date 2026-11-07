package com.carrental.service;

import com.carrental.dto.response.KycSummaryResponse;
import com.carrental.entity.UserDocument;
import com.carrental.enums.DocumentType;
import com.carrental.enums.KycStatus;
import com.carrental.security.CurrentAccount;
import java.time.LocalDate;
import java.util.List;

public interface KycService {
    KycSummaryResponse getMe(CurrentAccount account);
    KycSummaryResponse getCustomer(long customerId);

    /** Called inside the review transaction after document flush. */
    KycStatus currentStatus(long customerId, LocalDate evaluatedOn);

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
