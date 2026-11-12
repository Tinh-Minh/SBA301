package com.carrental.enums;

/** Loại bản ghi trong hồ sơ an toàn của xe. */
public enum SafetyRecordType {
    /** Đăng kiểm định kỳ. */
    INSPECTION,
    /** Bảo hiểm (TNDS bắt buộc / vật chất). */
    INSURANCE,
    /** Bảo dưỡng định kỳ. */
    MAINTENANCE,
    /** Sửa chữa, tai nạn, thay thế linh kiện lớn. */
    REPAIR
}
