package com.carrental.config;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import javax.sql.DataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

/**
 * Nạp schema + dữ liệu mẫu MỘT LẦN khi database còn trống.
 *
 * <p>Trước đây {@code spring.sql.init.mode=always} chạy {@code seed_data.sql} (có DROP TABLE)
 * ở mỗi lần khởi động nên toàn bộ dữ liệu thật bị xoá khi restart. Giờ seed chỉ chạy khi
 * chưa có bảng {@code customers}, hoặc khi chủ động bật {@code app.database.init.reset=true}
 * (biến môi trường {@code DB_RESET_ON_STARTUP=true}) để làm lại dữ liệu demo.
 *
 * <p>{@code schema_updates.sql} chỉ chứa lệnh idempotent (IF NOT EXISTS) nên chạy ở mọi lần
 * khởi động để database cũ nhận được bảng/cột mới mà không mất dữ liệu.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.database.init.enabled", havingValue = "true", matchIfMissing = true)
public class DatabaseSeedInitializer implements InitializingBean {

    private static final String SEED_SCRIPT = "seed_data.sql";
    private static final String UPDATE_SCRIPT = "schema_updates.sql";

    private final DataSource dataSource;
    private final boolean reset;

    public DatabaseSeedInitializer(DataSource dataSource,
            @Value("${app.database.init.reset:false}") boolean reset) {
        this.dataSource = dataSource;
        this.reset = reset;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        boolean empty = !customersTableExists();
        if (empty || reset) {
            log.warn("Nạp dữ liệu mẫu {} (database trống={}, reset={})", SEED_SCRIPT, empty, reset);
            run(SEED_SCRIPT);
        } else {
            log.info("Database đã có dữ liệu, bỏ qua {} để không xoá dữ liệu hiện có", SEED_SCRIPT);
        }
        if (new ClassPathResource(UPDATE_SCRIPT).exists()) {
            run(UPDATE_SCRIPT);
        }
    }

    private boolean customersTableExists() throws Exception {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement();
             ResultSet rs = statement.executeQuery("SELECT to_regclass('public.customers') IS NOT NULL")) {
            return rs.next() && rs.getBoolean(1);
        }
    }

    private void run(String script) {
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator(new ClassPathResource(script));
        populator.setSqlScriptEncoding("UTF-8");
        populator.execute(dataSource);
    }
}
