package com.carrental.service.impl;

import com.carrental.dto.response.KycSummaryResponse;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.KycEvidenceProjection;
import com.carrental.security.CurrentAccount;
import com.carrental.service.KycPolicy;
import com.carrental.service.KycService;
import java.time.Clock;
import java.time.LocalDate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KycServiceImpl implements KycService {

    private final CustomerRepository customers;
    private final KycPolicy policy;
    private final Clock clock;

    public KycServiceImpl(CustomerRepository customers, KycPolicy policy, Clock clock) {
        this.customers = customers;
        this.policy = policy;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public KycSummaryResponse getMe(CurrentAccount account) {
        if (account == null || account.customerId() <= 0 || account.role() == null) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        LocalDate today = LocalDate.now(clock);
        KycEvidenceProjection evidence = evidence(account.customerId(), today);
        CustomerStatus status = CustomerStatus.valueOf(evidence.getAccountStatus());
        Role role = Role.valueOf(evidence.getAccountRole());
        if (status != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (role != account.role()) throw new AppException(ErrorCode.ACCESS_DENIED);
        return toSummary(evidence, today, status);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public KycSummaryResponse getCustomer(long customerId) {
        if (customerId <= 0) throw new AppException(ErrorCode.INVALID_REQUEST);
        LocalDate today = LocalDate.now(clock);
        KycEvidenceProjection evidence = evidence(customerId, today);
        return toSummary(evidence, today, CustomerStatus.valueOf(evidence.getAccountStatus()));
    }

    @Override
    public KycStatus currentStatus(long customerId, LocalDate evaluatedOn) {
        return evaluate(evidence(customerId, evaluatedOn));
    }

    private KycSummaryResponse toSummary(KycEvidenceProjection evidence, LocalDate today, CustomerStatus status) {
        return new KycSummaryResponse(evidence.getCustomerId(), status, evaluate(evidence), today);
    }

    private KycEvidenceProjection evidence(long customerId, LocalDate today) {
        return customers.findKycEvidence(customerId, today)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private KycStatus evaluate(KycEvidenceProjection evidence) {
        return policy.evaluate(Boolean.TRUE.equals(evidence.getHasValidApprovedIdentity()),
                Boolean.TRUE.equals(evidence.getHasPendingIdentity()),
                Boolean.TRUE.equals(evidence.getHasRejectedIdentity()));
    }
}
