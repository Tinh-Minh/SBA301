package com.carrental.repository;

/** Scalar result from the one-statement current identity-KYC query. */
public interface KycEvidenceProjection {
    Long getCustomerId();
    String getAccountRole();
    String getAccountStatus();
    Boolean getHasValidApprovedIdentity();
    Boolean getHasPendingIdentity();
    Boolean getHasRejectedIdentity();
}
