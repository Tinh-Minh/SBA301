package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.carrental.dto.request.document.ReviewUserDocumentRequest;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.UserDocument;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DocumentType;
import com.carrental.enums.Role;
import com.carrental.enums.VerificationStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.KycService;
import com.carrental.storage.PrivateDocumentStorage;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class UserDocumentPrerequisitesTest {

    private CustomerRepository customers;
    private UserDocumentRepository documents;
    private PrivateDocumentStorage storage;
    private KycService kycService;
    private UserDocumentServiceImpl service;
    private LocalDate today;
    private Customer admin;
    private Customer owner;

    @BeforeEach
    void setUp() {
        today = LocalDate.of(2026, 11, 13);
        Clock clock = Clock.fixed(Instant.parse("2026-11-13T06:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));

        customers = mock(CustomerRepository.class);
        documents = mock(UserDocumentRepository.class);
        storage = mock(PrivateDocumentStorage.class);
        kycService = mock(KycService.class);

        service = new UserDocumentServiceImpl(customers, documents, storage, kycService, clock);

        admin = Customer.builder().role(Role.ADMIN).status(CustomerStatus.ACTIVE).build();
        ReflectionTestUtils.setField(admin, "id", 1L);

        owner = Customer.builder().role(Role.CUSTOMER).status(CustomerStatus.ACTIVE).build();
        ReflectionTestUtils.setField(owner, "id", 10L);

        when(customers.findById(1L)).thenReturn(Optional.of(admin));
        when(customers.findWithLockById(10L)).thenReturn(Optional.of(owner));
    }

    private void mockDoc(UserDocument doc) {
        when(documents.findById(100L)).thenReturn(Optional.of(doc));
        when(documents.findWithLockById(100L)).thenReturn(Optional.of(doc));
    }

    private UserDocument validCccd() {
        UserDocument doc = new UserDocument();
        ReflectionTestUtils.setField(doc, "id", 100L);
        doc.setCustomer(owner);
        doc.setDocType(DocumentType.CITIZEN_ID);
        doc.setDocNumber("079099001234");
        doc.setFullNameOnDoc("NGUYEN VAN A");
        doc.setDateOfBirthOnDoc(LocalDate.of(1995, 5, 20));
        doc.setIssuePlace("Cuc Canh sat QLHC ve TTXH");
        doc.setIssueDate(LocalDate.of(2021, 6, 15));
        doc.setExpiresAt(LocalDate.of(2035, 5, 20));
        doc.setFrontImageUrl("private-local:front.jpg");
        doc.setBackImageUrl("private-local:back.jpg");
        doc.setVerifyStatus(VerificationStatus.PENDING);
        return doc;
    }

    private ReviewUserDocumentRequest approveRequest() {
        ReviewUserDocumentRequest req = new ReviewUserDocumentRequest();
        req.setVerifyStatus(tools.jackson.databind.node.JsonNodeFactory.instance.textNode("APPROVED"));
        return req;
    }

    @Test
    @DisplayName("Duyệt thất bại khi họ tên trên giấy tờ bị để trống: nêu rõ họ tên không được để trống")
    void missingFullNameFailsWithDetailedMessage() {
        UserDocument doc = validCccd();
        doc.setFullNameOnDoc("   ");
        mockDoc(doc);

        assertThatThrownBy(() -> service.review(new CurrentAccount(1L, Role.ADMIN), 100L, approveRequest()))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException e = (AppException) ex;
                    assertThat(e.errorCode()).isEqualTo(ErrorCode.DOCUMENT_NOT_APPROVABLE);
                    assertThat(e.getMessage()).contains("Họ và tên trên giấy tờ không được để trống");
                    assertThat(e.fieldErrors()).extracting(FieldErrorResponse::field).contains("fullNameOnDoc");
                });
    }

    @Test
    @DisplayName("Duyệt thất bại khi ngày sinh ở tương lai: nêu rõ ngày sinh và giá trị cụ thể")
    void futureDateOfBirthFailsWithDetailedMessage() {
        UserDocument doc = validCccd();
        doc.setDateOfBirthOnDoc(today.plusDays(1));
        mockDoc(doc);

        assertThatThrownBy(() -> service.review(new CurrentAccount(1L, Role.ADMIN), 100L, approveRequest()))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException e = (AppException) ex;
                    assertThat(e.errorCode()).isEqualTo(ErrorCode.DOCUMENT_NOT_APPROVABLE);
                    assertThat(e.getMessage()).contains("Ngày sinh (2026-11-14) không được ở tương lai");
                    assertThat(e.fieldErrors()).extracting(FieldErrorResponse::field).contains("dateOfBirthOnDoc");
                });
    }

    @Test
    @DisplayName("Duyệt thất bại khi ngày cấp ở tương lai: nêu rõ ngày cấp và giá trị cụ thể")
    void futureIssueDateFailsWithDetailedMessage() {
        UserDocument doc = validCccd();
        doc.setIssueDate(today.plusMonths(1));
        mockDoc(doc);

        assertThatThrownBy(() -> service.review(new CurrentAccount(1L, Role.ADMIN), 100L, approveRequest()))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException e = (AppException) ex;
                    assertThat(e.errorCode()).isEqualTo(ErrorCode.DOCUMENT_NOT_APPROVABLE);
                    assertThat(e.getMessage()).contains("Ngày cấp (2026-12-13) không được ở tương lai");
                    assertThat(e.fieldErrors()).extracting(FieldErrorResponse::field).contains("issueDate");
                });
    }

    @Test
    @DisplayName("Duyệt thất bại khi giấy tờ đã hết hạn: nêu rõ giấy tờ đã hết hạn sử dụng")
    void expiredDocumentFailsWithDetailedMessage() {
        UserDocument doc = validCccd();
        doc.setExpiresAt(today.minusDays(1));
        mockDoc(doc);

        assertThatThrownBy(() -> service.review(new CurrentAccount(1L, Role.ADMIN), 100L, approveRequest()))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException e = (AppException) ex;
                    assertThat(e.errorCode()).isEqualTo(ErrorCode.DOCUMENT_NOT_APPROVABLE);
                    assertThat(e.getMessage()).contains("Giấy tờ đã hết hạn sử dụng");
                    assertThat(e.fieldErrors()).extracting(FieldErrorResponse::field).contains("expiresAt");
                });
    }

    @Test
    @DisplayName("Duyệt thất bại khi ngày hết hạn nhỏ hơn ngày cấp: nêu rõ ngày hết hạn phải sau ngày cấp")
    void expiryBeforeIssueDateFailsWithDetailedMessage() {
        UserDocument doc = validCccd();
        doc.setIssueDate(LocalDate.of(2022, 1, 1));
        doc.setExpiresAt(LocalDate.of(2021, 1, 1));
        mockDoc(doc);

        assertThatThrownBy(() -> service.review(new CurrentAccount(1L, Role.ADMIN), 100L, approveRequest()))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException e = (AppException) ex;
                    assertThat(e.errorCode()).isEqualTo(ErrorCode.DOCUMENT_NOT_APPROVABLE);
                    assertThat(e.getMessage()).contains("Ngày hết hạn (2021-01-01) phải sau hoặc bằng ngày cấp (2022-01-01)");
                    assertThat(e.fieldErrors()).extracting(FieldErrorResponse::field).contains("expiresAt");
                });
    }

    @Test
    @DisplayName("Duyệt thất bại khi thiếu ảnh mặt sau CCCD: nêu rõ thiếu ảnh mặt sau")
    void missingBackImageFailsWithDetailedMessage() {
        UserDocument doc = validCccd();
        doc.setBackImageUrl(null);
        mockDoc(doc);

        assertThatThrownBy(() -> service.review(new CurrentAccount(1L, Role.ADMIN), 100L, approveRequest()))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException e = (AppException) ex;
                    assertThat(e.errorCode()).isEqualTo(ErrorCode.DOCUMENT_NOT_APPROVABLE);
                    assertThat(e.getMessage()).contains("Thiếu ảnh chụp mặt sau giấy tờ");
                    assertThat(e.fieldErrors()).extracting(FieldErrorResponse::field).contains("backImage");
                });
    }
}
