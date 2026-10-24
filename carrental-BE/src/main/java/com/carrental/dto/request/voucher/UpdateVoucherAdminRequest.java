package com.carrental.dto.request.voucher;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.JsonNode;

/** Strict full replacement for the two mutable voucher administration fields. */
public final class UpdateVoucherAdminRequest {
    private boolean descriptionPresent;
    private boolean usageLimitPresent;
    private String description;
    private Integer usageLimit;

    @JsonProperty("description")
    public void setDescription(JsonNode value) {
        duplicate(descriptionPresent);
        descriptionPresent = true;
        description = CreateVoucherRequest.nullableText(value, "description");
    }

    @JsonProperty("usageLimit")
    public void setUsageLimit(JsonNode value) {
        duplicate(usageLimitPresent);
        usageLimitPresent = true;
        usageLimit = CreateVoucherRequest.integer(value, "usageLimit", true);
    }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown voucher update field");
    }

    public boolean descriptionWasProvided() { return descriptionPresent; }
    public boolean usageLimitWasProvided() { return usageLimitPresent; }
    public String getDescription() { return description; }
    public Integer getUsageLimit() { return usageLimit; }

    private static void duplicate(boolean alreadyPresent) {
        if (alreadyPresent) throw new IllegalArgumentException("Repeated voucher update field");
    }
}
