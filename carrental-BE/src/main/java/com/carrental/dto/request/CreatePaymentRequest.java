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
public class CreatePaymentRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    @Positive(message = "Số tiền thanh toán phải lớn hơn 0")
    private BigDecimal amount;

    private String method;

    public Transaction toEntity() {
        Transaction transaction = new Transaction();
        transaction.setTransactionType(TransactionType.RENTAL_PAYMENT);
        transaction.setAmount(this.amount);

        PaymentMethod paymentMethod = PaymentMethod.VNPAY;
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
