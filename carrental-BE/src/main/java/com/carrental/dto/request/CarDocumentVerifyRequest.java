package com.carrental.dto.request;

import com.carrental.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarDocumentVerifyRequest {

    @NotNull(message = "Trạng thái xác minh không được để trống")
    private VerificationStatus verifyStatus; // APPROVED hoặc REJECTED

    private String rejectReason;
}
