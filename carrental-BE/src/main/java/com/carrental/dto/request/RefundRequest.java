package com.carrental.dto.request;

import com.carrental.entity.Transaction;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.util.TimeUtil;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequest {
    @NotNull(message = "Mã giao dịch gốc không được để trống")
    private Long parentTransactionId;

    @Positive(message = "Số tiền hoàn phải lớn hơn 0")
    private BigDecimal amount;

    private String reason;

    public static RefundRequest of(Long parentTransactionId, BigDecimal amount, String reason) {
        return new RefundRequest(parentTransactionId, amount, reason);
    }

    public Transaction toEntity(Transaction parent, BigDecimal refundAmount) {
        Transaction refundTx = new Transaction();
        refundTx.setOrder(parent.getOrder());
        refundTx.setRefundOf(parent);
        refundTx.setTransactionType(TransactionType.REFUND);
        refundTx.setAmount(refundAmount);
        refundTx.setMethod(parent.getMethod());
        refundTx.setStatus(TransactionStatus.SUCCESS);
        refundTx.setProviderRef("REFUND_" + UUID.randomUUID().toString().substring(0, 8));
        refundTx.setPaidAt(TimeUtil.nowVn());
        return refundTx;
    }
}
