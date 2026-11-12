package com.carrental.enums;

/**
 * Vòng đời đơn thuê xe.
 *
 * <pre>
 * REQUESTED --(chủ xe gọi cho khách, xác nhận đã liên hệ + nhận đơn)--> CONFIRMED
 * REQUESTED --(chủ xe từ chối)--> REJECTED      REQUESTED --(quá giờ nhận xe)--> EXPIRED
 * REQUESTED/CONFIRMED --(khách/chủ xe/admin huỷ)--> CANCELLED
 * CONFIRMED --(chủ xe lập biên bản nhận xe)--> PICKUP_PENDING
 * PICKUP_PENDING --(khách xác nhận toàn bộ biên bản)--> IN_PROGRESS
 * IN_PROGRESS --(chủ xe lập biên bản trả xe)--> RETURN_PENDING
 * RETURN_PENDING --(khách xác nhận)--> COMPLETED
 * </pre>
 * Khi khách không đồng ý một mục trong biên bản, đơn vẫn ở *_PENDING cho tới khi chủ xe sửa lại
 * các mục đó và khách xác nhận.
 */
public enum BookingStatus {
    REQUESTED,
    CONFIRMED,
    REJECTED,
    CANCELLED,
    EXPIRED,
    PICKUP_PENDING,
    IN_PROGRESS,
    RETURN_PENDING,
    COMPLETED;

    /** Đơn đang giữ lịch xe (dùng để chống trùng lịch). */
    public boolean holdsCar() {
        return this == CONFIRMED || this == PICKUP_PENDING || this == IN_PROGRESS || this == RETURN_PENDING;
    }

    public boolean isOpen() {
        return this == REQUESTED || holdsCar();
    }
}
