package com.carrental.util;

import com.carrental.exception.AppException;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

import java.util.Optional;

public final class DbErrors {
    private DbErrors() {}

    public static AppException toAppException(DataAccessException e, String fallback) {
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
