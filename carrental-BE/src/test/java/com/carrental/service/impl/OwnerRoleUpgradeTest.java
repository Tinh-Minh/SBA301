package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.customer.ChangeCustomerRoleRequest;
import com.carrental.dto.request.document.ReviewUserDocumentRequest;
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
import com.carrental.service.KycService;
import com.carrental.storage.PrivateDocumentStorage;
import jakarta.persistence.EntityManager;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.node.StringNode;

class OwnerRoleUpgradeTest {

    private static final Clock FIXED_CLOCK = Clock.fixed(
            Instant.parse("2026-11-11T08:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));

    @Test
    void approvingIdentityDocumentPromotesActiveCustomerToOwner() {
        CustomerRepository customers = mock(CustomerRepository.class);
        UserDocumentRepository documents = mock(UserDocumentRepository.class);
        PrivateDocumentStorage storage = mock(PrivateDocumentStorage.class);
        KycService kycService = mock(KycService.class);

        Customer admin = customer(1L, Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.VERIFIED);
        Customer customer = customer(20L, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.PENDING);
        UserDocument doc = pendingIdentityDocument(300L, customer);

        when(documents.findById(300L)).thenReturn(Optional.of(doc));
        when(customers.findWithLockById(20L)).thenReturn(Optional.of(customer));
        when(documents.findWithLockById(300L)).thenReturn(Optional.of(doc));
        when(customers.findById(1L)).thenReturn(Optional.of(admin));
        when(storage.isEnabled()).thenReturn(true);
        when(documents.existsByDocTypeAndDocNumberAndVerifyStatus(
                DocumentType.CITIZEN_ID, "079099000001", VerificationStatus.APPROVED)).thenReturn(false);
        when(kycService.currentStatus(20L, LocalDate.now(FIXED_CLOCK))).thenReturn(KycStatus.VERIFIED);

        UserDocumentServiceImpl service = new UserDocumentServiceImpl(
                customers, documents, storage, kycService, FIXED_CLOCK);
        ReviewUserDocumentRequest request = new ReviewUserDocumentRequest();
        request.setVerifyStatus(StringNode.valueOf("APPROVED"));

        var response = service.review(new CurrentAccount(1L, Role.ADMIN), 300L, request);

        assertThat(response.kycStatus()).isEqualTo(KycStatus.VERIFIED);
        assertThat(customer.getKycStatus()).isEqualTo(KycStatus.VERIFIED);
        assertThat(customer.getRole()).isEqualTo(Role.OWNER);
    }

    @Test
    void approvingNonIdentityDocumentWithoutVerifiedKycKeepsCustomerRole() {
        CustomerRepository customers = mock(CustomerRepository.class);
        UserDocumentRepository documents = mock(UserDocumentRepository.class);
        PrivateDocumentStorage storage = mock(PrivateDocumentStorage.class);
        KycService kycService = mock(KycService.class);

        Customer admin = customer(1L, Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.VERIFIED);
        Customer customer = customer(21L, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.PENDING);
        UserDocument doc = pendingIdentityDocument(301L, customer);
        doc.setDocType(DocumentType.DRIVER_LICENSE);
        doc.setLicenseClass("B2");
        doc.setExpiresAt(LocalDate.now(FIXED_CLOCK).plusYears(3));

        when(documents.findById(301L)).thenReturn(Optional.of(doc));
        when(customers.findWithLockById(21L)).thenReturn(Optional.of(customer));
        when(documents.findWithLockById(301L)).thenReturn(Optional.of(doc));
        when(customers.findById(1L)).thenReturn(Optional.of(admin));
        when(storage.isEnabled()).thenReturn(true);
        when(documents.existsByDocTypeAndDocNumberAndVerifyStatus(
                DocumentType.DRIVER_LICENSE, "079099000001", VerificationStatus.APPROVED)).thenReturn(false);
        when(kycService.currentStatus(21L, LocalDate.now(FIXED_CLOCK))).thenReturn(KycStatus.PENDING);

        UserDocumentServiceImpl service = new UserDocumentServiceImpl(
                customers, documents, storage, kycService, FIXED_CLOCK);
        ReviewUserDocumentRequest request = new ReviewUserDocumentRequest();
        request.setVerifyStatus(StringNode.valueOf("APPROVED"));

        var response = service.review(new CurrentAccount(1L, Role.ADMIN), 301L, request);

        assertThat(response.kycStatus()).isEqualTo(KycStatus.PENDING);
        assertThat(customer.getRole()).isEqualTo(Role.CUSTOMER);
    }

    @Test
    void changeCustomerRoleEnforcesKycVerificationAndAllowsAdminPromotionDemotion() {
        CustomerRepository customers = mock(CustomerRepository.class);
        Customer admin = customer(1L, Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.VERIFIED);
        Customer unverified = customer(10L, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        Customer verified = customer(11L, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.VERIFIED);

        when(customers.findById(1L)).thenReturn(Optional.of(admin));
        when(customers.findWithLockById(10L)).thenReturn(Optional.of(unverified));
        when(customers.findWithLockById(11L)).thenReturn(Optional.of(verified));

        CustomerServiceImpl service = new CustomerServiceImpl(
                customers, mock(EntityManager.class), new CustomerProperties(), FIXED_CLOCK);

        ChangeCustomerRoleRequest toOwner = new ChangeCustomerRoleRequest();
        toOwner.setRole(StringNode.valueOf("OWNER"));

        assertThatThrownBy(() -> service.changeCustomerRole(new CurrentAccount(1L, Role.ADMIN), 10L, toOwner))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).errorCode())
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        var promoted = service.changeCustomerRole(new CurrentAccount(1L, Role.ADMIN), 11L, toOwner);
        assertThat(promoted.role()).isEqualTo(Role.OWNER);

        ChangeCustomerRoleRequest toCustomer = new ChangeCustomerRoleRequest();
        toCustomer.setRole(StringNode.valueOf("CUSTOMER"));
        var demoted = service.changeCustomerRole(new CurrentAccount(1L, Role.ADMIN), 11L, toCustomer);
        assertThat(demoted.role()).isEqualTo(Role.CUSTOMER);
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

    private static UserDocument pendingIdentityDocument(long docId, Customer owner) {
        UserDocument doc = new UserDocument();
        ReflectionTestUtils.setField(doc, "id", docId);
        doc.setCustomer(owner);
        doc.setDocType(DocumentType.CITIZEN_ID);
        doc.setDocNumber("079099000001");
        doc.setFullNameOnDoc(owner.getFullName());
        doc.setDateOfBirthOnDoc(LocalDate.of(1995, 1, 1));
        doc.setIssuePlace("Cục Cảnh sát");
        doc.setIssueDate(LocalDate.of(2022, 1, 1));
        doc.setFrontImageUrl("private-local:front.png");
        doc.setBackImageUrl("private-local:back.png");
        doc.setVerifyStatus(VerificationStatus.PENDING);
        return doc;
    }
}

