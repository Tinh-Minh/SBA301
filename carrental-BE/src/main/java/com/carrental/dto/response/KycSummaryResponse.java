package com.carrental.dto.response;

import com.carrental.entity.Customer;

import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import java.time.LocalDate;

/** Current, time-sensitive identity KYC summary without document or profile data. */
public record KycSummaryResponse(
        long customerId,
        CustomerStatus accountStatus,
        KycStatus kycStatus,
        LocalDate evaluatedOn) {

    public static KycSummaryResponse from(Customer customer, KycStatus status, LocalDate today) {
        return new KycSummaryResponse(customer.getId(), customer.getStatus(), status, today);
    }
}
