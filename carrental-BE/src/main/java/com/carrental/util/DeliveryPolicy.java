package com.carrental.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Phí giao xe tận nơi: miễn phí trong {@value #FREE_KM} km đầu, mỗi km vượt (làm tròn lên) thu {@link #FEE_PER_KM}.
 * Khoảng cách đường đi ước tính = khoảng cách chim bay giữa xe và điểm giao × {@value #ROAD_FACTOR}.
 */
public final class DeliveryPolicy {

    public static final int FREE_KM = 5;
    public static final BigDecimal FEE_PER_KM = BigDecimal.valueOf(30_000);
    public static final double ROAD_FACTOR = 1.3;
    private static final double EARTH_RADIUS_KM = 6371.0;

    private DeliveryPolicy() {}

    /** Khoảng cách đường đi ước tính (km, 1 chữ số thập phân) hoặc null nếu thiếu toạ độ. */
    public static BigDecimal distanceKm(BigDecimal fromLat, BigDecimal fromLng, BigDecimal toLat, BigDecimal toLng) {
        if (fromLat == null || fromLng == null || toLat == null || toLng == null) {
            return null;
        }
        double lat1 = Math.toRadians(fromLat.doubleValue()), lat2 = Math.toRadians(toLat.doubleValue());
        double dLat = lat2 - lat1, dLng = Math.toRadians(toLng.doubleValue() - fromLng.doubleValue());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double straight = 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
        return BigDecimal.valueOf(straight * ROAD_FACTOR).setScale(1, RoundingMode.HALF_UP);
    }

    /** Phí giao xe cho quãng đường (km). Không giao (null) hoặc trong 5 km: 0đ. */
    public static BigDecimal fee(BigDecimal distanceKm) {
        if (distanceKm == null || distanceKm.compareTo(BigDecimal.valueOf(FREE_KM)) <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal extraKm = distanceKm.subtract(BigDecimal.valueOf(FREE_KM)).setScale(0, RoundingMode.CEILING);
        return extraKm.multiply(FEE_PER_KM);
    }
}
