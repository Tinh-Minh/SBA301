package com.carrental.repository;

/** One-statement account, driver, current identity-KYC, and driving-licence evidence. */
public interface DriverEligibilityProjection {
    Long getCustomerId();
    String getAccountRole();
    String getAccountStatus();
    Long getDriverId();
    String getDriverStatus();
    Boolean getHasValidApprovedIdentity();
    Boolean getHasPendingIdentity();
    Boolean getHasRejectedIdentity();
    Boolean getHasValidDriverLicense();
}
