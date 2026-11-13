package com.carrental.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Quy tắc tính tiền thuê dùng chung: mọi khoảng thời gian thuê được quy về NGÀY (khối 24 giờ)
 * và GIỜ lẻ (làm tròn lên từng giờ).
 *
 * <ul>
 *   <li>Giá giờ = giá ngày / 10, làm tròn lên 1.000đ.</li>
 *   <li>Tiền giờ lẻ không vượt quá giá một ngày (thuê lẻ từ 10 giờ trở lên tính tròn 1 ngày).</li>
 * </ul>
 */
public final class RentalPricing {

    public static final int HOURS_PER_DAY = 24;
    private static final BigDecimal HOURLY_DIVISOR = BigDecimal.TEN;
    private static final BigDecimal ROUND_UNIT = new BigDecimal("1000");

    private RentalPricing() {}

    public static BigDecimal hourlyRate(BigDecimal pricePerDay) {
        if (pricePerDay == null || pricePerDay.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        return pricePerDay.divide(HOURLY_DIVISOR, 0, RoundingMode.CEILING)
                .divide(ROUND_UNIT, 0, RoundingMode.CEILING).multiply(ROUND_UNIT);
    }

    /** Tiền cho số giờ lẻ (0..23), không vượt quá giá một ngày. */
    public static BigDecimal extraHoursAmount(BigDecimal pricePerDay, int extraHours) {
        if (extraHours <= 0 || pricePerDay == null) {
            return BigDecimal.ZERO;
        }
        return hourlyRate(pricePerDay).multiply(BigDecimal.valueOf(extraHours)).min(pricePerDay);
    }
}
