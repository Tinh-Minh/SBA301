package com.carrental.service.impl;

import com.carrental.dto.request.PackagePaymentRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.CarSubscription;
import com.carrental.entity.Customer;
import com.carrental.entity.Transaction;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.SubscriptionStatus;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.exception.AppException;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.service.CurrentUserService;
import com.carrental.service.TransactionService;
import com.carrental.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CarSubscriptionRepository carSubscriptionRepository;
    private final VNPayService vnPayService;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public TransactionResponse createPackagePayment(PackagePaymentRequest request, HttpServletRequest servletRequest) {
        log.info("Khởi tạo thanh toán gói subscriptionId={}, method={}", request.getSubscriptionId(), request.getMethod());

        Customer current = currentUserService.getCurrentUser();
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
        Customer current = currentUserService.getCurrentUser();
        Specification<Transaction> spec = buildFilterSpecification(subscriptionId, transactionType, status);

        if (!currentUserService.isAdmin(current)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("subscription").get("customer").get("id"), current.getId()));
        }

        Page<Transaction> page = transactionRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(TransactionResponse::from));
    }

    private Specification<Transaction> buildFilterSpecification(Long subscriptionId, String transactionType, String status) {
        Specification<Transaction> spec = (root, query, cb) -> cb.conjunction();

        if (subscriptionId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("subscription").get("id"), subscriptionId));
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
            } catch (IllegalArgumentException ignored) {}
        }

        return spec;
    }

    private boolean isTransactionOwner(Transaction transaction, Customer customer) {
        return transaction != null &&
               transaction.getSubscription() != null &&
               transaction.getSubscription().getCustomer() != null &&
               transaction.getSubscription().getCustomer().getId().equals(customer.getId());
    }

    private void validateOwnerAccess(Transaction transaction) {
        Customer current = currentUserService.getCurrentUser();
        if (!isTransactionOwner(transaction, current)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ chủ xe sở hữu giao dịch này mới có quyền");
        }
    }

    private void validateAccess(Transaction transaction) {
        Customer current = currentUserService.getCurrentUser();
        if (currentUserService.isAdmin(current) || isTransactionOwner(transaction, current)) {
            return;
        }
        throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập giao dịch này");
    }
}
