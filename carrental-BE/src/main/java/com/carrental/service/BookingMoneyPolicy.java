package com.carrental.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Chính sách tiền của đơn thuê (tham khảo Mioto):
 * <ul>
 *   <li>Đặt xe xong khách cọc {@value #DEPOSIT_PERCENT}% tiền thuê (sau giảm giá) qua hệ thống, trong
 *       {@link #DEPOSIT_PAYMENT_WINDOW}; phần còn lại thanh toán qua hệ thống trước khi nhận xe.</li>
 *   <li>Chủ xe phải phản hồi yêu cầu đã cọc trong {@link #OWNER_RESPONSE_WINDOW}, quá hạn tự từ chối và hoàn 100%.</li>
 *   <li>Phí huỷ chuyến (cùng mức cho khách và chủ xe): miễn phí trong {@link #FREE_CANCEL_WINDOW} sau khi giữ chỗ;
 *       huỷ trước chuyến hơn {@value #EARLY_CANCEL_DAYS} ngày: {@value #EARLY_CANCEL_PERCENT}%; trong vòng
 *       {@value #EARLY_CANCEL_DAYS} ngày: {@value #LATE_CANCEL_PERCENT}% giá trị chuyến.</li>
 *   <li>Chủ xe huỷ: khách được hoàn 100% số đã trả + đền bù bằng phí huỷ; chủ xe bị phạt bằng phí huỷ.</li>
 *   <li>GPLX phải còn hạn ít nhất {@value #LICENSE_BUFFER_DAYS} ngày sau ngày trả xe (phòng xe về trễ).</li>
 * </ul>
 */
public final class BookingMoneyPolicy {

    private BookingMoneyPolicy() {}

    public static final int DEPOSIT_PERCENT = 40;
    public static final Duration DEPOSIT_PAYMENT_WINDOW = Duration.ofMinutes(30);
    public static final Duration OWNER_RESPONSE_WINDOW = Duration.ofHours(24);
    public static final Duration FREE_CANCEL_WINDOW = Duration.ofHours(1);
    public static final int EARLY_CANCEL_DAYS = 7;
    public static final int EARLY_CANCEL_PERCENT = 10;
    public static final int LATE_CANCEL_PERCENT = 40;
    public static final int LICENSE_BUFFER_DAYS = 10;
    /** Khách không đến: chủ xe báo vắng mặt sau giờ nhận xe này. */
    public static final Duration CUSTOMER_NO_SHOW_GRACE = Duration.ofHours(2);
    /** Chủ xe không giao xe: khách báo vắng mặt sau giờ nhận xe này. */
    public static final Duration OWNER_NO_SHOW_GRACE = Duration.ofHours(1);
    /** Phí xăng/pin hụt cho mỗi 1% so với lúc nhận xe. */
    public static final BigDecimal FUEL_FEE_PER_PERCENT = new BigDecimal("10000");
    /** Chủ xe huỷ quá số lần này trong 30 ngày thì toàn bộ tin bị tạm ẩn. */
    public static final int OWNER_CANCEL_LIMIT = 3;

    /** Tiền cọc = 40% tiền thuê sau giảm, làm tròn lên nghìn đồng. */
    public static BigDecimal depositFor(BigDecimal payableRental) {
        if (payableRental == null || payableRental.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal raw = payableRental.multiply(BigDecimal.valueOf(DEPOSIT_PERCENT)).divide(BigDecimal.valueOf(100), 0, RoundingMode.UP);
        return raw.divide(BigDecimal.valueOf(1000), 0, RoundingMode.UP).multiply(BigDecimal.valueOf(1000)).min(payableRental);
    }

    /**
     * Phí huỷ chuyến theo mốc thời gian.
     * @param tripValue giá trị chuyến (tiền thuê sau giảm)
     * @param heldSince thời điểm bắt đầu giữ chỗ (khách: lúc cọc; chủ xe: lúc xác nhận)
     */
    public static BigDecimal cancellationFee(BigDecimal tripValue, LocalDateTime heldSince, LocalDateTime pickupAt, LocalDateTime now) {
        if (tripValue == null || tripValue.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        if (heldSince != null && !now.isAfter(heldSince.plus(FREE_CANCEL_WINDOW))) {
            return BigDecimal.ZERO;
        }
        int percent = Duration.between(now, pickupAt).toDays() >= EARLY_CANCEL_DAYS ? EARLY_CANCEL_PERCENT : LATE_CANCEL_PERCENT;
        return tripValue.multiply(BigDecimal.valueOf(percent)).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
    }

    public static String cancellationRule(LocalDateTime heldSince, LocalDateTime pickupAt, LocalDateTime now) {
        if (heldSince != null && !now.isAfter(heldSince.plus(FREE_CANCEL_WINDOW))) {
            return "huỷ trong 1 giờ sau khi giữ chỗ: miễn phí";
        }
        return Duration.between(now, pickupAt).toDays() >= EARLY_CANCEL_DAYS
                ? "huỷ trước chuyến hơn 7 ngày: phí 10% giá trị chuyến"
                : "huỷ trong vòng 7 ngày trước chuyến: phí 40% giá trị chuyến";
    }
}
