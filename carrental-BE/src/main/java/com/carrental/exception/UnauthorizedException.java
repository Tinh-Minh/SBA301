package com.carrental.exception;

/** Chưa đăng nhập / không xác định được người dùng -> 401. */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
