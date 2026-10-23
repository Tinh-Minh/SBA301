package com.carrental.dto.request.customer;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.JsonNode;

/** PATCH body that preserves whether each allowlisted field was omitted or explicitly null. */
public final class UpdateProfileRequest {

    private boolean fullNamePresent;
    private boolean dateOfBirthPresent;
    private boolean addressPresent;
    private boolean emailPresent;
    private boolean phonePresent;
    private boolean avatarUrlPresent;
    private String fullName;
    private String dateOfBirth;
    private String address;
    private String email;
    private String phone;
    private String avatarUrl;

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

    @JsonProperty("email")
    public void setEmail(JsonNode value) {
        rejectDuplicate(emailPresent);
        emailPresent = true;
        email = strictText(value);
    }

    @JsonProperty("phone")
    public void setPhone(JsonNode value) {
        rejectDuplicate(phonePresent);
        phonePresent = true;
        phone = strictText(value);
    }

    @JsonProperty("avatarUrl")
    public void setAvatarUrl(JsonNode value) {
        rejectDuplicate(avatarUrlPresent);
        avatarUrlPresent = true;
        avatarUrl = strictText(value);
    }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown customer profile field");
    }

    // Avoid JavaBean isX getters: Jackson 3 may infer private field mutators from them.
    public boolean fullNameWasProvided() { return fullNamePresent; }
    public boolean dateOfBirthWasProvided() { return dateOfBirthPresent; }
    public boolean addressWasProvided() { return addressPresent; }
    public boolean emailWasProvided() { return emailPresent; }
    public boolean phoneWasProvided() { return phonePresent; }
    public boolean avatarUrlWasProvided() { return avatarUrlPresent; }
    public String getFullName() { return fullName; }
    public String getDateOfBirth() { return dateOfBirth; }
    public String getAddress() { return address; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAvatarUrl() { return avatarUrl; }

    public boolean hasAnyAllowedField() {
        return fullNamePresent || dateOfBirthPresent || addressPresent
                || emailPresent || phonePresent || avatarUrlPresent;
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
