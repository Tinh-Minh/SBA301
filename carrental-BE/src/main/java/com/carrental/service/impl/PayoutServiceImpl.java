package com.carrental.service.impl;

import com.carrental.dto.request.CreatePayoutRequest;
import com.carrental.dto.request.ProcessPayoutRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.PayoutResponse;
import com.carrental.entity.BankAccount;
import com.carrental.entity.Customer;
import com.carrental.entity.Payout;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.PayoutStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.BankAccountRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.PayoutRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.service.OrderAccess;
import com.carrental.service.PayoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            orderAccess.requireAdmin();
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            Customer recipient = findCustomerOrThrow(request.getRecipientId());

            Payout payout = request.toEntity();
            payout.setOrder(order);
            payout.setRecipient(recipient);

            if (request.getBankAccountId() != null) {
                BankAccount bankAccount = bankAccountRepository.findByIdAndCustomer_Id(request.getBankAccountId(), recipient.getId())
                        .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Tài khoản ngân hàng không thuộc về người nhận"));
                payout.setBankAccount(bankAccount);
            } else {
                BankAccount defaultAccount = bankAccountRepository.findByCustomer_IdAndIsDefaultTrue(recipient.getId())
                        .or(() -> bankAccountRepository.findAllByCustomer_IdOrderByCreatedAtDesc(recipient.getId()).stream().findFirst())
                        .orElse(null);
                payout.setBankAccount(defaultAccount);
            }

            Payout saved = payoutRepository.save(payout);
            log.info("Tạo yêu cầu chi trả thành công id={}", saved.getId());
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
            orderAccess.requireAdmin();
            Payout payout = findPayoutOrThrow(payoutId);

            if (request.getBankAccountId() != null) {
                BankAccount bankAccount = bankAccountRepository.findByIdAndCustomer_Id(request.getBankAccountId(), payout.getRecipient().getId())
                        .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Tài khoản ngân hàng không thuộc về người nhận"));
                payout.setBankAccount(bankAccount);
            } else if (payout.getBankAccount() == null && payout.getRecipient() != null) {
                BankAccount defaultAccount = bankAccountRepository.findByCustomer_IdAndIsDefaultTrue(payout.getRecipient().getId())
                        .or(() -> bankAccountRepository.findAllByCustomer_IdOrderByCreatedAtDesc(payout.getRecipient().getId()).stream().findFirst())
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
        if (!orderAccess.isAdmin(user) && (recipientId == null || !recipientId.equals(user.getId()))) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn chỉ xem được khoản chi trả của mình");
        }
        Page<Payout> page;
        if (recipientId != null) {
            page = payoutRepository.findByRecipientId(recipientId, pageable);
        } else if (orderId != null) {
            page = payoutRepository.findByOrderId(orderId, pageable);
        } else if (status != null && !status.isBlank()) {
            PayoutStatus payoutStatus = PayoutStatus.valueOf(status.toUpperCase());
            page = payoutRepository.findByStatus(payoutStatus, pageable);
        } else {
            page = payoutRepository.findAll(pageable);
        }
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
