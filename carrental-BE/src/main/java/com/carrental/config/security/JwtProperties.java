package com.carrental.config.security;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
        @NotBlank String issuer,
        @NotBlank String audience,
        @NotNull Duration accessTokenTtl,
        @NotNull Duration clockSkew,
        @NotBlank String secretKey) {

    @AssertTrue(message = "JWT secret key must be at least 32 UTF-8 bytes for HS256")
    public boolean isSecretKeyValid() {
        return secretKey != null && secretKey.getBytes(StandardCharsets.UTF_8).length >= 32;
    }

    @AssertTrue(message = "JWT access-token TTL must be a positive whole number of seconds")
    public boolean isAccessTokenTtlValid() {
        return accessTokenTtl != null && !accessTokenTtl.isNegative()
                && accessTokenTtl.getSeconds() >= 1 && accessTokenTtl.getNano() == 0;
    }

    @AssertTrue(message = "JWT clock skew must not be negative")
    public boolean isClockSkewValid() {
        return clockSkew != null && !clockSkew.isNegative();
    }
}
