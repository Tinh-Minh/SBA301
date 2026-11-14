package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.carrental.entity.Customer;
import com.carrental.entity.ListingPackage;
import com.carrental.entity.Voucher;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.Role;
import com.carrental.enums.VoucherStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.ListingPackageRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.security.CurrentAccount;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class VoucherCatalogServiceImplTest {

    private static final long CUSTOMER_ID = 71L;
    private static final long PACKAGE_ID = 25L;
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 7, 1, 0, 0);

    private final VoucherRepository vouchers = mock(VoucherRepository.class);
    private final ListingPackageRepository packages = mock(ListingPackageRepository.class);
    private final CustomerRepository customers = mock(CustomerRepository.class);
    private final CarSubscriptionRepository subscriptions = mock(CarSubscriptionRepository.class);
    private VoucherCatalogServiceImpl service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC);
        service = new VoucherCatalogServiceImpl(vouchers, packages, customers, subscriptions, clock);
        Customer customer = new Customer();
        customer.setId(CUSTOMER_ID);
        customer.setRole(Role.CUSTOMER);
        customer.setStatus(CustomerStatus.ACTIVE);
        when(customers.findById(CUSTOMER_ID)).thenReturn(Optional.of(customer));
        ListingPackage listingPackage = ListingPackage.builder().id(PACKAGE_ID).price(new BigDecimal("50000"))
                .isActive(true).build();
        when(packages.findById(PACKAGE_ID)).thenReturn(Optional.of(listingPackage));
    }

    @Test
    void listsOnlyActiveWindowPriceEligibleGloballyAndPerUserEligibleVouchers() {
        Voucher eligible = voucher(101L, "OK", 2);
        Voucher atPerUserLimit = voucher(102L, "USED", 1);
        var eligibleUsage = usage(101L, 1L);
        var fullUsage = usage(102L, 1L);
        when(vouchers.findAvailableForPackage(VoucherStatus.ACTIVE, NOW, new BigDecimal("50000")))
                .thenReturn(List.of(eligible, atPerUserLimit));
        when(subscriptions.countVoucherUsesByCustomerIdAndVoucherIds(eq(CUSTOMER_ID), anyCollection(),
                eq(com.carrental.enums.SubscriptionStatus.CANCELLED), eq(com.carrental.enums.PaymentStatus.REFUNDED)))
                .thenReturn(List.of(eligibleUsage, fullUsage));

        var response = service.listAvailableForPackage(new CurrentAccount(CUSTOMER_ID, Role.CUSTOMER), PACKAGE_ID);

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().code()).isEqualTo("OK");
        assertThat(response.getFirst().toString()).doesNotContain("usedCount", "usageLimit", "perUserLimit");
        verify(vouchers).findAvailableForPackage(VoucherStatus.ACTIVE, NOW, new BigDecimal("50000"));
        verify(subscriptions).countVoucherUsesByCustomerIdAndVoucherIds(eq(CUSTOMER_ID), anyCollection(),
                eq(com.carrental.enums.SubscriptionStatus.CANCELLED), eq(com.carrental.enums.PaymentStatus.REFUNDED));
    }

    @Test
    void skipsPerUserUsageQueryWhenNoGloballyEligibleCandidatesExist() {
        when(vouchers.findAvailableForPackage(VoucherStatus.ACTIVE, NOW, new BigDecimal("50000")))
                .thenReturn(List.of());

        assertThat(service.listAvailableForPackage(new CurrentAccount(CUSTOMER_ID, Role.CUSTOMER), PACKAGE_ID))
                .isEmpty();

        verify(subscriptions, never()).countVoucherUsesByCustomerIdAndVoucherIds(eq(CUSTOMER_ID), anyCollection(),
                eq(com.carrental.enums.SubscriptionStatus.CANCELLED), eq(com.carrental.enums.PaymentStatus.REFUNDED));
    }

    @Test
    void rejectsInactivePackageAndNeverQueriesVoucherCatalog() {
        when(packages.findById(PACKAGE_ID)).thenReturn(Optional.of(
                ListingPackage.builder().id(PACKAGE_ID).price(BigDecimal.TEN).isActive(false).build()));

        assertThatThrownBy(() -> service.listAvailableForPackage(
                new CurrentAccount(CUSTOMER_ID, Role.CUSTOMER), PACKAGE_ID))
                .isInstanceOfSatisfying(AppException.class,
                        exception -> assertThat(exception.errorCode()).isEqualTo(ErrorCode.RESOURCE_NOT_FOUND));

        verify(vouchers, never()).findAvailableForPackage(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    private static Voucher voucher(long id, String code, int perUserLimit) {
        Voucher voucher = Voucher.builder().code(code).description("synthetic")
                .discountType(DiscountType.FIXED).discountValue(BigDecimal.TEN)
                .minOrderAmount(BigDecimal.ZERO).startAt(NOW.minusDays(1)).endAt(NOW.plusDays(1))
                .perUserLimit(perUserLimit).usedCount(0).status(VoucherStatus.ACTIVE).build();
        voucher.setId(id);
        return voucher;
    }

    private static CarSubscriptionRepository.VoucherUsageCount usage(long voucherId, long count) {
        CarSubscriptionRepository.VoucherUsageCount result = mock(CarSubscriptionRepository.VoucherUsageCount.class);
        when(result.getVoucherId()).thenReturn(voucherId);
        when(result.getUsageCount()).thenReturn(count);
        return result;
    }
}
