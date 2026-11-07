package com.carrental.util;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.security.CurrentAccount;
import com.carrental.web.RequestTraceFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriComponentsBuilder;

public final class RequestChecks {

    private RequestChecks() { }

    public static void requirePositiveId(long id) {
        if (id <= 0) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    public static void requirePrincipal(CurrentAccount account) {
        if (account == null || account.customerId() <= 0 || account.role() == null) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    public static AppException fieldError(String field, String message) {
        return new AppException(ErrorCode.VALIDATION_ERROR, List.of(new FieldErrorResponse(field, message)));
    }

    public static AppException notFound() {
        return new AppException(ErrorCode.RESOURCE_NOT_FOUND);
    }

    public static void rejectQuery(HttpServletRequest request) {
        if (request.getQueryString() != null) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    public static void rejectBodylessQueryOrBytes(HttpServletRequest request) throws IOException {
        rejectQuery(request);
        if (request.getInputStream().read() != -1) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    public static <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(data, RequestTraceFilter.currentTraceId()));
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(String pathTemplate, Object id, T data) {
        return ResponseEntity.created(UriComponentsBuilder.fromPath(pathTemplate).buildAndExpand(id).toUri())
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(data, RequestTraceFilter.currentTraceId()));
    }
}
