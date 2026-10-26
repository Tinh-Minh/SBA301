package com.carrental.dto.request.voucher;

import com.carrental.entity.Voucher;
import java.util.Objects;

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

    /** @return true nếu có thay đổi được áp dụng lên voucher */
    public boolean applyTo(Voucher voucher) {
        String newDescription = getDescription() == null || getDescription().isBlank() ? null : getDescription().strip();
        boolean changed = !Objects.equals(voucher.getDescription(), newDescription)
                || !Objects.equals(voucher.getUsageLimit(), getUsageLimit());
        if (changed) {
            voucher.setDescription(newDescription);
            voucher.setUsageLimit(getUsageLimit());
        }
        return changed;
    }
}
