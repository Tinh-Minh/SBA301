package com.carrental.config;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Logs startup warnings (variable names only, never values) when required mail or frontend
 * environment variables are missing or blank.
 */
@Component
public class MailEnvironmentStartupLogger {

    private static final Logger log = LoggerFactory.getLogger(MailEnvironmentStartupLogger.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");

    static final List<String> REQUIRED_ENV_VARIABLES = List.of(
            "MAILJET_API_KEY",
            "MAILJET_SECRET_KEY",
            "MAILJET_SENDER_EMAIL",
            "FRONTEND_URL");

    private final Environment environment;

    public MailEnvironmentStartupLogger(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validateOnStartup() {
        List<String> missing = findMissingVariables();
        boolean dotEnvLoaded = environment instanceof ConfigurableEnvironment configurable
                && configurable.getPropertySources().contains(DotEnvEnvironmentPostProcessor.PROPERTY_SOURCE_NAME);

        if (!missing.isEmpty()) {
            log.warn("Missing or blank environment variables on startup: {} (dotEnvLoaded={})",
                    String.join(", ", missing), dotEnvLoaded);
            for (String variable : missing) {
                log.warn("Missing environment variable: {}", variable);
            }
            return;
        }

        String mailHost = environment.getProperty("spring.mail.host", "");
        String mailPort = environment.getProperty("spring.mail.port", "");
        log.info("Mail & frontend environment variables verified (dotEnvLoaded={}, mailHost={}, mailPort={})",
                dotEnvLoaded, mailHost, mailPort);
    }

    public List<String> findMissingVariables() {
        List<String> missing = new ArrayList<>();
        for (String name : REQUIRED_ENV_VARIABLES) {
            String value = environment.getProperty(name);
            if (value == null || value.isBlank()) {
                missing.add(name);
            }
        }
        return missing;
    }

    public static String summarizeMailFailure(Throwable error, String... sensitiveTerms) {
        if (error == null) {
            return "unknown";
        }
        Throwable root = error;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        String raw = root.getMessage();
        if (raw == null || raw.isBlank()) {
            raw = error.getMessage();
        }
        String prefix = root == error
                ? error.getClass().getSimpleName()
                : error.getClass().getSimpleName() + "->" + root.getClass().getSimpleName();
        if (raw == null || raw.isBlank()) {
            return prefix;
        }
        String sanitized = EMAIL_PATTERN.matcher(raw).replaceAll("<redacted-email>");
        if (sensitiveTerms != null) {
            for (String term : sensitiveTerms) {
                if (term != null && !term.isBlank()) {
                    sanitized = sanitized.replace(term, "<redacted>");
                }
            }
        }
        sanitized = sanitized.replaceAll("[\\r\\n]+", " ").trim();
        if (sanitized.length() > 240) {
            sanitized = sanitized.substring(0, 240) + "...";
        }
        return prefix + ": " + sanitized;
    }
}
