package com.carrental.dto.response;

import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import java.time.LocalDate;

/** Current, time-sensitive identity KYC summary without document or profile data. */
public record KycSummaryResponse(
        long customerId,
        CustomerStatus accountStatus,
        KycStatus kycStatus,
        LocalDate evaluatedOn) {
}
