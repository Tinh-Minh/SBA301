package com.carrental.dto.request;

import com.carrental.entity.RentalOrder;
import com.carrental.entity.Transaction;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateDepositRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    private BigDecimal amount;

    private String method;

    public Transaction toEntity() {
        return toEntity(null, this.amount);
    }

    public Transaction toEntity(RentalOrder order, BigDecimal depositAmount) {
        Transaction transaction = new Transaction();
        transaction.setOrder(order);
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setAmount(depositAmount);

        PaymentMethod paymentMethod = PaymentMethod.VNPAY;
        if (this.method != null && !this.method.isBlank()) {
            paymentMethod = PaymentMethod.valueOf(this.method.trim().toUpperCase());
        }
        transaction.setMethod(paymentMethod);
        transaction.setStatus(TransactionStatus.PENDING);
        return transaction;
    }
}
