package com.carrental.service;

import com.carrental.enums.KycStatus;
import org.springframework.stereotype.Component;

/** Shared precedence for review-time snapshots and current KYC reads. */
@Component
public final class KycPolicy {

    public KycStatus evaluate(boolean hasValidApprovedIdentity, boolean hasPendingIdentity, boolean hasRejectedIdentity) {
        if (hasValidApprovedIdentity) return KycStatus.VERIFIED;
        if (hasPendingIdentity) return KycStatus.PENDING;
        if (hasRejectedIdentity) return KycStatus.REJECTED;
        return KycStatus.NONE;
    }
}
