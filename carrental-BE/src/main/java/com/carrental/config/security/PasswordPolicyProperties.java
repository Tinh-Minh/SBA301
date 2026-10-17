package com.carrental.config.security;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.security.password")
public record PasswordPolicyProperties(
        @Min(1) int minLength,
        @Min(1) @Max(72) int maxUtf8Bytes,
        @Min(4) @Max(31) int bcryptStrength) {

    @AssertTrue(message = "Password minimum length must fit the configured UTF-8 byte limit")
    public boolean isMinimumLengthFeasible() {
        return minLength > 0 && minLength <= maxUtf8Bytes;
    }
}
