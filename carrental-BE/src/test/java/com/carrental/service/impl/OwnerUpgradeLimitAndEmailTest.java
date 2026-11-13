package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.carrental.dto.request.document.ReviewUserDocumentRequest;
import com.carrental.dto.request.document.UserDocumentSubmissionCommand;
import com.carrental.dto.request.document.UserDocumentSubmissionRequest;
import com.carrental.dto.response.KycSummaryResponse;
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
import com.carrental.service.EmailService;
import com.carrental.service.KycService;
import com.carrental.storage.PrivateDocumentStorage;
import com.carrental.storage.PrivateDocumentStorage.PrivateDocumentReceipt;
import com.carrental.storage.PrivateDocumentStorage.UploadedDocumentImage;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailSendException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import tools.jackson.databind.node.StringNode;

class OwnerUpgradeLimitAndEmailTest {

    private static final Clock FIXED_CLOCK = Clock.fixed(
            Instant.parse("2026-11-12T08:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));

    @Test
    void fourthUpgradeSubmissionIsRejectedEvenWhenEarlierThreeWereRejected() {
        CustomerRepository customers = mock(CustomerRepository.class);
        UserDocumentRepository documents = mock(UserDocumentRepository.class);
        PrivateDocumentStorage storage = mock(PrivateDocumentStorage.class);
        KycService kycService = mock(KycService.class);

        Customer customer = customer(25L, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.REJECTED);
        when(customers.existsByIdAndStatusAndRole(25L, CustomerStatus.ACTIVE, Role.CUSTOMER)).thenReturn(true);
        when(customers.findWithLockById(25L)).thenReturn(Optional.of(customer));
        when(storage.isEnabled()).thenReturn(true);
        when(storage.store(any())).thenReturn(new PrivateDocumentReceipt("private-local:r1.png", UUID.randomUUID()));
        when(documents.existsByCustomerIdAndDocTypeInAndVerifyStatus(
                eq(25L), anyCollection(), eq(VerificationStatus.PENDING))).thenReturn(false);
        when(documents.countByCustomerIdAndDocTypeIn(eq(25L), anyCollection())).thenReturn(3L);

        UserDocumentServiceImpl service = new UserDocumentServiceImpl(
                customers, documents, storage, kycService, FIXED_CLOCK);

        UserDocumentSubmissionRequest metadata = new UserDocumentSubmissionRequest(
                DocumentType.PASSPORT, "P1234567", "User 25", LocalDate.of(1995, 1, 1),
                "HCM", LocalDate.of(2020, 1, 1), LocalDate.of(2030, 1, 1), null);
        UserDocumentSubmissionCommand command = new UserDocumentSubmissionCommand(
                metadata, new UploadedDocumentImage("front.png", "image/png", new byte[]{1, 2, 3}), null);

        TransactionSynchronizationManager.initSynchronization();
        try {
            assertThatThrownBy(() -> service.submit(new CurrentAccount(25L, Role.CUSTOMER), command))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).errorCode())
                    .isEqualTo(ErrorCode.OWNER_UPGRADE_LIMIT_EXCEEDED);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
        verify(storage).delete(any(PrivateDocumentReceipt.class));
    }

    @Test
    void submittingPassportWhileCitizenIdIsPendingIsBlocked() {
        CustomerRepository customers = mock(CustomerRepository.class);
        UserDocumentRepository documents = mock(UserDocumentRepository.class);
        PrivateDocumentStorage storage = mock(PrivateDocumentStorage.class);
        KycService kycService = mock(KycService.class);

        Customer customer = customer(26L, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.PENDING);
        when(customers.existsByIdAndStatusAndRole(26L, CustomerStatus.ACTIVE, Role.CUSTOMER)).thenReturn(true);
        when(customers.findWithLockById(26L)).thenReturn(Optional.of(customer));
        when(storage.isEnabled()).thenReturn(true);
        when(storage.store(any())).thenReturn(new PrivateDocumentReceipt("private-local:r2.png", UUID.randomUUID()));
        when(documents.existsByCustomerIdAndDocTypeInAndVerifyStatus(
                eq(26L), anyCollection(), eq(VerificationStatus.PENDING))).thenReturn(true);

        UserDocumentServiceImpl service = new UserDocumentServiceImpl(
                customers, documents, storage, kycService, FIXED_CLOCK);

        UserDocumentSubmissionRequest metadata = new UserDocumentSubmissionRequest(
                DocumentType.PASSPORT, "P9999999", "User 26", LocalDate.of(1995, 1, 1),
                "HCM", LocalDate.of(2020, 1, 1), LocalDate.of(2030, 1, 1), null);
        UserDocumentSubmissionCommand command = new UserDocumentSubmissionCommand(
                metadata, new UploadedDocumentImage("front.png", "image/png", new byte[]{1, 2, 3}), null);

        TransactionSynchronizationManager.initSynchronization();
        try {
            assertThatThrownBy(() -> service.submit(new CurrentAccount(26L, Role.CUSTOMER), command))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).errorCode())
                    .isEqualTo(ErrorCode.DOCUMENT_PENDING_EXISTS);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    @SuppressWarnings("unchecked")
    void reviewApprovalAndRejectionSendEmailsAndSurviveMailFailureWithoutLeakingPii() {
        CustomerRepository customers = mock(CustomerRepository.class);
        UserDocumentRepository documents = mock(UserDocumentRepository.class);
        PrivateDocumentStorage storage = mock(PrivateDocumentStorage.class);
        KycService kycService = mock(KycService.class);
        EmailService emailService = mock(EmailService.class);
        when(emailService.isConfigured()).thenReturn(true);

        Customer admin = customer(1L, Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.VERIFIED);
        Customer owner = customer(30L, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.PENDING);
        UserDocument docApprove = pendingDoc(400L, owner, VerificationStatus.PENDING);

        when(customers.findById(1L)).thenReturn(Optional.of(admin));
        when(customers.findWithLockById(30L)).thenReturn(Optional.of(owner));
        when(documents.findById(400L)).thenReturn(Optional.of(docApprove));
        when(documents.findWithLockById(400L)).thenReturn(Optional.of(docApprove));
        when(storage.isEnabled()).thenReturn(true);
        when(kycService.currentStatus(30L, LocalDate.now(FIXED_CLOCK))).thenReturn(KycStatus.VERIFIED);

        UserDocumentServiceImpl service = new UserDocumentServiceImpl(
                customers, documents, storage, kycService, FIXED_CLOCK,
                emailService, "http://localhost:3000");

        ReviewUserDocumentRequest approveReq = new ReviewUserDocumentRequest();
        approveReq.setVerifyStatus(StringNode.valueOf("APPROVED"));
        service.review(new CurrentAccount(1L, Role.ADMIN), 400L, approveReq);

        ArgumentCaptor<String> subjectCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> plainTextCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> htmlCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendHtmlEmail(eq("user30@test.vn"), subjectCaptor.capture(),
                plainTextCaptor.capture(), htmlCaptor.capture());
        assertThat(subjectCaptor.getValue()).contains("Chúc mừng");
        assertThat(plainTextCaptor.getValue()).contains("Chủ xe (OWNER)");
        assertThat(htmlCaptor.getValue()).contains("Chủ xe (OWNER)", "href=");

        // Test rejection + mail delivery exception resilience + no PII leak in logs
        Customer owner2 = customer(31L, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.PENDING);
        UserDocument docReject = pendingDoc(401L, owner2, VerificationStatus.PENDING);
        when(customers.findWithLockById(31L)).thenReturn(Optional.of(owner2));
        when(documents.findById(401L)).thenReturn(Optional.of(docReject));
        when(documents.findWithLockById(401L)).thenReturn(Optional.of(docReject));
        when(kycService.currentStatus(31L, LocalDate.now(FIXED_CLOCK))).thenReturn(KycStatus.REJECTED);
        when(documents.countByCustomerIdAndDocTypeIn(eq(31L), anyCollection())).thenReturn(2L);
        doThrow(new MailSendException("SMTP down")).when(emailService)
                .sendHtmlEmail(anyString(), anyString(), anyString(), anyString());

        Logger logger = (Logger) LoggerFactory.getLogger(UserDocumentServiceImpl.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            ReviewUserDocumentRequest rejectReq = new ReviewUserDocumentRequest();
            rejectReq.setVerifyStatus(StringNode.valueOf("REJECTED"));
            rejectReq.setRejectReason(StringNode.valueOf("Ảnh mặt trước bị lóa sáng"));

            var res = service.review(new CurrentAccount(1L, Role.ADMIN), 401L, rejectReq);
            assertThat(res.document().verifyStatus()).isEqualTo(VerificationStatus.REJECTED);
            assertThat(docReject.getRejectReason()).isEqualTo("Ảnh mặt trước bị lóa sáng");

            List<String> logged = appender.list.stream().map(ILoggingEvent::getFormattedMessage).toList();
            assertThat(logged).anyMatch(m -> m.contains("document-review-email-failed"));
            assertThat(logged).noneMatch(m -> m.contains("user31@test.vn") || m.contains("lóa sáng"));
        } finally {
            logger.detachAppender(appender);
        }
    }

    @Test
    void kycServiceReportsUpgradeQuotaAndPendingState() {
        CustomerRepository customers = mock(CustomerRepository.class);
        UserDocumentRepository documents = mock(UserDocumentRepository.class);
        Customer customer = customer(40L, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.REJECTED);
        when(customers.findById(40L)).thenReturn(Optional.of(customer));

        UserDocument d1 = pendingDoc(501L, customer, VerificationStatus.REJECTED);
        UserDocument d2 = pendingDoc(502L, customer, VerificationStatus.REJECTED);
        d2.setDocType(DocumentType.PASSPORT);
        UserDocument dl = pendingDoc(503L, customer, VerificationStatus.APPROVED);
        dl.setDocType(DocumentType.DRIVER_LICENSE);
        dl.setExpiresAt(LocalDate.now(FIXED_CLOCK).plusYears(2));

        when(documents.findByCustomerId(40L)).thenReturn(List.of(d1, d2, dl));
        KycServiceImpl kycService = new KycServiceImpl(customers, documents, FIXED_CLOCK);

        KycSummaryResponse summary = kycService.getMe(new CurrentAccount(40L, Role.CUSTOMER));
        assertThat(summary.upgradeAttemptsUsed()).isEqualTo(2);
        assertThat(summary.maxUpgradeAttempts()).isEqualTo(3);
        assertThat(summary.upgradeAttemptsRemaining()).isEqualTo(1);
        assertThat(summary.hasPendingUpgradeRequest()).isFalse();
    }

    private static Customer customer(long id, Role role, CustomerStatus status, KycStatus kycStatus) {
        Customer account = Customer.builder()
                .fullName("User " + id)
                .email("user" + id + "@test.vn")
                .phone("0900000" + String.format("%03d", id))
                .passwordHash("hash")
                .role(role)
                .status(status)
                .kycStatus(kycStatus)
                .build();
        ReflectionTestUtils.setField(account, "id", id);
        return account;
    }

    private static UserDocument pendingDoc(long docId, Customer owner, VerificationStatus status) {
        UserDocument doc = new UserDocument();
        ReflectionTestUtils.setField(doc, "id", docId);
        doc.setCustomer(owner);
        doc.setDocType(DocumentType.CITIZEN_ID);
        doc.setDocNumber("0790990000" + docId);
        doc.setFullNameOnDoc(owner.getFullName());
        doc.setDateOfBirthOnDoc(LocalDate.of(1995, 1, 1));
        doc.setIssuePlace("Cục Cảnh sát");
        doc.setIssueDate(LocalDate.of(2022, 1, 1));
        doc.setFrontImageUrl("private-local:front.png");
        doc.setBackImageUrl("private-local:back.png");
        doc.setVerifyStatus(status);
        return doc;
    }
}
