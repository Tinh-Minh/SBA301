package com.carrental.dto.request;

import com.carrental.entity.Dispute;
import com.carrental.enums.DisputeStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ResolveDisputeRequest {
    @NotBlank(message = "Trạng thái giải quyết không được để trống")
    private String status;

    private String resolutionNote;

    private Long resolvedById;

    public void applyTo(Dispute dispute) {
        DisputeStatus current = DisputeStatus.valueOf(dispute.getStatus());
        DisputeStatus next = DisputeStatus.valueOf(this.status);
        current.validateTransitionTo(next);

        dispute.setStatus(next.name());
        dispute.setResolutionNote(this.resolutionNote);
        dispute.setResolvedAt(Instant.now());
        dispute.setUpdatedAt(Instant.now());
    }
}
