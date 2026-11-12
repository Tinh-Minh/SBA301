package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.carrental.dto.request.document.UserDocumentListQuery;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.UserDocumentSummaryResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.UserDocument;
import com.carrental.enums.DocumentType;
import com.carrental.enums.Role;
import com.carrental.enums.VerificationStatus;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.KycService;
import com.carrental.storage.PrivateDocumentStorage;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.util.ReflectionTestUtils;

class UserDocumentSummaryReasonTest {

    @Test
    @SuppressWarnings("unchecked")
    void mineListingIncludesRejectReasonAndVerifiedTimestamp() {
        Customer owner = Customer.builder().fullName("Test User").build();
        ReflectionTestUtils.setField(owner, "id", 12L);

        UserDocument rejected = new UserDocument();
        ReflectionTestUtils.setField(rejected, "id", 16L);
        rejected.setCustomer(owner);
        rejected.setDocType(DocumentType.CITIZEN_ID);
        rejected.setDocNumber("079099001234");
        rejected.setFrontImageUrl("private-local:a.png");
        rejected.setVerifyStatus(VerificationStatus.REJECTED);
        rejected.setRejectReason("Ảnh CCCD bị mờ góc phải");
        rejected.setVerifiedAt(LocalDateTime.of(2026, 11, 12, 10, 30));

        UserDocumentRepository documents = mock(UserDocumentRepository.class);
        when(documents.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(rejected), PageRequest.of(0, 20), 1));

        UserDocumentServiceImpl service = new UserDocumentServiceImpl(
                mock(CustomerRepository.class),
                documents,
                mock(PrivateDocumentStorage.class),
                mock(KycService.class),
                Clock.fixed(Instant.parse("2026-11-12T08:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh")));

        UserDocumentListQuery query = new UserDocumentListQuery(
                "mine", null, null, null, PageRequest.of(0, 20));
        PageResponse<UserDocumentSummaryResponse> page = service.list(
                new CurrentAccount(12L, Role.CUSTOMER), query);

        assertThat(page.content()).hasSize(1);
        UserDocumentSummaryResponse summary = page.content().get(0);
        assertThat(summary.verifyStatus()).isEqualTo(VerificationStatus.REJECTED);
        assertThat(summary.rejectReason()).isEqualTo("Ảnh CCCD bị mờ góc phải");
        assertThat(summary.verifiedAt()).isEqualTo(LocalDateTime.of(2026, 11, 12, 10, 30));
        assertThat(summary.docNumberMasked()).isEqualTo("********1234");
    }
}
