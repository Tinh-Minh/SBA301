package com.carrental.service.impl;

import static com.carrental.util.RequestChecks.notFound;
import static com.carrental.util.RequestChecks.requirePositiveId;
import static com.carrental.util.RequestChecks.requirePrincipal;

import com.carrental.config.MailEnvironmentStartupLogger;
import com.carrental.dto.request.document.ReviewUserDocumentRequest;
import com.carrental.dto.request.document.UserDocumentListQuery;
import com.carrental.dto.request.document.UserDocumentSubmissionCommand;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.UserDocumentDetailResponse;
import com.carrental.dto.response.UserDocumentReviewResponse;
import com.carrental.dto.response.UserDocumentSummaryResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.UserDocument;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DocumentType;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.enums.VerificationStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.AuthService;
import com.carrental.service.KycService;
import com.carrental.service.UserDocumentService;
import com.carrental.storage.PrivateDocumentStorage;
import com.carrental.storage.PrivateDocumentStorage.PrivateDocumentFile;
import com.carrental.storage.PrivateDocumentStorage.PrivateDocumentReceipt;
import com.carrental.util.RequestChecks;
import com.carrental.web.RequestTraceFilter;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Slf4j
@Service
@Transactional(readOnly = true)
public class UserDocumentServiceImpl implements UserDocumentService {

    public static final int MAX_OWNER_UPGRADE_ATTEMPTS = 3;
    public static final Set<DocumentType> IDENTITY_DOC_TYPES = Set.of(DocumentType.CITIZEN_ID, DocumentType.PASSPORT);

    private final CustomerRepository customers;
    private final UserDocumentRepository documents;
    private final PrivateDocumentStorage storage;
    private final KycService kycService;
    private final Clock clock;
    private final AuthService authService;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String mailFrom;
    private final String mailUsername;
    private final String mailPassword;
    private final String frontendBaseUrl;

    public UserDocumentServiceImpl(CustomerRepository customers, UserDocumentRepository documents,
            PrivateDocumentStorage storage, KycService kycService, Clock clock) {
        this(customers, documents, storage, kycService, clock, null, null, "", "", "", "http://localhost:3000");
    }

    public UserDocumentServiceImpl(CustomerRepository customers, UserDocumentRepository documents,
            PrivateDocumentStorage storage, KycService kycService, Clock clock, AuthService authService) {
        this(customers, documents, storage, kycService, clock, authService, null, "", "", "", "http://localhost:3000");
    }

    public UserDocumentServiceImpl(CustomerRepository customers, UserDocumentRepository documents,
            PrivateDocumentStorage storage, KycService kycService, Clock clock,
            ObjectProvider<JavaMailSender> mailSenderProvider, String mailFrom, String mailUsername,
            String mailPassword, String frontendBaseUrl) {
        this(customers, documents, storage, kycService, clock, null, mailSenderProvider, mailFrom, mailUsername,
                mailPassword, frontendBaseUrl);
    }

