package com.carrental.service.impl;

import com.carrental.dto.response.KycSummaryResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.UserDocument;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.VerificationStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.KycService;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class KycServiceImpl implements KycService {
    private final CustomerRepository customers;
    private final UserDocumentRepository documents;
    private final Clock clock;

    public KycServiceImpl(CustomerRepository customers, UserDocumentRepository documents, Clock clock) {
        this.customers = customers;
        this.documents = documents;
        this.clock = clock;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public KycSummaryResponse getMe(CurrentAccount account) {
        if (account == null) throw new AppException(ErrorCode.INVALID_TOKEN);
        Customer customer = customer(account.customerId());
        if (customer.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (customer.getRole() != account.role()) throw new AppException(ErrorCode.ACCESS_DENIED);
        return summary(customer);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public KycSummaryResponse getCustomer(long customerId) {
        return summary(customer(customerId));
    }

    @Override
    public KycStatus currentStatus(long customerId, LocalDate evaluatedOn) {
        customer(customerId);
        return KycService.evaluateDocuments(documents.findByCustomerId(customerId), evaluatedOn);
    }

    private Customer customer(long id) {
        if (id <= 0) throw new AppException(ErrorCode.INVALID_REQUEST);
        return customers.findById(id).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private KycSummaryResponse summary(Customer customer) {
        LocalDate today = LocalDate.now(clock);
        List<UserDocument> docs = documents.findByCustomerId(customer.getId());
        KycStatus status = KycService.evaluateDocuments(docs, today);
        int used = (int) docs.stream()
                .filter(d -> UserDocumentServiceImpl.IDENTITY_DOC_TYPES.contains(d.getDocType()))
                .count();
        boolean hasPending = docs.stream()
                .anyMatch(d -> UserDocumentServiceImpl.IDENTITY_DOC_TYPES.contains(d.getDocType())
                        && d.getVerifyStatus() == VerificationStatus.PENDING);
        return KycSummaryResponse.from(
                customer,
                status,
                today,
                used,
                UserDocumentServiceImpl.MAX_OWNER_UPGRADE_ATTEMPTS,
                hasPending);
    }
}
