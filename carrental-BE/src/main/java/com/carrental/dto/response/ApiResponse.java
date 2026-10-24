package com.carrental.dto.response;

import java.util.List;

import com.carrental.exception.ErrorCode;

public record ApiResponse<T>(
        boolean success,
        String code,
        String message,
        T data,
        List<FieldErrorResponse> errors,
        String traceId) {

    public ApiResponse {
        errors = errors == null ? List.of() : List.copyOf(errors);
    }

    public static <T> ApiResponse<T> success(T data, String traceId) {
        return new ApiResponse<>(true, ErrorCode.OK.name(), ErrorCode.OK.message(), data, List.of(), traceId);
    }

    /** Success envelope used by the Function 3/4 controllers. */
    public static <T> ApiResponse<T> ok(T data) {
        return ok(ErrorCode.OK.message(), data);
    }

    /** Success envelope used by the Function 3/4 controllers. */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, ErrorCode.OK.name(), message, data, List.of(), null);
    }

    /** Created envelope used by controllers. */
    public static <T> ApiResponse<T> created(String message, T data) {
        return new ApiResponse<>(true, ErrorCode.OK.name(), message, data, List.of(), null);
    }

    /** Compatibility factory for controllers that return a simple error envelope. */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, ErrorCode.INTERNAL_ERROR.name(), message, null, List.of(), null);
    }

    public static <T> ApiResponse<T> error(org.springframework.http.HttpStatus status, String message) {
        return new ApiResponse<>(false, status.name(), message, null, List.of(), null);
    }

    public static <T> ApiResponse<T> error(org.springframework.http.HttpStatus status, String message, T data) {
        return new ApiResponse<>(false, status.name(), message, data, List.of(), null);
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(false, code, message, null, List.of(), null);
    }

    public static <T> ApiResponse<T> failure(
            ErrorCode errorCode,
            String traceId,
            List<FieldErrorResponse> errors) {
        return new ApiResponse<>(false, errorCode.name(), errorCode.message(), null, errors, traceId);
    }
}
