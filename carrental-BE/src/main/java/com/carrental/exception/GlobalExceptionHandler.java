package com.carrental.exception;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.ApiResponseDTO;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.web.RequestTraceFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<?> handleAppException(AppException exception) {
        if (exception.errorCode() == null) {
            return ResponseEntity.status(exception.getStatus())
                    .body(ApiResponseDTO.error(exception.getStatus(), exception.getMessage(), null));
        }
        ErrorCode errorCode = exception.errorCode();
        return ResponseEntity.status(errorCode.status())
                .body(ApiResponse.failure(errorCode, RequestTraceFilter.currentTraceId(), exception.fieldErrors()));
    }

    @ExceptionHandler({ResourceNotFoundException.class, BadRequestException.class, UnauthorizedException.class,
            ForbiddenException.class, ConflictException.class})
    public ResponseEntity<ApiResponseDTO<Void>> handleFunction34BusinessException(RuntimeException exception) {
        HttpStatus status = exception instanceof ResourceNotFoundException ? HttpStatus.NOT_FOUND
                : exception instanceof UnauthorizedException ? HttpStatus.UNAUTHORIZED
                : exception instanceof ForbiddenException ? HttpStatus.FORBIDDEN
                : exception instanceof ConflictException ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(ApiResponseDTO.error(status, exception.getMessage(), null));
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleOptimisticLock(ObjectOptimisticLockingFailureException exception) {
        HttpStatus status = HttpStatus.CONFLICT;
        return ResponseEntity.status(status).body(ApiResponseDTO.error(status,
                "Dữ liệu vừa được cập nhật đồng thời, vui lòng tải lại và thử lại", null));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException exception) {
        if (exception instanceof org.springframework.security.authentication.AuthenticationServiceException) {
            String traceId = RequestTraceFilter.currentTraceId();
            log.error("Authentication dependency unavailable traceId={} exceptionType={}",
                    traceId, exception.getClass().getSimpleName());
            return ResponseEntity.status(ErrorCode.DEPENDENCY_UNAVAILABLE.status())
                    .body(ApiResponse.failure(ErrorCode.DEPENDENCY_UNAVAILABLE, traceId, List.of()));
        }
        return ResponseEntity.status(ErrorCode.AUTHENTICATION_FAILED.status())
                .body(ApiResponse.failure(ErrorCode.AUTHENTICATION_FAILED, RequestTraceFilter.currentTraceId(), List.of()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException exception) {
        return ResponseEntity.status(ErrorCode.ACCESS_DENIED.status())
                .body(ApiResponse.failure(ErrorCode.ACCESS_DENIED, RequestTraceFilter.currentTraceId(), List.of()));
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiResponse<Void>> handleMalformedMultipart(MultipartException exception) {
        return ResponseEntity.status(ErrorCode.INVALID_REQUEST.status())
                .body(ApiResponse.failure(ErrorCode.INVALID_REQUEST, RequestTraceFilter.currentTraceId(), List.of()));
    }

    @ExceptionHandler({org.springframework.dao.PessimisticLockingFailureException.class,
            org.springframework.dao.DataAccessResourceFailureException.class})
    public ResponseEntity<ApiResponse<Void>> handleDatabaseLockOrAvailabilityFailure(RuntimeException exception) {
        String traceId = RequestTraceFilter.currentTraceId();
        log.error("Database dependency unavailable traceId={} exceptionType={}", traceId,
                exception.getClass().getSimpleName());
        return ResponseEntity.status(ErrorCode.DEPENDENCY_UNAVAILABLE.status())
                .body(ApiResponse.failure(ErrorCode.DEPENDENCY_UNAVAILABLE, traceId, List.of()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpectedException(Exception exception) {
        String traceId = RequestTraceFilter.currentTraceId();
        log.error("Unhandled request failure traceId={} exceptionType={}", traceId, exception.getClass().getSimpleName());
        return ResponseEntity.status(ErrorCode.INTERNAL_ERROR.status())
                .body(ApiResponse.failure(ErrorCode.INTERNAL_ERROR, traceId, List.of()));
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {
        if (isFunction34Request(request)) {
            Map<String, String> errors = new LinkedHashMap<>();
            exception.getBindingResult().getFieldErrors()
                    .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
            ApiResponseDTO<Map<String, String>> response = ApiResponseDTO.error(
                    HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ", errors);
            return super.handleExceptionInternal(exception, response, headers, HttpStatus.BAD_REQUEST, request);
        }
        return super.handleMethodArgumentNotValid(exception, headers, statusCode, request);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception exception,
            Object body,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {
        ErrorCode errorCode = mapErrorCode(exception, statusCode);
        List<FieldErrorResponse> fieldErrors = fieldErrors(exception);
        ApiResponse<Void> response = ApiResponse.failure(
                errorCode,
                RequestTraceFilter.currentTraceId(),
                fieldErrors);
        return super.handleExceptionInternal(exception, response, headers, statusCode, request);
    }

    @Override
    protected ResponseEntity<Object> handleMaxUploadSizeExceededException(
            MaxUploadSizeExceededException exception,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {
        ApiResponse<Void> response = ApiResponse.failure(
                ErrorCode.PAYLOAD_TOO_LARGE, RequestTraceFilter.currentTraceId(), List.of());
        return super.handleExceptionInternal(exception, response, headers,
                ErrorCode.PAYLOAD_TOO_LARGE.status(), request);
    }

    private ErrorCode mapErrorCode(Exception exception, HttpStatusCode statusCode) {
        if (exception instanceof MethodArgumentNotValidException || exception instanceof BindException) {
            return ErrorCode.VALIDATION_ERROR;
        }
        if (statusCode.value() == ErrorCode.RESOURCE_NOT_FOUND.status().value()) {
            return ErrorCode.RESOURCE_NOT_FOUND;
        }
        if (statusCode.value() == ErrorCode.METHOD_NOT_ALLOWED.status().value()) {
            return ErrorCode.METHOD_NOT_ALLOWED;
        }
        if (statusCode.value() == ErrorCode.UNSUPPORTED_MEDIA_TYPE.status().value()) {
            return ErrorCode.UNSUPPORTED_MEDIA_TYPE;
        }
        if (statusCode.value() == ErrorCode.INVALID_REQUEST.status().value()) {
            return ErrorCode.INVALID_REQUEST;
        }
        if (statusCode.value() == ErrorCode.VALIDATION_ERROR.status().value()) {
            return ErrorCode.VALIDATION_ERROR;
        }
        if (statusCode.value() == ErrorCode.PAYLOAD_TOO_LARGE.status().value()) {
            return ErrorCode.PAYLOAD_TOO_LARGE;
        }
        if (statusCode.is4xxClientError()) {
            return ErrorCode.INVALID_REQUEST;
        }
        return ErrorCode.INTERNAL_ERROR;
    }

    private boolean isFunction34Request(WebRequest request) {
        String description = request.getDescription(false);
        return description.matches(".*uri=/api/(orders|disputes|extra-fees|handovers|payouts|reviews|transactions|payments)(/|\\?.*)?.*");
    }

    private List<FieldErrorResponse> fieldErrors(Exception exception) {
        if (exception instanceof BindException bindException) {
            return bindException.getBindingResult().getFieldErrors().stream()
                    .map(this::toFieldError)
                    .toList();
        }
        return List.of();
    }

    private FieldErrorResponse toFieldError(FieldError fieldError) {
        if (fieldError.isBindingFailure()) {
            return new FieldErrorResponse(fieldError.getField(), "Giá trị không hợp lệ");
        }

        String message = fieldError.getDefaultMessage();
        return new FieldErrorResponse(fieldError.getField(), message == null ? "Giá trị không hợp lệ" : message);
    }
}