    @Autowired
    public UserDocumentServiceImpl(
            CustomerRepository customers,
            UserDocumentRepository documents,
            PrivateDocumentStorage storage,
            KycService kycService,
            Clock clock,
            AuthService authService,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.mail.from:}") String mailFrom,
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${spring.mail.password:}") String mailPassword,
            @Value("${app.frontend.base-url:http://localhost:3000}") String frontendBaseUrl) {
        this.customers = customers;
        this.documents = documents;
        this.storage = storage;
        this.kycService = kycService;
        this.clock = clock;
        this.authService = authService;
        this.mailSenderProvider = mailSenderProvider;
        this.mailFrom = mailFrom == null ? "" : mailFrom;
        this.mailUsername = mailUsername == null ? "" : mailUsername;
        this.mailPassword = mailPassword == null ? "" : mailPassword;
        this.frontendBaseUrl = frontendBaseUrl == null || frontendBaseUrl.isBlank()
                ? "http://localhost:3000"
                : frontendBaseUrl;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    @Transactional
    public UserDocumentDetailResponse submit(CurrentAccount account, UserDocumentSubmissionCommand command) {
        requirePrincipal(account);
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
            DocumentType docType = command.metadata().docType();
            if (IDENTITY_DOC_TYPES.contains(docType)) {
                if (owner.getRole() == Role.OWNER || owner.getKycStatus() == KycStatus.VERIFIED) {
                    throw new AppException(ErrorCode.INVALID_REQUEST,
                            "Tài khoản đã là Chủ xe (OWNER) và đã được xác thực danh tính, không cần gửi lại yêu cầu nâng cấp");
                }
                // Không nhận thêm yêu cầu nâng cấp chủ xe khi đang có hồ sơ định danh PENDING.
                if (documents.existsByCustomerIdAndDocTypeInAndVerifyStatus(
                        owner.getId(), IDENTITY_DOC_TYPES, VerificationStatus.PENDING)) {
                    throw new AppException(ErrorCode.DOCUMENT_PENDING_EXISTS,
                            "Bạn đã có yêu cầu nâng cấp chủ xe đang chờ duyệt, vui lòng chờ kết quả trước khi gửi lại");
                }
                // Giới hạn tối đa 3 lần gửi yêu cầu nâng cấp chủ xe cho mỗi user (kể cả các lần đã bị từ chối).
                long submittedAttempts = documents.countByCustomerIdAndDocTypeIn(owner.getId(), IDENTITY_DOC_TYPES);
                if (submittedAttempts >= MAX_OWNER_UPGRADE_ATTEMPTS) {
                    throw new AppException(ErrorCode.OWNER_UPGRADE_LIMIT_EXCEEDED,
                            "Bạn đã sử dụng hết tối đa 3 lần gửi yêu cầu nâng cấp chủ xe (bao gồm cả các lần đã bị từ chối)");
                }
                owner.setKycStatus(KycStatus.PENDING);
                customers.save(owner);
            } else if (documents.existsByCustomerIdAndDocTypeAndVerifyStatus(
                    owner.getId(), docType, VerificationStatus.PENDING)) {
                throw new AppException(ErrorCode.DOCUMENT_PENDING_EXISTS);
            }
            UserDocument document = command.metadata().toEntity(owner,
                    receipts.get(0).locator(), receipts.size() == 2 ? receipts.get(1).locator() : null);
            return UserDocumentDetailResponse.from(documents.saveAndFlush(document));
        } catch (RuntimeException failure) {
            cleanup(receipts);
            throw failure;
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public PageResponse<UserDocumentSummaryResponse> list(CurrentAccount account, UserDocumentListQuery query) {
        requirePrincipal(account);
        Objects.requireNonNull(query);
        if (account.role() != Role.ADMIN && (!query.scope().equals("mine") || query.customerId() != null)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        if (account.role() == Role.ADMIN && query.customerId() != null && !query.scope().equals("all")) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        Specification<UserDocument> specification = documentSpecification(account, query);
        Page<UserDocument> page = documents.findAll(specification, query.pageable());
        return PageResponse.from(page.map(UserDocumentSummaryResponse::from));
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public UserDocumentDetailResponse get(CurrentAccount account, long documentId) {
        return UserDocumentDetailResponse.from(findAccessibleDocument(account, documentId));
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public PrivateDocumentFile download(CurrentAccount account, long documentId, String side) {
        requirePrincipal(account);
        requirePositiveId(documentId);
        if (!"front".equals(side) && !"back".equals(side)) throw new AppException(ErrorCode.INVALID_REQUEST);
        requireStorage();
        UserDocument document = findAccessibleDocument(account, documentId);
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

        long ownerId = documents.findById(documentId)
                .orElseThrow(RequestChecks::notFound)
                .getCustomer().getId();
        if (actor.customerId() == ownerId) throw new AppException(ErrorCode.DOCUMENT_SELF_REVIEW_FORBIDDEN);
        // Reviews of different documents of one customer share this lock so the KYC update is consistent.
        Customer owner = customers.findWithLockById(ownerId).orElseThrow(RequestChecks::notFound);
        UserDocument document = documents.findWithLockById(documentId).orElseThrow(RequestChecks::notFound);
        Customer actorRow = customers.findById(actor.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (actorRow.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (actorRow.getRole() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);
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
        boolean ownerChanged = false;
        if (owner.getKycStatus() != currentKyc) {
            owner.setKycStatus(currentKyc);
            ownerChanged = true;
        }
        Role oldRole = owner.getRole();
        if (currentKyc == KycStatus.VERIFIED
                && owner.getStatus() == CustomerStatus.ACTIVE
                && owner.getRole() == Role.CUSTOMER) {
            owner.setRole(Role.OWNER);
            ownerChanged = true;
        }
        if (ownerChanged) {
            customers.flush();
        }
        UserDocumentReviewResponse response = UserDocumentReviewResponse.from(document, currentKyc, evaluatedOn);
        if (authService != null && oldRole == Role.CUSTOMER && owner.getRole() == Role.OWNER) {
            notifyOwnerApprovedAfterCommit(owner);
        }
        log.info("document-review actorId={} ownerId={} documentId={} type={} {} -> {} kyc {} -> {} role {} -> {} reasonProvided={}", actorRow.getId(), owner.getId(), document.getId(), document.getDocType(), oldStatus, command.status(), oldKyc, currentKyc, oldRole, owner.getRole(), command.reason() != null);
        sendReviewNotificationEmail(owner, document, command.status(), oldRole, owner.getRole());
        return response;
    }

    private void notifyOwnerApprovedAfterCommit(Customer customer) {
        long customerId = customer.getId();
        String email = customer.getEmail();
        String fullName = customer.getFullName();
        Runnable notification = () -> authService.notifyOwnerApproved(customerId, email, fullName);
        if (TransactionSynchronizationManager.isSynchronizationActive()
                && TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    notification.run();
                }
            });
        } else {
            notification.run();
        }
    }

    private UserDocument findAccessibleDocument(CurrentAccount account, long documentId) {
        requirePrincipal(account);
        requirePositiveId(documentId);
        return account.role() == Role.ADMIN
                ? documents.findById(documentId).orElseThrow(RequestChecks::notFound)
                : documents.findByIdAndCustomerId(documentId, account.customerId()).orElseThrow(RequestChecks::notFound);
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
        List<String> reasons = new ArrayList<>();
        List<FieldErrorResponse> fieldErrors = new ArrayList<>();

        if (!notBlank(document.getFullNameOnDoc())) {
            reasons.add("Họ và tên trên giấy tờ không được để trống");
            fieldErrors.add(new FieldErrorResponse("fullNameOnDoc", "Họ và tên trên giấy tờ không được để trống"));
        }

        if (document.getDateOfBirthOnDoc() == null) {
            reasons.add("Thiếu ngày sinh trên giấy tờ");
            fieldErrors.add(new FieldErrorResponse("dateOfBirthOnDoc", "Thiếu ngày sinh trên giấy tờ"));
        } else if (document.getDateOfBirthOnDoc().isAfter(today)) {
            reasons.add("Ngày sinh (" + document.getDateOfBirthOnDoc() + ") không được ở tương lai");
            fieldErrors.add(new FieldErrorResponse("dateOfBirthOnDoc", "Ngày sinh (" + document.getDateOfBirthOnDoc() + ") không được ở tương lai"));
        }

        if (!notBlank(document.getIssuePlace())) {
            reasons.add("Nơi cấp giấy tờ không được để trống");
            fieldErrors.add(new FieldErrorResponse("issuePlace", "Nơi cấp giấy tờ không được để trống"));
        }

        if (document.getIssueDate() == null) {
            reasons.add("Thiếu ngày cấp giấy tờ");
            fieldErrors.add(new FieldErrorResponse("issueDate", "Thiếu ngày cấp giấy tờ"));
        } else if (document.getIssueDate().isAfter(today)) {
            reasons.add("Ngày cấp (" + document.getIssueDate() + ") không được ở tương lai");
            fieldErrors.add(new FieldErrorResponse("issueDate", "Ngày cấp (" + document.getIssueDate() + ") không được ở tương lai"));
        }

        if (document.getDocType() == DocumentType.DRIVER_LICENSE && document.getExpiresAt() == null) {
            reasons.add("Giấy phép lái xe bắt buộc phải có ngày hết hạn");
            fieldErrors.add(new FieldErrorResponse("expiresAt", "Giấy phép lái xe bắt buộc phải có ngày hết hạn"));
        }

        if (document.getExpiresAt() != null && document.getExpiresAt().isBefore(today)) {
            reasons.add("Giấy tờ đã hết hạn sử dụng (ngày hết hạn: " + document.getExpiresAt() + ", hôm nay: " + today + ")");
            fieldErrors.add(new FieldErrorResponse("expiresAt", "Giấy tờ đã hết hạn sử dụng"));
        }

        if (document.getIssueDate() != null && document.getExpiresAt() != null
                && document.getIssueDate().isAfter(document.getExpiresAt())) {
            reasons.add("Ngày hết hạn (" + document.getExpiresAt() + ") phải sau hoặc bằng ngày cấp (" + document.getIssueDate() + ")");
            fieldErrors.add(new FieldErrorResponse("expiresAt", "Ngày hết hạn phải sau hoặc bằng ngày cấp"));
        }

        if (document.getDocType() == DocumentType.DRIVER_LICENSE && !notBlank(document.getLicenseClass())) {
            reasons.add("Giấy phép lái xe bắt buộc phải có hạng bằng lái");
            fieldErrors.add(new FieldErrorResponse("licenseClass", "Giấy phép lái xe bắt buộc phải có hạng bằng lái"));
        }

        if ((document.getDocType() == DocumentType.CITIZEN_ID || document.getDocType() == DocumentType.DRIVER_LICENSE)
                && !notBlank(document.getBackImageUrl())) {
            reasons.add("Thiếu ảnh chụp mặt sau giấy tờ");
            fieldErrors.add(new FieldErrorResponse("backImage", "Thiếu ảnh chụp mặt sau giấy tờ"));
        }

        if (!reasons.isEmpty()) {
            String detailedMessage = "Giấy tờ chưa đủ điều kiện duyệt: " + String.join("; ", reasons);
            log.warn("document-review-prerequisites-failed docId={} docType={} reasons={}",
                    document.getId(), document.getDocType(), reasons);
            throw new AppException(ErrorCode.DOCUMENT_NOT_APPROVABLE, detailedMessage, fieldErrors);
        }
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

    private void sendReviewNotificationEmail(
            Customer owner,
            UserDocument document,
            VerificationStatus verifyStatus,
            Role oldRole,
            Role newRole) {
        JavaMailSender mailSender = mailSenderProvider != null ? mailSenderProvider.getIfAvailable() : null;
        if (mailSender == null
                || mailFrom.isBlank()
                || mailUsername.isBlank()
                || mailPassword.isBlank()) {
            log.warn("document-review-email-skipped reason=mail_unconfigured customerId={} documentId={} verifyStatus={}",
                    owner.getId(), document.getId(), verifyStatus);
            return;
        }
        if (owner.getEmail() == null || owner.getEmail().isBlank()) {
            log.warn("document-review-email-skipped reason=missing_recipient customerId={} documentId={} verifyStatus={}",
                    owner.getId(), document.getId(), verifyStatus);
            return;
        }

        String baseUrl = frontendBaseUrl.replaceAll("/+$", "");
        String docLabel = switch (document.getDocType()) {
            case CITIZEN_ID -> "CCCD/CMND";
            case PASSPORT -> "Hộ chiếu";
            case DRIVER_LICENSE -> "Giấy phép lái xe";
        };
        String greetingName = owner.getFullName() != null && !owner.getFullName().isBlank()
                ? owner.getFullName()
                : "Quý khách";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(owner.getEmail());

        if (verifyStatus == VerificationStatus.APPROVED) {
            boolean promotedToOwner = newRole == Role.OWNER && oldRole != Role.OWNER;
            if (promotedToOwner) {
                message.setSubject("Chúc mừng! Tài khoản CarDB của bạn đã được nâng cấp lên Chủ xe");
                message.setText("Xin chào " + greetingName + ",\n\n"
                        + "Chúc mừng bạn! Hồ sơ " + docLabel + " của bạn đã được quản trị viên phê duyệt.\n"
                        + "Tài khoản CarDB của bạn đã chính thức được nâng cấp lên vai trò Chủ xe (OWNER). "
                        + "Bạn có thể đăng ký xe cho thuê và quản lý tin đăng ngay tại:\n"
                        + baseUrl + "/owner/dashboard\n\n"
                        + "Trân trọng,\nĐội ngũ CarDB");
            } else {
                message.setSubject("Thông báo: Hồ sơ " + docLabel + " trên CarDB đã được duyệt");
                message.setText("Xin chào " + greetingName + ",\n\n"
                        + "Chúc mừng bạn! Hồ sơ " + docLabel + " của bạn đã được quản trị viên xác minh thành công.\n"
                        + "Xem chi tiết trạng thái tại:\n"
                        + baseUrl + "/account/verification\n\n"
                        + "Trân trọng,\nĐội ngũ CarDB");
            }
        } else {
            long usedAttempts = IDENTITY_DOC_TYPES.contains(document.getDocType())
                    ? documents.countByCustomerIdAndDocTypeIn(owner.getId(), IDENTITY_DOC_TYPES)
                    : 0;
            long remaining = Math.max(0, MAX_OWNER_UPGRADE_ATTEMPTS - usedAttempts);
            String reason = document.getRejectReason() != null && !document.getRejectReason().isBlank()
                    ? document.getRejectReason()
                    : "Hồ sơ chưa đạt yêu cầu xác minh.";
            String quotaNote = IDENTITY_DOC_TYPES.contains(document.getDocType())
                    ? (remaining > 0
                            ? "Bạn còn " + remaining + "/" + MAX_OWNER_UPGRADE_ATTEMPTS + " lượt gửi yêu cầu nâng cấp chủ xe."
                            : "Bạn đã sử dụng hết tối đa " + MAX_OWNER_UPGRADE_ATTEMPTS + "/" + MAX_OWNER_UPGRADE_ATTEMPTS + " lượt gửi yêu cầu nâng cấp chủ xe.")
                    : "Bạn có thể cập nhật lại hồ sơ hợp lệ.";
            message.setSubject("Thông báo: Hồ sơ " + docLabel + " trên CarDB chưa được duyệt");
            message.setText("Xin chào " + greetingName + ",\n\n"
                    + "Rất tiếc, hồ sơ " + docLabel + " của bạn đã bị từ chối.\n"
                    + "Lý do từ chối: " + reason + "\n\n"
                    + quotaNote + "\n"
                    + "Xem trạng thái hồ sơ tại:\n"
                    + baseUrl + "/account/verification\n\n"
                    + "Trân trọng,\nĐội ngũ CarDB");
        }

        try {
            mailSender.send(message);
            log.info("document-review-email-sent customerId={} documentId={} verifyStatus={}",
                    owner.getId(), document.getId(), verifyStatus);
        } catch (RuntimeException ex) {
            log.warn("document-review-email-failed customerId={} documentId={} verifyStatus={} exceptionType={} detail={}",
                    owner.getId(),
                    document.getId(),
                    verifyStatus,
                    ex.getClass().getSimpleName(),
                    MailEnvironmentStartupLogger.summarizeMailFailure(ex, owner.getEmail(), document.getRejectReason()));
        }
    }
}
