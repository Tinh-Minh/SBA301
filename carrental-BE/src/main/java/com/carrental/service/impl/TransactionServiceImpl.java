package com.carrental.service.impl;

import com.carrental.dto.request.PackagePaymentRequest;
import com.carrental.dto.request.SimulateGatewayRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.CarSubscription;
import com.carrental.entity.Customer;
import com.carrental.entity.Transaction;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.event.PaymentCompletedEvent;
import com.carrental.exception.AppException;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.repository.TransactionSpecification;
import com.carrental.service.CurrentUserService;
import com.carrental.service.TransactionService;
import com.carrental.service.VNPayService;
import com.carrental.util.TimeUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CarSubscriptionRepository carSubscriptionRepository;
    private final VNPayService vnPayService;
    private final ApplicationEventPublisher eventPublisher;
    private final CurrentUserService currentUserService;

    @Value("${app.payment.simulate-gateway-enabled:false}")
    private boolean simulateGatewayEnabled;

    @Override
    @Transactional
    public TransactionResponse createPackagePayment(PackagePaymentRequest request) {
        log.info("Tạo giao dịch thanh toán gói đăng tin subscriptionId={}, method={}",
                request.getSubscriptionId(), request.getMethod());
        try {
            CarSubscription subscription = findSubscriptionOrThrow(request.getSubscriptionId());
            Customer current = currentUserService.getCurrentUser();
            checkSubscriptionAccess(subscription, current);

            if (subscription.getPaymentStatus() == PaymentStatus.PAID) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Gói đăng tin đã được thanh toán thành công");
            }

            if (transactionRepository.existsBySubscriptionIdAndTransactionTypeAndStatus(
                    subscription.getId(), TransactionType.PACKAGE_PAYMENT, TransactionStatus.SUCCESS)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Gói đăng tin đã có giao dịch thanh toán thành công trước đó");
            }

            // Nếu đã có giao dịch PENDING của gói này, tái sử dụng để tránh tạo trùng lặp
            Optional<Transaction> pendingOpt = transactionRepository.findFirstBySubscriptionIdAndTransactionTypeAndStatusOrderByCreatedAtDesc(
                    subscription.getId(), TransactionType.PACKAGE_PAYMENT, TransactionStatus.PENDING);

            Transaction transaction;
            if (pendingOpt.isPresent()) {
                transaction = pendingOpt.get();
                if (request.getMethod() != null) {
                    transaction.setMethod(request.getMethod());
                    transaction = transactionRepository.save(transaction);
                }
            } else {
                BigDecimal amount = subscription.getTotalAmount();
                if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán gói không hợp lệ");
                }

                transaction = Transaction.builder()
                        .subscription(subscription)
                        .transactionType(TransactionType.PACKAGE_PAYMENT)
                        .amount(amount)
                        .method(request.getMethod() != null ? request.getMethod() : PaymentMethod.VNPAY)
                        .status(TransactionStatus.PENDING)
                        .build();

                transaction = transactionRepository.save(transaction);
            }

            String paymentUrl = null;
            if (transaction.getMethod() == PaymentMethod.VNPAY) {
                try {
                    paymentUrl = vnPayService.createPaymentUrl(transaction.getId(), request.getBankCode(), getCurrentHttpRequest());
                } catch (Exception ex) {
                    log.warn("Không thể sinh VNPay paymentUrl cho giao dịch id={}: {}", transaction.getId(), ex.getMessage());
                }
            }

            return TransactionResponse.from(transaction, paymentUrl);
        } catch (AppException e) {
            log.warn("Tạo giao dịch thanh toán gói thất bại subscriptionId={}: {}", request.getSubscriptionId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo giao dịch thanh toán gói subscriptionId={}", request.getSubscriptionId(), e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo giao dịch thanh toán gói");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getById(Long id) {
        Transaction transaction = findTransactionOrThrow(id);
        Customer current = currentUserService.getCurrentUser();
        checkSubscriptionAccess(transaction.getSubscription(), current);
        return TransactionResponse.from(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getPaged(Long subscriptionId, String transactionType, String status, Pageable pageable) {
        Customer current = currentUserService.getCurrentUser();
        if (subscriptionId != null) {
            CarSubscription subscription = findSubscriptionOrThrow(subscriptionId);
            checkSubscriptionAccess(subscription, current);
        } else if (!currentUserService.isAdmin(current)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ Quản trị viên mới có thể xem toàn bộ giao dịch");
        }
        Specification<Transaction> spec = TransactionSpecification.filter(subscriptionId, transactionType, status);
        Page<Transaction> page = transactionRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(TransactionResponse::from));
    }

    @Override
    @Transactional
    public String getVNPayUrl(Long transactionId, String bankCode, HttpServletRequest request) {
        Transaction transaction = findTransactionOrThrow(transactionId);
        Customer current = currentUserService.getCurrentUser();
        checkSubscriptionAccess(transaction.getSubscription(), current);
        HttpServletRequest req = request != null ? request : getCurrentHttpRequest();
        return vnPayService.createPaymentUrl(transactionId, bankCode, req);
    }

    @Override
    @Transactional
    public TransactionResponse simulateGateway(Long id, SimulateGatewayRequest request) {
        if (!simulateGatewayEnabled) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tính năng giả lập cổng thanh toán không được kích hoạt");
        }
        Transaction transaction = findTransactionOrThrow(id);
        Customer current = currentUserService.getCurrentUser();
        checkSubscriptionAccess(transaction.getSubscription(), current);

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Giao dịch không ở trạng thái PENDING");
        }

        boolean success = request == null || request.getSimulateSuccess() == null || Boolean.TRUE.equals(request.getSimulateSuccess());
        String providerRef = (request != null && request.getProviderRef() != null && !request.getProviderRef().isBlank())
                ? request.getProviderRef()
                : "SIM-" + System.currentTimeMillis();

        if (success) {
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setPaidAt(TimeUtil.nowVn());
            transaction.setProviderRef(providerRef);
            Transaction saved = transactionRepository.save(transaction);
            eventPublisher.publishEvent(new PaymentCompletedEvent(saved));
            log.info("Giả lập cổng thanh toán thành công id={}, providerRef={}", saved.getId(), providerRef);
            return TransactionResponse.from(saved);
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
            transaction.setProviderRef(providerRef);
            Transaction saved = transactionRepository.save(transaction);
            log.info("Giả lập cổng thanh toán thất bại id={}, providerRef={}", saved.getId(), providerRef);
            return TransactionResponse.from(saved);
        }
    }

    private void checkSubscriptionAccess(CarSubscription subscription, Customer user) {
        if (currentUserService.isAdmin(user)) return;
        if (subscription == null || subscription.getCustomer() == null || !subscription.getCustomer().getId().equals(user.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập vào giao dịch này");
        }
    }

    private HttpServletRequest getCurrentHttpRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private Transaction findTransactionOrThrow(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch với id=" + id));
    }

    private CarSubscription findSubscriptionOrThrow(Long subscriptionId) {
        return carSubscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy gói đăng tin với id=" + subscriptionId));
    }
}
