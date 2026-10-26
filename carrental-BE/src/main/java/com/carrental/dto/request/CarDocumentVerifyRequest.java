package com.carrental.dto.request;

import com.carrental.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarDocumentVerifyRequest {

    @NotNull(message = "Trạng thái xác minh không được để trống")
    private VerificationStatus verifyStatus;

    private String rejectReason;
}
