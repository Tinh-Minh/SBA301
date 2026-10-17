package com.carrental.exception;

import com.carrental.dto.response.ApiResponseDTO;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleBadRequest(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleUnauthorized(UnauthorizedException ex) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleForbidden(ForbiddenException ex) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleConflict(ConflictException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    /** Lỗi nghiệp vụ của Function 4 (AppException mang sẵn HttpStatus). */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleAppException(AppException ex) {
        return build(ex.getStatus(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseDTO<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(ApiResponseDTO.error(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ", errors));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return build(HttpStatus.BAD_REQUEST, "Tham số '" + ex.getName() + "' không hợp lệ");
    }

    /** Hai người cùng sửa một bản ghi có @Version. */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        return build(HttpStatus.CONFLICT, "Dữ liệu vừa được người khác cập nhật, vui lòng tải lại và thử lại");
    }

    /**
     * Lớp phòng thủ cuối của DB: EXCLUDE chống trùng lịch (SQLSTATE 23P01),
     * CHECK/trigger (23514), khóa ngoại (23503), unique (23505).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String detail = rootMessage(ex);
        if (detail.contains("rental_orders_no_overlap") || detail.contains("car_slots_no_overlap")) {
            return build(HttpStatus.CONFLICT, "Khung thời gian này đã có người đặt");
        }
        return build(HttpStatus.CONFLICT, "Dữ liệu vi phạm ràng buộc: " + firstLine(detail));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleOther(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống: " + ex.getMessage());
    }

    private ResponseEntity<ApiResponseDTO<Void>> build(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(ApiResponseDTO.error(status, message, null));
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
