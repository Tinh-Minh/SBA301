package com.carrental.dto.request.driver;

import com.carrental.enums.DriverStatus;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.JsonNode;

/** Strict, presence-aware allowlist for a driver status command. */
public final class ChangeDriverStatusRequest {

    private boolean statusPresent;
    private boolean reasonPresent;
    private DriverStatus status;
    private String reason;

    @JsonProperty("status")
    public void setStatus(JsonNode value) {
        rejectDuplicate(statusPresent);
        statusPresent = true;
        if (value == null || !value.isTextual()) {
            throw new IllegalArgumentException("Driver status must be a string");
        }
        try {
            status = DriverStatus.valueOf(value.stringValue());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Driver status is invalid");
        }
    }

    @JsonProperty("reason")
    public void setReason(JsonNode value) {
        rejectDuplicate(reasonPresent);
        reasonPresent = true;
        if (value == null || value.isNull()) {
            reason = null;
        } else if (value.isTextual()) {
            reason = value.stringValue();
        } else {
            throw new IllegalArgumentException("Driver reason must be a string or null");
        }
    }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown driver status field");
    }

    // Keep parser-state accessors non-JavaBean, as in P04/P06 strict commands.
    public boolean statusWasProvided() { return statusPresent; }
    public boolean reasonWasProvided() { return reasonPresent; }
    public DriverStatus getStatus() { return status; }
    public String getReason() { return reason; }

    private static void rejectDuplicate(boolean alreadyPresent) {
        if (alreadyPresent) throw new IllegalArgumentException("Repeated driver status field");
    }
}
