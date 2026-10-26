package com.carrental.service.impl;

import com.carrental.dto.request.CreatePayoutRequest;
import com.carrental.dto.request.ProcessPayoutRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.PayoutResponse;
import com.carrental.entity.BankAccount;
import com.carrental.entity.Customer;
import com.carrental.entity.Payout;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.PayoutStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.BankAccountRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.PayoutRepository;
import com.carrental.repository.PayoutSpecification;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.util.OrderAccess;
import com.carrental.service.PayoutService;
import com.carrental.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayoutServiceImpl implements PayoutService {

    private final PayoutRepository payoutRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final CustomerRepository customerRepository;
    private final BankAccountRepository bankAccountRepository;
    private final OrderAccess orderAccess;

    @Override
    @Transactional
    public PayoutResponse createPayout(CreatePayoutRequest request) {
        log.info("Tạo yêu cầu chi trả orderId={}, recipientId={}, grossAmount={}",
                request.getOrderId(), request.getRecipientId(), request.getGrossAmount());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());

            // 1. Kiểm tra đơn hàng phải ở trạng thái COMPLETED
            if (order.getStatus() != OrderStatus.COMPLETED) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ có thể tạo chi trả cho đơn thuê đã hoàn thành (COMPLETED)");
            }

            // 2. Kiểm tra không cho phép tạo payout trùng cho cùng đơn hàng
            if (payoutRepository.findByOrderId(order.getId()).isPresent()) {
                throw new AppException(HttpStatus.CONFLICT, "Đơn thuê này đã được tạo yêu cầu chi trả");
            }

            // 3. Xác định người nhận (Chủ xe)
            Customer owner = null;
            if (order.getCar() != null) {
                owner = order.getCar().getOwner();
            }
            if (owner == null) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê không có thông tin chủ xe nhận chi trả");
            }
            if (request.getRecipientId() != null && !request.getRecipientId().equals(owner.getId())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Người nhận chi trả phải là chủ xe của xe thuê");
            }
            Customer recipient = owner;

            // 4. Lấy số tiền và tính toán chi trả hoàn toàn từ đơn hàng trong cơ sở dữ liệu
            BigDecimal grossAmount = order.getTotalAmount();
            if (grossAmount == null) {
                grossAmount = BigDecimal.ZERO;
            }

            BigDecimal commissionRate = order.getCommissionRate();
            if (commissionRate == null) {
                commissionRate = new BigDecimal("10.00");
            }

            BigDecimal platformFee = grossAmount.multiply(commissionRate)
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);

            BigDecimal netAmount = grossAmount.subtract(platformFee);

            BankAccount bankAccount;
            if (request.getBankAccountId() != null) {
                bankAccount = bankAccountRepository.findByIdAndCustomerId(request.getBankAccountId(), recipient.getId())
                        .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Tài khoản ngân hàng không thuộc về người nhận"));
            } else {
                bankAccount = bankAccountRepository.findByCustomerIdAndIsDefaultTrue(recipient.getId())
                        .or(() -> bankAccountRepository.findAllByCustomerIdOrderByCreatedAtDesc(recipient.getId()).stream().findFirst())
                        .orElse(null);
            }

            Payout payout = request.toEntity(order, recipient, bankAccount, grossAmount, platformFee, netAmount);
            Payout saved = payoutRepository.save(payout);
            log.info("Tạo yêu cầu chi trả thành công id={}, netAmount={}", saved.getId(), saved.getNetAmount());
            return PayoutResponse.from(saved);
        } catch (AppException e) {
            log.warn("Tạo yêu cầu chi trả thất bại orderId={}: {}", request.getOrderId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo yêu cầu chi trả orderId={}", request.getOrderId(), e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo yêu cầu chi trả");
        }
    }

    @Override
    @Transactional
    public PayoutResponse processPayout(Long payoutId, ProcessPayoutRequest request) {
        log.info("Cập nhật trạng thái chi trả payoutId={}, nextStatus={}", payoutId, request.getStatus());
        try {
            Payout payout = findPayoutOrThrow(payoutId);

            if (request.getBankAccountId() != null) {
                BankAccount bankAccount = bankAccountRepository.findByIdAndCustomerId(request.getBankAccountId(), payout.getRecipient().getId())
                        .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Tài khoản ngân hàng không thuộc về người nhận"));
                payout.setBankAccount(bankAccount);
            } else if (payout.getBankAccount() == null && payout.getRecipient() != null) {
                BankAccount defaultAccount = bankAccountRepository.findByCustomerIdAndIsDefaultTrue(payout.getRecipient().getId())
                        .or(() -> bankAccountRepository.findAllByCustomerIdOrderByCreatedAtDesc(payout.getRecipient().getId()).stream().findFirst())
                        .orElse(null);
                payout.setBankAccount(defaultAccount);
            }

            PayoutStatus nextStatus = PayoutStatus.valueOf(request.getStatus().toUpperCase());
            if (nextStatus == PayoutStatus.PAID && payout.getBankAccount() == null) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "Chủ xe chưa có tài khoản ngân hàng để nhận chi trả. Vui lòng yêu cầu chủ xe liên kết tài khoản ngân hàng trước.");
            }

            request.applyTo(payout);

            Payout saved = payoutRepository.save(payout);
            log.info("Cập nhật trạng thái chi trả thành công id={}, status={}", saved.getId(), saved.getStatus());
            return PayoutResponse.from(saved);
        } catch (AppException e) {
            log.warn("Cập nhật trạng thái chi trả thất bại payoutId={}: {}", payoutId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi cập nhật trạng thái chi trả payoutId={}", payoutId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể cập nhật trạng thái chi trả");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PayoutResponse getById(Long id) {
        Payout payout = findPayoutOrThrow(id);
        Customer user = orderAccess.requireUser();
        boolean recipient = payout.getRecipient() != null && user.getId().equals(payout.getRecipient().getId());
        if (!orderAccess.isAdmin(user) && !recipient) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không được xem khoản chi trả này");
        }
        return PayoutResponse.from(payout);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PayoutResponse> getPaged(Long recipientId, Long orderId, String status, Pageable pageable) {
        Customer user = orderAccess.requireUser();
        Long effectiveRecipientId = recipientId;
        if (!orderAccess.isAdmin(user)) {
            if (effectiveRecipientId != null && !effectiveRecipientId.equals(user.getId())) {
                throw new AppException(HttpStatus.FORBIDDEN, "Bạn chỉ xem được khoản chi trả của mình");
            }
            effectiveRecipientId = user.getId();
        }

        Specification<Payout> spec = PayoutSpecification.filter(effectiveRecipientId, orderId, status);
        Page<Payout> page = payoutRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(PayoutResponse::from));
    }

    private Payout findPayoutOrThrow(Long id) {
        return payoutRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin chi trả id=" + id));
    }

    private RentalOrder findOrderOrThrow(Long orderId) {
        return rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê id=" + orderId));
    }

    private Customer findCustomerOrThrow(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng/chủ xe id=" + customerId));
    }
}
