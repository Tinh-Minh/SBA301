package com.carrental.dto.response;

import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import java.time.LocalDate;

/** Point-in-time aggregate; it is not a reservation or vehicle-assignment authorization. */
public record DriverEligibilityResponse(long customerId, Long driverId, CustomerStatus accountStatus,
        DriverStatus driverStatus, KycStatus kycStatus, boolean hasValidDriverLicense, boolean eligibleNow,
        DriverEligibilityReasonCode ineligibilityReasonCode, LocalDate evaluatedOn) {
}
