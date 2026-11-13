package com.carrental.dto.response;

import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import java.time.LocalDate;

/** Current, time-sensitive identity KYC summary and owner upgrade quota. */
public record KycSummaryResponse(
        long customerId,
        CustomerStatus accountStatus,
        KycStatus kycStatus,
        LocalDate evaluatedOn,
        int upgradeAttemptsUsed,
        int maxUpgradeAttempts,
        int upgradeAttemptsRemaining,
        boolean hasPendingUpgradeRequest) {

    public static KycSummaryResponse from(
            Customer customer,
            KycStatus status,
            LocalDate today,
            int upgradeAttemptsUsed,
            int maxUpgradeAttempts,
            boolean hasPendingUpgradeRequest) {
        int remaining = Math.max(0, maxUpgradeAttempts - upgradeAttemptsUsed);
        return new KycSummaryResponse(
                customer.getId(),
                customer.getStatus(),
                status,
                today,
                upgradeAttemptsUsed,
                maxUpgradeAttempts,
                remaining,
                hasPendingUpgradeRequest);
    }
}
