package com.carrental.service;

import com.carrental.dto.response.DriverEligibilityResponse;
import java.time.LocalDate;

/** Internal F1→F2 contract: calculate a current point-in-time result for an explicit customerId. */
public interface DriverEligibilityService {
    DriverEligibilityResponse evaluateForCustomer(long customerId);

    /** Reuses the same aggregate and policy inside a status transaction with its single captured date. */
    DriverEligibilityResponse evaluateForCustomer(long customerId, LocalDate evaluatedOn);
}
