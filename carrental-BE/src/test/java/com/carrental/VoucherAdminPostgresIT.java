package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verifyNoInteractions;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.voucher.CreateVoucherRequest;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.repository.CustomerStatusLock;
import com.carrental.repository.VoucherRepository;
import com.carrental.service.VoucherChangeLogger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Real HTTP/JWT/JPA behavior against the leader schema in a disposable PostgreSQL 15.13 container. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1,classpath:db/migration/it-support",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false",
        "app.customer.status-lock-timeout-ms=2500"
})
@Import(VoucherAdminPostgresIT.FixedClockConfiguration.class)
class VoucherAdminPostgresIT {
    private static final String PASSWORD = "P09 synthetic administrator password";
    private static final HttpClient CLIENT = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final Instant NOW = Instant.parse("2026-10-14T03:00:00Z");
    private static final MutableTestClock TEST_CLOCK = new MutableTestClock(NOW, ZONE);

    @Container private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:15.13-alpine");

    @TestConfiguration(proxyBeanMethods = false)
    static class FixedClockConfiguration {
        @Bean @Primary java.time.Clock p09VoucherClock() { return TEST_CLOCK; }
    }

    @DynamicPropertySource
    static void integrationProperties(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        properties.add("spring.datasource.username", POSTGRES::getUsername);
        properties.add("spring.datasource.password", POSTGRES::getPassword);
        properties.add("app.security.jwt.issuer", () -> TestJwtKeys.ISSUER);
        properties.add("app.security.jwt.audience", () -> TestJwtKeys.AUDIENCE);
        properties.add("app.security.jwt.access-token-ttl", () -> "PT2H");
        properties.add("app.security.jwt.clock-skew", () -> "PT30S");
        properties.add("app.security.cors.allowed-origins", () -> "http://localhost:5173");
    }

    @LocalServerPort private int port;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private DataSource dataSource;
    @Autowired private JsonMapper mapper;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private CustomerProperties customerProperties;
    @MockitoSpyBean private VoucherRepository vouchers;
    @MockitoSpyBean private VoucherChangeLogger changeLogger;
    @MockitoSpyBean private CustomerStatusLock statusLock;

    @BeforeEach
    void cleanFixture() {
        TEST_CLOCK.set(NOW);
        customerProperties.setStatusLockTimeoutMs(2_500);
        reset(vouchers, changeLogger, statusLock);
        jdbc.update("delete from vouchers");
        jdbc.update("delete from customers");
    }

    @AfterEach
    void resetTestClockAndTimeout() {
        TEST_CLOCK.set(NOW);
        customerProperties.setStatusLockTimeoutMs(2_500);
        reset(vouchers, changeLogger, statusLock);
    }

