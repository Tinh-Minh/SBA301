package com.carrental.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    OK(HttpStatus.OK, "Thành công"),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Yêu cầu không hợp lệ"),
    PAYLOAD_TOO_LARGE(HttpStatus.PAYLOAD_TOO_LARGE, "Tệp tải lên vượt quá giới hạn cho phép"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "Phương thức không được hỗ trợ"),
    UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Loại nội dung không được hỗ trợ"),
    AUTHENTICATION_FAILED(HttpStatus.UNAUTHORIZED, "Thông tin xác thực không hợp lệ hoặc không được phép đăng nhập"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "Token không hợp lệ hoặc tài khoản không còn được phép truy cập"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này"),
    ACCOUNT_ALREADY_EXISTS(HttpStatus.CONFLICT, "Tài khoản đã tồn tại"),
    ADMIN_SELF_LOCK_FORBIDDEN(HttpStatus.CONFLICT, "ADMIN không được tự khóa tài khoản của mình"),
    LAST_ACTIVE_ADMIN_LOCK_FORBIDDEN(HttpStatus.CONFLICT, "Không thể khóa ADMIN ACTIVE cuối cùng"),
    DOCUMENT_SELF_REVIEW_FORBIDDEN(HttpStatus.FORBIDDEN, "ADMIN không được tự duyệt giấy tờ của mình"),
    DOCUMENT_ALREADY_REVIEWED(HttpStatus.CONFLICT, "Giấy tờ đã được xử lý"),
    DOCUMENT_NOT_APPROVABLE(HttpStatus.CONFLICT, "Giấy tờ chưa đủ điều kiện duyệt"),
    APPROVED_DOCUMENT_CONFLICT(HttpStatus.CONFLICT, "Giấy tờ đã được duyệt không thể trùng lặp"),
    DRIVER_PROFILE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Hồ sơ tài xế đã tồn tại"),
    INVALID_DRIVER_STATUS_TRANSITION(HttpStatus.CONFLICT, "Không thể chuyển trạng thái hồ sơ tài xế"),
    DRIVER_NOT_ELIGIBLE(HttpStatus.CONFLICT, "Hồ sơ tài xế hiện chưa đủ điều kiện"),
    DRIVER_SELF_STATUS_CHANGE_FORBIDDEN(HttpStatus.FORBIDDEN, "ADMIN không được tự đổi trạng thái hồ sơ tài xế"),
    BANK_ACCOUNT_ALREADY_EXISTS(HttpStatus.CONFLICT, "Tài khoản ngân hàng đã tồn tại"),
    BANK_ACCOUNT_IN_USE(HttpStatus.CONFLICT, "Tài khoản ngân hàng đang được tham chiếu"),
    BANK_DEFAULT_CONFLICT(HttpStatus.CONFLICT, "Tài khoản mặc định đã thay đổi đồng thời"),
    VOUCHER_CODE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Mã voucher đã tồn tại"),
    VOUCHER_USAGE_LIMIT_CONFLICT(HttpStatus.CONFLICT, "Giới hạn sử dụng thấp hơn số lượt hiện tại"),
    DEPENDENCY_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "Dịch vụ phụ thuộc tạm thời không khả dụng"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi hệ thống");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus status() {
        return status;
    }

    public String message() {
        return message;
    }
}
