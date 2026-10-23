package com.carrental.exception;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.web.RequestTraceFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException e) {
        ErrorCode errorCode = e.errorCode();
        HttpStatus status = e.getStatus() != null ? e.getStatus() : (errorCode != null ? errorCode.status() : HttpStatus.BAD_REQUEST);
        String code = errorCode != null ? errorCode.name() : status.name();
        List<FieldErrorResponse> fieldErrors = e.fieldErrors() != null ? e.fieldErrors() : List.of();
        return ResponseEntity.status(status)
                .body(new ApiResponse<>(false, code, e.getMessage(), null, fieldErrors, RequestTraceFilter.currentTraceId()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        List<FieldErrorResponse> errors = e.getBindingResult().getFieldErrors().stream()
                .map(err -> new FieldErrorResponse(err.getField(), err.getDefaultMessage() != null ? err.getDefaultMessage() : "Giá trị không hợp lệ"))
                .toList();
        String message = errors.isEmpty() ? "Dữ liệu không hợp lệ" : errors.get(0).field() + ": " + errors.get(0).message();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, ErrorCode.VALIDATION_ERROR.name(), message, null, errors, RequestTraceFilter.currentTraceId()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND.name(), ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST.name(), ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        return build(HttpStatus.UNAUTHORIZED, ErrorCode.AUTHENTICATION_FAILED.name(), ex.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
        return build(HttpStatus.UNAUTHORIZED, ErrorCode.AUTHENTICATION_FAILED.name(), "Thông tin xác thực không hợp lệ hoặc đã hết hạn");
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenException ex) {
        return build(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED.name(), ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED.name(), "Bạn không có quyền thực hiện thao tác này");
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(ConflictException ex) {
        return build(HttpStatus.CONFLICT, "CONFLICT", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return build(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST.name(), "Tham số '" + ex.getName() + "' không hợp lệ");
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
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String detail = rootMessage(ex);
        if (detail.contains("rental_orders_no_overlap") || detail.contains("car_slots_no_overlap")) {
            return build(HttpStatus.CONFLICT, "SCHEDULE_OVERLAP", "Khung thời gian này đã có người đặt");
        }
        return build(HttpStatus.CONFLICT, "DATA_INTEGRITY_VIOLATION", "Dữ liệu vi phạm ràng buộc: " + firstLine(detail));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception e) {
        log.error("Unhandled request failure traceId={} exceptionType={}",
                RequestTraceFilter.currentTraceId(), e.getClass().getSimpleName(), e);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR.name(), "Lỗi hệ thống: " + e.getMessage());
    }

    private ResponseEntity<ApiResponse<Void>> build(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status)
                .body(new ApiResponse<>(false, code, message, null, List.of(), RequestTraceFilter.currentTraceId()));
    }

    private static String rootMessage(Throwable ex) {
        Throwable root = ex;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        return root.getMessage() == null ? "" : root.getMessage();
    }

    private static String firstLine(String s) {
        int idx = s.indexOf('\n');
        return idx < 0 ? s : s.substring(0, idx);
    }
}
