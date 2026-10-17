package com.carrental.config;

import com.carrental.service.impl.HeaderCurrentUserServiceImpl;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Clock;
import java.time.ZoneId;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    public static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    // ===================================================================== 1. Security & CORS
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // ===================================================================== 2. Clock (Việt Nam)
    /**
     * Đồng hồ dùng chung theo giờ Việt Nam (DB lưu TIMESTAMP giờ VN, server Supabase chạy UTC).
     * Inject Clock vào service thay vì gọi LocalDateTime.now() trực tiếp để dễ viết test.
     */
    @Bean
    public Clock clock() {
        return Clock.system(VN_ZONE);
    }

    // ===================================================================== 3. Job định kỳ
    /**
     * Bật các job chạy định kỳ. Để trong class con để công tắc app.scheduling.enabled=false
     * (dùng khi chạy test) chỉ tắt scheduling, không tắt các bean khác của file này.
     */
    @Configuration
    @EnableScheduling
    @ConditionalOnProperty(name = "app.scheduling.enabled", havingValue = "true", matchIfMissing = true)
    static class SchedulingConfig {
    }

    // ===================================================================== 4. Swagger Header (Tạm thời)
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
