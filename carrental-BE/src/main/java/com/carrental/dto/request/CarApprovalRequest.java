package com.carrental.dto.request;

import com.carrental.enums.CarStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarApprovalRequest {

    @NotNull(message = "Trạng thái phê duyệt không được để trống")
    private CarStatus status; // ACTIVE hoặc REJECTED

    private String reason;
}
