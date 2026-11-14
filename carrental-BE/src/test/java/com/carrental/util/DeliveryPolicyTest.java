package com.carrental.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class DeliveryPolicyTest {

    @Test
    void freeWithinFiveKm() {
        assertThat(DeliveryPolicy.fee(new BigDecimal("0"))).isEqualByComparingTo("0");
        assertThat(DeliveryPolicy.fee(new BigDecimal("5.0"))).isEqualByComparingTo("0");
        assertThat(DeliveryPolicy.fee(null)).isEqualByComparingTo("0");
    }

    @Test
    void chargesThirtyThousandPerStartedKmBeyondFive() {
        assertThat(DeliveryPolicy.fee(new BigDecimal("5.1"))).isEqualByComparingTo("30000");
        assertThat(DeliveryPolicy.fee(new BigDecimal("7.0"))).isEqualByComparingTo("60000");
        assertThat(DeliveryPolicy.fee(new BigDecimal("7.4"))).isEqualByComparingTo("90000");
    }

    @Test
    void distanceUsesRoadFactorAndNeedsBothPoints() {
        // Quận 7 -> Bình Thạnh (xe mẫu id 1 và 3): ~7,5 km chim bay -> ~9,7 km đường đi.
        BigDecimal km = DeliveryPolicy.distanceKm(new BigDecimal("10.7324"), new BigDecimal("106.7153"),
                new BigDecimal("10.7951"), new BigDecimal("106.7218"));
        assertThat(km).isBetween(new BigDecimal("8.5"), new BigDecimal("10.5"));
        assertThat(DeliveryPolicy.distanceKm(null, null, BigDecimal.ONE, BigDecimal.ONE)).isNull();
    }
}
