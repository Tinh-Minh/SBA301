package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.config.ClockConfig;
import com.carrental.config.security.JwtConfiguration;
import com.carrental.dto.response.TokenResponse;
import java.util.Arrays;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;

class JwtConfigurationTest {

    @Test
    void tokenResponseNeverRendersTheBearerSecretInLogs() {
        TokenResponse response = new TokenResponse("SENSITIVE_BEARER_SENTINEL", "Bearer", 300, null);
        assertThat(response.toString()).contains("accessToken=<redacted>").doesNotContain(response.accessToken());
    }

    @Test
    void missingOrShortSigningKeyFailsPropertyValidation() {
        new ApplicationContextRunner()
                .withUserConfiguration(ClockConfig.class, JwtConfiguration.class)
                .withPropertyValues(baseProperties("PT5M", ""))
                .run(context -> assertThat(context).hasFailed());
        new ApplicationContextRunner()
                .withUserConfiguration(ClockConfig.class, JwtConfiguration.class)
                .withPropertyValues(baseProperties("PT5M", "too-short"))
                .run(context -> assertThat(context).hasFailed());
    }

    @Test
    void secretKeyValidationCountsUtf8Bytes() {
        new ApplicationContextRunner()
                .withUserConfiguration(ClockConfig.class, JwtConfiguration.class)
                .withPropertyValues(baseProperties("PT5M", "é".repeat(16)))
                .run(context -> assertThat(context).hasNotFailed());
    }

    @Test
    void validSecretKeyCreatesEncoderAndDecoder() {
        new ApplicationContextRunner()
                .withUserConfiguration(ClockConfig.class, JwtConfiguration.class)
                .withPropertyValues(baseProperties("PT5M", "function1-test-secret-key-for-hs256-not-production"))
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasBean("jwtEncoder");
                    assertThat(context).hasBean("jwtDecoder");
                    Instant issuedAt = context.getBean(Clock.class).instant().truncatedTo(ChronoUnit.SECONDS);
                    JwtClaimsSet claims = JwtClaimsSet.builder()
                            .issuer("https://auth.example.test")
                            .audience(List.of("carrental-api"))
                            .subject("1")
                            .issuedAt(issuedAt)
                            .expiresAt(issuedAt.plusSeconds(300))
                            .build();
                    String token = context.getBean(JwtEncoder.class).encode(JwtEncoderParameters.from(
                            JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
                    var decoded = context.getBean(JwtDecoder.class).decode(token);
                    assertThat(decoded.getHeaders().get("alg")).isEqualTo("HS256");
                    assertThat(decoded.getSubject()).isEqualTo("1");
                });
    }

    @Test
    void missingIssuerOrAudienceFailsPropertyValidation() {
        for (String requiredProperty : new String[]{"app.security.jwt.issuer=", "app.security.jwt.audience="}) {
            String prefix = requiredProperty.substring(0, requiredProperty.indexOf('='));
            String[] validProperties = baseProperties("PT5M", "function1-test-secret-key-for-hs256-not-production");
            String[] missing = Arrays.stream(validProperties)
                    .filter(property -> !property.startsWith(prefix + "="))
                    .toArray(String[]::new);
            new ApplicationContextRunner()
                    .withUserConfiguration(ClockConfig.class, JwtConfiguration.class)
                    .withPropertyValues(missing)
                    .run(context -> assertThat(context).hasFailed());
        }
    }

    @Test
    void zeroOrFractionalAccessTokenTtlFailsPropertyValidation() {
        for (String ttl : new String[]{"PT0S", "PT1.5S"}) {
            new ApplicationContextRunner()
                    .withUserConfiguration(ClockConfig.class, JwtConfiguration.class)
                    .withPropertyValues(baseProperties(ttl, "function1-test-secret-key-for-hs256-not-production"))
                    .run(context -> assertThat(context).hasFailed());
        }
    }

    private String[] baseProperties(String ttl, String secretKey) {
        return new String[]{
                "app.security.jwt.issuer=https://auth.example.test",
                "app.security.jwt.audience=carrental-api",
                "app.security.jwt.access-token-ttl=" + ttl,
                "app.security.jwt.clock-skew=PT30S",
                "app.security.jwt.secret-key=" + secretKey,
                "app.security.password.min-length=8",
                "app.security.password.max-utf8-bytes=72",
                "app.security.password.bcrypt-strength=10"};
    }
}
