package com.carrental.dto.request.customer;

import com.carrental.enums.Role;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.JsonNode;

/** Admin command to promote a KYC-verified customer to OWNER or demote back to CUSTOMER. */
public final class ChangeCustomerRoleRequest {

    private boolean rolePresent;
    private Role role;

    @JsonProperty("role")
    public void setRole(JsonNode value) {
        if (rolePresent) throw new IllegalArgumentException("Repeated customer role field");
        rolePresent = true;
        if (value == null || !value.isTextual()) {
            throw new IllegalArgumentException("Customer role must be a string");
        }
        try {
            role = Role.valueOf(value.stringValue());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Customer role is invalid");
        }
    }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown customer role field");
    }

    public boolean roleWasProvided() { return rolePresent; }
    public Role getRole() { return role; }
}

