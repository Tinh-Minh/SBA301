package com.carrental.exception;

/** Dữ liệu gửi lên không hợp lệ về mặt nghiệp vụ -> 400. */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
