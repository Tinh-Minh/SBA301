package com.carrental.security;

import org.springframework.security.core.AuthenticationException;

public final class InvalidCurrentAccountException extends AuthenticationException {
    public InvalidCurrentAccountException() {
        super("The account is no longer allowed to use this token");
    }
}
