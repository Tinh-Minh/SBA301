package com.carrental.dto.request;

import com.carrental.entity.Customer;
import com.carrental.entity.Dispute;
import com.carrental.entity.ExtraFee;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.DisputeStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateDisputeRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    private Long extraFeeId;

    private Long raisedById;

    @NotBlank(message = "Lý do khiếu nại không được để trống")
    private String reason;

    private String description;

    private List<DisputeEvidenceRequest> evidences;

    public Dispute toEntity() {
        return toEntity(null, null, null);
    }

    public Dispute toEntity(RentalOrder order, Customer raisedBy, ExtraFee extraFee) {
        Dispute dispute = new Dispute();
        dispute.setOrder(order);
        dispute.setRaisedBy(raisedBy);
        dispute.setExtraFee(extraFee);
        dispute.setReason(this.reason);
        dispute.setDescription(this.description);
        dispute.setStatus(DisputeStatus.OPEN);
        return dispute;
    }
}
