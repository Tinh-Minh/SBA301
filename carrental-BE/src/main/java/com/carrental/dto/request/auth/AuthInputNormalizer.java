package com.carrental.dto.request.auth;

import java.util.Locale;

public final class AuthInputNormalizer {
    private AuthInputNormalizer() { }

    public static String email(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    public static String trimmed(String value) {
        return value == null ? null : value.trim();
    }
}
