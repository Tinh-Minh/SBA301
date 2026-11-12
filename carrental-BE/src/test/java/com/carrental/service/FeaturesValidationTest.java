package com.carrental.service;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.request.PackagePaymentRequest;
import com.carrental.dto.response.CarReviewSummaryResponse;
import com.carrental.dto.response.RevenueDashboardResponse;
import com.carrental.dto.response.ReviewResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.*;
import com.carrental.enums.*;
import com.carrental.event.PaymentCompletedEvent;
import com.carrental.exception.AppException;
import com.carrental.repository.*;
import com.carrental.service.impl.DashboardServiceImpl;
import com.carrental.service.impl.ReviewServiceImpl;
import com.carrental.service.impl.TransactionServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeaturesValidationTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private CarSubscriptionRepository carSubscriptionRepository;
    @Mock private CarRepository carRepository;
    @Mock private ListingPackageRepository listingPackageRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private com.carrental.repository.BookingRepository bookingRepository;
    @Mock private VNPayService vnPayService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private CurrentUserService currentUserService;
    @Mock private HttpServletRequest servletRequest;

    private TransactionServiceImpl transactionService;
    private ReviewServiceImpl reviewService;
    private DashboardServiceImpl dashboardService;

    private Customer owner;
    private Customer customer;
    private Car car;
    private ListingPackage pkg;
    private CarSubscription subscription;

    @BeforeEach
    void setUp() {
        transactionService = new TransactionServiceImpl(
                transactionRepository, carSubscriptionRepository, vnPayService, currentUserService);
        reviewService = new ReviewServiceImpl(reviewRepository, carRepository, bookingRepository, currentUserService);
        dashboardService = new DashboardServiceImpl(transactionRepository, carRepository, listingPackageRepository);

        owner = Customer.builder().fullName("Nguyễn Văn Chủ").email("owner@test.com").phone("0901111111")
                .role(Role.OWNER).kycStatus(KycStatus.VERIFIED).status(CustomerStatus.ACTIVE).build();
        owner.setId(1L);

        customer = Customer.builder().fullName("Trần Khách Hàng").email("customer@test.com").phone("0902222222").role(Role.CUSTOMER).build();
        customer.setId(2L);

        car = Car.builder().owner(owner).licensePlate("51F-99999").brand("Toyota").model("Camry")
                .status(com.carrental.enums.CarStatus.ACTIVE).build();
        car.setId(10L);

        pkg = ListingPackage.builder().name("Gói Tiêu Chuẩn (30 Ngày)").code("PKG_STANDARD").price(BigDecimal.valueOf(180000)).durationDays(30).priorityLevel(2).build();
        pkg.setId(100L);

        subscription = CarSubscription.builder()
                .subscriptionCode("SUB-20261105-001")
                .customer(owner)
                .car(car)
                .listingPackage(pkg)
                .totalAmount(BigDecimal.valueOf(180000))
                .status(SubscriptionStatus.PENDING_PAYMENT)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();
        subscription.setId(200L);
    }

    @Test
    @DisplayName("F4 - Tạo giao dịch thanh toán gói qua VNPay trả về paymentUrl")
    void testCreatePackagePayment_VNPay() {
        when(currentUserService.getCurrentUser()).thenReturn(owner);
        when(carSubscriptionRepository.findById(200L)).thenReturn(Optional.of(subscription));
        when(transactionRepository.findFirstBySubscriptionIdAndTransactionTypeAndStatusOrderByCreatedAtDesc(
                any(), any(), any())).thenReturn(Optional.empty());

        Transaction savedTx = Transaction.builder()
                .subscription(subscription)
                .transactionType(TransactionType.PACKAGE_PAYMENT)
                .amount(BigDecimal.valueOf(180000))
                .method(PaymentMethod.VNPAY)
                .status(TransactionStatus.PENDING)
                .build();
        savedTx.setId(500L);

        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTx);
        when(vnPayService.createPaymentUrl(eq(500L), any(), any())).thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?test=1");

        PackagePaymentRequest request = PackagePaymentRequest.builder()
                .subscriptionId(200L)
                .method(PaymentMethod.VNPAY)
                .bankCode("NCB")
                .build();

        TransactionResponse response = transactionService.createPackagePayment(request, servletRequest);

        assertNotNull(response);
        assertEquals(500L, response.id());
        assertEquals("PENDING", response.status());
        assertNotNull(response.paymentUrl());
        assertTrue(response.paymentUrl().contains("vnpayment.vn"));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("F4 - Người không phải chủ xe sở hữu gói đăng ký bị chặn thanh toán")
    void testCreatePackagePayment_NotOwnerForbidden() {
        Customer otherUser = Customer.builder().fullName("Người dùng khác").email("other@test.com").phone("0900000001")
                .role(Role.OWNER).kycStatus(KycStatus.VERIFIED).status(CustomerStatus.ACTIVE).build();
        otherUser.setId(99L);

        when(currentUserService.getCurrentUser()).thenReturn(otherUser);
        when(carSubscriptionRepository.findById(200L)).thenReturn(Optional.of(subscription));

        PackagePaymentRequest request = PackagePaymentRequest.builder()
                .subscriptionId(200L)
                .method(PaymentMethod.VNPAY)
                .build();

        AppException ex = assertThrows(AppException.class, () -> transactionService.createPackagePayment(request, servletRequest));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("sở hữu"));
    }

    @Test
    @DisplayName("F4 - Tài khoản CUSTOMER chưa xác minh làm chủ xe bị chặn thanh toán gói")
    void testCreatePackagePayment_CustomerRoleForbidden() {
        customer.setStatus(CustomerStatus.ACTIVE);
        when(currentUserService.getCurrentUser()).thenReturn(customer);

        PackagePaymentRequest request = PackagePaymentRequest.builder()
                .subscriptionId(200L)
                .method(PaymentMethod.VNPAY)
                .build();

        AppException ex = assertThrows(AppException.class, () -> transactionService.createPackagePayment(request, servletRequest));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    @DisplayName("F4 - Giả lập thanh toán thành công (Simulate Gateway)")
    void testSimulateGateway_Success() {
        Transaction tx = Transaction.builder()
                .subscription(subscription)
                .transactionType(TransactionType.PACKAGE_PAYMENT)
                .amount(BigDecimal.valueOf(180000))
                .method(PaymentMethod.VNPAY)
                .status(TransactionStatus.PENDING)
                .build();
        tx.setId(500L);

        when(currentUserService.getCurrentUser()).thenReturn(owner);
        when(transactionRepository.findById(500L)).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        transactionService.setSimulateGatewayEnabled(true);
        TransactionResponse response = transactionService.simulateGateway(500L);

        assertNotNull(response);
        assertEquals("SUCCESS", response.status());
        assertNotNull(response.providerRef());
        assertTrue(response.providerRef().startsWith("SIMULATED_"));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("F4 - Người dùng gửi đánh giá 5 sao cho xe thành công")
    void testCreateReview_Success() {
        when(currentUserService.getCurrentUser()).thenReturn(customer);
        when(carRepository.findById(10L)).thenReturn(Optional.of(car));
        when(reviewRepository.existsByCarIdAndCustomerId(10L, 2L)).thenReturn(false);

        Review savedReview = Review.builder()
                .car(car)
                .customer(customer)
                .rating(5)
                .comment("Xe chạy rất êm, chủ xe nhiệt tình!")
                .createdAt(LocalDateTime.now())
                .build();
        savedReview.setId(1L);

        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);
        // Khách đã hoàn tất chuyến thuê xe này
        when(bookingRepository.existsByCarIdAndCustomerIdAndStatus(10L, customer.getId(),
                com.carrental.enums.BookingStatus.COMPLETED)).thenReturn(true);

        CreateReviewRequest request = CreateReviewRequest.builder()
                .carId(10L)
                .rating(5)
                .comment("Xe chạy rất êm, chủ xe nhiệt tình!")
                .build();

        ReviewResponse response = reviewService.createReview(request);

        assertNotNull(response);
        assertEquals(5, response.rating());
        assertEquals(10L, response.carId());
        assertEquals("Trần Khách Hàng", response.customerName());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    @DisplayName("F4 - Chủ xe không thể tự đánh giá xe của chính mình")
    void testCreateReview_CannotReviewOwnCar() {
        when(currentUserService.getCurrentUser()).thenReturn(owner);
        when(carRepository.findById(10L)).thenReturn(Optional.of(car));

        CreateReviewRequest request = CreateReviewRequest.builder()
                .carId(10L)
                .rating(5)
                .comment("Xe của tôi rất tốt")
                .build();

        AppException ex = assertThrows(AppException.class, () -> reviewService.createReview(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("tự đánh giá"));
    }

    @Test
    @DisplayName("F4 - Xem tóm tắt đánh giá xe kèm điểm trung bình")
    void testGetReviewsByCarId() {
        when(carRepository.existsById(10L)).thenReturn(true);
        Review r1 = Review.builder().car(car).customer(customer).rating(5).comment("Tuyệt vời").status(ReviewStatus.APPROVED).build();
        Review r2 = Review.builder().car(car).customer(customer).rating(4).comment("Khá tốt").status(ReviewStatus.APPROVED).build();

        when(reviewRepository.findByCarIdAndStatusOrderByCreatedAtDesc(10L, ReviewStatus.APPROVED)).thenReturn(List.of(r1, r2));
        when(reviewRepository.getAverageRatingByCarId(10L)).thenReturn(4.5);

        CarReviewSummaryResponse summary = reviewService.getReviewsByCarId(10L);

        assertNotNull(summary);
        assertEquals(10L, summary.carId());
        assertEquals(4.5, summary.averageRating());
        assertEquals(2, summary.totalReviews());
        assertEquals(2, summary.reviews().size());
    }

    @Test
    @DisplayName("F4 - Khách chưa thuê hoặc chưa hoàn tất chuyến thuê xe thì không thể đánh giá")
    void testCreateReview_CannotReviewWithoutCompletedTrip() {
        when(currentUserService.getCurrentUser()).thenReturn(customer);
        when(carRepository.findById(10L)).thenReturn(Optional.of(car));
        when(bookingRepository.existsByCarIdAndCustomerIdAndStatus(10L, customer.getId(),
                com.carrental.enums.BookingStatus.COMPLETED)).thenReturn(false);

        CreateReviewRequest request = CreateReviewRequest.builder()
                .carId(10L)
                .rating(5)
                .comment("Xe chạy rất êm")
                .build();

        AppException ex = assertThrows(AppException.class, () -> reviewService.createReview(request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("hoàn tất"));
    }

    @Test
    @DisplayName("F4 - Admin Dashboard tổng hợp doanh thu và số lượng gói đã bán")
    void testGetRevenueDashboard() {
        when(transactionRepository.sumTotalRevenue()).thenReturn(BigDecimal.valueOf(1200000));
        when(carRepository.countByListingStatus(ListingStatus.LISTED)).thenReturn(8L);
        when(transactionRepository.countByStatusAndTransactionType(TransactionStatus.SUCCESS, TransactionType.PACKAGE_PAYMENT)).thenReturn(15L);
        when(listingPackageRepository.findAll()).thenReturn(List.of(pkg));

        List<Object[]> statRows = new java.util.ArrayList<>();
        statRows.add(new Object[]{100L, "Gói Tiêu Chuẩn (30 Ngày)", "PKG_STANDARD", 15L, BigDecimal.valueOf(1200000)});
        when(transactionRepository.findPackageRevenueStats()).thenReturn(statRows);
        when(transactionRepository.findTop10ByStatusOrderByCreatedAtDesc(TransactionStatus.SUCCESS)).thenReturn(List.of());

        RevenueDashboardResponse dashboard = dashboardService.getRevenueDashboard();

        assertNotNull(dashboard);
        assertEquals(BigDecimal.valueOf(1200000), dashboard.totalRevenue());
        assertEquals(8L, dashboard.activeListingsCount());
        assertEquals(15L, dashboard.totalPackagesSold());
        assertEquals("Gói Tiêu Chuẩn (30 Ngày)", dashboard.bestSellingPackageName());
        assertEquals(1, dashboard.packageStats().size());
        assertEquals(15L, dashboard.packageStats().get(0).countSold());
    }
}
