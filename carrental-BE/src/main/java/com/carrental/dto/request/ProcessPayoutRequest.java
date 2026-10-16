package com.carrental.dto.request;

import com.carrental.entity.Payout;
import com.carrental.enums.PayoutStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ProcessPayoutRequest {
    @NotBlank(message = "Trạng thái mới không được để trống")
    private String status;

    private String note;

    public void applyTo(Payout payout) {
        PayoutStatus current = payout.getStatus();
        PayoutStatus next = PayoutStatus.valueOf(this.status.toUpperCase());
        current.validateTransitionTo(next);

        payout.setStatus(next);
        if (this.note != null && !this.note.isBlank()) {
            payout.setNote(this.note);
        }
        if (next == PayoutStatus.COMPLETED || next == PayoutStatus.PAID) {
            payout.setPaidAt(LocalDateTime.now());
        }
        payout.setUpdatedAt(LocalDateTime.now());
    }
}
