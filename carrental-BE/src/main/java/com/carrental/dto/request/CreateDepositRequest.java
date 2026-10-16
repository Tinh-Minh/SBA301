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
import java.time.LocalDateTime;

@Getter
@Setter
public class CreateDepositRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    @Positive(message = "Số tiền cọc phải lớn hơn 0")
    private BigDecimal amount;

    private String method;

    public Transaction toEntity() {
        Transaction transaction = new Transaction();
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setAmount(this.amount);

        PaymentMethod paymentMethod = PaymentMethod.MOCK_GATEWAY;
        if (this.method != null) {
            try {
                paymentMethod = PaymentMethod.valueOf(this.method.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        transaction.setMethod(paymentMethod);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());
        return transaction;
    }
}
