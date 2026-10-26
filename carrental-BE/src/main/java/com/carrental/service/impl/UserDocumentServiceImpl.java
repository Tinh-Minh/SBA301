package com.carrental.service.impl;

import com.carrental.dto.request.document.UserDocumentListQuery;
import com.carrental.dto.request.document.UserDocumentSubmissionCommand;
import com.carrental.dto.request.document.ReviewUserDocumentRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.UserDocumentDetailResponse;
import com.carrental.dto.response.UserDocumentSummaryResponse;
import com.carrental.dto.response.UserDocumentReviewResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.UserDocument;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.VerificationStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.enums.DocumentType;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.mapper.UserDocumentMapper;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.UserDocumentService;
import com.carrental.service.ActionLogService;
import com.carrental.service.KycService;
import com.carrental.storage.PrivateDocumentStorage.PrivateDocumentFile;
import com.carrental.storage.PrivateDocumentStorage.PrivateDocumentReceipt;
import com.carrental.storage.PrivateDocumentStorage;
import com.carrental.web.RequestTraceFilter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDocumentServiceImpl implements UserDocumentService {

    private static final Logger log = LoggerFactory.getLogger(UserDocumentServiceImpl.class);
    private final CustomerRepository customers;
    private final UserDocumentRepository documents;
    private final PrivateDocumentStorage storage;
    private final KycService kycService;
    private final ActionLogService actionLogService;
    private final Clock clock;

    public UserDocumentServiceImpl(CustomerRepository customers, UserDocumentRepository documents,
            PrivateDocumentStorage storage, KycService kycService, ActionLogService actionLogService, Clock clock) {
        this.customers = customers;
        this.documents = documents;
        this.storage = storage;
        this.kycService = kycService;
        this.actionLogService = actionLogService;
        this.clock = clock;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    public UserDocumentDetailResponse submit(CurrentAccount account, UserDocumentSubmissionCommand command) {
        requireActivePrincipal(account);
        if (command == null || command.metadata() == null) throw new AppException(ErrorCode.INVALID_REQUEST);
        if (!customers.existsByIdAndStatusAndRole(account.customerId(), CustomerStatus.ACTIVE, account.role())) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        requireStorage();
        List<PrivateDocumentReceipt> receipts = new ArrayList<>(2);
        try {
            receipts.add(storage.store(command.frontImage()));
            if (command.backImage() != null) receipts.add(storage.store(command.backImage()));
            // A DB commit can fail after this method returns. Spring reports rollback here as well.
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCompletion(int status) {
                    if (status == STATUS_ROLLED_BACK) cleanup(receipts);
                    else if (status == STATUS_UNKNOWN) {
                        log.warn("Document transaction outcome unknown traceId={}; keeping files for reconciliation",
                                RequestTraceFilter.currentTraceId());
                    }
                }
            });
            // Recheck after file IO and serialize the new evidence with concurrent KYC reviews.
            Customer owner = customers.findWithLockById(account.customerId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
            if (owner.getStatus() != CustomerStatus.ACTIVE || owner.getRole() != account.role()) {
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
            UserDocument document = UserDocumentMapper.toNewEntity(owner, command.metadata(),
                    receipts.get(0).locator(), receipts.size() == 2 ? receipts.get(1).locator() : null);
            return UserDocumentMapper.toDetail(documents.saveAndFlush(document));
        } catch (RuntimeException failure) {
            cleanup(receipts);
            throw failure;
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public PageResponse<UserDocumentSummaryResponse> list(CurrentAccount account, UserDocumentListQuery query) {
        requireActivePrincipal(account);
        Objects.requireNonNull(query);
        if (account.role() != Role.ADMIN && (!query.scope().equals("mine") || query.customerId() != null)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        if (account.role() == Role.ADMIN && query.customerId() != null && !query.scope().equals("all")) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        Specification<UserDocument> specification = documentSpecification(account, query);
        Page<UserDocument> page = documents.findAll(specification, query.pageable());
        return new PageResponse<>(page.getContent().stream().map(UserDocumentMapper::toSummary).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public UserDocumentDetailResponse get(CurrentAccount account, long documentId) {
        requireActivePrincipal(account);
        requirePositiveId(documentId);
        UserDocument document = account.role() == Role.ADMIN
                ? documents.findById(documentId).orElseThrow(() -> notFound())
                : documents.findByIdAndCustomerId(documentId, account.customerId()).orElseThrow(() -> notFound());
        return UserDocumentMapper.toDetail(document);
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public PrivateDocumentFile download(CurrentAccount account, long documentId, String side) {
        requireActivePrincipal(account);
        requirePositiveId(documentId);
        if (!"front".equals(side) && !"back".equals(side)) throw new AppException(ErrorCode.INVALID_REQUEST);
        requireStorage();
        UserDocument document = account.role() == Role.ADMIN
                ? documents.findById(documentId).orElseThrow(this::notFound)
                : documents.findByIdAndCustomerId(documentId, account.customerId()).orElseThrow(this::notFound);
        String locator = "front".equals(side) ? document.getFrontImageUrl() : document.getBackImageUrl();
        if (locator == null || locator.isBlank()) throw notFound();
        return storage.open(locator);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserDocumentReviewResponse review(CurrentAccount actor, long documentId, ReviewUserDocumentRequest request) {
        ReviewCommand command = reviewCommand(request);
        requirePositiveId(documentId);
        if (actor == null || actor.customerId() <= 0 || actor.role() != Role.ADMIN) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        long ownerId = documents.findCustomerIdById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (actor.customerId() == ownerId) throw new AppException(ErrorCode.DOCUMENT_SELF_REVIEW_FORBIDDEN);
        // Reviews of different documents of one customer share this lock so the KYC update is consistent.
        Customer owner = customers.findWithLockById(ownerId).orElseThrow(this::notFound);
        UserDocument document = documents.findWithLockById(documentId).orElseThrow(this::notFound);
        Customer actorRow = customers.findById(actor.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (actorRow.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (actorRow.getRole() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);
        if (actorRow.getId().equals(owner.getId())) throw new AppException(ErrorCode.DOCUMENT_SELF_REVIEW_FORBIDDEN);
        switch (document.getVerifyStatus()) {
            case PENDING -> { }
            case APPROVED, REJECTED -> throw new AppException(ErrorCode.DOCUMENT_ALREADY_REVIEWED);
        }

        LocalDate evaluatedOn = LocalDate.now(clock);
        KycStatus oldKyc = owner.getKycStatus();
        VerificationStatus oldStatus = document.getVerifyStatus();
        if (command.status() == VerificationStatus.APPROVED) {
            validateApprovalPrerequisites(document, evaluatedOn);
            validateStoredEvidence(document);
            if (documents.existsByDocTypeAndDocNumberAndVerifyStatus(
                    document.getDocType(), document.getDocNumber(), VerificationStatus.APPROVED)) {
                throw new AppException(ErrorCode.APPROVED_DOCUMENT_CONFLICT);
            }
            document.setVerifyStatus(VerificationStatus.APPROVED);
            document.setRejectReason(null);
        } else {
            document.setVerifyStatus(VerificationStatus.REJECTED);
            document.setRejectReason(command.reason());
        }
        document.setVerifiedBy(actorRow);
        document.setVerifiedAt(LocalDateTime.now(clock));
        documents.flush();

        KycStatus currentKyc = kycService.currentStatus(owner.getId(), evaluatedOn);
        if (owner.getKycStatus() != currentKyc) {
            owner.setKycStatus(currentKyc);
            customers.flush();
        }
        UserDocumentReviewResponse response = UserDocumentMapper.toReviewResponse(document, currentKyc, evaluatedOn);
        actionLogService.documentReviewRecorded(actorRow.getId(), owner.getId(), document.getId(), document.getDocType(),
                oldStatus, command.status(), oldKyc, currentKyc, command.reason() != null);
        return response;
    }

    private ReviewCommand reviewCommand(ReviewUserDocumentRequest request) {
        if (request == null || !request.verifyStatusWasProvided() || request.getVerifyStatus() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        VerificationStatus status = request.getVerifyStatus();
        if (status == VerificationStatus.PENDING) throw new AppException(ErrorCode.INVALID_REQUEST);
        String reason = request.getRejectReason();
        if (status == VerificationStatus.APPROVED) {
            if (reason != null) throw new AppException(ErrorCode.INVALID_REQUEST);
            return new ReviewCommand(status, null);
        }
        if (!request.rejectReasonWasProvided() || reason == null || reason.strip().isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        reason = reason.strip();
        if (reason.length() > 500) throw new AppException(ErrorCode.INVALID_REQUEST);
        return new ReviewCommand(status, reason);
    }

    private void validateApprovalPrerequisites(UserDocument document, LocalDate today) {
        boolean complete = notBlank(document.getFullNameOnDoc())
                && document.getDateOfBirthOnDoc() != null && !document.getDateOfBirthOnDoc().isAfter(today)
                && notBlank(document.getIssuePlace())
                && document.getIssueDate() != null && !document.getIssueDate().isAfter(today)
                && (document.getExpiresAt() == null || !document.getExpiresAt().isBefore(today))
                && (document.getIssueDate() == null || document.getExpiresAt() == null
                        || !document.getIssueDate().isAfter(document.getExpiresAt()));
        if (document.getDocType() == DocumentType.DRIVER_LICENSE) {
            complete = complete && notBlank(document.getLicenseClass()) && document.getExpiresAt() != null;
        }
        if (document.getDocType() == DocumentType.CITIZEN_ID
                || document.getDocType() == DocumentType.DRIVER_LICENSE) {
            complete = complete && notBlank(document.getBackImageUrl());
        }
        if (!complete) throw new AppException(ErrorCode.DOCUMENT_NOT_APPROVABLE);
    }

    private void validateStoredEvidence(UserDocument document) {
        requireStorage();
        validateStoredImage(document.getFrontImageUrl());
        if (document.getDocType() == DocumentType.CITIZEN_ID || document.getDocType() == DocumentType.DRIVER_LICENSE) {
            validateStoredImage(document.getBackImageUrl());
        }
    }

    private void validateStoredImage(String locator) {
        if (!notBlank(locator)) throw new AppException(ErrorCode.DOCUMENT_NOT_APPROVABLE);
        try { storage.open(locator); }
        catch (AppException failure) {
            if (failure.errorCode() == ErrorCode.DEPENDENCY_UNAVAILABLE) throw failure;
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Không thể xác minh tệp giấy tờ", failure);
        }
    }

    /** Review failure diagnostics deliberately exclude throwable/message, request fields and storage locators. */

    private boolean notBlank(String value) { return value != null && !value.strip().isEmpty(); }

    private record ReviewCommand(VerificationStatus status, String reason) { }

    private Specification<UserDocument> documentSpecification(CurrentAccount account, UserDocumentListQuery query) {
        return (root, criteria, builder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (query.scope().equals("mine")) predicates.add(builder.equal(root.get("customer").get("id"), account.customerId()));
            if (query.scope().equals("all") && account.role() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);
            if (query.customerId() != null) predicates.add(builder.equal(root.get("customer").get("id"), query.customerId()));
            if (query.docType() != null) predicates.add(builder.equal(root.get("docType"), query.docType()));
            if (query.verifyStatus() != null) predicates.add(builder.equal(root.get("verifyStatus"), query.verifyStatus()));
            return builder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private void cleanup(List<PrivateDocumentReceipt> receipts) {
        for (PrivateDocumentReceipt receipt : receipts) {
            try { storage.delete(receipt); }
            catch (RuntimeException failure) {
                log.error("Document cleanup failed traceId={} receiptId={} exceptionType={}",
                        RequestTraceFilter.currentTraceId(), receipt.receiptId(), failure.getClass().getSimpleName());
            }
        }
    }

    private void requireStorage() {
        if (!storage.isEnabled()) throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE, "Dịch vụ lưu tệp chưa được bật");
    }

    private void requireActivePrincipal(CurrentAccount account) {
        if (account == null || account.customerId() <= 0 || account.role() == null) throw new AppException(ErrorCode.INVALID_TOKEN);
    }

    private void requirePositiveId(long id) {
        if (id <= 0) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    private AppException notFound() { return new AppException(ErrorCode.RESOURCE_NOT_FOUND); }

}
