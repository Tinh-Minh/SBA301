package com.carrental.dto.request;

import com.carrental.entity.Payout;
import com.carrental.enums.PayoutStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CreatePayoutRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "Mã người nhận không được để trống")
    private Long recipientId;

    private Long bankAccountId;

    @NotNull(message = "Tổng tiền gross không được để trống")
    @Positive(message = "Tổng tiền gross phải lớn hơn 0")
    private BigDecimal grossAmount;

    private BigDecimal platformFee;

    private BigDecimal netAmount;

    private String note;

    public Payout toEntity() {
        Payout payout = new Payout();
        payout.setGrossAmount(this.grossAmount);
        BigDecimal fee = this.platformFee != null ? this.platformFee : BigDecimal.ZERO;
        payout.setPlatformFee(fee);
        payout.setNetAmount(this.netAmount != null ? this.netAmount : this.grossAmount.subtract(fee));
        payout.setStatus(PayoutStatus.PENDING);
        payout.setNote(this.note);
        payout.setVersion(0L);
        payout.setCreatedAt(LocalDateTime.now());
        payout.setUpdatedAt(LocalDateTime.now());
        return payout;
    }
}
