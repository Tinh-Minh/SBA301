package com.carrental.dto.request.voucher;

import com.carrental.enums.VoucherStatus;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.JsonNode;

/** Strict command DTO for enabling or disabling a voucher. */
public final class ChangeVoucherStatusRequest {
    private boolean statusPresent;
    private VoucherStatus status;

    @JsonProperty("status")
    public void setStatus(JsonNode value) {
        if (statusPresent) throw new IllegalArgumentException("Repeated voucher status field");
        statusPresent = true;
        String raw = CreateVoucherRequest.requiredText(value, "status");
        try {
            status = VoucherStatus.valueOf(raw);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("status is invalid");
        }
    }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown voucher status field");
    }

    public boolean statusWasProvided() { return statusPresent; }
    public VoucherStatus getStatus() { return status; }
}
