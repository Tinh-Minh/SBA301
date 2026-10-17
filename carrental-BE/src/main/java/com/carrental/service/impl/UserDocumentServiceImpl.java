package com.carrental.service.impl;

import com.carrental.dto.request.document.UserDocumentListQuery;
import com.carrental.dto.request.document.UserDocumentSubmissionCommand;
import com.carrental.dto.request.document.UserDocumentSubmissionRequest;
import com.carrental.dto.request.document.ReviewUserDocumentRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.UserDocumentDetailResponse;
import com.carrental.dto.response.UserDocumentSummaryResponse;
import com.carrental.dto.response.UserDocumentReviewResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.UserDocument;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DocumentVerifyStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.enums.UserDocumentType;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.mapper.UserDocumentMapper;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.CustomerStatusLock;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.UserDocumentService;
import com.carrental.service.DocumentReviewLogger;
import com.carrental.service.KycService;
import com.carrental.storage.CanonicalDocumentImage;
import com.carrental.storage.DocumentImageInspector;
import com.carrental.storage.PrivateDocumentFile;
import com.carrental.storage.PrivateDocumentReceipt;
import com.carrental.storage.PrivateDocumentStorage;
import com.carrental.web.RequestTraceFilter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;
import java.sql.SQLException;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class UserDocumentServiceImpl implements UserDocumentService {

    private static final Logger log = LoggerFactory.getLogger(UserDocumentServiceImpl.class);
    private final CustomerRepository customers;
    private final UserDocumentRepository documents;
    private final PrivateDocumentStorage storage;
    private final DocumentImageInspector inspector;
    private final TransactionTemplate transactions;
    private final CustomerStatusLock statusLock;
    private final KycService kycService;
    private final DocumentReviewLogger reviewLogger;
    private final Clock clock;

    public UserDocumentServiceImpl(CustomerRepository customers, UserDocumentRepository documents,
            PrivateDocumentStorage storage, DocumentImageInspector inspector,
            PlatformTransactionManager transactionManager, CustomerStatusLock statusLock,
            KycService kycService, DocumentReviewLogger reviewLogger, Clock clock) {
        this.customers = customers;
        this.documents = documents;
        this.storage = storage;
        this.inspector = inspector;
        this.transactions = new TransactionTemplate(transactionManager);
        this.transactions.setTimeout(30);
        this.transactions.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.statusLock = statusLock;
        this.kycService = kycService;
        this.reviewLogger = reviewLogger;
        this.clock = clock;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public UserDocumentDetailResponse submit(CurrentAccount account, UserDocumentSubmissionCommand command) {
        if (command == null || command.metadata() == null) throw new AppException(ErrorCode.INVALID_REQUEST);
        requireActivePrincipal(account);
        requireStorage();

        CanonicalDocumentImage front = inspector.inspect(command.frontImage(), "frontImage");
        CanonicalDocumentImage back = command.backImage() == null ? null : inspector.inspect(command.backImage(), "backImage");
        List<PrivateDocumentReceipt> receipts = new ArrayList<>(2);
        try {
            receipts.add(storage.store(front));
            if (back != null) receipts.add(storage.store(back));
        } catch (RuntimeException primary) {
            cleanup(receipts, primary, account.customerId());
            throw primary;
        }

        TransactionOutcome outcome = new TransactionOutcome();
        UserDocumentDetailResponse result;
        try {
            PrivateDocumentReceipt frontReceipt = receipts.get(0);
            PrivateDocumentReceipt backReceipt = receipts.size() > 1 ? receipts.get(1) : null;
            result = transactions.execute(status -> {
                outcome.register();
                Customer owner = customers.findByIdForUpdate(account.customerId())
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
                if (owner.getStatus() != CustomerStatus.ACTIVE || owner.getRole() != account.role()
                        || (owner.getRole() != Role.CUSTOMER && owner.getRole() != Role.ADMIN)) {
                    throw new AppException(ErrorCode.INVALID_TOKEN);
                }
                UserDocument document = new UserDocument();
                document.setCustomer(owner);
                applyMetadata(document, command.metadata());
                document.setFrontImageUrl(frontReceipt.locator());
                document.setBackImageUrl(backReceipt == null ? null : backReceipt.locator());
                document.setVerifyStatus(DocumentVerifyStatus.PENDING);
                document.setRejectReason(null);
                document.setVerifiedBy(null);
                document.setVerifiedAt(null);
                UserDocument saved = documents.saveAndFlush(document);
                return UserDocumentMapper.toDetail(saved);
            });
        } catch (RuntimeException primary) {
            handleFailedTransaction(outcome.failureState(), receipts, primary, account.customerId());
            throw primary;
        }

        TransactionOutcome.State completion = outcome.successfulReturnState();
        if (completion == TransactionOutcome.State.ROLLED_BACK
                || completion == TransactionOutcome.State.NO_DATABASE_WORK) {
            AppException failure = new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE);
            cleanup(receipts, failure, account.customerId());
            throw failure;
        }
        if (completion != TransactionOutcome.State.COMMITTED) {
            logUnknownOutcome(receipts, account.customerId(), new IllegalStateException("Transaction completion was not confirmed"));
            throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE);
        }
        if (result == null) {
            // Completion is known committed; keep files because metadata may refer to them.
            log.error("User document committed without a response action=user-document-submit traceId={} actorId={} receiptIds={} exceptionType=IllegalStateException",
                    RequestTraceFilter.currentTraceId(), account.customerId(), receiptIds(receipts));
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
        log.info("User document submitted action=user-document-submit traceId={} actorId={} documentId={} docType={} fileCount={}",
                RequestTraceFilter.currentTraceId(), account.customerId(), result.id(), result.docType(), receipts.size());
        return result;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
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
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public UserDocumentDetailResponse get(CurrentAccount account, long documentId) {
        requireActivePrincipal(account);
        requirePositiveId(documentId);
        UserDocument document = account.role() == Role.ADMIN
                ? documents.findById(documentId).orElseThrow(() -> notFound())
                : documents.findByIdAndCustomer_Id(documentId, account.customerId()).orElseThrow(() -> notFound());
        return UserDocumentMapper.toDetail(document);
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public PrivateDocumentFile download(CurrentAccount account, long documentId, String side) {
        requireActivePrincipal(account);
        requirePositiveId(documentId);
        if (!"front".equals(side) && !"back".equals(side)) throw new AppException(ErrorCode.INVALID_REQUEST);
        requireStorage();
        String locator = transactions.execute(status -> {
            UserDocument document = account.role() == Role.ADMIN
                    ? documents.findById(documentId).orElseThrow(() -> notFound())
                    : documents.findByIdAndCustomer_Id(documentId, account.customerId()).orElseThrow(() -> notFound());
            String selected = "front".equals(side) ? document.getFrontImageUrl() : document.getBackImageUrl();
            if (selected == null || selected.isBlank()) throw notFound();
            return selected;
        });
        if (locator == null) throw notFound();
        try {
            PrivateDocumentFile stored = storage.open(locator);
            inspector.validateStored(stored.bytes(), stored.format());
            return stored;
        } catch (AppException exception) {
            if (exception.errorCode() == ErrorCode.INTERNAL_ERROR || exception.errorCode() == ErrorCode.DEPENDENCY_UNAVAILABLE
                    || exception.errorCode() == ErrorCode.VALIDATION_ERROR || exception.errorCode() == ErrorCode.UNSUPPORTED_MEDIA_TYPE
                    || exception.errorCode() == ErrorCode.PAYLOAD_TOO_LARGE) {
                log.error("User document storage read failed action=user-document-download traceId={} actorId={} documentId={} side={} errorCode={}",
                        RequestTraceFilter.currentTraceId(), account.customerId(), documentId, side, exception.errorCode().name());
                if (exception.errorCode() != ErrorCode.RESOURCE_NOT_FOUND && exception.errorCode() != ErrorCode.INTERNAL_ERROR
                        && exception.errorCode() != ErrorCode.DEPENDENCY_UNAVAILABLE) {
                    throw new AppException(ErrorCode.INTERNAL_ERROR, "Không thể đọc tệp riêng tư", exception);
                }
            }
            throw exception;
        } catch (IllegalArgumentException exception) {
            log.error("User document storage validation failed action=user-document-download traceId={} actorId={} documentId={} side={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), account.customerId(), documentId, side, exception.getClass().getSimpleName());
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Không thể đọc tệp riêng tư", exception);
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    public UserDocumentReviewResponse review(CurrentAccount actor, long documentId, ReviewUserDocumentRequest request) {
        ReviewCommand command = reviewCommand(request);
        requirePositiveId(documentId);
        if (actor == null || actor.customerId() <= 0 || actor.role() != Role.ADMIN) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        // Shared P04 global lock must precede every actor/owner/document row lock.
        statusLock.acquire();
        Customer actorRow = customers.findByIdForUpdate(actor.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (actorRow.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (actorRow.getRole() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);

        long discoveredOwnerId = documents.findOwnerIdByDocumentId(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        Customer owner = customers.findByIdForUpdate(discoveredOwnerId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        UserDocument document = documents.findByIdForUpdate(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (document.getCustomer().getId() == null || document.getCustomer().getId() != discoveredOwnerId) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        if (actorRow.getId().equals(owner.getId())) throw new AppException(ErrorCode.DOCUMENT_SELF_REVIEW_FORBIDDEN);
        switch (document.getVerifyStatus()) {
            case PENDING -> { }
            case APPROVED, REJECTED -> throw new AppException(ErrorCode.DOCUMENT_ALREADY_REVIEWED);
        }

        LocalDate evaluatedOn = LocalDate.now(clock);
        KycStatus oldKyc = owner.getKycStatus();
        DocumentVerifyStatus oldStatus = document.getVerifyStatus();
        if (command.status() == DocumentVerifyStatus.APPROVED) {
            validateApprovalPrerequisites(document, evaluatedOn);
            validateStoredEvidence(document, actorRow.getId(), owner.getId());
            if (documents.findFirstByDocTypeAndDocNumberAndVerifyStatus(
                    document.getDocType(), document.getDocNumber(), DocumentVerifyStatus.APPROVED).isPresent()) {
                throw new AppException(ErrorCode.APPROVED_DOCUMENT_CONFLICT);
            }
            document.setVerifyStatus(DocumentVerifyStatus.APPROVED);
            document.setRejectReason(null);
        } else {
            document.setVerifyStatus(DocumentVerifyStatus.REJECTED);
            document.setRejectReason(command.reason());
        }
        document.setVerifiedBy(actorRow);
        document.setVerifiedAt(LocalDateTime.now(clock));
        try {
            documents.flush();
        } catch (DataIntegrityViolationException exception) {
            if (isApprovedDocumentUniqueViolation(exception)) {
                logReviewFailure("approved-document-unique-conflict", ErrorCode.APPROVED_DOCUMENT_CONFLICT,
                        actorRow.getId(), owner.getId(), document.getId(), "uq_user_doc_approved",
                        exception.getClass().getSimpleName(), false);
                throw new AppException(ErrorCode.APPROVED_DOCUMENT_CONFLICT, exception);
            }
            throw exception;
        }

        KycStatus currentKyc = kycService.currentStatus(owner.getId(), evaluatedOn);
        if (owner.getKycStatus() != currentKyc) {
            owner.setKycStatus(currentKyc);
            customers.flush();
        }
        UserDocumentReviewResponse response = new UserDocumentReviewResponse(
                UserDocumentMapper.toDetail(document), currentKyc, evaluatedOn);
        reviewLogger.record(actorRow.getId(), owner.getId(), document.getId(), document.getDocType(),
                oldStatus, command.status(), oldKyc, currentKyc, command.reason() != null);
        return response;
    }

    private ReviewCommand reviewCommand(ReviewUserDocumentRequest request) {
        if (request == null || !request.verifyStatusWasProvided() || request.getVerifyStatus() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        DocumentVerifyStatus status = request.getVerifyStatus();
        if (status == DocumentVerifyStatus.PENDING) throw new AppException(ErrorCode.INVALID_REQUEST);
        String reason = request.getRejectReason();
        if (status == DocumentVerifyStatus.APPROVED) {
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
        if (document.getDocType() == UserDocumentType.DRIVER_LICENSE) {
            complete = complete && notBlank(document.getLicenseClass()) && document.getExpiresAt() != null;
        }
        if (document.getDocType() == UserDocumentType.CITIZEN_ID
                || document.getDocType() == UserDocumentType.DRIVER_LICENSE) {
            complete = complete && notBlank(document.getBackImageUrl());
        }
        if (!complete) throw new AppException(ErrorCode.DOCUMENT_NOT_APPROVABLE);
    }

    private void validateStoredEvidence(UserDocument document, long actorId, long ownerId) {
        try {
            requireStorage();
        } catch (AppException exception) {
            if (exception.errorCode() == ErrorCode.DEPENDENCY_UNAVAILABLE) {
                logReviewFailure("storage-dependency", ErrorCode.DEPENDENCY_UNAVAILABLE,
                        actorId, ownerId, document.getId(), null, exception.getClass().getSimpleName(), true);
            }
            throw exception;
        }
        validateStoredImage(document.getFrontImageUrl(), actorId, ownerId, document.getId());
        if (document.getDocType() == UserDocumentType.CITIZEN_ID
                || document.getDocType() == UserDocumentType.DRIVER_LICENSE) {
            validateStoredImage(document.getBackImageUrl(), actorId, ownerId, document.getId());
        }
    }

    private void validateStoredImage(String locator, long actorId, long ownerId, long documentId) {
        if (!notBlank(locator)) throw new AppException(ErrorCode.DOCUMENT_NOT_APPROVABLE);
        try {
            PrivateDocumentFile file = storage.open(locator);
            inspector.validateStored(file.bytes(), file.format());
        } catch (AppException exception) {
            if (exception.errorCode() == ErrorCode.DEPENDENCY_UNAVAILABLE) {
                logReviewFailure("storage-dependency", ErrorCode.DEPENDENCY_UNAVAILABLE,
                        actorId, ownerId, documentId, null, exception.getClass().getSimpleName(), true);
                throw exception;
            }
            logReviewFailure("stored-evidence-invalid", ErrorCode.INTERNAL_ERROR,
                    actorId, ownerId, documentId, null, exception.getClass().getSimpleName(), false);
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Không thể xác minh tệp giấy tờ", exception);
        } catch (RuntimeException exception) {
            logReviewFailure("stored-evidence-validation-failed", ErrorCode.INTERNAL_ERROR,
                    actorId, ownerId, documentId, null, exception.getClass().getSimpleName(), false);
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Không thể xác minh tệp giấy tờ", exception);
        }
    }

    /** Review failure diagnostics deliberately exclude throwable/message, request fields and storage locators. */
    private void logReviewFailure(String category, ErrorCode errorCode, long actorId, Long ownerId,
            long documentId, String allowlistedConstraint, String exceptionType, boolean dependencyFailure) {
        if (dependencyFailure) {
            log.warn("Document review failed action=document-review-failure traceId={} category={} errorCode={} actorId={} ownerId={} documentId={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), category, errorCode.name(), actorId, ownerId,
                    documentId, exceptionType);
            return;
        }
        if (allowlistedConstraint != null) {
            log.warn("Document review failed action=document-review-failure traceId={} category={} errorCode={} actorId={} ownerId={} documentId={} constraint={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), category, errorCode.name(), actorId, ownerId,
                    documentId, allowlistedConstraint, exceptionType);
            return;
        }
        log.error("Document review failed action=document-review-failure traceId={} category={} errorCode={} actorId={} ownerId={} documentId={} exceptionType={}",
                RequestTraceFilter.currentTraceId(), category, errorCode.name(), actorId, ownerId,
                documentId, exceptionType);
    }

    private boolean isApprovedDocumentUniqueViolation(Throwable failure) {
        boolean exactConstraint = false;
        boolean uniqueViolation = false;
        for (Throwable current = failure; current != null; current = current.getCause()) {
            if (current instanceof ConstraintViolationException violation) {
                exactConstraint |= "uq_user_doc_approved".equals(violation.getConstraintName());
                SQLException sql = violation.getSQLException();
                uniqueViolation |= sql != null && "23505".equals(sql.getSQLState());
            }
        }
        return exactConstraint && uniqueViolation;
    }

    private boolean notBlank(String value) { return value != null && !value.strip().isEmpty(); }

    private record ReviewCommand(DocumentVerifyStatus status, String reason) { }

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

    private void applyMetadata(UserDocument document, UserDocumentSubmissionRequest request) {
        document.setDocType(request.docType());
        document.setDocNumber(request.docNumber());
        document.setFullNameOnDoc(request.fullNameOnDoc());
        document.setDateOfBirthOnDoc(request.dateOfBirthOnDoc());
        document.setIssuePlace(request.issuePlace());
        document.setIssueDate(request.issueDate());
        document.setExpiresAt(request.expiresAt());
        document.setLicenseClass(request.licenseClass());
    }

    private void cleanup(List<PrivateDocumentReceipt> receipts, RuntimeException primary, long actorId) {
        for (int index = receipts.size() - 1; index >= 0; index--) {
            PrivateDocumentReceipt receipt = receipts.get(index);
            try {
                storage.delete(receipt);
            } catch (RuntimeException cleanupFailure) {
                primary.addSuppressed(cleanupFailure);
                log.error("User document cleanup failed action=user-document-cleanup traceId={} actorId={} receiptId={} exceptionType={}",
                        RequestTraceFilter.currentTraceId(), actorId, receipt.receiptId(), cleanupFailure.getClass().getSimpleName());
            }
        }
    }

    private void handleFailedTransaction(TransactionOutcome.State state, List<PrivateDocumentReceipt> receipts,
            RuntimeException primary, long actorId) {
        if (state == TransactionOutcome.State.ROLLED_BACK || state == TransactionOutcome.State.NO_DATABASE_WORK) {
            cleanup(receipts, primary, actorId);
            return;
        }
        if (state == TransactionOutcome.State.COMMITTED) {
            log.error("User document failure after committed transaction action=user-document-submit traceId={} actorId={} receiptIds={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), actorId, receiptIds(receipts), primary.getClass().getSimpleName());
            return;
        }
        logUnknownOutcome(receipts, actorId, primary);
    }

    private void logUnknownOutcome(List<PrivateDocumentReceipt> receipts, long actorId, RuntimeException failure) {
        log.error("User document transaction outcome unknown action=user-document-submit traceId={} actorId={} receiptIds={} exceptionType={}",
                RequestTraceFilter.currentTraceId(), actorId, receiptIds(receipts), failure.getClass().getSimpleName());
    }

    private String receiptIds(List<PrivateDocumentReceipt> receipts) {
        return receipts.stream().map(receipt -> receipt.receiptId().toString()).toList().toString();
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

    private static final class TransactionOutcome {
        private enum State { NOT_STARTED, IN_PROGRESS, COMMITTED, ROLLED_BACK, UNKNOWN, NO_DATABASE_WORK }

        private final AtomicReference<State> state = new AtomicReference<>(State.NOT_STARTED);

        private void register() {
            if (!TransactionSynchronizationManager.isSynchronizationActive()) {
                state.set(State.NO_DATABASE_WORK);
                throw new IllegalStateException("Document transaction synchronization is unavailable");
            }
            state.set(State.IN_PROGRESS);
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCompletion(int status) {
                    if (status == STATUS_COMMITTED) state.set(State.COMMITTED);
                    else if (status == STATUS_ROLLED_BACK) state.set(State.ROLLED_BACK);
                    else state.set(State.UNKNOWN);
                }
            });
            state.set(State.IN_PROGRESS);
        }

        private State failureState() {
            State current = state.get();
            if (current == State.NOT_STARTED || current == State.NO_DATABASE_WORK) return State.NO_DATABASE_WORK;
            return current == State.IN_PROGRESS ? State.UNKNOWN : current;
        }

        private State successfulReturnState() {
            return state.updateAndGet(current -> current == State.IN_PROGRESS ? State.COMMITTED : current);
        }
    }
}
