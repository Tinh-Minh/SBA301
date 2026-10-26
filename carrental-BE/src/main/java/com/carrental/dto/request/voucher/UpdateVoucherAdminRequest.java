package com.carrental.dto.request.voucher;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/** PUT requires both properties; explicit null clears their values. */
@Getter
public final class UpdateVoucherAdminRequest {
    @Size(max = 300)
    private final String description;
    @Positive
    private final Integer usageLimit;

    @JsonCreator
    public UpdateVoucherAdminRequest(@JsonProperty(value = "description", required = true) String description,
            @JsonProperty(value = "usageLimit", required = true) Integer usageLimit) {
        this.description = description == null ? null : description.strip();
        this.usageLimit = usageLimit;
    }
}
