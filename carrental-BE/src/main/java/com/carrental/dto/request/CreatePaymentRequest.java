package com.carrental.dto.request;

import com.carrental.entity.Transaction;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class CreatePaymentRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    @Positive(message = "Số tiền thanh toán phải lớn hơn 0")
    private BigDecimal amount;

    private String method;

    public Transaction toEntity() {
        Transaction transaction = new Transaction();
        transaction.setTransactionType(TransactionType.PAYMENT.name());
        transaction.setAmount(this.amount);
        transaction.setMethod(this.method != null ? this.method : PaymentMethod.MOCK_GATEWAY.name());
        transaction.setStatus(TransactionStatus.PENDING.name());
        transaction.setCreatedAt(Instant.now());
        transaction.setUpdatedAt(Instant.now());
        return transaction;
    }
}
