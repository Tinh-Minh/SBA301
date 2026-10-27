package com.carrental.service.impl;

import com.carrental.dto.request.CreateExtraFeeRequest;
import com.carrental.dto.request.PayExtraFeeRequest;
import com.carrental.dto.response.ExtraFeeResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.ExtraFee;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Transaction;
import com.carrental.enums.ExtraFeeStatus;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.exception.AppException;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.ExtraFeeRepository;
import com.carrental.repository.ExtraFeeSpecification;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.service.ExtraFeeService;
import com.carrental.service.VNPayService;
import com.carrental.util.TimeUtil;
import com.carrental.util.OrderAccess;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExtraFeeServiceImpl implements ExtraFeeService {

    private final ExtraFeeRepository extraFeeRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final VNPayService vnPayService;
    private final OrderAccess orderAccess;

    @Override
    @Transactional
    public ExtraFeeResponse createExtraFee(CreateExtraFeeRequest request) {
        log.info("Tạo phí phát sinh orderId={}, feeType={}, amount={}",
                request.getOrderId(), request.getFeeType(), request.getAmount());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            orderAccess.requireOwner(order);
            Customer current = orderAccess.requireUser();
            ExtraFee extraFee = request.toEntity(order, current);

            ExtraFee saved = extraFeeRepository.save(extraFee);
            log.info("Tạo phí phát sinh thành công id={}", saved.getId());
            return ExtraFeeResponse.from(saved);
        } catch (AppException e) {
            log.warn("Tạo phí phát sinh thất bại orderId={}: {}", request.getOrderId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo phí phát sinh orderId={}", request.getOrderId(), e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo phí phát sinh");
        }
    }

    @Override
    @Transactional
    public ExtraFeeResponse payExtraFee(Long extraFeeId, PayExtraFeeRequest request) {
        log.info("Thanh toán phí phát sinh id={}", extraFeeId);
        try {
            ExtraFee extraFee = findExtraFeeOrThrow(extraFeeId);
            ExtraFeeStatus currentStatus = extraFee.getStatus();
            currentStatus.validateTransitionTo(ExtraFeeStatus.PAID);

            PaymentMethod method = PaymentMethod.VNPAY;
            if (request != null && request.getMethod() != null && !request.getMethod().isBlank()) {
                String mStr = request.getMethod().trim().toUpperCase();
                if ("DIRECT".equals(mStr)) {
                    method = PaymentMethod.CASH;
                } else {
                    try {
                        method = PaymentMethod.valueOf(mStr);
                    } catch (IllegalArgumentException e) {
                        throw new AppException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán không hợp lệ: " + request.getMethod());
                    }
                }
            }

            if (method == PaymentMethod.CASH) {
                // Khách trả tiền mặt trực tiếp cho chủ xe lúc trả xe -> chỉ chủ xe được bấm xác nhận đã nhận tiền mặt
                orderAccess.requireOwner(extraFee.getOrder());

                extraFee.setStatus(ExtraFeeStatus.PAID);

                Transaction transaction = Transaction.builder()
                        .order(extraFee.getOrder())
                        .extraFee(extraFee)
                        .transactionType(TransactionType.EXTRA_FEE)
                        .amount(extraFee.getAmount())
                        .method(method)
                        .status(TransactionStatus.SUCCESS)
                        .providerRef("CASH_" + UUID.randomUUID().toString().substring(0, 8))
                        .paidAt(TimeUtil.nowVn())
                        .build();
                transactionRepository.save(transaction);

                ExtraFee saved = extraFeeRepository.save(extraFee);
                log.info("Chủ xe xác nhận đã nhận tiền mặt phí phát sinh thành công id={}", saved.getId());
                return ExtraFeeResponse.from(saved);
            } else {
                // VNPAY: Người thuê thanh toán qua cổng VNPay
                orderAccess.requireRenter(extraFee.getOrder());

                Transaction transaction = Transaction.builder()
                        .order(extraFee.getOrder())
                        .extraFee(extraFee)
                        .transactionType(TransactionType.EXTRA_FEE)
                        .amount(extraFee.getAmount())
                        .method(PaymentMethod.VNPAY)
                        .status(TransactionStatus.PENDING)
                        .build();
                Transaction savedTx = transactionRepository.save(transaction);

                String paymentUrl = vnPayService.createPaymentUrl(savedTx.getId(), null);
                log.info("Khởi tạo link VNPay thanh toán phí phát sinh id={}, url={}", extraFeeId, paymentUrl);
                return ExtraFeeResponse.from(extraFee, paymentUrl);
            }
        } catch (AppException e) {
            log.warn("Thanh toán phí phát sinh thất bại id={}: {}", extraFeeId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi thanh toán phí phát sinh id={}", extraFeeId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể thanh toán phí phát sinh");
        }
    }

    @Override
    @Transactional
    public ExtraFeeResponse waiveExtraFee(Long extraFeeId, String note) {
        log.info("Miễn trừ phí phát sinh id={}, note={}", extraFeeId, note);
        try {
            ExtraFee extraFee = findExtraFeeOrThrow(extraFeeId);
            orderAccess.requireOwnerOrAdmin(extraFee.getOrder());
            ExtraFeeStatus current = extraFee.getStatus();
            current.validateTransitionTo(ExtraFeeStatus.WAIVED);

            extraFee.setStatus(ExtraFeeStatus.WAIVED);
            if (note != null && !note.isBlank()) {
                extraFee.setDescription(extraFee.getDescription() != null ? extraFee.getDescription() + " | Miễn trừ: " + note : "Miễn trừ: " + note);
            }

            ExtraFee saved = extraFeeRepository.save(extraFee);
            log.info("Miễn trừ phí phát sinh thành công id={}", saved.getId());
            return ExtraFeeResponse.from(saved);
        } catch (AppException e) {
            log.warn("Miễn trừ phí phát sinh thất bại id={}: {}", extraFeeId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi miễn trừ phí phát sinh id={}", extraFeeId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể miễn trừ phí phát sinh");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ExtraFeeResponse getById(Long id) {
        ExtraFee extraFee = findExtraFeeOrThrow(id);
        orderAccess.requireParty(extraFee.getOrder());
        return ExtraFeeResponse.from(extraFee);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExtraFeeResponse> getPaged(Long orderId, String status, Pageable pageable) {
        if (orderId != null) {
            orderAccess.requireParty(findOrderOrThrow(orderId));
        } else {
            orderAccess.requireAdmin();
        }
        Specification<ExtraFee> spec = ExtraFeeSpecification.filter(orderId, status);
        Page<ExtraFee> page = extraFeeRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(ExtraFeeResponse::from));
    }

    private ExtraFee findExtraFeeOrThrow(Long id) {
        return extraFeeRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phí phát sinh id=" + id));
    }

    private RentalOrder findOrderOrThrow(Long orderId) {
        return rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê id=" + orderId));
    }
}
