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

    public static <T> ApiResponse<T> failure(
            ErrorCode errorCode,
            String traceId,
            List<FieldErrorResponse> errors) {
        return new ApiResponse<>(false, errorCode.name(), errorCode.message(), null, errors, traceId);
    }
}
