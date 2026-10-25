package com.carrental.dto.response;

import com.carrental.entity.Driver;
import com.carrental.enums.DriverStatus;
import java.time.LocalDateTime;

/** Safe stored driver-profile view; current eligibility is a separate response. */
public record DriverResponse(long id, long customerId, DriverStatus status,
        LocalDateTime createdAt, LocalDateTime updatedAt) {

    public static DriverResponse from(Driver driver) {
        return new DriverResponse(driver.getId(), driver.getCustomer().getId(), driver.getStatus(),
                driver.getCreatedAt(), driver.getUpdatedAt());
    }
}
