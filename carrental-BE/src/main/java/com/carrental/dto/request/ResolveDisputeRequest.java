package com.carrental.dto.request;

import com.carrental.entity.Dispute;
import com.carrental.enums.DisputeStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ResolveDisputeRequest {
    @NotBlank(message = "Trạng thái giải quyết không được để trống")
    private String status;

    private String resolutionNote;

    private Long resolvedById;

    public void applyTo(Dispute dispute) {
        DisputeStatus current = dispute.getStatus();
        DisputeStatus next = DisputeStatus.valueOf(this.status.toUpperCase());
        current.validateTransitionTo(next);

        dispute.setStatus(next);
        dispute.setResolutionNote(this.resolutionNote);
        dispute.setResolvedAt(LocalDateTime.now());
        dispute.setUpdatedAt(LocalDateTime.now());
    }
}
