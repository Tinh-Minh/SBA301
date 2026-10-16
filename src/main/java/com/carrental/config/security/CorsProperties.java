package com.carrental.config.security;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.cors")
public class CorsProperties {

    private List<String> allowedOrigins = new ArrayList<>();
    private List<String> allowedMethods = new ArrayList<>(List.of("GET", "POST", "PATCH", "OPTIONS"));
    private List<String> allowedHeaders = new ArrayList<>(List.of("Authorization", "Content-Type", "X-Request-ID"));
    private List<String> exposedHeaders = new ArrayList<>(List.of("X-Request-ID"));

    public List<String> getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = copy(allowedOrigins); }
    public List<String> getAllowedMethods() { return allowedMethods; }
    public void setAllowedMethods(List<String> allowedMethods) { this.allowedMethods = copy(allowedMethods); }
    public List<String> getAllowedHeaders() { return allowedHeaders; }
    public void setAllowedHeaders(List<String> allowedHeaders) { this.allowedHeaders = copy(allowedHeaders); }
    public List<String> getExposedHeaders() { return exposedHeaders; }
    public void setExposedHeaders(List<String> exposedHeaders) { this.exposedHeaders = copy(exposedHeaders); }

    private static List<String> copy(List<String> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }
}
