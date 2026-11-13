package com.carrental.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

/**
 * Loads variables from the backend {@code .env} file into the Spring {@link ConfigurableEnvironment}
 * before {@code application.properties} placeholders are resolved.
 *
 * <p>Real JVM system properties ({@code -D...}) and OS environment variables always take
 * precedence over {@code .env} entries.
 */
public class DotEnvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    public static final String PROPERTY_SOURCE_NAME = "dotenv";

    @Override
    public int getOrder() {
        return ConfigDataEnvironmentPostProcessor.ORDER - 1;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (environment.getPropertySources().contains(PROPERTY_SOURCE_NAME)) {
            return;
        }
        Path envFile = resolveEnvFile(Path.of("").toAbsolutePath().normalize());
        if (envFile == null) {
            return;
        }
        loadFileIntoEnvironment(environment, envFile);
    }

    static Path resolveEnvFile(Path startDir) {
        List<Path> candidates = new ArrayList<>();
        Path cursor = startDir;
        for (int depth = 0; depth < 5 && cursor != null; depth++) {
            candidates.add(cursor.resolve(".env"));
            candidates.add(cursor.resolve("carrental-BE").resolve(".env"));
            cursor = cursor.getParent();
        }
        for (Path candidate : candidates) {
            if (Files.isRegularFile(candidate) && Files.isReadable(candidate)) {
                return candidate.toAbsolutePath().normalize();
            }
        }
        return null;
    }

    static void loadFileIntoEnvironment(ConfigurableEnvironment environment, Path envFile) {
        try {
            List<String> lines = Files.readAllLines(envFile, StandardCharsets.UTF_8);
            Map<String, Object> parsed = parseLines(lines);
            if (parsed.isEmpty()) {
                return;
            }
            MapPropertySource propertySource = new MapPropertySource(PROPERTY_SOURCE_NAME, parsed);
            MutablePropertySources sources = environment.getPropertySources();
            if (sources.contains("systemEnvironment")) {
                sources.addAfter("systemEnvironment", propertySource);
            } else {
                sources.addLast(propertySource);
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read .env configuration file: " + envFile.getFileName(), ex);
        }
    }

    static Map<String, Object> parseLines(List<String> lines) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (lines == null) {
            return result;
        }
        for (int i = 0; i < lines.size(); i++) {
            String rawLine = lines.get(i);
            if (rawLine == null) {
                continue;
            }
            if (i == 0 && rawLine.startsWith("\uFEFF")) {
                rawLine = rawLine.substring(1);
            }
            String trimmed = rawLine.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                continue;
            }
            if (trimmed.startsWith("export ") || trimmed.startsWith("export\t")) {
                trimmed = trimmed.substring(6).trim();
            }
            int equalsIndex = trimmed.indexOf('=');
            if (equalsIndex <= 0) {
                continue;
            }
            String key = trimmed.substring(0, equalsIndex).trim();
            if (key.isEmpty()) {
                continue;
            }
            String rawValue = trimmed.substring(equalsIndex + 1);
            String value = parseValue(rawValue);
            result.put(key, value);
        }
        return result;
    }

    static String parseValue(String rawValue) {
        String trimmed = rawValue.trim();
        if (trimmed.isEmpty()) {
            return "";
        }
        char first = trimmed.charAt(0);
        if (first == '"' || first == '\'') {
            char quote = first;
            int endQuoteIdx = -1;
            boolean escaped = false;
            for (int i = 1; i < trimmed.length(); i++) {
                char c = trimmed.charAt(i);
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (c == '\\' && quote == '"') {
                    escaped = true;
                    continue;
                }
                if (c == quote) {
                    endQuoteIdx = i;
                    break;
                }
            }
            if (endQuoteIdx >= 1) {
                String inside = trimmed.substring(1, endQuoteIdx);
                return quote == '"' ? unescapeDoubleQuoted(inside) : inside;
            }
        }
        int commentIdx = findInlineCommentIndex(trimmed);
        if (commentIdx >= 0) {
            trimmed = trimmed.substring(0, commentIdx).trim();
        }
        return trimmed;
    }

    private static int findInlineCommentIndex(String value) {
        for (int i = 1; i < value.length(); i++) {
            if (value.charAt(i) == '#' && Character.isWhitespace(value.charAt(i - 1))) {
                return i;
            }
        }
        return -1;
    }

    private static String unescapeDoubleQuoted(String content) {
        StringBuilder sb = new StringBuilder(content.length());
        for (int i = 0; i < content.length(); i++) {
            char c = content.charAt(i);
            if (c == '\\' && i + 1 < content.length()) {
                char next = content.charAt(i + 1);
                switch (next) {
                    case 'n' -> {
                        sb.append('\n');
                        i++;
                    }
                    case 'r' -> {
                        sb.append('\r');
                        i++;
                    }
                    case 't' -> {
                        sb.append('\t');
                        i++;
                    }
                    case '"' -> {
                        sb.append('"');
                        i++;
                    }
                    case '\\' -> {
                        sb.append('\\');
                        i++;
                    }
                    default -> sb.append(c);
                }
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }
}
