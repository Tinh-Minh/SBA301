package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.voucher.CreateVoucherRequest;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.ActionLogService;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class VoucherServiceImplTest {

    private static final long ADMIN_ID = 41L;

    private final VoucherRepository vouchers = mock(VoucherRepository.class);
    private final CustomerRepository customers = mock(CustomerRepository.class);
    private final ActionLogService actionLogs = mock(ActionLogService.class);
    private VoucherServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new VoucherServiceImpl(vouchers, customers, actionLogs, new CustomerProperties(),
                Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC));
        Customer admin = new Customer();
        admin.setId(ADMIN_ID);
        admin.setRole(Role.ADMIN);
        admin.setStatus(CustomerStatus.ACTIVE);
        when(customers.findById(ADMIN_ID)).thenReturn(Optional.of(admin));
    }

    @Test
    void createRejectsCodeAlreadyUsedWithDifferentLetterCase() {
        CreateVoucherRequest request = new CreateVoucherRequest();
        request.setCode("SpringDeal2026");
        request.setDiscountType(DiscountType.FIXED);
        request.setDiscountValue(BigDecimal.TEN);
        request.setStartAt(LocalDateTime.of(2026, 1, 1, 0, 0));
        request.setEndAt(LocalDateTime.of(2026, 1, 2, 0, 0));
        when(vouchers.existsByCodeIgnoreCase("SpringDeal2026")).thenReturn(true);

        assertThatThrownBy(() -> service.create(new CurrentAccount(ADMIN_ID, Role.ADMIN), request))
                .isInstanceOfSatisfying(AppException.class,
                        exception -> assertThat(exception.errorCode()).isEqualTo(ErrorCode.VOUCHER_CODE_ALREADY_EXISTS));

        verify(vouchers).existsByCodeIgnoreCase("SpringDeal2026");
        verify(vouchers, never()).saveAndFlush(org.mockito.ArgumentMatchers.any());
    }
}
