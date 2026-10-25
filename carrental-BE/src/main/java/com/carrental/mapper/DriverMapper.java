package com.carrental.mapper;

import com.carrental.dto.response.DriverResponse;
import com.carrental.dto.response.DriverEligibilityResponse;
import com.carrental.dto.response.DriverEligibilityReasonCode;
import com.carrental.enums.KycStatus;
import java.time.LocalDate;
import com.carrental.entity.Customer;
import com.carrental.entity.Driver;
import com.carrental.enums.DriverStatus;

public final class DriverMapper {
    private DriverMapper() { }

    public static Driver toNewEntity(Customer owner) {
        Driver driver = new Driver();
        driver.setCustomer(owner);
        driver.setStatus(DriverStatus.PENDING);
        return driver;
    }

    public static DriverResponse toResponse(Driver driver) {
        return new DriverResponse(driver.getId(), driver.getCustomer().getId(), driver.getStatus(),
                driver.getCreatedAt(), driver.getUpdatedAt());
    }
    public static DriverEligibilityResponse toEligibility(
            Customer customer, Driver driver, KycStatus kyc, boolean validLicense,
            DriverEligibilityReasonCode reason, LocalDate today) {
        return new DriverEligibilityResponse(customer.getId(),
                driver == null ? null : driver.getId(), customer.getStatus(), driver == null ? null : driver.getStatus(),
                kyc, validLicense, reason == null, reason, today);
    }
}
