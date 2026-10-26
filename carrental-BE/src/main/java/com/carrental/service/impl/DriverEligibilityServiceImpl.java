package com.carrental.service.impl;

import com.carrental.dto.response.DriverEligibilityResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.Driver;
import com.carrental.entity.UserDocument;
import com.carrental.enums.DocumentType;
import com.carrental.enums.DriverEligibilityReasonCode;
import com.carrental.enums.KycStatus;
import com.carrental.enums.VerificationStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.DriverRepository;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.service.DriverEligibilityService;
import com.carrental.service.KycService;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DriverEligibilityServiceImpl implements DriverEligibilityService {
    private final CustomerRepository customers;
    private final DriverRepository drivers;
    private final UserDocumentRepository documents;
    private final Clock clock;

    public DriverEligibilityServiceImpl(CustomerRepository customers, DriverRepository drivers,
            UserDocumentRepository documents, Clock clock) {
        this.customers = customers;
        this.drivers = drivers;
        this.documents = documents;
        this.clock = clock;
    }

    @Override
    public DriverEligibilityResponse evaluateForCustomer(long customerId) {
        return evaluateForCustomer(customerId, LocalDate.now(clock));
    }

    @Override
    public DriverEligibilityResponse evaluateForCustomer(long customerId, LocalDate evaluatedOn) {
        if (customerId <= 0 || evaluatedOn == null) throw new AppException(ErrorCode.INVALID_REQUEST);
        Customer customer = customers.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        Driver driver = drivers.findByCustomerId(customerId).orElse(null);
        List<UserDocument> evidence = documents.findByCustomerId(customerId);
        KycStatus kyc = KycService.evaluateDocuments(evidence, evaluatedOn);
        boolean validLicense = evidence.stream().anyMatch(d -> d.getDocType() == DocumentType.DRIVER_LICENSE
                && d.getVerifyStatus() == VerificationStatus.APPROVED && d.getExpiresAt() != null
                && !d.getExpiresAt().isBefore(evaluatedOn) && d.getLicenseClass() != null && !d.getLicenseClass().isBlank());
        DriverEligibilityReasonCode reason = DriverEligibilityService.currentReason(customer.getStatus(),
                driver == null ? null : driver.getStatus(), kyc, validLicense);
        return DriverEligibilityResponse.from(customer, driver, kyc, validLicense, reason, evaluatedOn);
    }
}
