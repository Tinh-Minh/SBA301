package com.carrental.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Đồng hồ dùng chung theo giờ Việt Nam (DB lưu TIMESTAMP giờ VN, server Supabase chạy UTC).
 * Inject Clock vào service thay vì gọi LocalDateTime.now() trực tiếp để dễ viết test.
 */
@Configuration
public class TimeConfig {

    public static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Bean
    public Clock clock() {
        return Clock.system(VN_ZONE);
    }
}
