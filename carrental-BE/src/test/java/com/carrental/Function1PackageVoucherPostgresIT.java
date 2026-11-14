package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.enums.Role;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** HTTP and JPQL regression against an isolated PostgreSQL database only. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1,classpath:db/migration/it-support",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false"
})
class Function1PackageVoucherPostgresIT {

    private static final String PASSWORD = "F1new synthetic password only";
    private static final HttpClient CLIENT = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private static final String RUN = UUID.randomUUID().toString().replace("-", "");

    @Container
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:15.13-alpine");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        properties.add("spring.datasource.username", POSTGRES::getUsername);
        properties.add("spring.datasource.password", POSTGRES::getPassword);
        properties.add("app.security.jwt.issuer", () -> TestJwtKeys.ISSUER);
        properties.add("app.security.jwt.audience", () -> TestJwtKeys.AUDIENCE);
        properties.add("app.security.jwt.access-token-ttl", () -> "PT5M");
        properties.add("app.security.jwt.clock-skew", () -> "PT30S");
        properties.add("app.security.cors.allowed-origins", () -> "http://localhost:5173");
    }

    @LocalServerPort private int port;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private PasswordEncoder passwordEncoder;
    private JsonMapper mapper = JsonMapper.builder().build();
    private Long customerId;
    private Long adminId;
    private Long publicPackageId;
    private Long hiddenPackageId;
    private Long quotaVoucherId;
    private Long userFullVoucherId;
    private String customerToken;
    private String adminToken;

    @BeforeEach
    void createIsolatedRows() throws Exception {
        jdbc.update("delete from car_subscriptions");
        jdbc.update("delete from cars");
        jdbc.update("delete from listing_packages");
        jdbc.update("delete from vouchers");
        jdbc.update("delete from customers");

        customerId = createAccount("customer", Role.CUSTOMER);
        adminId = createAccount("admin", Role.ADMIN);
        customerToken = login("customer");
        adminToken = login("admin");

        publicPackageId = insertPackage("Public", "F1_PUBLIC_" + RUN.substring(0, 10), 3, true, 50000);
        insertPackage("Basic", "F1_BASIC_" + RUN.substring(0, 10), 1, true, 10000);
        hiddenPackageId = insertPackage("Hidden", "F1_HIDDEN_" + RUN.substring(0, 10), 2, false, 30000);

        LocalDateTime now = LocalDateTime.now();
        quotaVoucherId = insertVoucher("F1_QUOTA_" + RUN.substring(0, 10), now.minusDays(1), now.plusDays(1),
                2, 10, 50000, "ACTIVE", 0);
        userFullVoucherId = insertVoucher("F1_USER_FULL_" + RUN.substring(0, 10), now.minusDays(1), now.plusDays(1),
                1, 10, 0, "ACTIVE", 0);
        insertVoucher("F1_TOO_EXPENSIVE_" + RUN.substring(0, 10), now.minusDays(1), now.plusDays(1),
                2, 10, 50001, "ACTIVE", 0);
        insertVoucher("F1_EXPIRED_" + RUN.substring(0, 10), now.minusDays(3), now.minusDays(1),
                2, 10, 0, "ACTIVE", 0);
        insertVoucher("F1_DISABLED_" + RUN.substring(0, 10), now.minusDays(1), now.plusDays(1),
                2, 10, 0, "INACTIVE", 0);
        insertVoucher("F1_GLOBAL_FULL_" + RUN.substring(0, 10), now.minusDays(1), now.plusDays(1),
                2, 1, 0, "ACTIVE", 1);

        long carId = insertCar(customerId);
        insertSubscription(customerId, carId, publicPackageId, quotaVoucherId, "PENDING_PAYMENT", "UNPAID");
        insertSubscription(customerId, carId, publicPackageId, quotaVoucherId, "CANCELLED", "UNPAID");
        insertSubscription(customerId, carId, quotaVoucherId, "EXPIRED", "REFUNDED");
        insertSubscription(customerId, carId, publicPackageId, userFullVoucherId, "ACTIVE", "PAID");
    }

    @Test
    void publicPackagesOnlyExposeActiveRowsInPriorityOrderAndAdminCanManageAll() throws Exception {
        HttpResponse<String> publicResponse = send("GET", "/api/packages", null, null);
        assertSuccess(publicResponse, 200);
        JsonNode publicRows = json(publicResponse).path("data");
        assertThat(publicRows.size()).isEqualTo(2);
        assertThat(publicRows.get(0).path("id").asLong()).isEqualTo(publicPackageId);
        assertThat(publicRows.get(1).path("priorityLevel").asInt()).isEqualTo(1);
        assertThat(publicRows.toString()).doesNotContain("Hidden");

        assertError(send("GET", "/api/admin/packages", customerToken, null), 403, "ACCESS_DENIED");
        HttpResponse<String> adminRowsResponse = send("GET", "/api/admin/packages", adminToken, null);
        assertSuccess(adminRowsResponse, 200);
        assertThat(json(adminRowsResponse).path("data").size()).isEqualTo(3);

        String payload = "{\"name\":\"New\",\"code\":\"F1_NEW_" + RUN.substring(0, 8)
                + "\",\"price\":25000,\"durationDays\":14,\"priorityLevel\":2,\"badgeLabel\":\"NỔI BẬT\",\"isActive\":true}";
        HttpResponse<String> created = send("POST", "/api/admin/packages", adminToken, payload);
        assertSuccess(created, 201);
        long createdId = json(created).path("data").path("id").asLong();
        HttpResponse<String> updated = send("PUT", "/api/admin/packages/" + createdId, adminToken,
                "{\"name\":\"New Updated\",\"price\":30000,\"durationDays\":14,\"priorityLevel\":2,\"isActive\":false}");
        assertSuccess(updated, 200);
        assertThat(json(updated).path("data").path("isActive").asBoolean()).isFalse();
        assertError(send("POST", "/api/admin/packages", adminToken,
                "{\"name\":\"Bad\",\"code\":\"F1_BAD\",\"price\":null,\"durationDays\":7,\"priorityLevel\":4}"),
                400, "VALIDATION_ERROR");
    }

    @Test
    void profilePutPersistsContactFieldsAndPatchRemainsCompatible() throws Exception {
        HttpResponse<String> updated = send("PUT", "/api/customers/me", customerToken,
                "{\"zaloPhone\":\"  0900111222  \",\"contactNote\":\"  Gọi sau 18h  \"}");
        assertSuccess(updated, 200);
        assertThat(json(updated).path("data").path("zaloPhone").asText()).isEqualTo("0900111222");
        assertThat(json(updated).path("data").path("contactNote").asText()).isEqualTo("Gọi sau 18h");
        assertThat(jdbc.queryForMap("select full_name, email, phone, zalo_phone, contact_note from customers where id=?", customerId))
                .containsEntry("zalo_phone", "0900111222").containsEntry("contact_note", "Gọi sau 18h");

        assertError(send("PUT", "/api/customers/me", customerToken,
                "{\"zaloPhone\":\"" + "9".repeat(21) + "\"}"), 400, "VALIDATION_ERROR");
        assertError(send("PUT", "/api/customers/me", customerToken,
                "{\"contactNote\":\"" + "n".repeat(256) + "\"}"), 400, "VALIDATION_ERROR");
        HttpResponse<String> patch = send("PATCH", "/api/customers/me", customerToken, "{\"contactNote\":null}");
        assertSuccess(patch, 200);
        assertThat(json(patch).path("data").path("zaloPhone").asText()).isEqualTo("0900111222");
        assertThat(json(patch).path("data").path("contactNote").isNull()).isTrue();
    }

    @Test
    void customerVoucherCatalogPreservesExistingRouteAndEnforcesStatusWindowPriceAndBothQuotas() throws Exception {
        HttpResponse<String> available = send("GET", "/api/vouchers/available?packageId=" + publicPackageId,
                customerToken, null);
        assertSuccess(available, 200);
        String data = json(available).path("data").toString();
        assertThat(data).contains("F1_QUOTA_" + RUN.substring(0, 10));
        assertThat(data).doesNotContain("F1_TOO_EXPENSIVE_", "F1_EXPIRED_", "F1_DISABLED_", "F1_GLOBAL_FULL_",
                "F1_USER_FULL_");
        assertThat(data).doesNotContain("usedCount", "usageLimit", "perUserLimit");

        // The existing GET /api/vouchers stays the admin management list; customer catalog uses the compatible route above.
        assertError(send("GET", "/api/vouchers", customerToken, null), 403, "ACCESS_DENIED");
        HttpResponse<String> adminList = send("GET", "/api/vouchers?page=0&size=10", adminToken, null);
        assertSuccess(adminList, 200);

        assertThat(jdbc.queryForObject("select count(*) from car_subscriptions where customer_id=? and voucher_id=? "
                + "and status <> 'CANCELLED' and payment_status <> 'REFUNDED'", Long.class, customerId, quotaVoucherId))
                .isEqualTo(1L);
    }

    private long createAccount(String kind, Role role) {
        String suffix = RUN.substring(0, 12) + kind;
        String phoneSuffix = RUN.substring(0, 10) + kind;
        return jdbc.queryForObject("insert into customers(full_name,email,phone,password_hash,email_verified,kyc_status,role,status) "
                        + "values (?,?,?,?,true,'NONE',?,'ACTIVE') returning id",
                Long.class, "F1 " + kind, suffix + "@example.test", "P" + phoneSuffix,
                passwordEncoder.encode(PASSWORD), role.name());
    }

    private String login(String kind) throws Exception {
        String suffix = RUN.substring(0, 12) + kind;
        HttpResponse<String> response = send("POST", "/api/auth/login", null,
                mapper.writeValueAsString(Map.of("email", suffix + "@example.test", "password", PASSWORD)));
        assertSuccess(response, 200);
        return json(response).path("data").path("accessToken").asText();
    }

    private long insertPackage(String name, String code, int priority, boolean active, long price) {
        return jdbc.queryForObject("insert into listing_packages(name,code,price,duration_days,priority_level,badge_label,description,is_active) "
                        + "values (?,?,?,30,?,'TEST','Synthetic fixture',?) returning id",
                Long.class, name, code, price, priority, active);
    }

    private long insertVoucher(String code, LocalDateTime startAt, LocalDateTime endAt, int perUserLimit,
            int usageLimit, long minOrderAmount, String status, int usedCount) {
        return jdbc.queryForObject("insert into vouchers(code,description,discount_type,discount_value,min_order_amount,"
                        + "start_at,end_at,usage_limit,per_user_limit,used_count,status) values (?, 'Synthetic', 'FIXED', 1000, ?, ?, ?, ?, ?, ?, ?) returning id",
                Long.class, code, minOrderAmount, startAt, endAt, usageLimit, perUserLimit, usedCount, status);
    }

    private long insertCar(long ownerId) {
        return jdbc.queryForObject("insert into cars(owner_id,license_plate,brand,model,manufacture_year,car_type,seats,"
                        + "transmission,fuel_type,city,pickup_address,price_per_hour,price_per_day,deposit_amount,status) "
                        + "values (?,?,'Test','F1',2020,'SEDAN',4,'AUTOMATIC','GASOLINE','HCMC','Synthetic',0,0,0,'ACTIVE') returning id",
                Long.class, ownerId, "F1-" + RUN.substring(0, 12));
    }

    private void insertSubscription(long customer, long car, long packageId, long voucher, String status, String payment) {
        jdbc.update("insert into car_subscriptions(subscription_code,customer_id,car_id,package_id,voucher_id,package_price,"
                        + "discount_amount,total_amount,status,payment_status) values (?,?,?,?,?,50000,0,50000,?,?)",
                "SUB-" + UUID.randomUUID(), customer, car, packageId, voucher, status, payment);
    }

    private void insertSubscription(long customer, long car, long voucher, String status, String payment) {
        insertSubscription(customer, car, publicPackageId, voucher, status, payment);
    }

    private HttpResponse<String> send(String method, String path, String token, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .timeout(Duration.ofSeconds(8)).header("Accept", "application/json");
        if (token != null) builder.header("Authorization", "Bearer " + token);
        if (body != null) builder.header("Content-Type", "application/json");
        var publisher = body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8);
        return CLIENT.send(builder.method(method, publisher).build(), HttpResponse.BodyHandlers.ofString());
    }

    private JsonNode json(HttpResponse<String> response) throws Exception {
        return mapper.readTree(response.body());
    }

    private void assertSuccess(HttpResponse<String> response, int expectedStatus) throws Exception {
        assertThat(response.statusCode()).isEqualTo(expectedStatus);
        JsonNode body = json(response);
        assertThat(body.path("success").asBoolean()).isTrue();
        assertThat(body.path("code").asText()).isEqualTo("OK");
        assertTrace(response, body);
    }

    private void assertError(HttpResponse<String> response, int expectedStatus, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(expectedStatus);
        JsonNode body = json(response);
        assertThat(body.path("success").asBoolean()).isFalse();
        assertThat(body.path("code").asText()).isEqualTo(code);
        assertThat(body.path("data").isNull()).isTrue();
        assertTrace(response, body);
    }

    private void assertTrace(HttpResponse<String> response, JsonNode body) {
        assertThat(response.headers().firstValue("X-Request-ID").orElseThrow()).isEqualTo(body.path("traceId").asText());
    }
}
