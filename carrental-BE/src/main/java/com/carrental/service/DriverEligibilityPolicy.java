package com.carrental.service;

import com.carrental.dto.response.DriverEligibilityReasonCode;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import org.springframework.stereotype.Component;

/** Pure precedence rules shared by current reads and activation commands. */
@Component
public final class DriverEligibilityPolicy {

    public DriverEligibilityReasonCode currentReason(CustomerStatus accountStatus, DriverStatus driverStatus,
            KycStatus currentKyc, boolean hasValidDriverLicense) {
        if (accountStatus != CustomerStatus.ACTIVE) return DriverEligibilityReasonCode.ACCOUNT_NOT_ACTIVE;
        if (driverStatus == null) return DriverEligibilityReasonCode.DRIVER_PROFILE_MISSING;
        if (driverStatus != DriverStatus.ACTIVE) return DriverEligibilityReasonCode.DRIVER_NOT_ACTIVE;
        return activationFailure(accountStatus, currentKyc, hasValidDriverLicense);
    }

    /** A profile need not already be ACTIVE to satisfy the activation prerequisites. */
    public DriverEligibilityReasonCode activationFailure(CustomerStatus accountStatus, KycStatus currentKyc,
            boolean hasValidDriverLicense) {
        if (accountStatus != CustomerStatus.ACTIVE) return DriverEligibilityReasonCode.ACCOUNT_NOT_ACTIVE;
        if (currentKyc != KycStatus.VERIFIED) return DriverEligibilityReasonCode.IDENTITY_NOT_VERIFIED;
        if (!hasValidDriverLicense) return DriverEligibilityReasonCode.VALID_DRIVER_LICENSE_REQUIRED;
        return null;
    }
}
