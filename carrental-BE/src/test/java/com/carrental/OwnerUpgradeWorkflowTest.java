package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.carrental.dto.request.customer.CustomerListQuery;
import com.carrental.dto.request.document.ReviewUserDocumentRequest;
import com.carrental.dto.request.document.UserDocumentSubmissionCommand;
import com.carrental.dto.request.document.UserDocumentSubmissionRequest;
import com.carrental.dto.response.CustomerAdminResponse;
import com.carrental.dto.response.CustomerSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.UserDocumentDetailResponse;
import com.carrental.dto.response.UserDocumentReviewResponse;
import com.carrental.entity.Customer;
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
import com.carrental.service.CustomerService;
import com.carrental.service.KycService;
import com.carrental.service.UserDocumentService;
import com.carrental.service.impl.CustomerServiceImpl;
import com.carrental.service.impl.KycServiceImpl;
import com.carrental.service.impl.UserDocumentServiceImpl;
import com.carrental.storage.PrivateDocumentStorage;
import com.carrental.storage.PrivateDocumentStorage.PrivateDocumentFile;
import com.carrental.storage.PrivateDocumentStorage.PrivateDocumentReceipt;
import com.carrental.storage.PrivateDocumentStorage.UploadedDocumentImage;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import tools.jackson.databind.node.JsonNodeFactory;
import org.springframework.data.domain.PageRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class OwnerUpgradeWorkflowTest {

    @Autowired private CustomerRepository customers;
    @Autowired private UserDocumentRepository documents;
    @Autowired private CustomerService customerService;

    private final Clock clock = Clock.fixed(Instant.parse("2026-11-13T00:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));
    private final PrivateDocumentStorage storage = mock(PrivateDocumentStorage.class);
    private final JavaMailSender mailSender = mock(JavaMailSender.class);
    @SuppressWarnings("unchecked")
    private final ObjectProvider<JavaMailSender> mailProvider = mock(ObjectProvider.class);

    private UserDocumentService documentService;
    private KycService kycService;

    private Customer user;
    private Customer admin;
    private CurrentAccount userAccount;
    private CurrentAccount adminAccount;

    @BeforeEach
    void setUp() {
        when(mailProvider.getIfAvailable()).thenReturn(mailSender);
        when(storage.isEnabled()).thenReturn(true);
        when(storage.store(any())).thenAnswer(inv -> {
            UUID id = UUID.randomUUID();
            return new PrivateDocumentReceipt("private-local:" + id + ".png", id);
        });
        when(storage.open(any())).thenAnswer(inv -> {
            return new PrivateDocumentFile(new byte[] { 1, 2, 3 }, com.carrental.enums.DocumentImageFormat.PNG);
        });

        kycService = new KycServiceImpl(customers, documents, clock);
        documentService = new UserDocumentServiceImpl(customers, documents, storage, kycService, clock,
                mailProvider, "noreply@cardb.vn", "apikey", "secretkey", "http://localhost:3000");

        user = customers.save(Customer.builder()
                .fullName("Nguyễn Văn Kiểm Thử")
                .email("user-upgrade-test-" + UUID.randomUUID() + "@cardb.vn")
                .phone("0981" + (System.nanoTime() % 1000000))
                .passwordHash("$2a$10$dummyHashToSatisfyNotNullConstraints123456789012345678901")
                .emailVerified(true)
                .role(Role.CUSTOMER)
                .status(CustomerStatus.ACTIVE)
                .kycStatus(KycStatus.NONE)
                .build());

        admin = customers.save(Customer.builder()
                .fullName("Quản Trị Viên")
                .email("admin-upgrade-test-" + UUID.randomUUID() + "@cardb.vn")
                .phone("0982" + (System.nanoTime() % 1000000))
                .passwordHash("$2a$10$dummyHashToSatisfyNotNullConstraints123456789012345678902")
                .emailVerified(true)
                .role(Role.ADMIN)
                .status(CustomerStatus.ACTIVE)
                .kycStatus(KycStatus.NONE)
                .build());

        userAccount = new CurrentAccount(user.getId(), Role.CUSTOMER);
        adminAccount = new CurrentAccount(admin.getId(), Role.ADMIN);
    }

    private UserDocumentSubmissionCommand makeCommand(String docNumber) {
        UserDocumentSubmissionRequest meta = new UserDocumentSubmissionRequest(
                DocumentType.CITIZEN_ID,
                docNumber,
                "Nguyễn Văn Kiểm Thử",
                LocalDate.of(1995, 5, 20),
                "Cục Cảnh sát QLHC về TTXH",
                LocalDate.of(2021, 6, 15),
                LocalDate.of(2035, 5, 20),
                null);

        UploadedDocumentImage front = new UploadedDocumentImage("front.png", "image/png", new byte[] { 1, 2, 3 });
        UploadedDocumentImage back = new UploadedDocumentImage("back.png", "image/png", new byte[] { 4, 5, 6 });
        return new UserDocumentSubmissionCommand(meta, front, back);
    }

    @Test
    @DisplayName("Complete User to Owner upgrade flow with attempt limits, PENDING lock, rejection reasons and admin listing")
    void testFullUpgradeFlowAndEdgeCases() {
        // 1. Submit attempt #1
        UserDocumentDetailResponse doc1 = documentService.submit(userAccount, makeCommand("001095000001"));
        assertThat(doc1.verifyStatus()).isEqualTo(VerificationStatus.PENDING);

        // 2. Cannot submit while PENDING
        assertThatThrownBy(() -> documentService.submit(userAccount, makeCommand("001095000002")))
                .isInstanceOf(AppException.class)
                .satisfies(e -> assertThat(((AppException) e).errorCode()).isEqualTo(ErrorCode.DOCUMENT_PENDING_EXISTS));

        // 3. Admin can discover pending user via kycStatus=PENDING query
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        adminAccount, null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))));
        CustomerListQuery pendingQuery = new CustomerListQuery(null, KycStatus.PENDING, null, null, PageRequest.of(0, 10));
        PageResponse<CustomerSummaryResponse> pendingList = customerService.listCustomers(pendingQuery);
        assertThat(pendingList.content()).anyMatch(c -> c.id().equals(user.getId()) && c.kycStatus() == KycStatus.PENDING);
        org.springframework.security.core.context.SecurityContextHolder.clearContext();

        // 4. Non-admin cannot review (non-admin actor gets INVALID_TOKEN)
        ReviewUserDocumentRequest approveReq = new ReviewUserDocumentRequest();
        approveReq.setVerifyStatus(JsonNodeFactory.instance.textNode("APPROVED"));
        assertThatThrownBy(() -> documentService.review(userAccount, doc1.id(), approveReq))
                .isInstanceOf(AppException.class)
                .satisfies(e -> assertThat(((AppException) e).errorCode()).isEqualTo(ErrorCode.INVALID_TOKEN));

        // And Admin cannot review their own document (self-review forbidden)
        UserDocumentDetailResponse adminDoc = documentService.submit(adminAccount, makeCommand("001095000099"));
        assertThatThrownBy(() -> documentService.review(adminAccount, adminDoc.id(), approveReq))
                .isInstanceOf(AppException.class)
                .satisfies(e -> assertThat(((AppException) e).errorCode()).isEqualTo(ErrorCode.DOCUMENT_SELF_REVIEW_FORBIDDEN));

        // 5. Admin cannot reject without reason
        ReviewUserDocumentRequest rejectNoReason = new ReviewUserDocumentRequest();
        rejectNoReason.setVerifyStatus(JsonNodeFactory.instance.textNode("REJECTED"));
        assertThatThrownBy(() -> documentService.review(adminAccount, doc1.id(), rejectNoReason))
                .isInstanceOf(AppException.class)
                .satisfies(e -> assertThat(((AppException) e).errorCode()).isEqualTo(ErrorCode.INVALID_REQUEST));

        // 6. Admin rejects attempt #1 with reason
        ReviewUserDocumentRequest rejectReq1 = new ReviewUserDocumentRequest();
        rejectReq1.setVerifyStatus(JsonNodeFactory.instance.textNode("REJECTED"));
        rejectReq1.setRejectReason(JsonNodeFactory.instance.textNode("Ảnh mặt trước bị lóa sáng"));
        UserDocumentReviewResponse rev1 = documentService.review(adminAccount, doc1.id(), rejectReq1);
        assertThat(rev1.document().verifyStatus()).isEqualTo(VerificationStatus.REJECTED);
        assertThat(rev1.document().rejectReason()).isEqualTo("Ảnh mặt trước bị lóa sáng");

        // User remains CUSTOMER after rejection
        Customer afterReject1 = customers.findById(user.getId()).orElseThrow();
        assertThat(afterReject1.getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(afterReject1.getKycStatus()).isEqualTo(KycStatus.REJECTED);

        // 7. Submit attempt #2 and Admin rejects with reason
        UserDocumentDetailResponse doc2 = documentService.submit(userAccount, makeCommand("001095000003"));
        assertThat(doc2.verifyStatus()).isEqualTo(VerificationStatus.PENDING);
        ReviewUserDocumentRequest rejectReq2 = new ReviewUserDocumentRequest();
        rejectReq2.setVerifyStatus(JsonNodeFactory.instance.textNode("REJECTED"));
        rejectReq2.setRejectReason(JsonNodeFactory.instance.textNode("Ảnh mặt sau bị mất góc"));
        documentService.review(adminAccount, doc2.id(), rejectReq2);

        // 8. Submit attempt #3 and Admin rejects with reason
        UserDocumentDetailResponse doc3 = documentService.submit(userAccount, makeCommand("001095000004"));
        assertThat(doc3.verifyStatus()).isEqualTo(VerificationStatus.PENDING);
        ReviewUserDocumentRequest rejectReq3 = new ReviewUserDocumentRequest();
        rejectReq3.setVerifyStatus(JsonNodeFactory.instance.textNode("REJECTED"));
        rejectReq3.setRejectReason(JsonNodeFactory.instance.textNode("Họ tên trên giấy không trùng khớp"));
        documentService.review(adminAccount, doc3.id(), rejectReq3);

        // 9. 4th attempt is strictly blocked by BE with OWNER_UPGRADE_LIMIT_EXCEEDED
        assertThatThrownBy(() -> documentService.submit(userAccount, makeCommand("001095000005")))
                .isInstanceOf(AppException.class)
                .satisfies(e -> assertThat(((AppException) e).errorCode()).isEqualTo(ErrorCode.OWNER_UPGRADE_LIMIT_EXCEEDED));

        // 10. Test successful approval flow on another customer
        Customer happyUser = customers.save(Customer.builder()
                .fullName("Trần Thị Hạnh Phúc")
                .email("happy-user-" + UUID.randomUUID() + "@cardb.vn")
                .phone("0983" + (System.nanoTime() % 1000000))
                .passwordHash("$2a$10$dummyHashToSatisfyNotNullConstraints123456789012345678903")
                .emailVerified(true)
                .role(Role.CUSTOMER)
                .status(CustomerStatus.ACTIVE)
                .kycStatus(KycStatus.NONE)
                .build());
        CurrentAccount happyAccount = new CurrentAccount(happyUser.getId(), Role.CUSTOMER);

        UserDocumentDetailResponse happyDoc = documentService.submit(happyAccount, makeCommand("001095000006"));
        assertThat(happyDoc.verifyStatus()).isEqualTo(VerificationStatus.PENDING);

        // Admin approves happyDoc
        UserDocumentReviewResponse revHappy = documentService.review(adminAccount, happyDoc.id(), approveReq);
        assertThat(revHappy.document().verifyStatus()).isEqualTo(VerificationStatus.APPROVED);
        assertThat(revHappy.kycStatus()).isEqualTo(KycStatus.VERIFIED);

        Customer upgraded = customers.findById(happyUser.getId()).orElseThrow();
        assertThat(upgraded.getRole()).isEqualTo(Role.OWNER);
        assertThat(upgraded.getKycStatus()).isEqualTo(KycStatus.VERIFIED);
    }
}
