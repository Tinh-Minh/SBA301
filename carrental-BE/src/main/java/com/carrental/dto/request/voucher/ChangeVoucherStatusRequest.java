package com.carrental.dto.request.voucher;

import com.carrental.enums.VoucherStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeVoucherStatusRequest {
    @NotNull
    private VoucherStatus status;
}
