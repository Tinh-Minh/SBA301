package com.carrental.exception;

/** Xung đột trạng thái/dữ liệu (trùng lịch, sai trạng thái đơn, bị sửa đồng thời) -> 409. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
