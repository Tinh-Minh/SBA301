package com.carrental.dto.request;

import com.carrental.entity.Payout;
import com.carrental.enums.PayoutStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ProcessPayoutRequest {
    @NotBlank(message = "Trạng thái mới không được để trống")
    private String status;

    private String note;

    public void applyTo(Payout payout) {
        PayoutStatus current = PayoutStatus.valueOf(payout.getStatus());
        PayoutStatus next = PayoutStatus.valueOf(this.status);
        current.validateTransitionTo(next);

        payout.setStatus(next.name());
        if (this.note != null && !this.note.isBlank()) {
            payout.setNote(this.note);
        }
        if (next == PayoutStatus.COMPLETED) {
            payout.setPaidAt(Instant.now());
        }
        payout.setUpdatedAt(Instant.now());
    }
}
