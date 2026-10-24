package com.carrental.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.time.ZoneId;

@Configuration
public class SecurityConfig {

    public static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    // The Function 1 ClockConfig and SecurityConfiguration provide the shared clock and security beans.
    // Keep scheduling conditional so tests and local runs can disable background jobs.
    /**
     * Bật các job chạy định kỳ. Để trong class con để công tắc app.scheduling.enabled=false
     * (dùng khi chạy test) chỉ tắt scheduling, không tắt các bean khác của file này.
     */
    @Configuration
    @EnableScheduling
    @ConditionalOnProperty(name = "app.scheduling.enabled", havingValue = "true", matchIfMissing = true)
    static class SchedulingConfig {
    }
}
