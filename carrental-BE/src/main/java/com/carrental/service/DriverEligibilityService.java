package com.carrental.service;

import com.carrental.dto.response.DriverEligibilityResponse;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverEligibilityReasonCode;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import java.time.LocalDate;

/** Internal F1→F2 contract: calculate a current point-in-time result for an explicit customerId. */
public interface DriverEligibilityService {
    DriverEligibilityResponse evaluateForCustomer(long customerId);

    /** Reuses the same aggregate and policy inside a status transaction with its single captured date. */
    DriverEligibilityResponse evaluateForCustomer(long customerId, LocalDate evaluatedOn);

    static DriverEligibilityReasonCode currentReason(CustomerStatus accountStatus, DriverStatus driverStatus,
            KycStatus currentKyc, boolean hasValidDriverLicense) {
        if (accountStatus != CustomerStatus.ACTIVE) return DriverEligibilityReasonCode.ACCOUNT_NOT_ACTIVE;
        if (driverStatus == null) return DriverEligibilityReasonCode.DRIVER_PROFILE_MISSING;
        if (driverStatus != DriverStatus.ACTIVE) return DriverEligibilityReasonCode.DRIVER_NOT_ACTIVE;
        return activationFailure(accountStatus, currentKyc, hasValidDriverLicense);
    }

    static DriverEligibilityReasonCode activationFailure(CustomerStatus accountStatus, KycStatus currentKyc,
            boolean hasValidDriverLicense) {
        if (accountStatus != CustomerStatus.ACTIVE) return DriverEligibilityReasonCode.ACCOUNT_NOT_ACTIVE;
        if (currentKyc != KycStatus.VERIFIED) return DriverEligibilityReasonCode.IDENTITY_NOT_VERIFIED;
        if (!hasValidDriverLicense) return DriverEligibilityReasonCode.VALID_DRIVER_LICENSE_REQUIRED;
        return null;
    }
}
