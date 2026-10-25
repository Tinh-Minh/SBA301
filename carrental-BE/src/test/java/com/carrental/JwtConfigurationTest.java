package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.config.ClockConfig;
import com.carrental.config.security.JwtConfiguration;
import com.carrental.dto.response.TokenResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPairGenerator;
import java.util.Arrays;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class JwtConfigurationTest {

    @Test
    void tokenResponseNeverRendersTheBearerSecretInLogs() {
        TokenResponse response = new TokenResponse("SENSITIVE_BEARER_SENTINEL", "Bearer", 300, null);
        assertThat(response.toString()).contains("accessToken=<redacted>").doesNotContain(response.accessToken());
    }

    @Test
    void missingSigningKeyConfigurationFailsClosedAndDoesNotCreateAKey(@TempDir Path directory) {
        Path missingPrivate = directory.resolve("missing-private.pem");
        Path publicKey = directory.resolve("public.pem");
        assertThat(writeKeyPair(publicKey, directory.resolve("private.pem"))).isTrue();

        new ApplicationContextRunner()
                .withUserConfiguration(ClockConfig.class, JwtConfiguration.class)
                .withPropertyValues(baseProperties("PT5M", "", publicKey.toUri().toString()))
                .run(context -> assertThat(context).hasFailed());
        new ApplicationContextRunner()
                .withUserConfiguration(ClockConfig.class, JwtConfiguration.class)
                .withPropertyValues(baseProperties("PT5M", missingPrivate.toUri().toString(), publicKey.toUri().toString()))
                .run(context -> assertThat(context).hasFailed());
        assertThat(Files.exists(missingPrivate)).isFalse();
    }

    @Test
    void mismatchedExternalKeyPairFailsStartupWithoutPrintingKeyContent(@TempDir Path directory) throws Exception {
        Path privatePath = directory.resolve("private.pem");
        Path mismatchedPublicPath = directory.resolve("mismatched-public.pem");
        writeKeyPair(privatePath, directory.resolve("matching-public.pem"));
        var generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        Files.writeString(mismatchedPublicPath, pem("PUBLIC KEY", generator.generateKeyPair().getPublic().getEncoded()));

        new ApplicationContextRunner()
                .withUserConfiguration(ClockConfig.class, JwtConfiguration.class)
                .withPropertyValues(baseProperties("PT5M", privatePath.toUri().toString(),
                        mismatchedPublicPath.toUri().toString()))
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure().toString())
                            .doesNotContain("BEGIN PRIVATE KEY").doesNotContain("MII");
                });
    }

    @Test
    void missingIssuerOrAudienceFailsPropertyValidation(@TempDir Path directory) throws Exception {
        Path privatePath = directory.resolve("private.pem");
        Path publicPath = directory.resolve("public.pem");
        writeKeyPair(privatePath, publicPath);
        for (String requiredProperty : new String[]{"app.security.jwt.issuer=", "app.security.jwt.audience="}) {
            String prefix = requiredProperty.substring(0, requiredProperty.indexOf('='));
            String[] validProperties = baseProperties("PT5M", privatePath.toUri().toString(), publicPath.toUri().toString());
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
    void zeroOrFractionalAccessTokenTtlFailsPropertyValidation(@TempDir Path directory) throws Exception {
        Path privatePath = directory.resolve("private.pem");
        Path publicPath = directory.resolve("public.pem");
        writeKeyPair(privatePath, publicPath);
        for (String ttl : new String[]{"PT0S", "PT1.5S"}) {
            new ApplicationContextRunner()
                    .withUserConfiguration(ClockConfig.class, JwtConfiguration.class)
                    .withPropertyValues(baseProperties(ttl, privatePath.toUri().toString(), publicPath.toUri().toString()))
                    .run(context -> assertThat(context).hasFailed());
        }
    }

    private String[] baseProperties(String ttl, String privatePath, String publicPath) {
        return new String[]{
                "app.security.jwt.issuer=https://auth.example.test",
                "app.security.jwt.audience=carrental-api",
                "app.security.jwt.access-token-ttl=" + ttl,
                "app.security.jwt.clock-skew=PT30S",
                "app.security.jwt.private-key-location=" + privatePath,
                "app.security.jwt.public-key-location=" + publicPath,
                "app.security.password.min-length=8",
                "app.security.password.max-utf8-bytes=72",
                "app.security.password.bcrypt-strength=10"};
    }

    private boolean writeKeyPair(Path privatePath, Path publicPath) {
        try {
            var generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            var pair = generator.generateKeyPair();
            Files.writeString(privatePath, pem("PRIVATE KEY", pair.getPrivate().getEncoded()));
            Files.writeString(publicPath, pem("PUBLIC KEY", pair.getPublic().getEncoded()));
            return true;
        } catch (Exception exception) {
            throw new IllegalStateException("Could not create test key material");
        }
    }

    private String pem(String type, byte[] encoded) {
        String body = Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(encoded);
        return "-----BEGIN " + type + "-----\n" + body + "\n-----END " + type + "-----\n";
    }
}
