package com.carrental.service.impl;

import com.carrental.dto.response.DriverEligibilityReasonCode;
import com.carrental.dto.response.DriverEligibilityResponse;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.DriverEligibilityProjection;
import com.carrental.service.DriverEligibilityPolicy;
import com.carrental.service.DriverEligibilityService;
import com.carrental.service.KycPolicy;
import java.time.Clock;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DriverEligibilityServiceImpl implements DriverEligibilityService {

    /**
     * Bound as the explicit PostgreSQL btrim character set. Deriving it from the JDK keeps
     * the aggregate's blank-class check aligned with String.strip()/Character.isWhitespace,
     * without depending on database locale or an incomplete hand-maintained SQL \s class.
     */
    private static final String JAVA_STRIP_WHITESPACE_CHARACTERS = javaStripWhitespaceCharacters();

    private final CustomerRepository customers;
    private final KycPolicy kycPolicy;
    private final DriverEligibilityPolicy eligibilityPolicy;
    private final Clock clock;

    public DriverEligibilityServiceImpl(CustomerRepository customers, KycPolicy kycPolicy,
            DriverEligibilityPolicy eligibilityPolicy, Clock clock) {
        this.customers = customers;
        this.kycPolicy = kycPolicy;
        this.eligibilityPolicy = eligibilityPolicy;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public DriverEligibilityResponse evaluateForCustomer(long customerId) {
        return evaluateForCustomer(customerId, LocalDate.now(clock));
    }

    @Override
    @Transactional(readOnly = true)
    public DriverEligibilityResponse evaluateForCustomer(long customerId, LocalDate evaluatedOn) {
        if (customerId <= 0 || evaluatedOn == null) throw new AppException(ErrorCode.INVALID_REQUEST);
        DriverEligibilityProjection row = customers.findDriverEligibility(customerId, evaluatedOn,
                        JAVA_STRIP_WHITESPACE_CHARACTERS)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        CustomerStatus accountStatus = CustomerStatus.valueOf(row.getAccountStatus());
        KycStatus currentKyc = kycPolicy.evaluate(Boolean.TRUE.equals(row.getHasValidApprovedIdentity()),
                Boolean.TRUE.equals(row.getHasPendingIdentity()), Boolean.TRUE.equals(row.getHasRejectedIdentity()));
        DriverStatus driverStatus = row.getDriverStatus() == null ? null : DriverStatus.valueOf(row.getDriverStatus());
        boolean validLicense = Boolean.TRUE.equals(row.getHasValidDriverLicense());
        DriverEligibilityReasonCode reason = eligibilityPolicy.currentReason(
                accountStatus, driverStatus, currentKyc, validLicense);
        return new DriverEligibilityResponse(row.getCustomerId(), row.getDriverId(), accountStatus,
                driverStatus, currentKyc, validLicense, reason == null, reason, evaluatedOn);
    }

    private static String javaStripWhitespaceCharacters() {
        StringBuilder characters = new StringBuilder();
        for (int codePoint = Character.MIN_CODE_POINT; codePoint <= Character.MAX_CODE_POINT; codePoint++) {
            if (Character.isWhitespace(codePoint)) characters.appendCodePoint(codePoint);
        }
        return characters.toString();
    }
}
