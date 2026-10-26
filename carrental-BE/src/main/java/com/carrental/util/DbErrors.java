package com.carrental.util;

import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.util.Optional;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

public final class DbErrors {
    private DbErrors() {}

    public static ErrorCode resolveConstraint(Throwable exception) {
        for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
            if (!(cause instanceof ConstraintViolationException violation)
                    || violation.getSQLException() == null) continue;
            String state = violation.getSQLException().getSQLState();
            String name = violation.getConstraintName();
            if (name == null) continue;
            if ("23503".equals(state) && "payouts_bank_account_id_recipient_id_fkey".equals(name)) {
                return ErrorCode.BANK_ACCOUNT_IN_USE;
            }
            if (!"23505".equals(state)) continue;
            return switch (name) {
                case "uq_customers_email_lower", "customers_phone_key" -> ErrorCode.ACCOUNT_ALREADY_EXISTS;
                case "drivers_customer_id_key" -> ErrorCode.DRIVER_PROFILE_ALREADY_EXISTS;
                case "uq_user_doc_approved" -> ErrorCode.APPROVED_DOCUMENT_CONFLICT;
                case "bank_accounts_customer_id_bank_name_account_number_key" -> ErrorCode.BANK_ACCOUNT_ALREADY_EXISTS;
                case "uq_bank_default_per_customer" -> ErrorCode.BANK_DEFAULT_CONFLICT;
                case "vouchers_code_key" -> ErrorCode.VOUCHER_CODE_ALREADY_EXISTS;
                default -> null;
            };
        }
        return null;
    }

    public static AppException toAppException(DataAccessException e, String fallback) {
        if (e instanceof ObjectOptimisticLockingFailureException) {
            return new AppException(HttpStatus.CONFLICT, "Dữ liệu vừa được người khác cập nhật, vui lòng tải lại và thử lại");
        }
        String msg = Optional.ofNullable(NestedExceptionUtils.getMostSpecificCause(e).getMessage()).orElse("");
        if (msg.contains("car_slots_no_overlap")) {
            return new AppException(HttpStatus.CONFLICT, "Xe đã có slot khác trùng khoảng thời gian này");
        }
        if (msg.contains("uq_car_primary_image")) {
            return new AppException(HttpStatus.CONFLICT, "Xe chỉ được có một ảnh đại diện");
        }
        if (msg.contains("cars_license_plate_key") || msg.contains("uq_cars_license_plate")) {
            return new AppException(HttpStatus.CONFLICT, "Biển số xe đã tồn tại");
        }
        if (msg.contains("đơn đang hiệu lực") || msg.contains("trg_slot_change")) {
            return new AppException(HttpStatus.CONFLICT, "Slot còn đơn đang hiệu lực, không thể thu hẹp hoặc huỷ");
        }
        if (e instanceof DataIntegrityViolationException) {
            return new AppException(HttpStatus.BAD_REQUEST, fallback);
        }
        return new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi cơ sở dữ liệu, vui lòng thử lại sau");
    }
}