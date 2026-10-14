package com.carrental.service;

import com.carrental.dto.request.CreateDepositRequest;
import com.carrental.dto.request.CreatePaymentRequest;
import com.carrental.dto.request.MockPaymentProcessRequest;
import com.carrental.dto.request.RefundRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Transaction;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.exception.AppException;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final RentalOrderRepository rentalOrderRepository;

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
            return TransactionResponse.from(saved);
        } catch (AppException e) {
            log.warn("Tạo giao dịch đặt cọc thất bại orderId={}: {}", request.getOrderId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo giao dịch đặt cọc orderId={}", request.getOrderId(), e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo giao dịch đặt cọc");
        }
    }

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
            return TransactionResponse.from(saved);
        } catch (AppException e) {
            log.warn("Tạo giao dịch thanh toán thất bại orderId={}: {}", request.getOrderId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo giao dịch thanh toán orderId={}", request.getOrderId(), e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo giao dịch thanh toán");
        }
    }

    @Transactional
    public TransactionResponse simulatePaymentGateway(Long transactionId, MockPaymentProcessRequest request) {
        log.info("Giả lập cổng thanh toán cho giao dịch id={}, success={}", transactionId, request.isSimulateSuccess());
        try {
            Transaction transaction = findTransactionOrThrow(transactionId);
            TransactionStatus current = TransactionStatus.valueOf(transaction.getStatus());
            TransactionStatus next = request.isSimulateSuccess() ? TransactionStatus.SUCCESS : TransactionStatus.FAILED;

            current.validateTransitionTo(next);
            transaction.setStatus(next.name());
            transaction.setUpdatedAt(Instant.now());

            String ref = request.getProviderRef() != null && !request.getProviderRef().isBlank()
                    ? request.getProviderRef()
                    : "MOCK_GW_" + UUID.randomUUID().toString().substring(0, 8);
            transaction.setProviderRef(ref);

            if (next == TransactionStatus.SUCCESS) {
                transaction.setPaidAt(Instant.now());
                RentalOrder order = transaction.getOrder();
                if (order != null) {
                    if (TransactionType.DEPOSIT.name().equalsIgnoreCase(transaction.getTransactionType())) {
                        order.setPaymentStatus("DEPOSITED");
                    } else if (TransactionType.PAYMENT.name().equalsIgnoreCase(transaction.getTransactionType())) {
                        order.setPaymentStatus("PAID");
                    }
                    order.setUpdatedAt(Instant.now());
                    rentalOrderRepository.save(order);
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
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xử lý cổng thanh toán");
        }
    }

    @Transactional
    public TransactionResponse refund(RefundRequest request) {
        log.info("Hoàn tiền cho giao dịch id={}, amount={}", request.getParentTransactionId(), request.getAmount());
        try {
            Transaction parent = findTransactionOrThrow(request.getParentTransactionId());
            if (!TransactionStatus.SUCCESS.name().equalsIgnoreCase(parent.getStatus())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ có thể hoàn tiền cho giao dịch đã thành công (SUCCESS)");
            }

            BigDecimal refundAmount = request.getAmount() != null ? request.getAmount() : parent.getAmount();
            if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0
                    || refundAmount.compareTo(parent.getAmount()) > 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Số tiền hoàn không hợp lệ (vượt quá giao dịch gốc)");
            }

            Transaction refundTx = new Transaction();
            refundTx.setOrder(parent.getOrder());
            refundTx.setTransactions(parent);
            refundTx.setTransactionType(TransactionType.REFUND.name());
            refundTx.setAmount(refundAmount);
            refundTx.setMethod(parent.getMethod());
            refundTx.setStatus(TransactionStatus.SUCCESS.name());
            refundTx.setProviderRef("REFUND_" + UUID.randomUUID().toString().substring(0, 8));
            refundTx.setPaidAt(Instant.now());
            refundTx.setCreatedAt(Instant.now());
            refundTx.setUpdatedAt(Instant.now());

            RentalOrder order = parent.getOrder();
            if (order != null && TransactionType.DEPOSIT.name().equalsIgnoreCase(parent.getTransactionType())) {
                order.setPaymentStatus("DEPOSIT_REFUNDED");
                order.setUpdatedAt(Instant.now());
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

    @Transactional(readOnly = true)
    public TransactionResponse getById(Long id) {
        return TransactionResponse.from(findTransactionOrThrow(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getPaged(Long orderId, String transactionType, String status, Pageable pageable) {
        Page<Transaction> page;
        if (orderId != null) {
            page = transactionRepository.findByOrderId(orderId, pageable);
        } else if (transactionType != null && !transactionType.isBlank()) {
            page = transactionRepository.findByTransactionType(transactionType, pageable);
        } else if (status != null && !status.isBlank()) {
            page = transactionRepository.findByStatus(status, pageable);
        } else {
            page = transactionRepository.findAll(pageable);
        }
        return PageResponse.from(page.map(TransactionResponse::from));
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
