package com.carrental.dto.response;

import com.carrental.entity.Customer;

import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.service.KycService;
import com.carrental.service.KycService.RejectionBanStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Current, time-sensitive identity KYC summary without document or profile data. */
public record KycSummaryResponse(
        long customerId,
        CustomerStatus accountStatus,
        KycStatus kycStatus,
        LocalDate evaluatedOn,
        int rejectedAttempts,
        int maxAttempts,
        boolean verificationBlocked,
        LocalDateTime verificationBlockedUntil) {

    public static KycSummaryResponse from(Customer customer, KycStatus status, LocalDate today) {
        return from(customer, status, today,
                new RejectionBanStatus(0, KycService.MAX_REJECTION_ATTEMPTS, false, null));
    }

    public static KycSummaryResponse from(
            Customer customer, KycStatus status, LocalDate today, RejectionBanStatus ban) {
        return new KycSummaryResponse(
                customer.getId(),
                customer.getStatus(),
                status,
                today,
                ban.rejectedAttempts(),
                ban.maxAttempts(),
                ban.blocked(),
                ban.blockedUntil());
    }
}
