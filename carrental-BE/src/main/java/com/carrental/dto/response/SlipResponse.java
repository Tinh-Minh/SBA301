package com.carrental.dto.response;

import com.carrental.entity.SettlementSlip;
import com.carrental.entity.SettlementSlip.SlipStatus;
import com.carrental.entity.SettlementSlip.SlipType;
import com.carrental.util.TimeUtil;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.carrental.dto.request.*;

public record SlipResponse(Long id, String slipCode, SlipType slipType, String typeLabel, Long bookingId,
                           String bookingCode, Long recipientId, String recipientName, BigDecimal amount,
                           String reason, SlipStatus status, String bankAccountNumber, String bankName,
                           String bankBranch, String bankAccountHolder, boolean bankMissing,
                           LocalDateTime dueAt, boolean overdue, LocalDateTime processedAt,
                           String referenceCode, String note, LocalDateTime createdAt) {
    public static SlipResponse from(SettlementSlip s) {
        boolean overdue = s.getStatus() == SlipStatus.PENDING && TimeUtil.nowVn().isAfter(s.getDueAt());
        String label = switch (s.getSlipType()) {
            case CUSTOMER_REFUND -> "Hoàn tiền cho khách";
            case OWNER_PAYOUT -> "Chi trả cho chủ xe";
            case OWNER_PENALTY -> "Phạt chủ xe";
        };
        return new SlipResponse(s.getId(), s.getSlipCode(), s.getSlipType(), label, s.getBookingId(),
                s.getBookingCode(), s.getRecipientId(), s.getRecipientName(), s.getAmount(), s.getReason(),
                s.getStatus(), s.getBankAccountNumber(), s.getBankName(), s.getBankBranch(),
                s.getBankAccountHolder(), s.getBankAccountNumber() == null, s.getDueAt(), overdue,
                s.getProcessedAt(), s.getReferenceCode(), s.getNote(), s.getCreatedAt());
    }
}
