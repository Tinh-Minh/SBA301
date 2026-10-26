package com.carrental.dto.response;

import com.carrental.entity.Customer;
import com.carrental.entity.Driver;

import com.carrental.enums.DriverEligibilityReasonCode;

import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import java.time.LocalDate;

/** Point-in-time aggregate; it is not a reservation or vehicle-assignment authorization. */
public record DriverEligibilityResponse(long customerId, Long driverId, CustomerStatus accountStatus,
        DriverStatus driverStatus, KycStatus kycStatus, boolean hasValidDriverLicense, boolean eligibleNow,
        DriverEligibilityReasonCode ineligibilityReasonCode, LocalDate evaluatedOn) {

    public static DriverEligibilityResponse from(Customer customer, Driver driver, KycStatus kyc,
            boolean validLicense, DriverEligibilityReasonCode reason, LocalDate today) {
        return new DriverEligibilityResponse(customer.getId(),
                driver == null ? null : driver.getId(), customer.getStatus(), driver == null ? null : driver.getStatus(),
                kyc, validLicense, reason == null, reason, today);
    }
}
