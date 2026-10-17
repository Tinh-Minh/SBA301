package com.carrental.dto.response;

import com.carrental.enums.Role;

public record TokenResponse(String accessToken, String tokenType, long expiresIn, AccountSummary account) {
    public TokenResponse {
        if (accessToken == null || tokenType == null || account == null) {
            throw new IllegalArgumentException("Token response fields are required");
        }
    }

    @Override
    public String toString() {
        return "TokenResponse[accessToken=<redacted>, tokenType=" + tokenType
                + ", expiresIn=" + expiresIn + ", account=" + account + "]";
    }

    public record AccountSummary(Long id, String fullName, Role role) { }
}
