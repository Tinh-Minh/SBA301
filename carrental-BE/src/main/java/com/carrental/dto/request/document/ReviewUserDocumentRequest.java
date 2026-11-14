package com.carrental.dto.request.document;

import com.carrental.enums.VerificationStatus;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.JsonNode;

/** Strict allowlist for the admin document-review command. */
public final class ReviewUserDocumentRequest {

    private boolean verifyStatusPresent;
    private boolean rejectReasonPresent;
    private VerificationStatus verifyStatus;
    private String rejectReason;

    @JsonProperty("verifyStatus")
    public void setVerifyStatus(JsonNode value) {
        rejectDuplicate(verifyStatusPresent);
        verifyStatusPresent = true;
        if (value == null || !value.isTextual()) {
            throw new IllegalArgumentException("Document review status must be a string");
        }
        try {
            verifyStatus = VerificationStatus.valueOf(value.stringValue());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Document review status is invalid");
        }
    }

    @JsonProperty("rejectReason")
    public void setRejectReason(JsonNode value) {
        rejectDuplicate(rejectReasonPresent);
        rejectReasonPresent = true;
        if (value == null || value.isNull()) {
            rejectReason = null;
        } else if (value.isTextual()) {
            rejectReason = value.stringValue();
        } else {
            throw new IllegalArgumentException("Document rejection reason must be a string or null");
        }
    }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown document review field");
    }

    // Keep presence accessors non-JavaBean so Jackson cannot bind internal flags.
    public boolean verifyStatusWasProvided() { return verifyStatusPresent; }
    public boolean rejectReasonWasProvided() { return rejectReasonPresent; }
    public VerificationStatus getVerifyStatus() { return verifyStatus; }
    public String getRejectReason() { return rejectReason; }

    private static void rejectDuplicate(boolean alreadyPresent) {
        if (alreadyPresent) throw new IllegalArgumentException("Repeated document review field");
    }
}
