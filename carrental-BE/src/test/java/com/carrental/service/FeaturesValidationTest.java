package com.carrental.service;

import com.carrental.dto.request.CreateDepositRequest;
import com.carrental.dto.request.CreateDisputeRequest;
import com.carrental.dto.request.CreatePaymentRequest;
import com.carrental.dto.request.CreatePayoutRequest;
import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.request.PayExtraFeeRequest;
import com.carrental.dto.request.RefundRequest;
import com.carrental.dto.request.ResolveDisputeRequest;
import com.carrental.dto.response.DisputeResponse;
import com.carrental.dto.response.ExtraFeeResponse;
import com.carrental.dto.response.PayoutResponse;
import com.carrental.dto.response.ReviewResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.entity.Dispute;
import com.carrental.entity.ExtraFee;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Review;
import com.carrental.entity.Transaction;
import com.carrental.enums.ExtraFeeStatus;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.PayoutStatus;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.exception.AppException;
import com.carrental.repository.BankAccountRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.DisputeEvidenceRepository;
import com.carrental.repository.DisputeRepository;
import com.carrental.repository.ExtraFeeRepository;
import com.carrental.repository.PayoutRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.ReviewRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.service.impl.DisputeServiceImpl;
import com.carrental.service.impl.ExtraFeeServiceImpl;
import com.carrental.service.impl.PayoutServiceImpl;
import com.carrental.service.impl.ReviewServiceImpl;
import com.carrental.service.impl.TransactionServiceImpl;
import com.carrental.util.OrderAccess;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeaturesValidationTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private RentalOrderRepository rentalOrderRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private BankAccountRepository bankAccountRepository;
    @Mock private PayoutRepository payoutRepository;
    @Mock private ExtraFeeRepository extraFeeRepository;
    @Mock private DisputeRepository disputeRepository;
    @Mock private DisputeEvidenceRepository disputeEvidenceRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private VNPayService vnPayService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private OrderAccess orderAccess;

    private TransactionServiceImpl transactionService;
    private PayoutServiceImpl payoutService;
    private ExtraFeeServiceImpl extraFeeService;
    private DisputeServiceImpl disputeService;
    private ReviewServiceImpl reviewService;

    private Customer renter;
    private Customer owner;
    private Car car;
    private RentalOrder order;

    @BeforeEach
    void setUp() {
        transactionService = new TransactionServiceImpl(
                transactionRepository, rentalOrderRepository, vnPayService, eventPublisher, orderAccess);

        payoutService = new PayoutServiceImpl(
                payoutRepository, rentalOrderRepository, customerRepository, bankAccountRepository, orderAccess);

        extraFeeService = new ExtraFeeServiceImpl(
                extraFeeRepository, rentalOrderRepository, transactionRepository,
                customerRepository, vnPayService, orderAccess);

        disputeService = new DisputeServiceImpl(
                disputeRepository, disputeEvidenceRepository, rentalOrderRepository,
                customerRepository, extraFeeRepository, transactionRepository, transactionService, orderAccess);

        reviewService = new ReviewServiceImpl(
                reviewRepository, rentalOrderRepository, customerRepository, orderAccess);

        renter = Customer.builder().fullName("Nguyễn Văn Thuê").build();
        renter.setId(10L);

        owner = Customer.builder().fullName("Trần Thị Chủ").build();
        owner.setId(20L);

        car = Car.builder().owner(owner).brand("Toyota").model("Vios").build();
        car.setId(100L);

        order = RentalOrder.builder()
                .customer(renter)
                .car(car)
                .status(OrderStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.UNPAID)
                .depositAmount(new BigDecimal("500000"))
                .totalAmount(new BigDecimal("2000000"))
                .commissionRate(new BigDecimal("10.00"))
                .build();
        order.setId(1L);
    }

    // ==========================================
    // 1. TRANSACTION FEATURE TESTS
    // ==========================================

    @Test
    @DisplayName("Transaction: createDeposit derives amount strictly from order.getDepositAmount()")
    void testCreateDepositAmountDerivedFromDb() {
        CreateDepositRequest request = new CreateDepositRequest();
        request.setOrderId(1L);
        request.setAmount(new BigDecimal("1")); // Client tries to pay 1 VND

        when(rentalOrderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> {
            Transaction t = i.getArgument(0);
            t.setId(101L);
            return t;
        });

        TransactionResponse response = transactionService.createDeposit(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("500000"), response.amount(), "Số tiền cọc phải lấy 500.000 từ DB, bỏ qua 1đ từ client");
    }

    @Test
    @DisplayName("Transaction: createPayment rejects if order status is not CONFIRMED")
    void testCreatePaymentRejectsIfNotConfirmed() {
        order.setStatus(OrderStatus.PENDING);
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setOrderId(1L);

        when(rentalOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        AppException ex = assertThrows(AppException.class, () -> transactionService.createPayment(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Chỉ có thể thanh toán cho đơn đã được chủ xe xác nhận"));
    }

    @Test
    @DisplayName("Transaction: refund prevents refunding on a REFUND transaction")
    void testRefundRejectsOnRefundTransaction() {
        Transaction refundTx = Transaction.builder()
                .transactionType(TransactionType.REFUND)
                .status(TransactionStatus.SUCCESS)
                .build();
        refundTx.setId(50L);

        when(transactionRepository.findById(50L)).thenReturn(Optional.of(refundTx));

        RefundRequest request = RefundRequest.of(50L, new BigDecimal("100000"), "test");
        AppException ex = assertThrows(AppException.class, () -> transactionService.refund(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Không thể hoàn tiền cho giao dịch loại hoàn tiền"));
    }

    @Test
    @DisplayName("Transaction: partial refund does not mark order as REFUNDED until 100% refunded")
    void testPartialRefundDoesNotMarkOrderRefunded() {
        Transaction parentTx = Transaction.builder()
                .order(order)
                .transactionType(TransactionType.RENTAL_PAYMENT)
                .status(TransactionStatus.SUCCESS)
                .amount(new BigDecimal("1000000"))
                .build();
        parentTx.setId(60L);

        when(transactionRepository.findById(60L)).thenReturn(Optional.of(parentTx));
        when(transactionRepository.findByRefundOfId(60L)).thenReturn(Collections.emptyList());
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> {
            Transaction t = i.getArgument(0);
            t.setId(61L);
            return t;
        });

        RefundRequest request = RefundRequest.of(60L, new BigDecimal("300000"), "Hoàn một phần");
        transactionService.refund(request);

        assertNotEquals(PaymentStatus.REFUNDED, order.getPaymentStatus(), "Hoàn 300k/1tr không được đánh dấu đơn REFUNDED");
        verify(rentalOrderRepository, never()).save(order);
    }

    // ==========================================
    // 2. PAYOUT FEATURE TESTS
    // ==========================================

    @Test
    @DisplayName("Payout: calculates gross, fee, net strictly from order totalAmount and commissionRate")
    void testCreatePayoutCalculatesFromDb() {
        order.setStatus(OrderStatus.COMPLETED); // COMPLETED
        order.setTotalAmount(new BigDecimal("1000000"));
        order.setCommissionRate(new BigDecimal("10.00")); // 10%

        CreatePayoutRequest request = new CreatePayoutRequest();
        request.setOrderId(1L);

        when(rentalOrderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(payoutRepository.findByOrderId(1L)).thenReturn(Optional.empty());
        when(bankAccountRepository.findByCustomerIdAndIsDefaultTrue(owner.getId())).thenReturn(Optional.empty());
        when(bankAccountRepository.findAllByCustomerIdOrderByCreatedAtDesc(owner.getId())).thenReturn(Collections.emptyList());
        when(payoutRepository.save(any())).thenAnswer(i -> {
            com.carrental.entity.Payout p = i.getArgument(0);
            p.setId(201L);
            return p;
        });

        PayoutResponse response = payoutService.createPayout(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("1000000"), response.grossAmount());
        assertEquals(new BigDecimal("100000"), response.platformFee(), "Phí sàn 10% của 1.000.000 phải là 100.000");
        assertEquals(new BigDecimal("900000"), response.netAmount(), "Thực nhận phải là 900.000");
    }

    @Test
    @DisplayName("Payout: rejects if order is not COMPLETED")
    void testCreatePayoutRejectsIfNotCompleted() {
        order.setStatus(OrderStatus.CONFIRMED);
        CreatePayoutRequest request = new CreatePayoutRequest();
        request.setOrderId(1L);

        when(rentalOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        AppException ex = assertThrows(AppException.class, () -> payoutService.createPayout(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Chỉ có thể tạo chi trả cho đơn thuê đã hoàn thành"));
    }

    // ==========================================
    // 3. EXTRA FEE FEATURE TESTS
    // ==========================================

    @Test
    @DisplayName("ExtraFee: CASH payment requires car owner confirmation")
    void testPayExtraFeeCashRequiresOwner() {
        ExtraFee fee = ExtraFee.builder()
                .order(order)
                .amount(new BigDecimal("150000"))
                .status(ExtraFeeStatus.PENDING)
                .build();
        fee.setId(301L);

        when(extraFeeRepository.findById(301L)).thenReturn(Optional.of(fee));
        when(extraFeeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        PayExtraFeeRequest req = new PayExtraFeeRequest();
        req.setMethod("DIRECT"); // CASH

        ExtraFeeResponse response = extraFeeService.payExtraFee(301L, req);

        verify(orderAccess).requireOwner(order);
        assertEquals("PAID", response.status());
    }

    // ==========================================
    // 4. DISPUTE FEATURE TESTS
    // ==========================================

    @Test
    @DisplayName("Dispute: resolveDispute with RESOLVED triggers automatic refund")
    void testResolveDisputeTriggersRefund() {
        Dispute dispute = Dispute.builder()
                .order(order)
                .raisedBy(renter)
                .status(com.carrental.enums.DisputeStatus.OPEN)
                .build();
        dispute.setId(401L);

        Transaction successTx = Transaction.builder()
                .order(order)
                .transactionType(TransactionType.RENTAL_PAYMENT)
                .status(TransactionStatus.SUCCESS)
                .amount(new BigDecimal("2000000"))
                .build();
        successTx.setId(402L);

        when(disputeRepository.findById(401L)).thenReturn(Optional.of(dispute));
        when(orderAccess.requireUser()).thenReturn(owner);
        when(disputeRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(transactionRepository.findByOrderId(order.getId())).thenReturn(List.of(successTx));
        when(transactionRepository.findById(402L)).thenReturn(Optional.of(successTx));
        when(transactionRepository.findByRefundOfId(402L)).thenReturn(Collections.emptyList());
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

        ResolveDisputeRequest req = new ResolveDisputeRequest();
        req.setStatus("RESOLVED");
        req.setApprovedAmount(new BigDecimal("200000"));
        req.setResolutionNote("Đồng ý hoàn 200k");

        DisputeResponse response = disputeService.resolveDispute(401L, req);

        assertNotNull(response);
        verify(transactionRepository, atLeastOnce()).save(any(Transaction.class));
    }

    // ==========================================
    // 5. REVIEW FEATURE TESTS
    // ==========================================

    @Test
    @DisplayName("Review: createReview validates reviewee is the opposite party")
    void testCreateReviewValidatesOppositeParty() {
        order.setStatus(OrderStatus.COMPLETED);

        when(rentalOrderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderAccess.requireUser()).thenReturn(renter);
        when(orderAccess.isRenter(order, renter)).thenReturn(true);
        when(customerRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(reviewRepository.existsByOrderIdAndReviewerId(1L, renter.getId())).thenReturn(false);
        when(reviewRepository.save(any())).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(501L);
            return r;
        });

        CreateReviewRequest request = new CreateReviewRequest();
        request.setOrderId(1L);
        request.setRevieweeId(owner.getId()); // đúng chủ xe
        request.setRating(5);
        request.setComment("Xe chạy rất êm, chủ xe nhiệt tình!");

        ReviewResponse response = reviewService.createReview(request);

        assertNotNull(response);
        assertEquals(5, response.rating());
        assertEquals("Xe chạy rất êm, chủ xe nhiệt tình!", response.comment());
    }

    @Test
    @DisplayName("Review: createReview rejects self review")
    void testCreateReviewRejectsSelfReview() {
        order.setStatus(OrderStatus.COMPLETED);

        // Trường hợp hy hữu người thuê tự review chính mình
        when(rentalOrderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderAccess.requireUser()).thenReturn(renter);
        when(orderAccess.isRenter(order, renter)).thenReturn(true);

        CreateReviewRequest request = new CreateReviewRequest();
        request.setOrderId(1L);
        request.setRevieweeId(renter.getId()); // Cố tình truyền người nhận là chính mình

        AppException ex = assertThrows(AppException.class, () -> reviewService.createReview(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Người được đánh giá phải là bên còn lại của đơn"));
    }
}