    @Test
    void strictCreateDefaultsExactCodePrecisionDateAndSafeErrors() throws Exception {
        Account admin = account("p09-create-admin", Role.ADMIN, CustomerStatus.ACTIVE);
        Account customer = account("p09-create-customer", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String adminToken = login(admin);
        String customerToken = login(customer);
        String marker = "SENSITIVE_VOUCHER_" + suffix();

        HttpResponse<String> created = post("/api/vouchers", adminToken, body("  A%_Case  ", 5, 0,
                "2026-10-14T10:00:00", "2026-10-14T10:00:01", "\"usageLimit\":5"));
        assertSuccess(created, 201);
        assertThat(created.headers().firstValue("Location").orElseThrow()).contains("/api/vouchers/");
        JsonNode data = json(created).path("data");
        long id = data.path("id").asLong();
        assertThat(data.path("code").asText()).isEqualTo("A%_Case");
        assertThat(data.path("status").asText()).isEqualTo("ACTIVE");
        assertThat(data.path("usedCount").asInt()).isZero();
        assertThat(data.path("perUserLimit").asInt()).isEqualTo(1);
        assertThat(data.path("minOrderAmount").decimalValue()).isEqualByComparingTo("0");
        assertThat(data.path("windowState").asText()).isEqualTo("CURRENT");
        assertThat(data.path("evaluatedAt").asText()).isEqualTo("2026-10-14T10:00:00");
        Map<String, Object> stored = jdbc.queryForMap("select code,description,discount_type,discount_value,max_discount,min_order_amount,start_at,end_at,usage_limit,per_user_limit,used_count,status from vouchers where id=?", id);
        assertThat(stored).containsEntry("code", "A%_Case").containsEntry("description", null)
                .containsEntry("discount_type", "FIXED").containsEntry("usage_limit", 5)
                .containsEntry("per_user_limit", 1).containsEntry("used_count", 0).containsEntry("status", "ACTIVE");

        HttpResponse<String> caseVariant = post("/api/vouchers", adminToken, body("a%_case", 5, 0,
                "2026-10-14T09:00:00", "2026-10-14T10:00:00", ""));
        assertSuccess(caseVariant, 201);
        assertThat(json(caseVariant).path("data").path("windowState").asText()).isEqualTo("ENDED");
        assertSuccess(post("/api/vouchers", adminToken, body("Axx_Case", 5, 0,
                "2026-10-14T09:00:00", "2026-10-14T11:00:00", "")), 201);
        HttpResponse<String> exact = get("/api/vouchers?code=A%25_Case", adminToken);
        assertSuccess(exact, 200);
        assertThat(json(exact).path("data").path("totalElements").asLong()).isEqualTo(1);
        assertThat(json(exact).path("data").path("content").get(0).path("id").asLong()).isEqualTo(id);
        TEST_CLOCK.set(NOW.plusMillis(500));
        assertThat(json(get("/api/vouchers/" + id, adminToken)).path("data").path("windowState").asText()).isEqualTo("CURRENT");
        TEST_CLOCK.set(NOW.plusSeconds(3600));
        assertThat(json(get("/api/vouchers/" + id, adminToken)).path("data").path("windowState").asText()).isEqualTo("ENDED");
        TEST_CLOCK.set(NOW.plusSeconds(3601));
        assertThat(json(get("/api/vouchers/" + id, adminToken)).path("data").path("windowState").asText()).isEqualTo("ENDED");
        TEST_CLOCK.set(NOW);

        String percentBody = body("PERCENT_" + suffix(), 100, 0,
                "2026-10-14T10:00:00", "2026-10-14T11:00:00", "").replace("\"discountType\":\"FIXED\"", "\"discountType\":\"PERCENT\"");
        HttpResponse<String> percent = post("/api/vouchers", adminToken, percentBody);
        assertSuccess(percent, 201);
        assertThat(json(percent).path("data").path("maxDiscount").decimalValue()).isEqualByComparingTo("0");

        List<String> invalid = List.of(
                "{}", "null", "[]", body(marker, 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"status\":\"INACTIVE\""),
                numericBody("FRACTION_" + suffix(), "FIXED", "12.5", "0", "0",
                        "2026-10-14T10:00:00", "2026-10-14T11:00:00", ""),
                numericBody("OVERFLOW_" + suffix(), "FIXED", "100000000000000", "0", "0",
                        "2026-10-14T10:00:00", "2026-10-14T11:00:00", ""),
                body("BAD_TIME_" + suffix(), 12, 0, "2026-02-30T10:00:00", "2026-10-14T11:00:00", ""),
                body("TZ_" + suffix(), 12, 0, "2026-10-14T10:00:00Z", "2026-10-14T11:00:00", ""),
                body("FRACTION_TIME_" + suffix(), 12, 0, "2026-10-14T10:00:00.1234567", "2026-10-14T11:00:00", ""),
                body("BAD_WINDOW_" + suffix(), 12, 0, "2026-10-14T11:00:00", "2026-10-14T11:00:00", ""),
                body("NULL_MIN_" + suffix(), 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"minOrderAmount\":null"),
                body("BAD_INT_" + suffix(), 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"perUserLimit\":1.0"),
                body("BAD_INT_EXP_" + suffix(), 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"perUserLimit\":1e0"),
                body("BAD_USAGE_DECIMAL_" + suffix(), 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"usageLimit\":1.0"),
                body("BAD_USAGE_EXP_" + suffix(), 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"usageLimit\":1e0"),
                body("BAD_LIMIT_OVERFLOW_" + suffix(), 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"usageLimit\":2147483648"),
                numericBody("BAD_STRING_NUMBER_" + suffix(), "FIXED", "\"12\"", "0", "0",
                        "2026-10-14T10:00:00", "2026-10-14T11:00:00", ""),
                numericBody("BAD_NULL_NUMBER_" + suffix(), "FIXED", "null", "0", "0",
                        "2026-10-14T10:00:00", "2026-10-14T11:00:00", ""),
                numericBody("BAD_BOOLEAN_NUMBER_" + suffix(), "FIXED", "true", "0", "0",
                        "2026-10-14T10:00:00", "2026-10-14T11:00:00", ""),
                numericBody("BAD_ARRAY_NUMBER_" + suffix(), "FIXED", "[]", "0", "0",
                        "2026-10-14T10:00:00", "2026-10-14T11:00:00", ""),
                numericBody("BAD_OBJECT_NUMBER_" + suffix(), "FIXED", "{}", "0", "0",
                        "2026-10-14T10:00:00", "2026-10-14T11:00:00", ""),
                "{\"code\":\"BAD_NAN_" + suffix() + "\",\"discountType\":\"FIXED\",\"discountValue\":NaN,\"maxDiscount\":0,\"startAt\":\"2026-10-14T10:00:00\",\"endAt\":\"2026-10-14T11:00:00\"}",
                "{\"code\":\"BAD_INFINITY_" + suffix() + "\",\"discountType\":\"FIXED\",\"discountValue\":Infinity,\"maxDiscount\":0,\"startAt\":\"2026-10-14T10:00:00\",\"endAt\":\"2026-10-14T11:00:00\"}",
                body("UNKNOWN_" + suffix(), 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"status\":\"INACTIVE\""),
                body("DUP_" + suffix(), 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"code\":\"OTHER\""),
                body("USED_" + suffix(), 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"usedCount\":0"),
                body("ACTOR_" + suffix(), 12, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "\"customerId\":1"));
        int before = jdbc.queryForObject("select count(*) from vouchers", Integer.class);
        for (String invalidBody : invalid) {
            HttpResponse<String> rejected = post("/api/vouchers", adminToken, invalidBody);
            assertThat(rejected.statusCode()).isEqualTo(400);
            assertTrace(rejected, json(rejected));
            assertThat(rejected.body()).doesNotContain(marker, "rejectedValue", "discountValue\":12.5", "customerId");
            assertThat(jdbc.queryForObject("select count(*) from vouchers", Integer.class)).isEqualTo(before);
        }
        assertError(post("/api/vouchers?status=ACTIVE", adminToken,
                body("QUERY_" + suffix(), 5, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "")),
                400, "INVALID_REQUEST");
        assertError(post("/api/vouchers", adminToken, "{malformed"), 400, "INVALID_REQUEST");
        assertError(postForm("/api/vouchers", adminToken, "code=x"), 415, "UNSUPPORTED_MEDIA_TYPE");
        assertError(post("/api/vouchers", customerToken,
                body("CUSTOMER_" + suffix(), 5, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "")),
                403, "ACCESS_DENIED");
        assertError(get("/api/vouchers", null), 401, "AUTHENTICATION_FAILED");
        assertThat(jdbc.queryForObject("select count(*) from vouchers", Integer.class)).isEqualTo(before);
    }

    @Test
    void jsonMapperAndHttpPreserveExactVoucherDecimalTokens() throws Exception {
        Account admin = account("p09-exact-decimal-admin", Role.ADMIN, CustomerStatus.ACTIVE);
        String adminToken = login(admin);
        List<NumericCase> invalid = List.of(
                new NumericCase("DISC_NEAR_INTEGER", "FIXED", "1.00000000000000001", "0", "0", "discountValue"),
                new NumericCase("DISC_PRECISION_EDGE", "FIXED", "99999999999999.00001", "0", "0", "discountValue"),
                new NumericCase("PERCENT_PRECISION_EDGE", "PERCENT", "100.00000000000000001", "0", "0", "discountValue"),
                new NumericCase("DISC_ORDINARY_FRACTION", "FIXED", "12.5", "0", "0", "discountValue"),
                new NumericCase("DISC_SCIENTIFIC_FRACTION", "FIXED", "1.25e1", "0", "0", "discountValue"),
                new NumericCase("DISC_UNDERFLOW", "FIXED", "1e-400", "0", "0", "discountValue"),
                new NumericCase("DISC_NEGATIVE", "FIXED", "-1", "0", "0", "discountValue"),
                new NumericCase("DISC_NEGATIVE_UNDERFLOW", "FIXED", "-1e-400", "0", "0", "discountValue"),
                new NumericCase("MAX_UNDERFLOW", "FIXED", "10", "1e-400", "0", "maxDiscount"),
                new NumericCase("MAX_PRECISION_EDGE", "FIXED", "10", "99999999999999.00001", "0", "maxDiscount"),
                new NumericCase("MAX_NEGATIVE", "FIXED", "10", "-1", "0", "maxDiscount"),
                new NumericCase("MAX_NEGATIVE_UNDERFLOW", "FIXED", "10", "-1e-400", "0", "maxDiscount"),
                new NumericCase("MIN_NEGATIVE_UNDERFLOW", "FIXED", "10", "0", "-1e-400", "minOrderAmount"),
                new NumericCase("MIN_NEGATIVE", "FIXED", "10", "0", "-1", "minOrderAmount"),
                new NumericCase("MIN_UNDERFLOW", "FIXED", "10", "0", "1e-400", "minOrderAmount"),
                new NumericCase("MIN_PRECISION_EDGE", "FIXED", "10", "0", "99999999999999.00001", "minOrderAmount"));

        String mapperPayload = numericBody("BINDING_SENTINEL", "FIXED", "1.00000000000000001", "0", "0",
                "2026-10-14T10:00:00", "2026-10-14T11:00:00", "");
        JsonNode mapperTree = mapper.readTree(mapperPayload);
        assertThat(mapperTree.path("discountValue").decimalValue())
                .isEqualByComparingTo(new BigDecimal("1.00000000000000001"));
        CreateVoucherRequest boundRequest = mapper.readValue(mapperPayload, CreateVoucherRequest.class);
        assertThat(boundRequest.getDiscountValue()).isEqualByComparingTo(new BigDecimal("1.00000000000000001"));

        int before = jdbc.queryForObject("select count(*) from vouchers", Integer.class);
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            for (NumericCase numericCase : invalid) {
                String code = numericCase.code() + "_" + suffix();
                String payload = numericBody(code, numericCase.discountType(), numericCase.discountValue(),
                        numericCase.maxDiscount(), numericCase.minOrderAmount(),
                        "2026-10-14T10:00:00", "2026-10-14T11:00:00", "");
                BigDecimal exactBound = new BigDecimal(numericCase.rawValue());
                assertThat(mapper.readTree(payload).path(numericCase.field()).decimalValue())
                        .isEqualByComparingTo(exactBound);
                CreateVoucherRequest bound = mapper.readValue(payload, CreateVoucherRequest.class);
                assertThat(boundDecimal(bound, numericCase.field())).isEqualByComparingTo(exactBound);

                HttpResponse<String> rejected = post("/api/vouchers", adminToken, payload);
                assertError(rejected, 400, "VALIDATION_ERROR");
                JsonNode safeError = json(rejected);
                assertThat(rejected.headers().firstValue("X-Request-ID").orElseThrow())
                        .isEqualTo(safeError.path("traceId").asText());
                assertThat(safeError.path("code").asText()).isEqualTo("VALIDATION_ERROR");
                assertThat(safeError.path("data").isNull()).isTrue();
                String exposedMessages = safeError.path("message").asText()
                        + safeError.path("errors").toString();
                assertThat(exposedMessages).doesNotContain(
                        code, numericCase.rawValue(), "rejectedValue", "Throwable");
                assertThat(jdbc.queryForObject("select count(*) from vouchers where code=?", Integer.class, code)).isZero();
                assertThat(jdbc.queryForObject("select count(*) from vouchers", Integer.class)).isEqualTo(before);
            }
            String renderedLogs = logs.rendered().replaceAll("traceId=[0-9a-fA-F-]{36}", "traceId=<trace>");
            assertThat(renderedLogs).doesNotContain("BINDING_SENTINEL", "DISC_NEAR_INTEGER", "Throwable", "rejectedValue");
            for (NumericCase numericCase : invalid) {
                assertThat(renderedLogs).doesNotContain(numericCase.rawValue());
            }
            verifyNoInteractions(changeLogger);
        }

        List<NumericCase> valid = List.of(
                new NumericCase("WHOLE_INTEGER", "FIXED", "1", "0", "0", "discountValue"),
                new NumericCase("WHOLE_DECIMAL", "FIXED", "1.0", "null", "0.0", "discountValue"),
                new NumericCase("WHOLE_EXPONENT", "FIXED", "1e3", "0", "1e3", "discountValue"),
                new NumericCase("MAX_NUMERIC_14", "FIXED", "99999999999999", "0", "0", "discountValue"),
                new NumericCase("PERCENT_100", "PERCENT", "100.0", "null", "0", "discountValue"));
        for (NumericCase numericCase : valid) {
            String code = numericCase.code() + "_" + suffix();
            String payload = numericBody(code, numericCase.discountType(), numericCase.discountValue(),
                    numericCase.maxDiscount(), numericCase.minOrderAmount(),
                    "2026-10-14T10:00:00", "2026-10-14T11:00:00", "");
            BigDecimal exact = new BigDecimal(numericCase.discountValue());
            CreateVoucherRequest bound = mapper.readValue(payload, CreateVoucherRequest.class);
            assertThat(bound.getDiscountValue()).isEqualByComparingTo(exact);
            HttpResponse<String> response = post("/api/vouchers", adminToken, payload);
            assertSuccess(response, 201);
            long id = json(response).path("data").path("id").asLong();
            assertThat(jdbc.queryForObject("select discount_value from vouchers where id=?", BigDecimal.class, id))
                    .isEqualByComparingTo(exact);
            BigDecimal storedMax = jdbc.queryForObject("select max_discount from vouchers where id=?", BigDecimal.class, id);
            if (numericCase.maxDiscount().equals("null")) assertThat(storedMax).isNull();
            else assertThat(storedMax).isEqualByComparingTo(new BigDecimal(numericCase.maxDiscount()));
            BigDecimal storedMin = jdbc.queryForObject("select min_order_amount from vouchers where id=?", BigDecimal.class, id);
            assertThat(storedMin).isEqualByComparingTo(new BigDecimal(numericCase.minOrderAmount()));
        }

        String omittedDefaultsCode = "DEFAULTS_" + suffix();
        HttpResponse<String> omittedDefaults = post("/api/vouchers", adminToken,
                body(omittedDefaultsCode, 1, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", ""));
        assertSuccess(omittedDefaults, 201);
        long omittedId = json(omittedDefaults).path("data").path("id").asLong();
        assertThat(jdbc.queryForObject("select max_discount from vouchers where id=?", BigDecimal.class, omittedId))
                .isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(jdbc.queryForObject("select min_order_amount from vouchers where id=?", BigDecimal.class, omittedId))
                .isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void adminOnlyImmutableFieldsQuotaNoOpsAndSoftDisable() throws Exception {
        Account admin = account("p09-update-admin", Role.ADMIN, CustomerStatus.ACTIVE);
        Account customer = account("p09-update-customer", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String adminToken = login(admin);
        String customerToken = login(customer);
        long id = create(adminToken, "UPDATE_CODE_" + suffix(), 5).path("id").asLong();
        jdbc.update("update vouchers set used_count=3 where id=?", id);
        Map<String, Object> before = jdbc.queryForMap("select description,usage_limit,used_count,status,created_at,updated_at from vouchers where id=?", id);

        HttpResponse<String> below = put("/api/vouchers/" + id, adminToken,
                "{\"description\":\"must rollback\",\"usageLimit\":2}");
        assertError(below, 409, "VOUCHER_USAGE_LIMIT_CONFLICT");
        assertThat(jdbc.queryForMap("select description,usage_limit,used_count,status,created_at,updated_at from vouchers where id=?", id))
                .isEqualTo(before);
        HttpResponse<String> missingKey = put("/api/vouchers/" + id, adminToken, "{\"description\":null}");
        assertError(missingKey, 400, "INVALID_REQUEST");
        HttpResponse<String> extra = put("/api/vouchers/" + id, adminToken,
                "{\"description\":\"x\",\"usageLimit\":4,\"code\":\"MUTATED\"}");
        assertError(extra, 400, "INVALID_REQUEST");

        HttpResponse<String> equal = put("/api/vouchers/" + id, adminToken,
                "{\"description\":\"  quota equals count  \",\"usageLimit\":3}");
        assertSuccess(equal, 200);
        assertThat(json(equal).path("data").path("description").asText()).isEqualTo("quota equals count");
        assertThat(json(equal).path("data").path("usedCount").asInt()).isEqualTo(3);
        Map<String, Object> changed = jdbc.queryForMap("select description,usage_limit,used_count,status,created_at,updated_at from vouchers where id=?", id);
        assertThat(changed).containsEntry("description", "quota equals count").containsEntry("usage_limit", 3)
                .containsEntry("used_count", 3).containsEntry("status", "ACTIVE").containsEntry("created_at", before.get("created_at"));

        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            HttpResponse<String> noOp = put("/api/vouchers/" + id, adminToken,
                    "{\"description\":\"quota equals count\",\"usageLimit\":3}");
            assertSuccess(noOp, 200);
            assertThat(jdbc.queryForMap("select description,usage_limit,used_count,status,created_at,updated_at from vouchers where id=?", id))
                    .isEqualTo(changed);
            assertThat(logs.rendered()).doesNotContain("Voucher changed");
        }
        Map<String, Object> beforeNoOpStatus = jdbc.queryForMap(
                "select description,usage_limit,used_count,status,created_at,updated_at from vouchers where id=?", id);
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            HttpResponse<String> sameStatus = patch("/api/vouchers/" + id + "/status", adminToken,
                    "{\"status\":\"ACTIVE\"}");
            assertSuccess(sameStatus, 200);
            assertThat(jdbc.queryForMap("select description,usage_limit,used_count,status,created_at,updated_at from vouchers where id=?", id))
                    .isEqualTo(beforeNoOpStatus);
            assertThat(logs.rendered()).doesNotContain("Voucher changed");
        }

        String rollbackMarker = "ROLLBACK_DESCRIPTION_" + suffix();
        reset(changeLogger);
        doAnswer(invocation -> {
            invocation.callRealMethod();
            throw new IllegalStateException("synthetic after-flush failure");
        }).when(changeLogger).changed(eq("voucher-update"), anyLong(), eq(id));
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            HttpResponse<String> rollback = put("/api/vouchers/" + id, adminToken,
                    "{\"description\":\"" + rollbackMarker + "\",\"usageLimit\":3}");
            assertError(rollback, 500, "INTERNAL_ERROR");
            assertThat(rollback.body()).doesNotContain(rollbackMarker);
            assertThat(jdbc.queryForMap("select description,usage_limit,used_count,status,created_at,updated_at from vouchers where id=?", id))
                    .isEqualTo(beforeNoOpStatus);
            assertThat(logs.rendered()).contains("category=voucher-update-unexpected-failure")
                    .doesNotContain(rollbackMarker, "Voucher changed");
        }
        reset(changeLogger);

        HttpResponse<String> clear = put("/api/vouchers/" + id, adminToken,
                "{\"description\":\"   \",\"usageLimit\":null}");
        assertSuccess(clear, 200);
        assertThat(json(clear).path("data").path("description").isNull()).isTrue();
        assertThat(json(clear).path("data").path("usageLimit").isNull()).isTrue();
        assertThat(json(clear).path("data").path("usedCount").asInt()).isEqualTo(3);

        HttpResponse<String> disabled = patch("/api/vouchers/" + id + "/status", adminToken, "{\"status\":\"INACTIVE\"}");
        assertSuccess(disabled, 200);
        assertThat(json(disabled).path("data").path("status").asText()).isEqualTo("INACTIVE");
        assertThat(json(disabled).path("data").path("usedCount").asInt()).isEqualTo(3);
        HttpResponse<String> noDelete = send("DELETE", "/api/vouchers/" + id, adminToken, null, null);
        assertError(noDelete, 405, "METHOD_NOT_ALLOWED");
        assertError(get("/api/vouchers/" + id + "?x=1", adminToken), 400, "INVALID_REQUEST");
        assertError(get("/api/vouchers/not-a-number", adminToken), 400, "INVALID_REQUEST");
        assertError(get("/api/vouchers/999999999", adminToken), 404, "RESOURCE_NOT_FOUND");
        assertError(get("/api/vouchers?unknown=1", adminToken), 400, "INVALID_REQUEST");
        assertError(get("/api/vouchers?page=0&page=1", adminToken), 400, "INVALID_REQUEST");
        assertError(get("/api/vouchers?sort=code,asc&sort=id,desc", adminToken), 400, "INVALID_REQUEST");
        assertError(put("/api/vouchers/" + id, customerToken,
                "{\"description\":null,\"usageLimit\":null}"), 403, "ACCESS_DENIED");
        assertError(patch("/api/vouchers/" + id + "/status", customerToken, "{\"status\":\"INACTIVE\"}"),
                403, "ACCESS_DENIED");
        assertError(get("/api/vouchers/" + id, customerToken), 403, "ACCESS_DENIED");
    }

    @Test
    void listFiltersUseDatabaseExactValuesAndWindowBoundaries() throws Exception {
        Account admin = account("p09-list-admin", Role.ADMIN, CustomerStatus.ACTIVE);
        String token = login(admin);
        long current = create(adminToken(token), "WINDOW_CURRENT_" + suffix(), null,
                "2026-10-14T10:00:00", "2026-10-14T10:00:01").path("id").asLong();
        long upcoming = create(adminToken(token), "WINDOW_UPCOMING_" + suffix(), null,
                "2026-10-14T10:00:00.000001", "2026-10-14T10:00:02").path("id").asLong();
        long ended = create(adminToken(token), "WINDOW_ENDED_" + suffix(), null,
                "2026-10-14T09:59:59", "2026-10-14T10:00:00").path("id").asLong();
        assertThat(get("/api/vouchers?window=CURRENT&sort=id,asc", token).statusCode()).isEqualTo(200);
        JsonNode currentPage = json(get("/api/vouchers?window=CURRENT&sort=id,asc", token)).path("data");
        assertThat(ids(currentPage)).contains(current);
        assertThat(ids(json(get("/api/vouchers?window=UPCOMING&sort=id,asc", token)).path("data"))).contains(upcoming);
        assertThat(ids(json(get("/api/vouchers?window=ENDED&sort=id,asc", token)).path("data"))).contains(ended);
        assertThat(get("/api/vouchers?status=active", token).statusCode()).isEqualTo(400);
        assertThat(get("/api/vouchers?discountType=FIXED&page=0.0", token).statusCode()).isEqualTo(400);
        assertThat(get("/api/vouchers?page=2147483648", token).statusCode()).isEqualTo(400);
        JsonNode page = json(get("/api/vouchers?size=1&page=0&sort=id,asc", token)).path("data");
        assertThat(page.path("size").asInt()).isEqualTo(1);
        assertThat(page.path("totalElements").asLong()).isGreaterThanOrEqualTo(3);
        assertThat(page.path("totalPages").asInt()).isGreaterThanOrEqualTo(3);
    }

    @Test
    void actualUniqueConstraintMapsOnlyVoucherCodeAndUnrelatedIntegrityRemainsGeneric() throws Exception {
        Account admin = account("p09-unique-admin", Role.ADMIN, CustomerStatus.ACTIVE);
        String token = login(admin);
        String code = "DB_DUP_" + suffix();
        String firstBody = body(code, 10, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "");
        assertSuccess(post("/api/vouchers", token, firstBody), 201);

        doReturn(false).when(vouchers).existsByCode(code);
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            HttpResponse<String> duplicate = post("/api/vouchers", token, firstBody);
            assertError(duplicate, 409, "VOUCHER_CODE_ALREADY_EXISTS");
            String trace = duplicate.headers().firstValue("X-Request-ID").orElseThrow();
            assertThat(logs.rendered()).contains("constraint=vouchers_code_key", "traceId=" + trace)
                    .doesNotContain(code, "discountValue", "Bearer", "SQLState", "23505");
            assertThat(duplicate.body()).doesNotContain(code);
        }
        reset(vouchers);

        String duplicateDescription = "description sentinel " + suffix();
        jdbc.execute("create unique index p09_test_description_unique on vouchers(description) where description is not null");
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            HttpResponse<String> baseline = post("/api/vouchers", token,
                    body("OTHER_" + suffix(), 10, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00",
                            "\"description\":\"" + duplicateDescription + "\""));
            assertSuccess(baseline, 201);
            HttpResponse<String> unrelated = post("/api/vouchers", token,
                    body("UNRELATED_" + suffix(), 10, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00",
                            "\"description\":\"" + duplicateDescription + "\""));
            assertError(unrelated, 500, "INTERNAL_ERROR");
            String trace = unrelated.headers().firstValue("X-Request-ID").orElseThrow();
            assertThat(logs.rendered()).contains("category=voucher-create-integrity-failure", "traceId=" + trace)
                    .doesNotContain(duplicateDescription, "UNRELATED_", "discountValue", "23505", "SQLState");
            assertThat(unrelated.body()).doesNotContain(duplicateDescription, "constraint");
        } finally {
            jdbc.execute("drop index if exists p09_test_description_unique");
            reset(vouchers);
        }
    }

    @Test
    void concurrentCounterWriterIsObservedByPostgresAndAdminNeverOverwritesLatestValue() throws Exception {
        customerProperties.setStatusLockTimeoutMs(10_000);
        Account admin = account("p09-counter-admin", Role.ADMIN, CustomerStatus.ACTIVE);
        Account secondAdmin = account("p09-counter-second-admin", Role.ADMIN, CustomerStatus.ACTIVE);
        String token = login(admin);
        String secondToken = login(secondAdmin);
        long id = create(token, "CONCURRENT_" + suffix(), 5).path("id").asLong();
        jdbc.update("update vouchers set used_count=2 where id=?", id);

        try (Connection holder = dataSource.getConnection()) {
            holder.setAutoCommit(false);
            int holderPid = backendPid(holder);
            try (PreparedStatement update = holder.prepareStatement("update vouchers set used_count=4 where id=?")) {
                update.setLong(1, id);
                assertThat(update.executeUpdate()).isEqualTo(1);
            }
            ExecutorService executor = Executors.newFixedThreadPool(2);
            try {
                CompletableFuture<HttpResponse<String>> update = CompletableFuture.supplyAsync(() ->
                        awaitSend("PUT", "/api/vouchers/" + id, token,
                                "{\"description\":\"counter conflict\",\"usageLimit\":3}", "application/json"), executor);
                int waiterPid = waitForBlockedBy(holderPid);
                assertThat(update.isDone()).isFalse();
                assertThat(blockingPids(waiterPid)).contains(holderPid);
                System.out.println("P09_COUNTER_LOCK holderPid=" + holderPid + " waiterPid=" + waiterPid
                        + " pgBlockingPids=" + blockingPids(waiterPid) + " expectedUsedCount=2 committedUsedCount=4 requestedLimit=3");
                holder.commit();
                HttpResponse<String> conflict = update.get(8, TimeUnit.SECONDS);
                assertError(conflict, 409, "VOUCHER_USAGE_LIMIT_CONFLICT");
                Map<String, Object> afterConflict = jdbc.queryForMap("select description,usage_limit,used_count,status from vouchers where id=?", id);
                assertThat(afterConflict).containsEntry("description", null).containsEntry("usage_limit", 5)
                        .containsEntry("used_count", 4).containsEntry("status", "ACTIVE");
            } finally {
                try { holder.rollback(); } catch (SQLException ignored) { }
                executor.shutdownNow();
            }
        }

        HttpResponse<String> equal = put("/api/vouchers/" + id, token, "{\"description\":\"count4\",\"usageLimit\":4}");
        assertSuccess(equal, 200);
        assertThat(jdbc.queryForObject("select used_count from vouchers where id=?", Integer.class, id)).isEqualTo(4);
        HttpResponse<String> unlimited = put("/api/vouchers/" + id, token, "{\"description\":\"unlimited\",\"usageLimit\":null}");
        assertSuccess(unlimited, 200);

        try (Connection holder = dataSource.getConnection()) {
            holder.setAutoCommit(false);
            int holderPid = backendPid(holder);
            try (PreparedStatement update = holder.prepareStatement("update vouchers set used_count=5 where id=?")) {
                update.setLong(1, id);
                assertThat(update.executeUpdate()).isEqualTo(1);
            }
            reset(statusLock);
            List<Integer> adminBackendPids = new CopyOnWriteArrayList<>();
            CountDownLatch adminLockCalls = new CountDownLatch(2);
            doAnswer(invocation -> {
                adminBackendPids.add(jdbc.queryForObject("select pg_backend_pid()", Integer.class));
                adminLockCalls.countDown();
                return invocation.callRealMethod();
            }).when(statusLock).acquire();
            ExecutorService executor = Executors.newFixedThreadPool(2);
            try {
                CompletableFuture<HttpResponse<String>> status = CompletableFuture.supplyAsync(() ->
                        awaitSend("PATCH", "/api/vouchers/" + id + "/status", token,
                                "{\"status\":\"INACTIVE\"}", "application/json"), executor);
                int waiterPid = waitForBlockedBy(holderPid);
                assertThat(status.isDone()).isFalse();
                CompletableFuture<HttpResponse<String>> concurrentUpdate = CompletableFuture.supplyAsync(() ->
                        awaitSend("PUT", "/api/vouchers/" + id, secondToken,
                                "{\"description\":\"after status commit\",\"usageLimit\":null}", "application/json"), executor);
                assertThat(adminLockCalls.await(5, TimeUnit.SECONDS)).isTrue();
                int updateWaiterPid = adminBackendPids.stream().filter(pid -> pid != waiterPid).findFirst().orElseThrow();
                waitForAdvisoryWaiter(updateWaiterPid);
                assertThat(blockingPids(updateWaiterPid)).contains(waiterPid);
                assertThat(concurrentUpdate.isDone()).isFalse();
                System.out.println("P09_STATUS_AND_ADMIN_ORDER holderPid=" + holderPid + " statusWaiterPid=" + waiterPid
                        + " updateWaiterPid=" + updateWaiterPid + " statusBlockingPids=" + blockingPids(waiterPid)
                        + " updateBlockingPids=" + blockingPids(updateWaiterPid) + " committedUsedCount=5");
                holder.commit();
                assertSuccess(status.get(8, TimeUnit.SECONDS), 200);
                assertSuccess(concurrentUpdate.get(8, TimeUnit.SECONDS), 200);
                Map<String, Object> row = jdbc.queryForMap("select used_count,status from vouchers where id=?", id);
                assertThat(row).containsEntry("used_count", 5).containsEntry("status", "INACTIVE");
                assertThat(jdbc.queryForObject("select description from vouchers where id=?", String.class, id))
                        .isEqualTo("after status commit");
            } finally {
                try { holder.rollback(); } catch (SQLException ignored) { }
                executor.shutdownNow();
            }
        }
    }

    @Test
    void actorStatusRecheckedAfterAdvisoryWaitAndReal55P03Returns503ThenRetries() throws Exception {
        Account targetAdmin = account("p09-actor-target", Role.ADMIN, CustomerStatus.ACTIVE);
        Account lockerAdmin = account("p09-actor-locker", Role.ADMIN, CustomerStatus.ACTIVE);
        account("p09-actor-spare", Role.ADMIN, CustomerStatus.ACTIVE);
        String targetToken = login(targetAdmin);
        String lockerToken = login(lockerAdmin);
        long voucherId = create(targetToken, "ACTOR_RECHECK_" + suffix(), 5).path("id").asLong();

        try (Connection holder = dataSource.getConnection()) {
            holder.setAutoCommit(false);
            int holderPid = backendPid(holder);
            acquireAdvisory(holder);
            ExecutorService executor = Executors.newFixedThreadPool(2);
            try {
                CompletableFuture<HttpResponse<String>> lockActor = CompletableFuture.supplyAsync(() ->
                        awaitSend("PATCH", "/api/customers/" + targetAdmin.id() + "/status", lockerToken,
                                "{\"status\":\"LOCKED\",\"reason\":\"P09 concurrency fixture\"}", "application/json"), executor);
                int actorWaiter = waitForBlockedBy(holderPid);
                CompletableFuture<HttpResponse<String>> voucherWrite = CompletableFuture.supplyAsync(() ->
                        awaitSend("PUT", "/api/vouchers/" + voucherId, targetToken,
                                "{\"description\":\"must remain unchanged\",\"usageLimit\":4}", "application/json"), executor);
                int voucherWaiter = waitForSecondBlockedWaiter(holderPid, actorWaiter);
                System.out.println("P09_ACTOR_RECHECK holderPid=" + holderPid + " actorStatusWaiterPid=" + actorWaiter
                        + " voucherWaiterPid=" + voucherWaiter + " blocking=" + blockingPids(voucherWaiter));
                holder.commit();
                assertSuccess(lockActor.get(8, TimeUnit.SECONDS), 200);
                assertError(voucherWrite.get(8, TimeUnit.SECONDS), 401, "INVALID_TOKEN");
                assertThat(jdbc.queryForObject("select description from vouchers where id=?", String.class, voucherId)).isNull();
                assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, targetAdmin.id())).isEqualTo("LOCKED");
            } finally {
                try { holder.rollback(); } catch (SQLException ignored) { }
                executor.shutdownNow();
            }
        }

        Account retryAdmin = account("p09-timeout-admin", Role.ADMIN, CustomerStatus.ACTIVE);
        String retryToken = login(retryAdmin);
        customerProperties.setStatusLockTimeoutMs(600);
        String retryCode = "RETRY_" + suffix();
        try (Connection holder = dataSource.getConnection(); ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            holder.setAutoCommit(false);
            int holderPid = backendPid(holder);
            acquireAdvisory(holder);
            ExecutorService executor = Executors.newSingleThreadExecutor();
            try {
                CompletableFuture<HttpResponse<String>> waiting = CompletableFuture.supplyAsync(() ->
                        awaitSend("POST", "/api/vouchers", retryToken,
                                body(retryCode, 10, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", ""), "application/json"), executor);
                int waiterPid = waitForBlockedBy(holderPid);
                System.out.println("P09_LOCK_TIMEOUT holderPid=" + holderPid + " waiterPid=" + waiterPid
                        + " pgBlockingPids=" + blockingPids(waiterPid));
                HttpResponse<String> timeout = waiting.get(5, TimeUnit.SECONDS);
                assertError(timeout, 503, "DEPENDENCY_UNAVAILABLE");
                String trace = timeout.headers().firstValue("X-Request-ID").orElseThrow();
                assertThat(logs.rendered()).contains("category=voucher-create-database-failure",
                        "errorCode=DEPENDENCY_UNAVAILABLE", "traceId=" + trace)
                        .doesNotContain(retryCode, "55P03", "pg_advisory_xact_lock", "Bearer");
                assertThat(jdbc.queryForObject("select count(*) from vouchers where code=?", Integer.class, retryCode)).isZero();
                holder.rollback();
            } finally {
                try { holder.rollback(); } catch (SQLException ignored) { }
                executor.shutdownNow();
            }
        } finally {
            customerProperties.setStatusLockTimeoutMs(2_500);
        }
        assertSuccess(post("/api/vouchers", retryToken,
                body(retryCode, 10, 0, "2026-10-14T10:00:00", "2026-10-14T11:00:00", "")), 201);
    }

    private JsonNode create(String token, String code, Integer usageLimit) throws Exception {
        return create(token, code, usageLimit, "2026-10-14T10:00:00", "2026-10-14T11:00:00");
    }

    private JsonNode create(String token, String code, Integer usageLimit, String start, String end) throws Exception {
        String extra = usageLimit == null ? "\"usageLimit\":null" : "\"usageLimit\":" + usageLimit;
        HttpResponse<String> response = post("/api/vouchers", token, body(code, 10, 0, start, end, extra));
        assertSuccess(response, 201);
        return json(response).path("data");
    }

    private String body(String code, int value, int max, String start, String end, String extraField) {
        StringBuilder body = new StringBuilder("{\"code\":\"").append(escape(code))
                .append("\",\"discountType\":\"FIXED\",\"discountValue\":")
                .append(value).append(",\"maxDiscount\":").append(max)
                .append(",\"startAt\":\"").append(start).append("\",\"endAt\":\"").append(end).append("\"");
        if (!extraField.isBlank()) body.append(',').append(extraField);
        body.append('}');
        return body.toString();
    }

    private String numericBody(String code, String discountType, String discountValue, String maxDiscount,
            String minOrderAmount, String start, String end, String extraFields) {
        StringBuilder body = new StringBuilder("{\"code\":\"").append(escape(code))
                .append("\",\"discountType\":\"").append(discountType)
                .append("\",\"discountValue\":").append(discountValue)
                .append(",\"maxDiscount\":").append(maxDiscount)
                .append(",\"minOrderAmount\":").append(minOrderAmount)
                .append(",\"startAt\":\"").append(start)
                .append("\",\"endAt\":\"").append(end).append('"');
        if (!extraFields.isBlank()) body.append(',').append(extraFields);
        return body.append('}').toString();
    }

    private BigDecimal boundDecimal(CreateVoucherRequest request, String field) {
        return switch (field) {
            case "discountValue" -> request.getDiscountValue();
            case "maxDiscount" -> request.getMaxDiscount();
            case "minOrderAmount" -> request.getMinOrderAmount();
            default -> throw new IllegalArgumentException("Not a voucher decimal field");
        };
    }

    private Account account(String label, Role role, CustomerStatus status) {
        String random = suffix();
        String email = label + "-" + random + "@example.test";
        String phone = "P" + UUID.randomUUID().toString().replace("-", "").substring(0, 19);
        Long id = jdbc.queryForObject("insert into customers(full_name,email,phone,password_hash,email_verified,kyc_status,role,status) "
                + "values (?,?,?,?,?,?,?,?) returning id", Long.class, "Synthetic " + label, email, phone,
                passwordEncoder.encode(PASSWORD), true, KycStatus.NONE.name(), role.name(), status.name());
        return new Account(id, email);
    }

    private String login(Account account) throws Exception {
        HttpResponse<String> response = post("/api/auth/login", null,
                "{\"email\":\"" + account.email() + "\",\"password\":\"" + PASSWORD + "\"}");
        assertThat(response.statusCode()).isEqualTo(200);
        return json(response).path("data").path("accessToken").asText();
    }

    private HttpResponse<String> get(String path, String token) throws Exception { return send("GET", path, token, null, null); }
    private HttpResponse<String> post(String path, String token, String body) throws Exception {
        return send("POST", path, token, body, body == null ? null : "application/json");
    }
    private HttpResponse<String> postForm(String path, String token, String body) throws Exception {
        return send("POST", path, token, body, "application/x-www-form-urlencoded");
    }
    private HttpResponse<String> put(String path, String token, String body) throws Exception {
        return send("PUT", path, token, body, "application/json");
    }
    private HttpResponse<String> patch(String path, String token, String body) throws Exception {
        return send("PATCH", path, token, body, body == null ? null : "application/json");
    }

    private HttpResponse<String> send(String method, String path, String token, String body, String contentType) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri(path)).timeout(Duration.ofSeconds(15))
                .header("Accept", "application/json");
        if (token != null) builder.header("Authorization", "Bearer " + token);
        if (contentType != null) builder.header("Content-Type", contentType);
        HttpRequest.BodyPublisher publisher = body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body);
        return CLIENT.send(builder.method(method, publisher).build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> awaitSend(String method, String path, String token, String body, String contentType) {
        try { return send(method, path, token, body, contentType); }
        catch (Exception exception) { throw new IllegalStateException("P09 concurrent HTTP request failed", exception); }
    }

    private JsonNode json(HttpResponse<String> response) throws Exception { return mapper.readTree(response.body()); }

    private void assertSuccess(HttpResponse<String> response, int expected) throws Exception {
        assertThat(response.statusCode()).isEqualTo(expected);
        JsonNode envelope = json(response);
        assertThat(envelope.path("success").asBoolean()).isTrue();
        assertThat(envelope.path("code").asText()).isEqualTo("OK");
        assertThat(envelope.path("errors")).isEmpty();
        assertTrace(response, envelope);
        assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
    }

    private void assertError(HttpResponse<String> response, int expected, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(expected);
        JsonNode envelope = json(response);
        assertThat(envelope.path("success").asBoolean()).isFalse();
        assertThat(envelope.path("code").asText()).isEqualTo(code);
        assertThat(envelope.path("data").isNull()).isTrue();
        assertThat(envelope.path("errors").isArray()).isTrue();
        assertTrace(response, envelope);
    }

    private void assertTrace(HttpResponse<String> response, JsonNode envelope) {
        String trace = response.headers().firstValue("X-Request-ID").orElseThrow();
        assertThat(UUID.fromString(trace)).isNotNull();
        assertThat(envelope.path("traceId").asText()).isEqualTo(trace);
    }

    private List<Long> ids(JsonNode page) {
        List<Long> ids = new ArrayList<>();
        page.path("content").forEach(row -> ids.add(row.path("id").asLong()));
        return ids;
    }

    private URI uri(String path) { return URI.create("http://127.0.0.1:" + port + path); }

    private int backendPid(Connection connection) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("select pg_backend_pid()")) {
            try (var result = statement.executeQuery()) { result.next(); return result.getInt(1); }
        }
    }

    private void acquireAdvisory(Connection connection) throws SQLException {
        try (PreparedStatement lock = connection.prepareStatement("select pg_advisory_xact_lock(?)")) {
            lock.setLong(1, CustomerStatusLock.STATUS_NAMESPACE_KEY);
            lock.execute();
        }
    }

    private int waitForBlockedBy(int holderPid) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(7);
        while (System.nanoTime() < deadline) {
            List<Integer> blocked = blockedBy(holderPid);
            if (!blocked.isEmpty()) return blocked.getFirst();
            Thread.sleep(40);
        }
        throw new AssertionError("No PostgreSQL waiter blocked by holder=" + holderPid + "; active="
                + jdbc.queryForList("select pid,wait_event_type,wait_event,state from pg_stat_activity where datname=current_database()"));
    }

    private int waitForSecondBlockedWaiter(int holderPid, int firstPid) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(7);
        while (System.nanoTime() < deadline) {
            List<Integer> blocked = blockedBy(holderPid);
            for (Integer pid : blocked) if (pid != firstPid) return pid;
            Thread.sleep(40);
        }
        throw new AssertionError("Second advisory waiter not observed holder=" + holderPid + " first=" + firstPid
                + "; blocked=" + blockedBy(holderPid));
    }

    private void waitForAdvisoryWaiter(int waiterPid) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(7);
        while (System.nanoTime() < deadline) {
            Integer waiting = jdbc.queryForObject("select count(*) from pg_stat_activity where pid=? and state='active' "
                    + "and wait_event_type='Lock' and wait_event='advisory'", Integer.class, waiterPid);
            if (waiting != null && waiting > 0) return;
            Thread.sleep(40);
        }
        throw new AssertionError("PostgreSQL session did not wait on advisory lock pid=" + waiterPid
                + "; current=" + jdbc.queryForList("select pid,state,wait_event_type,wait_event from pg_stat_activity where pid=?", waiterPid));
    }

    private List<Integer> blockedBy(int holderPid) {
        return jdbc.query("select pid from pg_stat_activity where pid<>pg_backend_pid() and state='active' "
                        + "and ? = any(pg_blocking_pids(pid)) order by pid",
                (rs, row) -> rs.getInt(1), holderPid);
    }

    private List<Integer> blockingPids(int waiterPid) {
        return jdbc.query("select unnest(pg_blocking_pids(?))", (rs, row) -> rs.getInt(1), waiterPid);
    }

    private String escape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }
    private static String suffix() { return UUID.randomUUID().toString().replace("-", "").substring(0, 12); }
    private static String adminToken(String token) { return token; }

    private record Account(long id, String email) { }
    private record NumericCase(String code, String discountType, String discountValue,
            String maxDiscount, String minOrderAmount, String field) {
        private String rawValue() {
            return switch (field) {
                case "discountValue" -> discountValue;
                case "maxDiscount" -> maxDiscount;
                case "minOrderAmount" -> minOrderAmount;
                default -> throw new IllegalArgumentException("Not a voucher decimal field");
            };
        }
    }

    private static final class ThreadSafeLogCapture extends AppenderBase<ILoggingEvent> implements AutoCloseable {
        private final Logger logger;
        private final List<String> events = new java.util.concurrent.CopyOnWriteArrayList<>();

        private ThreadSafeLogCapture() {
            logger = (Logger) LoggerFactory.getLogger(VoucherChangeLogger.class);
            setContext((LoggerContext) LoggerFactory.getILoggerFactory());
            start();
            logger.addAppender(this);
        }

        @Override protected void append(ILoggingEvent event) { events.add(event.getFormattedMessage()); }
        private String rendered() { return String.join("\n", events); }
        @Override public void close() { logger.detachAppender(this); stop(); }
    }
}
