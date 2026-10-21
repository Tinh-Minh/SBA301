package com.carrental.config;

import com.carrental.service.impl.HeaderCurrentUserServiceImpl;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
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

    // Swagger header retained for the Function 3/4 manual testing flow.
    /** Thêm ô nhập header X-User-Id vào mọi API trên Swagger UI để test khi chưa có JWT. */
    @Bean
    public OperationCustomizer userIdHeaderCustomizer() {
        return (operation, handlerMethod) -> operation.addParametersItem(new HeaderParameter()
                .name(HeaderCurrentUserServiceImpl.USER_ID_HEADER)
                .description("TẠM THỜI: id customer đang đăng nhập (thay cho JWT)")
                .required(false)
                .schema(new StringSchema()));
    }

    @Bean
    public com.fasterxml.jackson.databind.ObjectMapper objectMapper() {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        return mapper;
    }
}
