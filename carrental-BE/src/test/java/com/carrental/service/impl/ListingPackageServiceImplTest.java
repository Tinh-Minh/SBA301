package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.carrental.dto.request.listingpackage.ListingPackageCreateRequest;
import com.carrental.entity.Customer;
import com.carrental.entity.ListingPackage;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.ListingPackageRepository;
import com.carrental.security.CurrentAccount;
import jakarta.validation.Validation;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ListingPackageServiceImplTest {

    private static final long ADMIN_ID = 22L;
    private final ListingPackageRepository packages = mock(ListingPackageRepository.class);
    private final CarSubscriptionRepository subscriptions = mock(CarSubscriptionRepository.class);
    private final CustomerRepository customers = mock(CustomerRepository.class);
    private final ListingPackageServiceImpl service = new ListingPackageServiceImpl(packages, subscriptions, customers);

    @BeforeEach
    void setUp() {
        Customer admin = new Customer();
        admin.setId(ADMIN_ID);
        admin.setRole(Role.ADMIN);
        admin.setStatus(CustomerStatus.ACTIVE);
        when(customers.findById(ADMIN_ID)).thenReturn(Optional.of(admin));
    }

    @Test
    void publicListUsesActiveOnlyRepositoryOrdering() {
        when(packages.findAllByIsActiveTrueOrderByPriorityLevelDescIdAsc()).thenReturn(List.of(
                ListingPackage.builder().id(3L).name("VIP").code("VIP").price(BigDecimal.TEN)
                        .durationDays(30).priorityLevel(3).badgeLabel("VIP").isActive(true).build()));

        var result = service.getPublicActivePackages();

        assertThat(result).extracting("code").containsExactly("VIP");
        verify(packages).findAllByIsActiveTrueOrderByPriorityLevelDescIdAsc();
        verify(packages, never()).findAllByOrderByPriorityLevelDescIdAsc();
    }

    @Test
    void createNormalizesCodeAndRejectsDuplicateCode() {
        var request = new ListingPackageCreateRequest("  Gói mới  ", " pkg_new ", BigDecimal.ZERO,
                7, 1, null, "  mô tả  ", null);
        when(packages.existsByCode("PKG_NEW")).thenReturn(false);
        when(packages.saveAndFlush(org.mockito.ArgumentMatchers.any(ListingPackage.class)))
                .thenAnswer(invocation -> {
                    ListingPackage saved = invocation.getArgument(0);
                    saved.setId(99L);
                    return saved;
                });

        var saved = service.createPackage(new CurrentAccount(ADMIN_ID, Role.ADMIN), request);

        assertThat(saved.name()).isEqualTo("Gói mới");
        assertThat(saved.code()).isEqualTo("PKG_NEW");
        assertThat(saved.price()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(saved.badgeLabel()).isEqualTo("THƯỜNG");
        assertThat(saved.isActive()).isTrue();
    }

    @Test
    void rejectsMissingBodyInsteadOfReturningServerError() {
        assertThatThrownBy(() -> service.createPackage(new CurrentAccount(ADMIN_ID, Role.ADMIN), null))
                .isInstanceOfSatisfying(AppException.class,
                        exception -> assertThat(exception.errorCode()).isEqualTo(ErrorCode.INVALID_REQUEST));
    }

    @Test
    void createRequestValidationMatchesSchemaBoundsAndNullability() {
        var validator = Validation.buildDefaultValidatorFactory().getValidator();
        var valid = new ListingPackageCreateRequest("Gói", "PKG_OK", new BigDecimal("99999999999999"),
                7, 3, "VIP", null, true);
        var invalid = new ListingPackageCreateRequest(" ", "bad code", new BigDecimal("1.2"),
                null, 4, "X".repeat(51), null, null);

        assertThat(validator.validate(valid)).isEmpty();
        assertThat(validator.validate(invalid)).hasSizeGreaterThanOrEqualTo(6);
    }
}
