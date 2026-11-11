package com.carrental.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyEmailRequest(
        @NotBlank(message = "Token xác minh không được để trống")
        @Size(max = 4096, message = "Token xác minh không hợp lệ")
        String token) {
}
