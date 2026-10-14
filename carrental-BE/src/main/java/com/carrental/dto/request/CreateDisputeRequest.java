package com.carrental.dto.request;

import com.carrental.entity.Dispute;
import com.carrental.enums.DisputeStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class CreateDisputeRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    private Long extraFeeId;

    @NotNull(message = "Mã người khiếu nại không được để trống")
    private Long raisedById;

    @NotBlank(message = "Lý do khiếu nại không được để trống")
    private String reason;

    private String description;

    private List<DisputeEvidenceRequest> evidences;

    public Dispute toEntity() {
        Dispute dispute = new Dispute();
        dispute.setReason(this.reason);
        dispute.setDescription(this.description);
        dispute.setStatus(DisputeStatus.OPEN.name());
        dispute.setCreatedAt(Instant.now());
        dispute.setUpdatedAt(Instant.now());
        return dispute;
    }
}
