package com.carrental.config;

import com.carrental.service.impl.HeaderCurrentUserServiceImpl;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Cấu hình của Function 3, gồm 3 phần:
 * <ol>
 *   <li>Đồng hồ giờ Việt Nam - LÂU DÀI</li>
 *   <li>Bật job chạy định kỳ (tự chuyển đơn EXPIRED) - LÂU DÀI</li>
 *   <li>Ô nhập header X-User-Id trên Swagger - TẠM THỜI</li>
 * </ol>
 * Security + CORS dùng chung {@link SecurityConfig}, không khai báo lại ở đây để tránh trùng bean.
 * Khi Function 1 đưa JWT + SwaggerConfig thật vào, XÓA phần 3 (bean userIdHeaderCustomizer).
 */
@Configuration
public class Viet_Config {

    public static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    // ===================================================================== 1. Đồng hồ (LÂU DÀI)

    /**
     * Đồng hồ dùng chung theo giờ Việt Nam (DB lưu TIMESTAMP giờ VN, server Supabase chạy UTC).
     * Inject Clock vào service thay vì gọi LocalDateTime.now() trực tiếp để dễ viết test.
     */
    @Bean
    public Clock clock() {
        return Clock.system(VN_ZONE);
    }

    // ===================================================================== 2. Job định kỳ (LÂU DÀI)

    /**
     * Bật các job chạy định kỳ. Để trong class con để công tắc app.scheduling.enabled=false
     * (dùng khi chạy test) chỉ tắt scheduling, không tắt các bean khác của file này.
     */
    @Configuration
    @EnableScheduling
    @ConditionalOnProperty(name = "app.scheduling.enabled", havingValue = "true", matchIfMissing = true)
    static class SchedulingConfig {
    }

    // ===================================================================== 3. Swagger (TẠM THỜI)

    /** Thêm ô nhập header X-User-Id vào mọi API trên Swagger UI để test khi chưa có JWT. */
    @Bean
    public OperationCustomizer userIdHeaderCustomizer() {
        return (operation, handlerMethod) -> operation.addParametersItem(new HeaderParameter()
                .name(HeaderCurrentUserServiceImpl.USER_ID_HEADER)
                .description("TẠM THỜI: id customer đang đăng nhập (thay cho JWT)")
                .required(false)
                .schema(new StringSchema()));
    }
}
