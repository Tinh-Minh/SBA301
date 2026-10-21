package com.carrental.mapper;

import com.carrental.dto.response.DriverResponse;
import com.carrental.entity.Driver;

public final class DriverMapper {
    private DriverMapper() { }

    public static DriverResponse toResponse(Driver driver) {
        return new DriverResponse(driver.getId(), driver.getCustomer().getId(), driver.getStatus(),
                driver.getCreatedAt(), driver.getUpdatedAt());
    }
}
