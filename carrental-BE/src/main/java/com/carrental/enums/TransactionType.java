package com.carrental.enums;

public enum TransactionType {
    PACKAGE_PAYMENT,
    BOOKING_DEPOSIT,
    /** Phần tiền thuê còn lại, trả trước khi nhận xe. */
    BOOKING_PAYMENT,
    /** Phí phát sinh khi trả xe (km, trễ giờ, xăng, phí khác). */
    BOOKING_EXTRA_FEE,
    BOOKING_REFUND,
    REFUND
}
