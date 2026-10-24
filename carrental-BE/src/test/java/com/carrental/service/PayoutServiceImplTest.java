package com.carrental.service;

import com.carrental.dto.request.CreatePayoutRequest;
import com.carrental.dto.request.ProcessPayoutRequest;
import com.carrental.dto.response.PayoutResponse;
import com.carrental.entity.BankAccount;
import com.carrental.entity.Customer;
import com.carrental.entity.Payout;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.PayoutStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.BankAccountRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.PayoutRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.service.impl.PayoutServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayoutServiceImplTest {

    @Mock
    private PayoutRepository payoutRepository;

    @Mock
    private RentalOrderRepository rentalOrderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private BankAccountRepository bankAccountRepository;

    @Mock
    private OrderAccess orderAccess;

    @InjectMocks
    private PayoutServiceImpl payoutService;

    private Customer owner;
    private RentalOrder order;
    private BankAccount defaultBankAccount;

    @BeforeEach
    void setUp() {
        owner = new Customer();
        owner.setId(8L);
        owner.setFullName("Tran Van ChuXe");

        order = new RentalOrder();
        order.setId(22L);
        order.setOrderCode("ORD-20261024-001");

        defaultBankAccount = BankAccount.builder()
                .id(5L)
                .bankName("Vietcombank")
                .accountNumber("0071000888999")
                .accountHolder("TRAN VAN CHUXE")
                .customer(owner)
                .isDefault(true)
                .build();
    }

    @Test
    void createPayout_autoResolvesDefaultBankAccount_whenBankAccountIdIsNull() {
        CreatePayoutRequest request = new CreatePayoutRequest();
        request.setOrderId(22L);
        request.setRecipientId(8L);
        request.setGrossAmount(BigDecimal.valueOf(3900000));
        request.setPlatformFee(BigDecimal.valueOf(390000));
        request.setNetAmount(BigDecimal.valueOf(3510000));

        when(rentalOrderRepository.findById(22L)).thenReturn(Optional.of(order));
        when(customerRepository.findById(8L)).thenReturn(Optional.of(owner));
        when(bankAccountRepository.findByCustomer_IdAndIsDefaultTrue(8L)).thenReturn(Optional.of(defaultBankAccount));
        when(payoutRepository.save(any(Payout.class))).thenAnswer(invocation -> {
            Payout p = invocation.getArgument(0);
            p.setId(100L);
            return p;
        });

        PayoutResponse response = payoutService.createPayout(request);

        assertThat(response).isNotNull();
        assertThat(response.bankAccountId()).isEqualTo(5L);
        assertThat(response.bankName()).isEqualTo("Vietcombank");
        assertThat(response.accountNumber()).isEqualTo("0071000888999");
        assertThat(response.status()).isEqualTo("PENDING");
    }

    @Test
    void processPayout_autoLinksBankAccountAndMarksPaid_whenBankAccountWasNull() {
        Payout existingPayout = Payout.builder()
                .order(order)
                .recipient(owner)
                .bankAccount(null) // originally null
                .grossAmount(BigDecimal.valueOf(3900000))
                .platformFee(BigDecimal.valueOf(390000))
                .netAmount(BigDecimal.valueOf(3510000))
                .status(PayoutStatus.PENDING)
                .build();
        existingPayout.setId(22L);

        when(payoutRepository.findById(22L)).thenReturn(Optional.of(existingPayout));
        when(bankAccountRepository.findByCustomer_IdAndIsDefaultTrue(8L)).thenReturn(Optional.of(defaultBankAccount));
        when(payoutRepository.save(any(Payout.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProcessPayoutRequest request = new ProcessPayoutRequest();
        request.setStatus("PAID");
        request.setNote("12");

        PayoutResponse response = payoutService.processPayout(22L, request);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo("PAID");
        assertThat(response.bankAccountId()).isEqualTo(5L);
        assertThat(response.bankName()).isEqualTo("Vietcombank");
        assertThat(response.note()).isEqualTo("12");
        assertThat(response.paidAt()).isNotNull();
    }

    @Test
    void processPayout_throwsBadRequest_whenNoBankAccountAvailableForPaidStatus() {
        Payout existingPayout = Payout.builder()
                .order(order)
                .recipient(owner)
                .bankAccount(null)
                .grossAmount(BigDecimal.valueOf(3900000))
                .platformFee(BigDecimal.valueOf(390000))
                .netAmount(BigDecimal.valueOf(3510000))
                .status(PayoutStatus.PENDING)
                .build();
        existingPayout.setId(22L);

        when(payoutRepository.findById(22L)).thenReturn(Optional.of(existingPayout));
        when(bankAccountRepository.findByCustomer_IdAndIsDefaultTrue(8L)).thenReturn(Optional.empty());
        when(bankAccountRepository.findAllByCustomer_IdOrderByCreatedAtDesc(8L)).thenReturn(Collections.emptyList());

        ProcessPayoutRequest request = new ProcessPayoutRequest();
        request.setStatus("PAID");
        request.setNote("12");

        assertThatThrownBy(() -> payoutService.processPayout(22L, request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException ae = (AppException) ex;
                    assertThat(ae.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(ae.getMessage()).contains("Chủ xe chưa có tài khoản ngân hàng");
                });

        verify(payoutRepository, never()).save(any());
    }
}
