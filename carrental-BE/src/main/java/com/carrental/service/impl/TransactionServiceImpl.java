package com.carrental.service.impl;

import com.carrental.dto.request.CreateDepositRequest;
import com.carrental.dto.request.CreatePaymentRequest;
import com.carrental.dto.request.RefundRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Transaction;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.event.PaymentCompletedEvent;
import com.carrental.exception.AppException;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.repository.TransactionSpecification;
import com.carrental.util.OrderAccess;
import com.carrental.service.TransactionService;
import com.carrental.service.VNPayService;
import com.carrental.util.TimeUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final ApplicationEventPublisher eventPublisher;
    private final OrderAccess orderAccess;

    @Override
    @Transactional
    public TransactionResponse createDeposit(CreateDepositRequest request) {
        log.info("Tạo giao dịch đặt cọc orderId={}, amount={}", request.getOrderId(), request.getAmount());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            orderAccess.requireRenter(order);
            if (order.getStatus() != OrderStatus.CONFIRMED) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ có thể đặt cọc cho đơn đã được chủ xe xác nhận");
            }
            if (order.getExpiresAt() != null && TimeUtil.nowVn().isAfter(order.getExpiresAt())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê đã quá thời hạn thanh toán/đặt cọc");
            }
            // Magic method check: kiểm tra đơn đã có giao dịch đặt cọc thành công chưa
            if (transactionRepository.existsByOrderIdAndTransactionTypeAndStatus(
                    order.getId(), TransactionType.DEPOSIT, TransactionStatus.SUCCESS)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê đã được đặt cọc thành công trước đó");
            }

            BigDecimal expectedDeposit = order.getDepositAmount();
            if (expectedDeposit == null || expectedDeposit.compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê không yêu cầu tiền đặt cọc");
            }
            Transaction transaction = request.toEntity(order, expectedDeposit);

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
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo giao dịch đặt cọc");
        }
    }

    @Override
    @Transactional
    public TransactionResponse createPayment(CreatePaymentRequest request) {
        log.info("Tạo giao dịch thanh toán đơn thuê orderId={}, amount={}", request.getOrderId(), request.getAmount());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            orderAccess.requireRenter(order);
            if (order.getStatus() != OrderStatus.CONFIRMED) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ có thể thanh toán cho đơn đã được chủ xe xác nhận");
            }
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê đã được thanh toán");
            }
            if (order.getExpiresAt() != null && TimeUtil.nowVn().isAfter(order.getExpiresAt())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê đã quá thời hạn thanh toán");
            }
            // Magic method check: kiểm tra đơn đã có giao dịch thanh toán thành công chưa
            if (transactionRepository.existsByOrderIdAndTransactionTypeAndStatus(
                    order.getId(), TransactionType.RENTAL_PAYMENT, TransactionStatus.SUCCESS)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê đã được thanh toán thành công trước đó");
            }

            BigDecimal expectedTotal = order.getTotalAmount();
            if (expectedTotal == null || expectedTotal.compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán đơn thuê không hợp lệ");
            }
            Transaction transaction = request.toEntity(order, expectedTotal);

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
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo giao dịch thanh toán");
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
            if (parent.getTransactionType() == TransactionType.REFUND) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Không thể hoàn tiền cho giao dịch loại hoàn tiền");
            }

            // Kiểm tra tổng số tiền đã hoàn trước đó trong DB
            BigDecimal alreadyRefunded = transactionRepository.findByRefundOfId(parent.getId()).stream()
                    .filter(t -> t.getStatus() == TransactionStatus.SUCCESS)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal maxRefundable = parent.getAmount().subtract(alreadyRefunded);
            if (maxRefundable.compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "Giao dịch gốc đã được hoàn trả toàn bộ số tiền (" + parent.getAmount() + " VND)");
            }

            BigDecimal refundAmount = request.getAmount();
            if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
                refundAmount = maxRefundable;
            } else if (refundAmount.compareTo(maxRefundable) > 0) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "Số tiền hoàn (" + refundAmount + " VND) vượt quá số tiền còn lại có thể hoàn (" + maxRefundable + " VND)");
            }
            request.setAmount(refundAmount);

            Transaction refundTx = request.toEntity(parent, refundAmount);

            RentalOrder order = parent.getOrder();
            if (order != null && alreadyRefunded.add(refundAmount).compareTo(parent.getAmount()) >= 0) {
                order.setPaymentStatus(PaymentStatus.REFUNDED);
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
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể thực hiện hoàn tiền");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getById(Long id) {
        Transaction transaction = findTransactionOrThrow(id);
        orderAccess.requireParty(transaction.getOrder());
        return TransactionResponse.from(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getPaged(Long orderId, String transactionType, String status, Pageable pageable) {
        if (orderId != null) {
            orderAccess.requireParty(findOrderOrThrow(orderId));
        } else {
            orderAccess.requireAdmin();
        }
        Specification<Transaction> spec = TransactionSpecification.filter(orderId, transactionType, status);
        Page<Transaction> page = transactionRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(TransactionResponse::from));
    }

    @Override
    @Transactional
    public String getVNPayUrl(Long transactionId, String bankCode, HttpServletRequest request) {
        Transaction transaction = findTransactionOrThrow(transactionId);
        orderAccess.requireRenter(transaction.getOrder());
        HttpServletRequest req = request != null ? request : getCurrentHttpRequest();
        return vnPayService.createPaymentUrl(transactionId, bankCode, req);
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
