package com.carrental.service.impl;

import com.carrental.dto.request.BookingDepositPaymentRequest;
import com.carrental.dto.request.PackagePaymentRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.Booking;
import com.carrental.entity.CarSubscription;
import com.carrental.entity.Customer;
import com.carrental.entity.Transaction;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.SubscriptionStatus;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.exception.AppException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.service.CurrentUserService;
import com.carrental.service.TransactionService;
import com.carrental.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;

import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Slf4j
@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CarSubscriptionRepository carSubscriptionRepository;
    private final BookingRepository bookingRepository;
    private final VNPayService vnPayService;
    private final CurrentUserService currentUserService;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired(required = false)
    private VoucherRepository voucherRepository;

    @Value("${app.transaction.payment-timeout-minutes:15}")
    private int transactionPaymentTimeoutMinutes;

    @Autowired
    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            CarSubscriptionRepository carSubscriptionRepository,
            BookingRepository bookingRepository,
            VNPayService vnPayService,
            CurrentUserService currentUserService,
            ApplicationEventPublisher eventPublisher) {
        this.transactionRepository = transactionRepository;
        this.carSubscriptionRepository = carSubscriptionRepository;
        this.bookingRepository = bookingRepository;
        this.vnPayService = vnPayService;
        this.currentUserService = currentUserService;
        this.eventPublisher = eventPublisher;
    }

    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            CarSubscriptionRepository carSubscriptionRepository,
            VNPayService vnPayService,
            CurrentUserService currentUserService) {
        this(transactionRepository, carSubscriptionRepository, null, vnPayService, currentUserService, null);
    }

    @Override
    @Transactional
    public TransactionResponse createPackagePayment(PackagePaymentRequest request, HttpServletRequest servletRequest) {
        log.info("Khởi tạo thanh toán gói subscriptionId={}, method={}", request.getSubscriptionId(), request.getMethod());

        Customer current = currentUserService.getCurrentUser();
        CurrentUserService.requireVerifiedOwner(current);
        CarSubscription subscription = carSubscriptionRepository.findById(request.getSubscriptionId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy gói subscription id=" + request.getSubscriptionId()));

        if (!subscription.getCustomer().getId().equals(current.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ chủ xe sở hữu gói đăng ký mới được thực hiện thanh toán");
        }

        if (subscription.getStatus() == SubscriptionStatus.ACTIVE || subscription.getPaymentStatus() == PaymentStatus.PAID) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Gói đăng tin này đã được thanh toán và kích hoạt");
        }

        if (subscription.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Gói đăng tin này đã bị hủy");
        }

        if (subscription.getTotalAmount() == null || subscription.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán của gói không hợp lệ");
        }

        // Kiểm tra xem đã có giao dịch PENDING nào trước đó chưa
        Optional<Transaction> existingPending = transactionRepository
                .findFirstBySubscriptionIdAndTransactionTypeAndStatusOrderByCreatedAtDesc(
                        subscription.getId(), TransactionType.PACKAGE_PAYMENT, TransactionStatus.PENDING);

        Transaction transaction;
        if (existingPending.isPresent() && existingPending.get().getMethod() == request.getMethod()) {
            transaction = existingPending.get();
        } else {
            if (existingPending.isPresent()) {
                Transaction oldPending = existingPending.get();
                oldPending.setStatus(TransactionStatus.FAILED);
                transactionRepository.save(oldPending);
            }
            transaction = Transaction.builder()
                    .subscription(subscription)
                    .transactionType(TransactionType.PACKAGE_PAYMENT)
                    .amount(subscription.getTotalAmount())
                    .method(request.getMethod())
                    .status(TransactionStatus.PENDING)
                    .build();
            transaction = transactionRepository.save(transaction);
        }

        String paymentUrl = null;
        if (request.getMethod() == PaymentMethod.VNPAY) {
            paymentUrl = vnPayService.createPaymentUrl(transaction.getId(), request.getBankCode(), servletRequest);
        }

        return TransactionResponse.from(transaction, paymentUrl);
    }

    @Override
    @Transactional
    public TransactionResponse createBookingDepositPayment(BookingDepositPaymentRequest request, HttpServletRequest servletRequest) {
        log.info("Khởi tạo thanh toán tiền cọc bookingId={}, method={}", request.bookingId(), request.method());

        Customer current = currentUserService.getCurrentUser();
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê id=" + request.bookingId()));

        if (!booking.getCustomer().getId().equals(current.getId()) && !currentUserService.isAdmin(current)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ khách thuê xe mới được thực hiện thanh toán tiền cọc cho đơn này");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ có thể đặt cọc khi đơn thuê đã được chủ xe xác nhận (CONFIRMED)");
        }

        if (booking.getDepositStatus() == PaymentStatus.PAID) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê này đã được thanh toán tiền cọc");
        }

        if (booking.getDepositAmount() == null || booking.getDepositAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê này không yêu cầu tiền cọc");
        }

        // Kiểm tra xem đã có giao dịch PENDING nào trước đó chưa
        Optional<Transaction> existingPending = transactionRepository
                .findFirstByBookingIdAndTransactionTypeAndStatusOrderByCreatedAtDesc(
                        booking.getId(), TransactionType.BOOKING_DEPOSIT, TransactionStatus.PENDING);

        Transaction transaction;
        if (existingPending.isPresent() && existingPending.get().getMethod() == request.method()) {
            transaction = existingPending.get();
        } else {
            if (existingPending.isPresent()) {
                Transaction oldPending = existingPending.get();
                oldPending.setStatus(TransactionStatus.FAILED);
                transactionRepository.save(oldPending);
            }
            transaction = Transaction.builder()
                    .booking(booking)
                    .transactionType(TransactionType.BOOKING_DEPOSIT)
                    .amount(booking.getDepositAmount())
                    .method(request.method())
                    .status(TransactionStatus.PENDING)
                    .build();
            transaction = transactionRepository.save(transaction);
        }

        String paymentUrl = null;
        if (request.method() == PaymentMethod.VNPAY) {
            paymentUrl = vnPayService.createPaymentUrl(transaction.getId(), request.bankCode(), servletRequest);
        }

        return TransactionResponse.from(transaction, paymentUrl);
    }

    @Override
    @Transactional(readOnly = true)
    public String getVNPayUrl(Long transactionId, String bankCode, HttpServletRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch id=" + transactionId));

        validateOwnerAccess(transaction);

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Giao dịch không ở trạng thái chờ thanh toán (PENDING)");
        }

        return vnPayService.createPaymentUrl(transaction.getId(), bankCode, request);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch id=" + id));
        validateAccess(transaction);
        return TransactionResponse.from(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getPaged(Long subscriptionId, String transactionType, String status, Pageable pageable) {
        return getPaged(subscriptionId, null, transactionType, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getPaged(Long subscriptionId, Long bookingId, String transactionType, String status, Pageable pageable) {
        Customer current = currentUserService.getCurrentUser();
        Specification<Transaction> spec = buildFilterSpecification(subscriptionId, bookingId, transactionType, status);

        if (!currentUserService.isAdmin(current)) {
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.equal(root.get("subscription").get("customer").get("id"), current.getId()),
                    cb.equal(root.get("booking").get("customer").get("id"), current.getId()),
                    cb.equal(root.get("booking").get("owner").get("id"), current.getId())
            ));
        }

        Page<Transaction> page = transactionRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(TransactionResponse::from));
    }

    private Specification<Transaction> buildFilterSpecification(Long subscriptionId, Long bookingId, String transactionType, String status) {
        Specification<Transaction> spec = (root, query, cb) -> cb.conjunction();

        if (subscriptionId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("subscription").get("id"), subscriptionId));
        }

        if (bookingId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("booking").get("id"), bookingId));
        }

        if (transactionType != null && !transactionType.isBlank()) {
            try {
                TransactionType type = TransactionType.valueOf(transactionType.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("transactionType"), type));
            } catch (IllegalArgumentException ignored) {}
        }

        if (status != null && !status.isBlank()) {
            try {
                TransactionStatus txStatus = TransactionStatus.valueOf(status.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), txStatus));
                if (txStatus == TransactionStatus.PENDING) {
                    spec = spec.and((root, query, cb) -> cb.or(
                            cb.equal(root.get("subscription").get("status"), SubscriptionStatus.PENDING_PAYMENT),
                            cb.isNotNull(root.get("booking"))
                    ));
                }
            } catch (IllegalArgumentException ignored) {}
        }

        return spec;
    }

    private boolean isTransactionOwner(Transaction transaction, Customer customer) {
        if (transaction == null || customer == null) return false;
        if (transaction.getSubscription() != null && transaction.getSubscription().getCustomer() != null) {
            return transaction.getSubscription().getCustomer().getId().equals(customer.getId());
        }
        if (transaction.getBooking() != null && transaction.getBooking().getCustomer() != null) {
            return transaction.getBooking().getCustomer().getId().equals(customer.getId());
        }
        return false;
    }

    private void validateOwnerAccess(Transaction transaction) {
        Customer current = currentUserService.getCurrentUser();
        if (currentUserService.isAdmin(current)) {
            return;
        }
        if (!isTransactionOwner(transaction, current)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền với giao dịch này");
        }
    }

    private void validateAccess(Transaction transaction) {
        Customer current = currentUserService.getCurrentUser();
        if (currentUserService.isAdmin(current)) {
            return;
        }
        if (isTransactionOwner(transaction, current)) {
            return;
        }
        if (transaction.getBooking() != null && transaction.getBooking().getOwner() != null
                && transaction.getBooking().getOwner().getId().equals(current.getId())) {
            return;
        }
        throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập giao dịch này");
    }

    @Override
    @Transactional
    public int expirePendingTransactions() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(transactionPaymentTimeoutMinutes);
        List<Transaction> staleList = transactionRepository.findByStatusAndCreatedAtBefore(TransactionStatus.PENDING, cutoff);
        int count = 0;
        for (Transaction tx : staleList) {
            try {
                tx.setStatus(TransactionStatus.FAILED);

                // Nếu giao dịch liên kết gói đăng tin PENDING_PAYMENT → hủy gói
                if (tx.getSubscription() != null) {
                    CarSubscription sub = tx.getSubscription();
                    if (sub.getStatus() == SubscriptionStatus.PENDING_PAYMENT) {
                        sub.setStatus(SubscriptionStatus.CANCELLED);
                        // Hoàn lại lượt dùng voucher nếu có
                        if (sub.getVoucher() != null && voucherRepository != null) {
                            voucherRepository.decreaseUsage(sub.getVoucher().getId());
                        }
                        log.info("Đã hủy gói đăng tin id={} do giao dịch id={} quá hạn thanh toán",
                                sub.getId(), tx.getId());
                    }
                }

                count++;
            } catch (RuntimeException e) {
                log.warn("Không thể hủy giao dịch PENDING id={}: {}", tx.getId(), e.getMessage());
            }
        }
        return count;
    }
}
