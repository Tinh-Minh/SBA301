package com.carrental.util;


import com.carrental.dto.request.booking.*;
import com.carrental.dto.response.booking.*;

import com.carrental.entity.Car;
import com.carrental.util.RentalPricing;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Tính tiền thuê: quy toàn bộ thời gian về NGÀY (khối 24 giờ tính từ giờ nhận xe) và GIỜ lẻ.
 * <ul>
 *   <li>Mỗi khối 24 giờ bắt đầu vào Thứ 7/Chủ nhật tính giá cuối tuần (nếu chủ xe đặt), còn lại giá ngày thường.</li>
 *   <li>Giờ lẻ (làm tròn lên) tính giá giờ = 1/10 giá ngày, tối đa bằng giá một ngày.</li>
 * </ul>
 */
public final class BookingPricing {

    public static final int MIN_HOURS = 4;
    public static final int MAX_DAYS = 30;

    private BookingPricing() {}

    public static QuoteResponse quote(Car car, LocalDateTime pickupAt, LocalDateTime returnAt,
                                      boolean available, String unavailableReason) {
        long minutes = Duration.between(pickupAt, returnAt).toMinutes();
        long totalHours = (minutes + 59) / 60;
        int days = (int) (totalHours / RentalPricing.HOURS_PER_DAY);
        int hours = (int) (totalHours % RentalPricing.HOURS_PER_DAY);

        BigDecimal dayPrice = nz(car.getRentalPricePerDay());
        BigDecimal weekend = car.getWeekendPricePerDay() != null && car.getWeekendPricePerDay().signum() > 0
                ? car.getWeekendPricePerDay() : dayPrice;
        BigDecimal hourly = RentalPricing.hourlyRate(dayPrice);

        BigDecimal dayAmount = BigDecimal.ZERO;
        int weekendDays = 0;
        for (int i = 0; i < days; i++) {
            boolean isWeekend = isWeekend(pickupAt.plusDays(i));
            dayAmount = dayAmount.add(isWeekend ? weekend : dayPrice);
            if (isWeekend) weekendDays++;
        }
        BigDecimal blockPrice = isWeekend(pickupAt.plusDays(days)) ? weekend : dayPrice;
        BigDecimal hourAmount = hours == 0 ? BigDecimal.ZERO
                : hourly.multiply(BigDecimal.valueOf(hours)).min(blockPrice);
        BigDecimal rental = dayAmount.add(hourAmount);

        List<String> breakdown = new ArrayList<>();
        if (days - weekendDays > 0) {
            breakdown.add((days - weekendDays) + " ngày thường × " + vnd(dayPrice));
        }
        if (weekendDays > 0) {
            breakdown.add(weekendDays + " ngày cuối tuần × " + vnd(weekend));
        }
        if (hours > 0) {
            breakdown.add(hours + " giờ lẻ × " + vnd(hourly)
                    + (hourAmount.compareTo(hourly.multiply(BigDecimal.valueOf(hours))) < 0 ? " (tính tối đa 1 ngày)" : ""));
        }

        Integer includedKm = car.getKmLimitPerDay() == null ? null
                : car.getKmLimitPerDay() * Math.max(1, (int) Math.ceil(totalHours / 24.0));
        return new QuoteResponse(car.getId(), pickupAt, returnAt, totalHours, days, hours, dayPrice,
                car.getWeekendPricePerDay(), hourly, dayAmount, hourAmount, rental, nz(car.getDepositAmount()),
                car.getKmLimitPerDay(), includedKm, car.getExtraKmFee(), car.getLateFeePerHour(),
                available, unavailableReason, breakdown);
    }

    private static boolean isWeekend(LocalDateTime time) {
        DayOfWeek day = time.getDayOfWeek();
        return day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
    }

    private static BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    public static String vnd(BigDecimal amount) {
        return String.format(java.util.Locale.ROOT, "%,d đ", amount.setScale(0, RoundingMode.HALF_UP).longValue())
                .replace(',', '.');
    }
}
