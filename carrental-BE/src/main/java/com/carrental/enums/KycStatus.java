package com.carrental.enums;

/** KYC summary states stored for a customer. */
public enum KycStatus {
    /** No KYC review is pending or complete. */
    NONE,
    /** KYC is awaiting review. */
    PENDING,
    /** KYC has been verified. */
    VERIFIED,
    /** KYC was rejected. */
    REJECTED
}
