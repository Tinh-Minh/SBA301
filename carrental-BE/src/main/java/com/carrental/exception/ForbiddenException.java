package com.carrental.exception;

/** Người dùng đã đăng nhập nhưng không có quyền với tài nguyên này -> 403. */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
