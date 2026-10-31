package com.carrental.config;

import org.junit.jupiter.api.Test;

import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

class OrderPropertiesTest {

    @Test
    void defaultsRequirePaymentBeforePickup() {
        OrderProperties properties = new OrderProperties();
        assertThat(properties.isRequirePaymentBeforePickup()).isTrue();
        assertThat(properties.getPaymentTimeoutMinutes()).isEqualTo(30);
    }

    /** Cấu hình chạy thật (không phải cấu hình test) phải bắt buộc thanh toán trước khi nhận xe. */
    @Test
    void applicationConfigRequiresPaymentBeforePickup() throws Exception {
        Properties config = new Properties();
        try (Reader reader = Files.newBufferedReader(Path.of("src/main/resources/application.properties"),
                StandardCharsets.UTF_8)) {
            config.load(reader);
        }
        assertThat(config.getProperty("app.order.require-payment-before-pickup")).isEqualTo("true");
        assertThat(config.getProperty("app.order.payment-timeout-minutes")).isEqualTo("30");
    }
}
