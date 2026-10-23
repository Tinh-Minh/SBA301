package com.carrental.dto.request.auth;

import com.carrental.validation.ValidPassword;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import jakarta.validation.constraints.NotBlank;
import tools.jackson.databind.JsonNode;

public final class ChangePasswordRequest {

    @NotBlank(message = "Mật khẩu hiện tại không được để trống")
    @ValidPassword
    private String currentPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @ValidPassword(requireMinimumLength = true)
    private String newPassword;

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown authentication request field");
    }
}
