package com.carrental.exception;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.util.DbErrors;
import com.carrental.web.RequestTraceFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException e) {
        ErrorCode errorCode = e.errorCode();
        if (errorCode != null && errorCode.status().is5xxServerError()) {
            log.error("Request failed traceId={} errorCode={}", RequestTraceFilter.currentTraceId(), errorCode);
        } else if (errorCode != null) {
            log.warn("Request rejected traceId={} errorCode={}", RequestTraceFilter.currentTraceId(), errorCode);
        }
        HttpStatus status = e.getStatus() != null ? e.getStatus() : (errorCode != null ? errorCode.status() : HttpStatus.BAD_REQUEST);
        String code = errorCode != null ? errorCode.name() : status.name();
        List<FieldErrorResponse> fieldErrors = e.fieldErrors() != null ? e.fieldErrors() : List.of();
        return ResponseEntity.status(status)
                .body(new ApiResponse<>(false, code, e.getMessage(), null, fieldErrors, RequestTraceFilter.currentTraceId()));
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<FieldErrorResponse> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> new FieldErrorResponse(err.getField(), safeFieldMessage(err)))
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .headers(headers)
                .body(failure(ErrorCode.VALIDATION_ERROR, ErrorCode.VALIDATION_ERROR.message(), errors));
    }

    @Override
    protected ResponseEntity<Object> handleTypeMismatch(org.springframework.beans.TypeMismatchException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String name = ex instanceof MethodArgumentTypeMismatchException mismatch ? mismatch.getName() : null;
        String message = name == null || name.isBlank()
                ? ErrorCode.INVALID_REQUEST.message()
                : "Tham số '" + name + "' không hợp lệ";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .headers(headers)
                .body(failure(ErrorCode.INVALID_REQUEST, message, List.of()));
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
            HttpStatusCode statusCode, WebRequest request) {
        ErrorCode code = codeFor(statusCode);
        HttpHeaders safeHeaders = headers == null ? new HttpHeaders() : headers;
        return ResponseEntity.status(statusCode)
                .headers(safeHeaders)
                .body(failure(code, code.message(), List.of()));
    }

    /** Multipart hỏng hoặc thiếu boundary. File quá lớn đi nhánh 413. */
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiResponse<Void>> handleMalformedMultipart(MultipartException ex) {
        if (ex instanceof MaxUploadSizeExceededException) {
            return build(HttpStatus.PAYLOAD_TOO_LARGE, ErrorCode.PAYLOAD_TOO_LARGE.name(), ErrorCode.PAYLOAD_TOO_LARGE.message());
        }
        log.warn("Malformed multipart traceId={} exceptionType={}",
                RequestTraceFilter.currentTraceId(), ex.getClass().getSimpleName());
        return build(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST.name(), ErrorCode.INVALID_REQUEST.message());
    }

    /** Lock, timeout, hoặc database không nhận kết nối. Không trả message SQL ra client. */
    @ExceptionHandler({
            PessimisticLockingFailureException.class,
            DataAccessResourceFailureException.class,
            QueryTimeoutException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleDatabaseLockOrAvailabilityFailure(Exception ex) {
        log.warn("Database unavailable traceId={} errorCode=DEPENDENCY_UNAVAILABLE exceptionType={}",
                RequestTraceFilter.currentTraceId(), ex.getClass().getSimpleName());
        return build(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.DEPENDENCY_UNAVAILABLE.name(),
                ErrorCode.DEPENDENCY_UNAVAILABLE.message());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
        for (Throwable cause = ex; cause != null; cause = cause.getCause()) {
            if (cause instanceof DataAccessResourceFailureException) {
                log.warn("Authentication dependency unavailable traceId={} errorCode=DEPENDENCY_UNAVAILABLE",
                        RequestTraceFilter.currentTraceId());
                return build(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.DEPENDENCY_UNAVAILABLE.name(),
                        ErrorCode.DEPENDENCY_UNAVAILABLE.message());
            }
        }
        return build(HttpStatus.UNAUTHORIZED, ErrorCode.AUTHENTICATION_FAILED.name(), "Thông tin xác thực không hợp lệ hoặc đã hết hạn");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED.name(), "Bạn không có quyền thực hiện thao tác này");
    }

    /** Hai người cùng sửa một bản ghi có @Version. */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponse<Void>> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        return build(HttpStatus.CONFLICT, "OPTIMISTIC_LOCK_CONFLICT", "Dữ liệu vừa được người khác cập nhật, vui lòng tải lại và thử lại");
    }

    /**
     * Lớp phòng thủ cuối của DB: EXCLUDE chống trùng lịch (SQLSTATE 23P01),
     * CHECK/trigger (23514), khóa ngoại (23503), unique (23505).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        ErrorCode f1Code = DbErrors.resolveConstraint(ex);
        if (f1Code != null) {
            log.warn("Database constraint rejected traceId={} errorCode={}", RequestTraceFilter.currentTraceId(), f1Code);
            return build(f1Code.status(), f1Code.name(), f1Code.message());
        }
        // Keep Function 1's contract: unexpected database failures are server errors, not duplicates.
        if (isFunction1Request(request)) {
            log.error("Database operation failed traceId={} errorCode=INTERNAL_ERROR", RequestTraceFilter.currentTraceId());
            return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR.name(), ErrorCode.INTERNAL_ERROR.message());
        }
        String detail = rootMessage(ex);
        log.warn("Data integrity failure traceId={} exceptionType={}",
                RequestTraceFilter.currentTraceId(), ex.getClass().getSimpleName());
        if (detail.contains("rental_orders_no_overlap") || detail.contains("car_slots_no_overlap")) {
            return build(HttpStatus.CONFLICT, "SCHEDULE_OVERLAP", "Khung thời gian này đã có người đặt");
        }
        return build(HttpStatus.CONFLICT, "DATA_INTEGRITY_VIOLATION", "Dữ liệu vi phạm ràng buộc");
    }

    private boolean isFunction1Request(HttpServletRequest request) {
        String path = request.getServletPath();
        return List.of("auth", "customers", "drivers", "user-documents", "bank-accounts", "vouchers").stream()
                .anyMatch(resource -> path.equals("/api/" + resource) || path.startsWith("/api/" + resource + "/"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception e) {
        log.error("Unhandled request failure traceId={} errorCode=INTERNAL_ERROR exceptionType={}",
                RequestTraceFilter.currentTraceId(), e.getClass().getSimpleName());
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR.name(), ErrorCode.INTERNAL_ERROR.message());
    }

    private ResponseEntity<ApiResponse<Void>> build(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status)
                .body(new ApiResponse<>(false, code, message, null, List.of(), RequestTraceFilter.currentTraceId()));
    }

    private static ApiResponse<Void> failure(ErrorCode code, String message, List<FieldErrorResponse> errors) {
        return new ApiResponse<>(false, code.name(), message, null, errors, RequestTraceFilter.currentTraceId());
    }

    private static String safeFieldMessage(FieldError error) {
        if (error.isBindingFailure()) {
            return "Giá trị không hợp lệ";
        }
        String message = error.getDefaultMessage();
        if (message == null || message.isBlank()) {
            return "Giá trị không hợp lệ";
        }
        Object rejected = error.getRejectedValue();
        if (rejected != null && message.contains(String.valueOf(rejected))) {
            return "Giá trị không hợp lệ";
        }
        if (message.contains("Failed to convert") || message.contains("java.")) {
            return "Giá trị không hợp lệ";
        }
        return message;
    }

    private static ErrorCode codeFor(HttpStatusCode status) {
        if (status == null) {
            return ErrorCode.INTERNAL_ERROR;
        }
        return switch (status.value()) {
            case 400 -> ErrorCode.INVALID_REQUEST;
            case 404 -> ErrorCode.RESOURCE_NOT_FOUND;
            case 405 -> ErrorCode.METHOD_NOT_ALLOWED;
            case 413 -> ErrorCode.PAYLOAD_TOO_LARGE;
            case 415 -> ErrorCode.UNSUPPORTED_MEDIA_TYPE;
            case 503 -> ErrorCode.DEPENDENCY_UNAVAILABLE;
            default -> ErrorCode.INTERNAL_ERROR;
        };
    }

    private static String rootMessage(Throwable ex) {
        Throwable root = ex;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        return root.getMessage() == null ? "" : root.getMessage();
    }
}
