package com.carrental.config.security;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties({
        JwtProperties.class,
        PasswordPolicyProperties.class,
        CorsProperties.class,
        BootstrapAdminProperties.class,
        com.carrental.config.CustomerProperties.class
})
public class JwtConfiguration {

    @Bean
    JwtKeyMaterial jwtKeyMaterial(JwtProperties properties, ResourceLoader resourceLoader) {
        return JwtKeyLoader.load(
                properties.privateKeyLocation(),
                properties.publicKeyLocation(),
                properties.privateKeyBase64(),
                properties.publicKeyBase64(),
                resourceLoader);
    }

    @Bean
    JwtEncoder jwtEncoder(JwtKeyMaterial keyMaterial) {
        RSAKey jwk = new RSAKey.Builder(keyMaterial.publicKey())
                .privateKey(keyMaterial.privateKey())
                .keyID("carrental-rs256")
                .build();
        var source = new ImmutableJWKSet<SecurityContext>(new JWKSet(jwk));
        return new NimbusJwtEncoder(source);
    }

    @Bean
    JwtDecoder jwtDecoder(JwtKeyMaterial keyMaterial, JwtProperties properties, Clock clock) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey(keyMaterial.publicKey())
                .signatureAlgorithm(SignatureAlgorithm.RS256)
                .build();
        JwtTimestampValidator timestampValidator = new JwtTimestampValidator(properties.clockSkew());
        timestampValidator.setClock(clock);
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                issuerValidator(properties.issuer()),
                timestampValidator,
                audienceValidator(properties.audience()),
                requiredClaimsValidator(properties, clock)));
        return decoder;
    }

    private OAuth2TokenValidator<Jwt> issuerValidator(String expectedIssuer) {
        return jwt -> {
            Object issuer = jwt.getClaims().get("iss");
            return issuer instanceof String value && !value.isBlank() && expectedIssuer.equals(value)
                    ? OAuth2TokenValidatorResult.success()
                    : invalidClaims();
        };
    }

    private OAuth2TokenValidator<Jwt> audienceValidator(String expectedAudience) {
        return jwt -> jwt.getAudience() != null && jwt.getAudience().contains(expectedAudience)
                ? OAuth2TokenValidatorResult.success()
                : invalidClaims();
    }

    private OAuth2TokenValidator<Jwt> requiredClaimsValidator(JwtProperties properties, Clock clock) {
        return jwt -> {
            Instant issuedAt = jwt.getIssuedAt();
            Instant expiresAt = jwt.getExpiresAt();
            String subject = jwt.getSubject();
            Object issuer = jwt.getClaims().get("iss");
            if (issuedAt == null || expiresAt == null || subject == null || subject.isBlank()
                    || !(issuer instanceof String value) || value.isBlank()
                    || jwt.getAudience() == null || jwt.getAudience().isEmpty()
                    || !expiresAt.isAfter(issuedAt)) {
                return invalidClaims();
            }
            try {
                if (Long.parseLong(subject) <= 0) {
                    return invalidClaims();
                }
            } catch (NumberFormatException exception) {
                return invalidClaims();
            }
            if (issuedAt.isAfter(clock.instant().plus(properties.clockSkew()))) {
                return invalidClaims();
            }
            return OAuth2TokenValidatorResult.success();
        };
    }

    private OAuth2TokenValidatorResult invalidClaims() {
        return OAuth2TokenValidatorResult.failure(
                new OAuth2Error("invalid_token", "Required JWT claims are invalid", null));
    }
}
