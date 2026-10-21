package com.carrental.dto.request.customer;

import com.carrental.enums.CustomerStatus;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.JsonNode;

/** Dedicated allowlisted admin command. The free-text reason is never persisted or logged. */
public final class ChangeCustomerStatusRequest {

    private boolean statusPresent;
    private boolean reasonPresent;
    private CustomerStatus status;
    private String reason;

    @JsonProperty("status")
    public void setStatus(JsonNode value) {
        rejectDuplicate(statusPresent);
        statusPresent = true;
        if (value == null || !value.isTextual()) {
            throw new IllegalArgumentException("Customer status must be a string");
        }
        try {
            status = CustomerStatus.valueOf(value.stringValue());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Customer status is invalid");
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
            throw new IllegalArgumentException("Customer status reason must be a string or null");
        }
    }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown customer status field");
    }

    // Do not expose JavaBean isX getters for parser state: Jackson could infer field mutators.
    public boolean statusWasProvided() { return statusPresent; }
    public boolean reasonWasProvided() { return reasonPresent; }
    public CustomerStatus getStatus() { return status; }
    public String getReason() { return reason; }

    private static void rejectDuplicate(boolean alreadyPresent) {
        if (alreadyPresent) throw new IllegalArgumentException("Repeated customer status field");
    }
}
