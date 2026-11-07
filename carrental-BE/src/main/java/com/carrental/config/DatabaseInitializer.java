package com.carrental.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.util.StreamUtils;

import javax.sql.DataSource;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.Statement;

@Slf4j
@Configuration
public class DatabaseInitializer {

    @Value("${app.database.init.enabled:true}")
    private boolean initEnabled;

    @Bean
    public CommandLineRunner runDatabaseInitialization(DataSource dataSource) {
        return args -> {
            if (!initEnabled) {
                log.info(">>> [DatabaseInitializer] Bỏ qua tự động chạy SQL (app.database.init.enabled=false).");
                return;
            }

            // 1. Chạy seed_data.sql (DDL schema: tạo bảng, extensions, functions, triggers, index)
            executeSqlFile(dataSource, "seed_data.sql", "Khởi tạo cấu trúc bảng (DDL Schema)");

            // 2. Chạy data.sql (DML: nạp dữ liệu mẫu ban đầu nếu có)
            executeSqlFile(dataSource, "data.sql", "Nạp dữ liệu mẫu (DML Seed Data)");
        };
    }

    private void executeSqlFile(DataSource dataSource, String resourcePath, String description) {
        Resource resource = new ClassPathResource(resourcePath);
        if (!resource.exists()) {
            log.warn(">>> [DatabaseInitializer] Không tìm thấy file: {}", resourcePath);
            return;
        }

        log.info(">>> [DatabaseInitializer] Bắt đầu thực thi {} ({})...", resourcePath, description);
        try (InputStream inputStream = resource.getInputStream();
             Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {

            String sql = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
            if (sql.trim().isEmpty()) {
                log.info(">>> [DatabaseInitializer] File {} rỗng, bỏ qua.", resourcePath);
                return;
            }

            // Thực thi trực tiếp toàn bộ script SQL qua JDBC Statement
            // Hỗ trợ tốt PostgreSQL dollar-quoting ($$), PL/pgSQL function, trigger và nhiều câu lệnh liên tiếp
            statement.execute(sql);
            log.info(">>> [DatabaseInitializer] Hoàn tất thực thi {} thành công!", resourcePath);
        } catch (Exception e) {
            log.error(">>> [DatabaseInitializer] Lỗi khi thực thi {}: {}", resourcePath, e.getMessage(), e);
        }
    }
}
