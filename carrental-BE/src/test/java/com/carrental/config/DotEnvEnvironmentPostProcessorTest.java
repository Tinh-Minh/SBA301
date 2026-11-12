package com.carrental.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.StandardEnvironment;

class DotEnvEnvironmentPostProcessorTest {

    @Test
    @DisplayName("parseLines handles comments, spaces, quotes, export prefixes and escapes")
    void parseLinesHandlesCommentsAndQuotes() {
        List<String> lines = List.of(
                "# comment",
                "   ",
                "export MAILJET_API_KEY=test-api-key # trailing inline comment",
                "MAILJET_SECRET_KEY=\"secret-with-#-and-\\nline\"",
                "MAILJET_SENDER_EMAIL='sender@cardb.vn'",
                "QUOTED_WITH_COMMENT=\"quoted-val\" # inline comment after quote",
                "SINGLE_QUOTED_WITH_COMMENT='single-val' # comment",
                "FRONTEND_URL=http://localhost:3000"
        );

        Map<String, Object> parsed = DotEnvEnvironmentPostProcessor.parseLines(lines);

        assertThat(parsed).containsEntry("MAILJET_API_KEY", "test-api-key");
        assertThat(parsed).containsEntry("MAILJET_SECRET_KEY", "secret-with-#-and-\nline");
        assertThat(parsed).containsEntry("MAILJET_SENDER_EMAIL", "sender@cardb.vn");
        assertThat(parsed).containsEntry("QUOTED_WITH_COMMENT", "quoted-val");
        assertThat(parsed).containsEntry("SINGLE_QUOTED_WITH_COMMENT", "single-val");
        assertThat(parsed).containsEntry("FRONTEND_URL", "http://localhost:3000");
    }

    @Test
    @DisplayName("resolveEnvFile locates .env in directory or carrental-BE subdirectory")
    void resolveEnvFileFindsRelativeEnv(@TempDir Path tempDir) throws IOException {
        Path beDir = tempDir.resolve("carrental-BE");
        Files.createDirectories(beDir);
        Path envFile = beDir.resolve(".env");
        Files.writeString(envFile, "MAILJET_API_KEY=from-child\n");

        Path resolvedFromRoot = DotEnvEnvironmentPostProcessor.resolveEnvFile(tempDir);
        assertThat(resolvedFromRoot).isEqualTo(envFile.toAbsolutePath().normalize());

        Path resolvedFromBe = DotEnvEnvironmentPostProcessor.resolveEnvFile(beDir);
        assertThat(resolvedFromBe).isEqualTo(envFile.toAbsolutePath().normalize());
    }

    @Test
    @DisplayName("loadFileIntoEnvironment injects dotenv property source")
    void loadFileIntoEnvironmentPopulatesEnv(@TempDir Path tempDir) throws IOException {
        Path envFile = tempDir.resolve(".env");
        Files.writeString(envFile, "MAILJET_SENDER_EMAIL=test@cardb.vn\n");

        ConfigurableEnvironment environment = new StandardEnvironment();
        DotEnvEnvironmentPostProcessor.loadFileIntoEnvironment(environment, envFile);

        assertThat(environment.getProperty("MAILJET_SENDER_EMAIL")).isEqualTo("test@cardb.vn");
    }

    @Test
    @DisplayName("MailEnvironmentStartupLogger identifies missing variables and summarizes errors safely")
    void mailEnvironmentStartupLoggerTests() {
        StandardEnvironment env = new StandardEnvironment();
        MailEnvironmentStartupLogger logger = new MailEnvironmentStartupLogger(env);

        List<String> missing = logger.findMissingVariables();
        assertThat(missing).containsExactly("MAILJET_API_KEY", "MAILJET_SECRET_KEY", "MAILJET_SENDER_EMAIL", "FRONTEND_URL");

        Exception simulated = new RuntimeException("554 5.7.1 Delivery to secret-user@test.vn failed with password123");
        String summary = MailEnvironmentStartupLogger.summarizeMailFailure(simulated, "password123");
        assertThat(summary).doesNotContain("secret-user@test.vn");
        assertThat(summary).doesNotContain("password123");
        assertThat(summary).contains("<redacted-email>");
        assertThat(summary).contains("<redacted>");
    }
}
