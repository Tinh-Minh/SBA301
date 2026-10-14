package com.carrental.service;

import com.carrental.dto.request.CreatePayoutRequest;
import com.carrental.dto.request.ProcessPayoutRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.PayoutResponse;
import com.carrental.entity.BankAccount;
import com.carrental.entity.Customer;
import com.carrental.entity.Payout;
import com.carrental.entity.RentalOrder;
import com.carrental.exception.AppException;
import com.carrental.repository.BankAccountRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.PayoutRepository;
import com.carrental.repository.RentalOrderRepository;
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
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final CustomerRepository customerRepository;
    private final BankAccountRepository bankAccountRepository;

    @Transactional
    public PayoutResponse createPayout(CreatePayoutRequest request) {
        log.info("Tạo yêu cầu chi trả orderId={}, recipientId={}, grossAmount={}",
                request.getOrderId(), request.getRecipientId(), request.getGrossAmount());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            Customer recipient = findCustomerOrThrow(request.getRecipientId());

            Payout payout = request.toEntity();
            payout.setOrder(order);
            payout.setRecipient(recipient);

            if (request.getBankAccountId() != null) {
                BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId())
                        .orElse(null);
                payout.setBankAccounts(bankAccount);
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

    @Transactional
    public PayoutResponse processPayout(Long payoutId, ProcessPayoutRequest request) {
        log.info("Cập nhật trạng thái chi trả payoutId={}, nextStatus={}", payoutId, request.getStatus());
        try {
            Payout payout = findPayoutOrThrow(payoutId);
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

    @Transactional(readOnly = true)
    public PayoutResponse getById(Long id) {
        return PayoutResponse.from(findPayoutOrThrow(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<PayoutResponse> getPaged(Long recipientId, Long orderId, String status, Pageable pageable) {
        Page<Payout> page;
        if (recipientId != null) {
            page = payoutRepository.findByRecipientId(recipientId, pageable);
        } else if (orderId != null) {
            page = payoutRepository.findByOrderId(orderId, pageable);
        } else if (status != null && !status.isBlank()) {
            page = payoutRepository.findByStatus(status, pageable);
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
