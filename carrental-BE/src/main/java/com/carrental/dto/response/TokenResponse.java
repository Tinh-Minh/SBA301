package com.carrental.dto.response;

import com.carrental.enums.Role;

public record TokenResponse(String accessToken, String tokenType, long expiresIn, AccountSummary account) {

    @Override
    public String toString() {
        return "TokenResponse[accessToken=<redacted>, tokenType=" + tokenType
                + ", expiresIn=" + expiresIn + ", account=" + account + "]";
    }

    public record AccountSummary(Long id, String fullName, Role role) { }
}
