package com.carrental.enums;

/** Các hạng mục bắt buộc/tuỳ chọn trong biên bản bàn giao. */
public enum HandoverCategory {
    EXTERIOR_FRONT(true, "Ngoại thất phía trước"),
    EXTERIOR_REAR(true, "Ngoại thất phía sau"),
    EXTERIOR_LEFT(true, "Thân xe bên trái"),
    EXTERIOR_RIGHT(true, "Thân xe bên phải"),
    INTERIOR(true, "Nội thất, ghế, taplo"),
    DASHBOARD_ODOMETER(true, "Đồng hồ: số km và mức nhiên liệu/pin"),
    DOCUMENTS(true, "Giấy tờ xe: đăng ký, đăng kiểm, bảo hiểm"),
    TIRES(false, "Lốp xe, mâm"),
    ACCESSORIES(false, "Phụ kiện kèm theo (chìa khoá, sạc, bộ sơ cứu...)"),
    DAMAGE(false, "Vết trầy xước / hư hỏng có sẵn"),
    OTHER(false, "Khác");

    private final boolean required;
    private final String label;

    HandoverCategory(boolean required, String label) {
        this.required = required;
        this.label = label;
    }

    public boolean required() { return required; }

    public String label() { return label; }
}
