package com.carrental.service.impl;

import com.carrental.dto.request.CreateDepositRequest;
import com.carrental.dto.request.CreatePaymentRequest;
import com.carrental.dto.request.MockPaymentProcessRequest;
import com.carrental.dto.request.RefundRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Transaction;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.exception.AppException;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.service.TransactionService;
import com.carrental.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final VNPayService vnPayService;

    @Override
    @Transactional
    public TransactionResponse createDeposit(CreateDepositRequest request) {
        log.info("Tạo giao dịch đặt cọc orderId={}, amount={}", request.getOrderId(), request.getAmount());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            BigDecimal amount = request.getAmount() != null ? request.getAmount() : order.getDepositAmount();
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Số tiền cọc không hợp lệ");
            }

            request.setAmount(amount);
            Transaction transaction = request.toEntity();
            transaction.setOrder(order);

            Transaction saved = transactionRepository.save(transaction);
            log.info("Tạo giao dịch đặt cọc thành công id={}", saved.getId());

            String paymentUrl = null;
            if (saved.getMethod() == PaymentMethod.VNPAY) {
                try {
                    paymentUrl = vnPayService.createPaymentUrl(saved.getId(), null, getCurrentHttpRequest());
                } catch (Exception ex) {
                    log.warn("Không thể sinh VNPay paymentUrl cho giao dịch cọc id={}: {}", saved.getId(), ex.getMessage());
                }
            }

            return TransactionResponse.from(saved, paymentUrl);
        } catch (AppException e) {
            log.warn("Tạo giao dịch đặt cọc thất bại orderId={}: {}", request.getOrderId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo giao dịch đặt cọc orderId={}", request.getOrderId(), e);
            String detail = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo giao dịch đặt cọc: " + detail);
        }
    }

    @Override
    @Transactional
    public TransactionResponse createPayment(CreatePaymentRequest request) {
        log.info("Tạo giao dịch thanh toán đơn thuê orderId={}, amount={}", request.getOrderId(), request.getAmount());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            BigDecimal amount = request.getAmount() != null ? request.getAmount() : order.getTotalAmount();
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán không hợp lệ");
            }

            request.setAmount(amount);
            Transaction transaction = request.toEntity();
            transaction.setOrder(order);

            Transaction saved = transactionRepository.save(transaction);
            log.info("Tạo giao dịch thanh toán thành công id={}", saved.getId());

            String paymentUrl = null;
            if (saved.getMethod() == PaymentMethod.VNPAY) {
                try {
                    paymentUrl = vnPayService.createPaymentUrl(saved.getId(), null, getCurrentHttpRequest());
                } catch (Exception ex) {
                    log.warn("Không thể sinh VNPay paymentUrl cho giao dịch thanh toán id={}: {}", saved.getId(), ex.getMessage());
                }
            }

            return TransactionResponse.from(saved, paymentUrl);
        } catch (AppException e) {
            log.warn("Tạo giao dịch thanh toán thất bại orderId={}: {}", request.getOrderId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo giao dịch thanh toán orderId={}", request.getOrderId(), e);
            String detail = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo giao dịch thanh toán: " + detail);
        }
    }

    @Override
    @Transactional
    public TransactionResponse simulatePaymentGateway(Long transactionId, MockPaymentProcessRequest request) {
        log.info("Giả lập cổng thanh toán cho giao dịch id={}, success={}", transactionId, request.isSimulateSuccess());
        try {
            Transaction transaction = findTransactionOrThrow(transactionId);
            TransactionStatus current = transaction.getStatus();
            TransactionStatus next = request.isSimulateSuccess() ? TransactionStatus.SUCCESS : TransactionStatus.FAILED;

            current.validateTransitionTo(next);
            transaction.setStatus(next);
            transaction.setUpdatedAt(LocalDateTime.now());

            String ref = request.getProviderRef() != null && !request.getProviderRef().isBlank()
                    ? request.getProviderRef()
                    : "MOCK_GW_" + UUID.randomUUID().toString().substring(0, 8);
            transaction.setProviderRef(ref);

            if (next == TransactionStatus.SUCCESS) {
                transaction.setPaidAt(LocalDateTime.now());
                RentalOrder order = transaction.getOrder();
                if (order != null) {
                    if (transaction.getTransactionType() == TransactionType.RENTAL_PAYMENT) {
                        order.setPaymentStatus(PaymentStatus.PAID);
                        order.setUpdatedAt(LocalDateTime.now());
                        rentalOrderRepository.save(order);
                    }
                }
            }

            Transaction saved = transactionRepository.save(transaction);
            log.info("Xử lý cổng thanh toán hoàn tất id={}, status={}", saved.getId(), saved.getStatus());
            return TransactionResponse.from(saved);
        } catch (AppException e) {
            log.warn("Giả lập cổng thanh toán thất bại id={}: {}", transactionId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi giả lập cổng thanh toán id={}", transactionId, e);
            String detail = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xử lý cổng thanh toán: " + detail);
        }
    }

    @Override
    @Transactional
    public TransactionResponse refund(RefundRequest request) {
        log.info("Hoàn tiền cho giao dịch id={}, amount={}", request.getParentTransactionId(), request.getAmount());
        try {
            Transaction parent = findTransactionOrThrow(request.getParentTransactionId());
            if (parent.getStatus() != TransactionStatus.SUCCESS) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ có thể hoàn tiền cho giao dịch đã thành công (SUCCESS)");
            }

            BigDecimal refundAmount = request.getAmount() != null ? request.getAmount() : parent.getAmount();
            if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0
                    || refundAmount.compareTo(parent.getAmount()) > 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Số tiền hoàn không hợp lệ (vượt quá giao dịch gốc)");
            }

            Transaction refundTx = new Transaction();
            refundTx.setOrder(parent.getOrder());
            refundTx.setRefundOf(parent);
            refundTx.setTransactionType(TransactionType.REFUND);
            refundTx.setAmount(refundAmount);
            refundTx.setMethod(parent.getMethod());
            refundTx.setStatus(TransactionStatus.SUCCESS);
            refundTx.setProviderRef("REFUND_" + UUID.randomUUID().toString().substring(0, 8));
            refundTx.setPaidAt(LocalDateTime.now());
            refundTx.setCreatedAt(LocalDateTime.now());
            refundTx.setUpdatedAt(LocalDateTime.now());

            RentalOrder order = parent.getOrder();
            if (order != null) {
                order.setPaymentStatus(PaymentStatus.REFUNDED);
                order.setUpdatedAt(LocalDateTime.now());
                rentalOrderRepository.save(order);
            }

            Transaction saved = transactionRepository.save(refundTx);
            log.info("Hoàn tiền thành công refundTxId={}, parentId={}", saved.getId(), parent.getId());
            return TransactionResponse.from(saved);
        } catch (AppException e) {
            log.warn("Hoàn tiền thất bại parentId={}: {}", request.getParentTransactionId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi hoàn tiền parentId={}", request.getParentTransactionId(), e);
            String detail = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể thực hiện hoàn tiền: " + detail);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getById(Long id) {
        return TransactionResponse.from(findTransactionOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getPaged(Long orderId, String transactionType, String status, Pageable pageable) {
        Page<Transaction> page;
        if (orderId != null) {
            page = transactionRepository.findByOrderId(orderId, pageable);
        } else if (transactionType != null && !transactionType.isBlank()) {
            TransactionType type = TransactionType.valueOf(transactionType.toUpperCase());
            page = transactionRepository.findByTransactionType(type, pageable);
        } else if (status != null && !status.isBlank()) {
            TransactionStatus txStatus = TransactionStatus.valueOf(status.toUpperCase());
            page = transactionRepository.findByStatus(txStatus, pageable);
        } else {
            page = transactionRepository.findAll(pageable);
        }
        return PageResponse.from(page.map(TransactionResponse::from));
    }

    @Override
    public String getVNPayUrl(Long transactionId, String bankCode, HttpServletRequest request) {
        HttpServletRequest req = request != null ? request : getCurrentHttpRequest();
        return vnPayService.createPaymentUrl(transactionId, bankCode, req);
    }

    @Override
    @Transactional
    public TransactionResponse processVNPayReturn(Map<String, String> queryParams) {
        return vnPayService.processReturn(queryParams);
    }

    @Override
    @Transactional
    public Map<String, String> processVNPayIpn(Map<String, String> queryParams) {
        return vnPayService.processIpn(queryParams);
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

    private RentalOrder findOrderOrThrow(Long orderId) {
        return rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê với id=" + orderId));
    }
}
