package com.carrental.exception;

import java.util.Objects;
import java.util.List;
import com.carrental.dto.response.FieldErrorResponse;
import org.springframework.http.HttpStatus;

public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private final List<FieldErrorResponse> fieldErrors;
    private final HttpStatus status;

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
        this.status = errorCode.status();
    }

    public AppException(ErrorCode errorCode, List<FieldErrorResponse> fieldErrors) {
        super(Objects.requireNonNull(errorCode).message());
        this.errorCode = errorCode;
        this.fieldErrors = fieldErrors == null ? List.of() : List.copyOf(fieldErrors);
        this.status = errorCode.status();
    }

    /** Constructor retained for Function 3/4 business services. */
    public AppException(HttpStatus status, String message) {
        super(message);
        this.errorCode = null;
        this.fieldErrors = List.of();
        this.status = Objects.requireNonNull(status);
    }

    /** Constructor retained for Function 3/4 enums and services. */
    public AppException(String message) {
        this(HttpStatus.BAD_REQUEST, message);
    }

    public ErrorCode errorCode() {
        return errorCode;
    }

    public List<FieldErrorResponse> fieldErrors() {
        return fieldErrors;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
