package com.carrental.dto.response;

import com.carrental.enums.DriverStatus;
import java.time.LocalDateTime;

public record DriverResponse(long id, long customerId, DriverStatus status,
        LocalDateTime createdAt, LocalDateTime updatedAt) {

}
