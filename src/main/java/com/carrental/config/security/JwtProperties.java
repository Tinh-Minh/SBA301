package com.carrental.config.security;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
        String privateKeyLocation,
        String publicKeyLocation,
        String privateKeyBase64,
        String publicKeyBase64) {

    @AssertTrue(message = "Configure both JWT RSA keys using external files or both inline Base64 values")
    public boolean isKeyMaterialConfigurationValid() {
        boolean hasPrivateBase64 = hasText(privateKeyBase64);
        boolean hasPublicBase64 = hasText(publicKeyBase64);
        if (hasPrivateBase64 || hasPublicBase64) {
            return hasPrivateBase64 && hasPublicBase64;
        }
        return hasText(privateKeyLocation) && hasText(publicKeyLocation);
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

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
