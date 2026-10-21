package com.carrental.dto.request.customer;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.JsonNode;

/** PATCH body that preserves whether each allowlisted field was omitted or explicitly null. */
public final class UpdateProfileRequest {

    private boolean fullNamePresent;
    private boolean dateOfBirthPresent;
    private boolean addressPresent;
    private String fullName;
    private String dateOfBirth;
    private String address;

    @JsonProperty("fullName")
    public void setFullName(JsonNode value) {
        rejectDuplicate(fullNamePresent);
        fullNamePresent = true;
        fullName = strictText(value);
    }

    @JsonProperty("dateOfBirth")
    public void setDateOfBirth(JsonNode value) {
        rejectDuplicate(dateOfBirthPresent);
        dateOfBirthPresent = true;
        dateOfBirth = strictText(value);
    }

    @JsonProperty("address")
    public void setAddress(JsonNode value) {
        rejectDuplicate(addressPresent);
        addressPresent = true;
        address = strictText(value);
    }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown customer profile field");
    }

    // Avoid JavaBean isX getters: Jackson 3 may infer private field mutators from them.
    public boolean fullNameWasProvided() { return fullNamePresent; }
    public boolean dateOfBirthWasProvided() { return dateOfBirthPresent; }
    public boolean addressWasProvided() { return addressPresent; }
    public String getFullName() { return fullName; }
    public String getDateOfBirth() { return dateOfBirth; }
    public String getAddress() { return address; }

    public boolean hasAnyAllowedField() {
        return fullNamePresent || dateOfBirthPresent || addressPresent;
    }

    private static String strictText(JsonNode value) {
        if (value == null || value.isNull()) return null;
        if (!value.isTextual()) throw new IllegalArgumentException("Customer profile values must be strings or null");
        return value.stringValue();
    }

    private static void rejectDuplicate(boolean alreadyPresent) {
        if (alreadyPresent) throw new IllegalArgumentException("Repeated customer profile field");
    }
}
