package com.carrental.security;

import com.carrental.enums.Role;

/** Immutable request principal containing only the current account identity and database role. */
public record CurrentAccount(long customerId, Role role) {
    public CurrentAccount {
        if (customerId <= 0 || role == null) {
            throw new IllegalArgumentException("Current account principal is invalid");
        }
    }
}
