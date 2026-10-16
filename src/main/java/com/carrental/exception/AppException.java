package com.carrental.exception;

import java.util.Objects;
import java.util.List;
import com.carrental.dto.response.FieldErrorResponse;

public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private final List<FieldErrorResponse> fieldErrors;

    public AppException(ErrorCode errorCode) {
        this(errorCode, null, null);
    }

    public AppException(ErrorCode errorCode, Throwable cause) {
        this(errorCode, null, cause);
    }

    public AppException(ErrorCode errorCode, String safeMessage) {
        this(errorCode, safeMessage, null);
    }

    public AppException(ErrorCode errorCode, String safeMessage, Throwable cause) {
        super(safeMessage == null || safeMessage.isBlank() ? Objects.requireNonNull(errorCode).message() : safeMessage,
                cause);
        this.errorCode = errorCode;
        this.fieldErrors = List.of();
    }

    public AppException(ErrorCode errorCode, List<FieldErrorResponse> fieldErrors) {
        super(Objects.requireNonNull(errorCode).message());
        this.errorCode = errorCode;
        this.fieldErrors = fieldErrors == null ? List.of() : List.copyOf(fieldErrors);
    }

    public ErrorCode errorCode() {
        return errorCode;
    }

    public List<FieldErrorResponse> fieldErrors() {
        return fieldErrors;
    }
}
