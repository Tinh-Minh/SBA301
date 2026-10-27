package com.carrental.dto.request;

import com.carrental.entity.BankAccount;
import com.carrental.entity.Customer;
import com.carrental.entity.Payout;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.PayoutStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreatePayoutRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    private Long recipientId;

    private Long bankAccountId;

    private BigDecimal grossAmount;

    private BigDecimal platformFee;

    private BigDecimal netAmount;

    private String note;

    public Payout toEntity() {
        return toEntity(null, null, null, this.grossAmount, this.platformFee, this.netAmount);
    }

    public Payout toEntity(RentalOrder order, Customer recipient, BankAccount bankAccount,
                          BigDecimal grossAmount, BigDecimal platformFee, BigDecimal netAmount) {
        Payout payout = new Payout();
        payout.setOrder(order);
        payout.setRecipient(recipient);
        payout.setBankAccount(bankAccount);
        payout.setGrossAmount(grossAmount);
        payout.setPlatformFee(platformFee != null ? platformFee : BigDecimal.ZERO);
        payout.setNetAmount(netAmount);
        payout.setStatus(PayoutStatus.PENDING);
        payout.setNote(this.note);
        return payout;
    }
}
