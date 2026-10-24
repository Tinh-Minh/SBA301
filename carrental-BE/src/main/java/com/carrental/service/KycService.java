package com.carrental.service;

import com.carrental.dto.response.KycSummaryResponse;
import com.carrental.enums.KycStatus;
import com.carrental.security.CurrentAccount;
import java.time.LocalDate;

public interface KycService {
    KycSummaryResponse getMe(CurrentAccount account);
    KycSummaryResponse getCustomer(long customerId);

    /** Called inside the review transaction after document flush. */
    KycStatus currentStatus(long customerId, LocalDate evaluatedOn);
}
