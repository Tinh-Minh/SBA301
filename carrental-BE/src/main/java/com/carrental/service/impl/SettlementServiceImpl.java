package com.carrental.service.impl;

import com.carrental.service.*;
import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

import com.carrental.entity.Booking;
import com.carrental.entity.Customer;
import com.carrental.entity.SettlementSlip;
import com.carrental.entity.SettlementSlip.SlipStatus;
import com.carrental.entity.SettlementSlip.SlipType;
import com.carrental.exception.AppException;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.SettlementSlipRepository;
import com.carrental.util.TimeUtil;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Phiếu hoàn / chi trả / phạt gửi Admin. Admin chuyển khoản thủ công theo thông tin ngân hàng
 * trên phiếu và xác nhận kèm mã giao dịch; hạn xử lý {@value #PROCESSING_WORKING_DAYS} ngày làm việc.
 * Phiếu phạt chủ xe được cấn trừ vào phiếu chi trả kế tiếp (số dư âm như Mioto).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {

    public static final int PROCESSING_WORKING_DAYS = 3;

    private static final SecureRandom RANDOM = new SecureRandom();

    private final SettlementSlipRepository slipRepository;
    private final CustomerRepository customerRepository;
    private final CurrentUserService currentUserService;

    // ------------------------------------------------------------------ tạo phiếu

    /** Hoàn tiền cho khách (huỷ chuyến, chủ xe huỷ, chủ xe vắng mặt, chủ xe từ chối...). */
    @Override
    @Transactional
    public SettlementSlip refundCustomer(Booking b, BigDecimal amount, String reason) {
        return create(SlipType.CUSTOMER_REFUND, b, b.getCustomer(), amount, reason);
    }

    /** Phạt chủ xe (huỷ chuyến / không giao xe); cấn trừ vào lần chi trả sau. */
    @Override
    @Transactional
    public SettlementSlip penalizeOwner(Booking b, BigDecimal amount, String reason) {
        return create(SlipType.OWNER_PENALTY, b, b.getOwner(), amount, reason);
    }

    /** Chi trả cho chủ xe; tự cấn trừ các khoản phạt chủ xe đang nợ. */
    @Override
    @Transactional
    public SettlementSlip payOwner(Booking b, BigDecimal gross, String reason) {
        if (gross == null || gross.signum() <= 0) {
            return null;
        }
        BigDecimal net = gross;
        List<String> offsets = new ArrayList<>();
        for (SettlementSlip penalty : slipRepository.findByRecipientIdAndSlipTypeAndStatusOrderByCreatedAtAsc(
                b.getOwner().getId(), SlipType.OWNER_PENALTY, SlipStatus.PENDING)) {
            if (net.signum() <= 0) {
                break;
            }
            BigDecimal used = penalty.getAmount().min(net);
            net = net.subtract(used);
            offsets.add(penalty.getSlipCode() + " (" + used.toPlainString() + "đ)");
            if (used.compareTo(penalty.getAmount()) >= 0) {
                penalty.setStatus(SlipStatus.COMPLETED);
                penalty.setProcessedAt(TimeUtil.nowVn());
                penalty.setNote("Đã cấn trừ vào tiền chi trả đơn " + b.getBookingCode());
            } else {
                penalty.setAmount(penalty.getAmount().subtract(used));
                penalty.setNote("Đã cấn trừ một phần " + used.toPlainString() + "đ vào đơn " + b.getBookingCode());
            }
            slipRepository.save(penalty);
        }
        String fullReason = offsets.isEmpty() ? reason
                : reason + ". Đã cấn trừ phạt: " + String.join(", ", offsets);
        if (net.signum() <= 0) {
            log.info("Chi trả đơn {} được cấn trừ hết vào phạt của chủ xe", b.getBookingCode());
            return null;
        }
        return create(SlipType.OWNER_PAYOUT, b, b.getOwner(), net, fullReason);
    }

    private SettlementSlip create(SlipType type, Booking b, Customer recipient, BigDecimal amount, String reason) {
        if (amount == null || amount.signum() <= 0) {
            return null;
        }
        LocalDateTime now = TimeUtil.nowVn();
        SettlementSlip slip = SettlementSlip.builder()
                .slipCode(newCode(type))
                .slipType(type)
                .bookingId(b.getId())
                .bookingCode(b.getBookingCode())
                .recipientId(recipient.getId())
                .recipientName(recipient.getFullName())
                .amount(amount)
                .reason(reason.length() > 500 ? reason.substring(0, 500) : reason)
                .dueAt(addWorkingDays(now, PROCESSING_WORKING_DAYS))
                .build();
        copyBank(slip, recipient);
        log.info("Tạo phiếu {} {} cho đơn {}: {}đ", type, slip.getSlipCode(), b.getBookingCode(), amount);
        return slipRepository.save(slip);
    }

    private static void copyBank(SettlementSlip slip, Customer c) {
        if (c.hasBankAccount()) {
            slip.setBankAccountNumber(c.getBankAccountNumber());
            slip.setBankName(c.getBankName());
            slip.setBankBranch(c.getBankBranch());
            slip.setBankAccountHolder(c.getBankAccountHolder());
        }
    }

    /** Cộng N ngày làm việc (bỏ qua thứ Bảy, Chủ nhật). */
    public static LocalDateTime addWorkingDays(LocalDateTime from, int days) {
        LocalDateTime result = from;
        int added = 0;
        while (added < days) {
            result = result.plusDays(1);
            if (result.getDayOfWeek() != DayOfWeek.SATURDAY && result.getDayOfWeek() != DayOfWeek.SUNDAY) {
                added++;
            }
        }
        return result;
    }

    private String newCode(SlipType type) {
        String prefix = switch (type) {
            case CUSTOMER_REFUND -> "HT";
            case OWNER_PAYOUT -> "CT";
            case OWNER_PENALTY -> "PH";
        };
        for (int i = 0; i < 10; i++) {
            String code = prefix + "-" + TimeUtil.nowVn().toLocalDate().toString().replace("-", "")
                    + "-" + Integer.toString(RANDOM.nextInt(36 * 36 * 36 * 36), 36).toUpperCase();
            if (!slipRepository.existsBySlipCode(code)) {
                return code;
            }
        }
        throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không tạo được mã phiếu");
    }

    // ------------------------------------------------------------------ đọc / xử lý

    @Override
    @Transactional(readOnly = true)
    public List<SlipResponse> mine() {
        Customer user = currentUserService.getCurrentUser();
        return slipRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId()).stream().map(SlipResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlipResponse> forBooking(Long bookingId) {
        return slipRepository.findByBookingIdOrderByCreatedAtAsc(bookingId).stream().map(SlipResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlipResponse> adminList(SlipType type, SlipStatus status) {
        requireAdmin();
        Specification<SettlementSlip> spec = (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            if (type != null) ps.add(cb.equal(root.get("slipType"), type));
            if (status != null) ps.add(cb.equal(root.get("status"), status));
            return cb.and(ps.toArray(new Predicate[0]));
        };
        return slipRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "status").and(Sort.by("dueAt")))
                .stream().map(SlipResponse::from).toList();
    }

    /** Admin xác nhận đã chuyển khoản (hoàn tiền / chi trả) kèm mã giao dịch ngân hàng. */
    @Override
    @Transactional
    public SlipResponse complete(Long id, String referenceCode, String note) {
        Customer admin = requireAdmin();
        SettlementSlip slip = slipRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phiếu id=" + id));
        if (slip.getStatus() != SlipStatus.PENDING) {
            throw new AppException(HttpStatus.CONFLICT, "Phiếu đã được xử lý");
        }
        if (slip.getSlipType() == SlipType.OWNER_PENALTY) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Phiếu phạt được tự cấn trừ vào lần chi trả kế tiếp của chủ xe");
        }
        if (slip.getBankAccountNumber() == null) {
            // Người nhận có thể đã bổ sung tài khoản sau khi phiếu được tạo.
            customerRepository.findById(slip.getRecipientId()).ifPresent(c -> copyBank(slip, c));
            if (slip.getBankAccountNumber() == null) {
                throw new AppException(HttpStatus.CONFLICT, "Người nhận chưa có tài khoản ngân hàng, chưa thể chuyển tiền");
            }
        }
        if (referenceCode == null || referenceCode.isBlank() || referenceCode.length() > 100) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng nhập mã giao dịch chuyển khoản (tối đa 100 ký tự)");
        }
        slip.setStatus(SlipStatus.COMPLETED);
        slip.setReferenceCode(referenceCode.trim());
        slip.setNote(note == null || note.isBlank() ? null : note.trim());
        slip.setProcessedAt(TimeUtil.nowVn());
        slip.setProcessedBy(admin.getId());
        log.info("Admin {} hoàn tất phiếu {} ref={}", admin.getId(), slip.getSlipCode(), referenceCode);
        return SlipResponse.from(slipRepository.save(slip));
    }

    private Customer requireAdmin() {
        Customer user = currentUserService.getCurrentUser();
        if (!currentUserService.isAdmin(user)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ quản trị viên mới xử lý phiếu");
        }
        return user;
    }
}
