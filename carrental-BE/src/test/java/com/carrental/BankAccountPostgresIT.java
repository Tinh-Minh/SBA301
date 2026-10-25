package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.reset;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import com.carrental.dto.response.BankAccountResponse;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.repository.BankAccountRepository;
import com.carrental.service.ActionLogService;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
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

/** Production HTTP/JWT/JPA behavior against a private PostgreSQL 15.13 Testcontainer. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1,classpath:db/migration/it-support",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false"
})
class BankAccountPostgresIT {
    private static final String PASSWORD = "P08 synthetic password";
    private static final String PAYOUT_FK = "payouts_bank_account_id_recipient_id_fkey";
    private static final String BANK_UNIQUE = "bank_accounts_customer_id_bank_name_account_number_key";
    private static final String DEFAULT_UNIQUE = "uq_bank_default_per_customer";
    private static final String ORIGIN = "http://localhost:5173";
    private static final HttpClient CLIENT = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();

    @Container
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:15.13-alpine");

    @DynamicPropertySource
    static void integrationProperties(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        properties.add("spring.datasource.username", POSTGRES::getUsername);
        properties.add("spring.datasource.password", POSTGRES::getPassword);
        properties.add("app.security.jwt.issuer", () -> TestJwtKeys.ISSUER);
        properties.add("app.security.jwt.audience", () -> TestJwtKeys.AUDIENCE);
        properties.add("app.security.jwt.access-token-ttl", () -> "PT5M");
        properties.add("app.security.jwt.clock-skew", () -> "PT30S");
        properties.add("app.security.jwt.private-key-location", TestJwtKeys::privateKeyLocation);
        properties.add("app.security.jwt.public-key-location", TestJwtKeys::publicKeyLocation);
        properties.add("app.security.cors.allowed-origins", () -> ORIGIN);
    }

    @LocalServerPort private int port;
    @Autowired private JsonMapper mapper;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private DataSource dataSource;
    @Autowired private PasswordEncoder passwordEncoder;
    @MockitoSpyBean private BankAccountRepository bankAccounts;
    @MockitoSpyBean private ActionLogService actionLogService;

    @BeforeEach
    void isolateRowsAndCreateTestOnlyPayoutFk() {
        reset(bankAccounts, actionLogService);
        jdbc.execute("DROP TABLE IF EXISTS payouts");
        jdbc.execute("CREATE TABLE payouts ("
                + "id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, bank_account_id BIGINT NOT NULL, recipient_id BIGINT NOT NULL, "
                + "CONSTRAINT " + PAYOUT_FK + " FOREIGN KEY (bank_account_id, recipient_id) "
                + "REFERENCES bank_accounts (id, customer_id))");
        jdbc.update("delete from customers");
    }

    @Test
    void strictCreateMaskingDefaultsAndOnlySchemaFieldsAreExposed() throws Exception {
        Account owner = account("p08-create-owner", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String token = login(owner);
        String raw = "0012345678";
        String marker = "SENTINEL_ACCOUNT_" + suffix();

        HttpResponse<String> created = post("/api/bank-accounts", token,
                "{\"bankName\":\"  Bank Case  \",\"accountNumber\":\"" + raw
                        + "\",\"accountHolder\":\" Owner Name \",\"unexpected\":\"" + marker + "\"}");
        assertError(created, 400, "INVALID_REQUEST");
        assertThat(created.body()).doesNotContain(raw, marker);
        assertThat(jdbc.queryForObject("select count(*) from bank_accounts", Integer.class)).isZero();

        HttpResponse<String> first = post("/api/bank-accounts", token,
                "{\"bankName\":\"  Bank Case  \",\"accountNumber\":\"" + raw
                        + "\",\"accountHolder\":\" Owner Name \"}");
        assertSuccess(first, 201);
        assertThat(first.headers().firstValue("Location").orElseThrow()).contains("/api/bank-accounts/");
        JsonNode firstDto = json(first).path("data");
        assertThat(firstDto.path("accountNumberMasked").asText()).isEqualTo("******5678");
        assertThat(firstDto.path("isDefault").asBoolean()).isFalse();
        assertThat(first.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        assertThat(first.body()).doesNotContain(raw).contains("Bank Case", "Owner Name");
        assertThat(fieldNames(firstDto)).containsExactlyInAnyOrder(
                "id", "customerId", "bankName", "accountNumberMasked", "accountHolder", "isDefault", "createdAt");
        long firstId = firstDto.path("id").asLong();
        Map<String, Object> stored = jdbc.queryForMap("select customer_id, bank_name, account_number, account_holder, is_default, created_at "
                + "from bank_accounts where id=?", firstId);
        assertThat(stored).containsEntry("customer_id", owner.id()).containsEntry("bank_name", "Bank Case")
                .containsEntry("account_number", raw).containsEntry("account_holder", "Owner Name")
                .containsEntry("is_default", false);
        assertThat(jdbc.queryForObject("select count(*) from information_schema.columns "
                + "where table_schema=current_schema() and table_name='bank_accounts' and column_name='updated_at'", Integer.class))
                .isZero();

        String next = "00001234";
        HttpResponse<String> madeDefault = post("/api/bank-accounts", token,
                "{\"bankName\":\"bank case\",\"accountNumber\":\"" + next
                        + "\",\"accountHolder\":\"Owner Name\",\"makeDefault\":true}");
        assertSuccess(madeDefault, 201);
        long secondId = json(madeDefault).path("data").path("id").asLong();
        assertThat(json(madeDefault).path("data").path("accountNumberMasked").asText()).isEqualTo("****1234");
        assertThat(json(madeDefault).path("data").path("isDefault").asBoolean()).isTrue();
        assertThat(madeDefault.body()).doesNotContain(next);
        assertThat(jdbc.queryForObject("select is_default from bank_accounts where id=?", Boolean.class, firstId)).isFalse();
        assertThat(jdbc.queryForObject("select is_default from bank_accounts where id=?", Boolean.class, secondId)).isTrue();

        HttpResponse<String> detail = get("/api/bank-accounts/" + firstId, token);
        assertSuccess(detail, 200);
        assertThat(detail.body()).doesNotContain(raw);
        HttpResponse<String> defaultAgain = patch("/api/bank-accounts/" + firstId + "/default", token, null);
        assertSuccess(defaultAgain, 200);
        assertThat(defaultAgain.body()).doesNotContain(raw);
        HttpResponse<String> listed = get("/api/bank-accounts?sort=id,asc", token);
        assertSuccess(listed, 200);
        assertThat(listed.body()).doesNotContain(raw, next);

        List<String> invalidBodies = List.of(
                "{}", "null", "[]", "{\"bankName\":null,\"accountNumber\":\"55\",\"accountHolder\":\"A\"}",
                "{\"bankName\":5,\"accountNumber\":\"55\",\"accountHolder\":\"A\"}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"makeDefault\":null}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"makeDefault\":\"true\"}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"makeDefault\":1}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"makeDefault\":[]}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"makeDefault\":{}}",
                "{\"bankName\":\"First\",\"bankName\":\"Second\",\"accountNumber\":\"55\",\"accountHolder\":\"A\"}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"customerId\":3}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"isDefault\":true}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"makeDefaultWasProvided\":true}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"bankNameWasProvided\":true}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"accountNumberWasProvided\":true}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"accountHolderWasProvided\":true}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"bankNamePresent\":true}",
                "{\"bankName\":\"B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\",\"ownerId\":3}",
                "{\"bankName\":\"\u0001B\",\"accountNumber\":\"55\",\"accountHolder\":\"A\"}");
        Map<String, Object> before = jdbc.queryForMap("select * from bank_accounts where id=?", secondId);
        for (String body : invalidBodies) {
            HttpResponse<String> response = post("/api/bank-accounts", token, body);
            assertThat(response.statusCode()).isIn(400);
            assertTrace(response, json(response));
            assertThat(response.body()).doesNotContain(raw, next, "rejectedValue", "makeDefaultWasProvided");
            assertThat(jdbc.queryForMap("select * from bank_accounts where id=?", secondId)).isEqualTo(before);
        }
        assertError(post("/api/bank-accounts?customerId=" + owner.id(), token,
                "{\"bankName\":\"Q\",\"accountNumber\":\"999\",\"accountHolder\":\"Q\"}"), 400, "INVALID_REQUEST");
        assertError(post("/api/bank-accounts", token, "{malformed"), 400, "INVALID_REQUEST");
        assertError(postForm("/api/bank-accounts", token, "bankName=x"), 415, "UNSUPPORTED_MEDIA_TYPE");
        for (String invalid : List.of(createBody("B".repeat(101), "777", "A", false),
                createBody("B", "7".repeat(31), "A", false), createBody("B", "777", "A".repeat(151), false))) {
            HttpResponse<String> rejected = post("/api/bank-accounts", token, invalid);
            assertError(rejected, 400, "VALIDATION_ERROR");
            assertThat(rejected.body()).doesNotContain("B".repeat(101), "7".repeat(31), "A".repeat(151));
        }
        HttpResponse<String> caseDistinct = post("/api/bank-accounts", token,
                createBody("bank case", raw, "Case Variant", false));
        assertSuccess(caseDistinct, 201);
        assertThat(jdbc.queryForObject("select bank_name from bank_accounts where id=?", String.class,
                json(caseDistinct).path("data").path("id").asLong())).isEqualTo("bank case");
    }

    @Test
    void ownershipPagingAndSecurityAreAlwaysScopedToTheCurrentOwner() throws Exception {
        Account customer = account("p08-scope-customer", Role.CUSTOMER, CustomerStatus.ACTIVE);
        Account admin = account("p08-scope-admin", Role.ADMIN, CustomerStatus.ACTIVE);
        Account foreign = account("p08-scope-foreign", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String customerToken = login(customer);
        String adminToken = login(admin);
        long customerFirst = create(customerToken, "Bank A", "00001001", false).id();
        long customerSecond = create(customerToken, "Bank B", "00001002", false).id();
        long adminBank = create(adminToken, "Admin Bank", "00002001", false).id();
        long foreignBank = create(login(foreign), "Foreign Bank", "00003001", false).id();

        HttpResponse<String> adminOwn = get("/api/bank-accounts/" + adminBank, adminToken);
        assertSuccess(adminOwn, 200);
        assertError(get("/api/bank-accounts/" + customerFirst, adminToken), 404, "RESOURCE_NOT_FOUND");
        assertError(get("/api/bank-accounts/" + foreignBank, customerToken), 404, "RESOURCE_NOT_FOUND");
        assertError(get("/api/bank-accounts/999999999", customerToken), 404, "RESOURCE_NOT_FOUND");
        assertError(get("/api/bank-accounts/0", customerToken), 400, "INVALID_REQUEST");
        assertError(get("/api/bank-accounts/" + customerFirst + "?page=0", customerToken), 400, "INVALID_REQUEST");

        HttpResponse<String> page = get("/api/bank-accounts?page=0&size=1&sort=id,asc", customerToken);
        assertSuccess(page, 200);
        assertThat(json(page).path("data").path("content").size()).isEqualTo(1);
        assertThat(json(page).path("data").path("content").get(0).path("id").asLong()).isEqualTo(customerFirst);
        assertThat(json(page).path("data").path("totalElements").asLong()).isEqualTo(2);
        assertThat(json(page).path("data").path("totalPages").asInt()).isEqualTo(2);
        assertThat(page.body()).doesNotContain("00001001", "00001002", "00002001", "00003001");
        for (String query : List.of("?page=-1", "?size=0", "?size=101", "?size=1&size=2",
                "?sort=id,asc&sort=createdAt,desc", "?sort=accountNumber,asc", "?filter=x", "?page=2147483647&size=100")) {
            assertError(get("/api/bank-accounts" + query, customerToken), 400, "INVALID_REQUEST");
        }
        assertError(get("/api/bank-accounts", null), 401, "AUTHENTICATION_FAILED");
        assertError(get("/api/bank-accounts", "not-a-valid-token"), 401, "INVALID_TOKEN");
        Account formerlyActive = account("p08-locked-after-login", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String lockedToken = login(formerlyActive);
        jdbc.update("update customers set status='LOCKED' where id=?", formerlyActive.id());
        assertError(get("/api/bank-accounts", lockedToken), 401, "INVALID_TOKEN");

        HttpRequest preflight = HttpRequest.newBuilder(uri("/api/bank-accounts/" + customerFirst))
                .header("Origin", ORIGIN).header("Access-Control-Request-Method", "DELETE")
                .header("Access-Control-Request-Headers", "authorization,content-type")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build();
        HttpResponse<String> cors = CLIENT.send(preflight, HttpResponse.BodyHandlers.ofString());
        assertThat(cors.statusCode()).isBetween(200, 299);
        assertThat(cors.headers().firstValue("Access-Control-Allow-Methods").orElse("")).contains("DELETE");
        assertThat(cors.headers().firstValue("X-Request-ID")).isPresent();
    }

    @Test
    void bodylessPatchAndDeleteRejectEveryPayloadAndQueryBeforeMutation() throws Exception {
        Account owner = account("p08-bodyless-owner", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String token = login(owner);
        long first = create(token, "Bank", "11112222", true).id();
        long second = create(token, "Bank", "33334444", false).id();
        Map<String, Object> beforeFirst = jdbc.queryForMap("select * from bank_accounts where id=?", first);
        Map<String, Object> beforeSecond = jdbc.queryForMap("select * from bank_accounts where id=?", second);
        List<String> payloads = List.of("{}", " ", "null", "a=b", "--test-boundary\r\nContent-Disposition: form-data; name=\"x\"\r\n\r\nx\r\n--test-boundary--\r\n");
        for (String payload : payloads) {
            HttpResponse<String> response = send("PATCH", "/api/bank-accounts/" + second + "/default", token,
                    payload, payload.startsWith("a=") ? "application/x-www-form-urlencoded" :
                            payload.startsWith("--") ? "multipart/form-data; boundary=test-boundary" : "application/json");
            assertError(response, 400, "INVALID_REQUEST");
            assertThat(jdbc.queryForMap("select * from bank_accounts where id=?", first)).isEqualTo(beforeFirst);
            assertThat(jdbc.queryForMap("select * from bank_accounts where id=?", second)).isEqualTo(beforeSecond);
        }
        HttpResponse<String> chunked = sendChunked("DELETE", "/api/bank-accounts/" + second, token,
                " { } ".getBytes(StandardCharsets.UTF_8), "application/json");
        assertError(chunked, 400, "INVALID_REQUEST");
        assertError(send("PATCH", "/api/bank-accounts/" + second + "/default?confirm=true", token, null, null),
                400, "INVALID_REQUEST");
        assertError(send("DELETE", "/api/bank-accounts/" + second + "?force=true", token, null, null),
                400, "INVALID_REQUEST");
        assertThat(jdbc.queryForMap("select * from bank_accounts where id=?", first)).isEqualTo(beforeFirst);
        assertThat(jdbc.queryForMap("select * from bank_accounts where id=?", second)).isEqualTo(beforeSecond);
        assertError(send("DELETE", "/api/bank-accounts/" + second, null, null, null), 401, "AUTHENTICATION_FAILED");
        assertError(send("PUT", "/api/bank-accounts/" + second, token, "{}", "application/json"),
                405, "METHOD_NOT_ALLOWED");
    }

    @Test
    void databasePostgresHealthResponseIncludesMatchingTrace() throws Exception {
        HttpResponse<String> health = get("/api/health", null);
        assertThat(health.statusCode()).isEqualTo(200);
        JsonNode envelope = json(health);
        assertThat(envelope.path("success").asBoolean()).isTrue();
        assertThat(envelope.path("code").asText()).isEqualTo("OK");
        assertThat(envelope.path("data").path("status").asText()).isEqualTo("UP");
        assertTrace(health, envelope);
        System.out.println("P08_HEALTH status=" + health.statusCode() + " body=" + health.body()
                + " X-Request-ID=" + health.headers().firstValue("X-Request-ID").orElse("missing"));
    }

    @Test
    void actualPostgresUniqueAndPartialIndexConflictsUseExactSafeCodes() throws Exception {
        Account owner = account("p08-unique-owner", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String token = login(owner);
        String number = "000077001234";
        BankAccountResponse existing = create(token, "Sensitive Bank", number, false);
        String duplicateTrace;
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            // Simulate a stale precheck only; the INSERT reaches PostgreSQL and its unique index raises actual 23505.
            doReturn(false).when(bankAccounts).existsByCustomerIdAndBankNameAndAccountNumber(
                    owner.id(), "Sensitive Bank", number);
            HttpResponse<String> duplicate = post("/api/bank-accounts", token,
                    createBody("Sensitive Bank", number, "SENTINEL_HOLDER_DUP", false));
            assertError(duplicate, 409, "BANK_ACCOUNT_ALREADY_EXISTS");
            duplicateTrace = duplicate.headers().firstValue("X-Request-ID").orElseThrow();
            assertThat(duplicate.body()).doesNotContain(number, "SENTINEL_HOLDER_DUP", BANK_UNIQUE);
            assertThat(logs.rendered()).contains("errorCode=BANK_ACCOUNT_ALREADY_EXISTS",
                    "traceId=" + duplicateTrace)
                    .doesNotContain(number, "Sensitive Bank", "SENTINEL_HOLDER_DUP", "SQLState", "23505", "Throwable");
            assertThat(jdbc.queryForObject("select count(*) from bank_accounts where customer_id=?", Integer.class, owner.id())).isEqualTo(1);
        }
        assertThat(jdbc.queryForObject("select count(*) from pg_constraint where conname=?", Integer.class, BANK_UNIQUE)).isEqualTo(1);

        Account secondOwner = account("p08-unique-second-owner", Role.CUSTOMER, CustomerStatus.ACTIVE);
        create(login(secondOwner), "Sensitive Bank", number, false);
        jdbc.execute("create unique index uq_p08_test_account_holder on bank_accounts(customer_id, account_holder)");
        try {
            try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
                HttpResponse<String> unrelated = post("/api/bank-accounts", token,
                        createBody("Unrelated Index Bank", "000077009876", "Synthetic Owner", false));
                assertError(unrelated, 500, "INTERNAL_ERROR");
                assertThat(unrelated.body()).doesNotContain("000077009876", "Synthetic Owner", "uq_p08_test_account_holder");
                assertThat(logs.rendered()).contains("errorCode=INTERNAL_ERROR")
                        .doesNotContain("BANK_ACCOUNT_ALREADY_EXISTS", "uq_p08_test_account_holder", "Synthetic Owner", "000077009876");
            }
        } finally {
            jdbc.execute("drop index if exists uq_p08_test_account_holder");
        }

        BankAccountResponse oldDefault = create(token, "Default Bank", "000088001234", true);
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            // The stale read is injected; PostgreSQL's partial unique index still rejects the second true row.
            doReturn(java.util.Optional.empty()).when(bankAccounts).findByCustomerIdAndIsDefaultTrue(owner.id());
            HttpResponse<String> conflict = post("/api/bank-accounts", token,
                    createBody("Other Bank", "000088005678", "Safe Holder", true));
            assertError(conflict, 409, "BANK_DEFAULT_CONFLICT");
            assertThat(conflict.body()).doesNotContain("000088005678");
            assertThat(logs.rendered()).contains("errorCode=BANK_DEFAULT_CONFLICT")
                    .doesNotContain("000088005678", "Other Bank", "Safe Holder", "23505");
            assertThat(jdbc.queryForObject("select count(*) from bank_accounts where customer_id=? and is_default", Integer.class,
                    owner.id())).isEqualTo(1);
            assertThat(jdbc.queryForObject("select id from bank_accounts where customer_id=? and is_default", Long.class,
                    owner.id())).isEqualTo(oldDefault.id());
        }
        assertThat(jdbc.queryForObject("select count(*) from pg_indexes where indexname=?", Integer.class, DEFAULT_UNIQUE)).isEqualTo(1);
        try (Connection connection = dataSource.getConnection(); PreparedStatement statement = connection.prepareStatement(
                "insert into bank_accounts(customer_id,bank_name,account_number,account_holder,is_default) values (?,?,?,?,true)")) {
            statement.setLong(1, owner.id()); statement.setString(2, "Third Bank");
            statement.setString(3, "000088009999"); statement.setString(4, "Third Holder");
            org.assertj.core.api.Assertions.assertThatThrownBy(statement::executeUpdate).satisfies(failure -> {
                SQLException sql = findSqlException(failure);
                assertThat(sql.getSQLState()).isEqualTo("23505");
                assertThat(sql.getMessage()).contains(DEFAULT_UNIQUE);
            });
        }
    }

    @Test
    void defaultNoOpRollbackAndDeletePreserveU16U17AndAfterCommitSemantics() throws Exception {
        Account owner = account("p08-default-owner", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String token = login(owner);
        BankAccountResponse first = create(token, "Bank", "1234", false);
        BankAccountResponse second = create(token, "Bank", "😀1234", true);
        assertThat(second.accountNumberMasked()).isEqualTo("*1234");
        assertThat(jdbc.queryForObject("select account_number from bank_accounts where id=?", String.class, second.id())).isEqualTo("😀1234");
        Map<String, Object> oldDefaultBefore = jdbc.queryForMap("select * from bank_accounts where id=?", second.id());

        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            HttpResponse<String> noOp = patch("/api/bank-accounts/" + second.id() + "/default", token, null);
            assertSuccess(noOp, 200);
            assertThat(jdbc.queryForMap("select * from bank_accounts where id=?", second.id())).isEqualTo(oldDefaultBefore);
            assertThat(logs.rendered()).doesNotContain("Bank account changed action=bank-account-default");
        }

        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            // Inject a fault after the old default's real UPDATE/flush, before target is set; outer transaction must roll back.
            doAnswer(invocation -> {
                Object result = SpySupport.callRealMethod(invocation);
                throw new IllegalStateException("SENTINEL_P08_ROLLBACK");
            }).when(bankAccounts).flush();
            HttpResponse<String> failed = patch("/api/bank-accounts/" + first.id() + "/default", token, null);
            assertError(failed, 500, "INTERNAL_ERROR");
            assertThat(failed.body()).doesNotContain("SENTINEL_P08_ROLLBACK", "1234", "😀1234");
            assertThat(jdbc.queryForObject("select id from bank_accounts where customer_id=? and is_default", Long.class, owner.id()))
                    .isEqualTo(second.id());
            assertThat(jdbc.queryForMap("select * from bank_accounts where id=?", second.id())).isEqualTo(oldDefaultBefore);
            assertThat(logs.rendered()).doesNotContain("SENTINEL_P08_ROLLBACK", "Bank account changed action=bank-account-default");
        }
        reset(bankAccounts);

        HttpResponse<String> changed = patch("/api/bank-accounts/" + first.id() + "/default", token, null);
        assertSuccess(changed, 200);
        HttpResponse<String> deleteDefault = send("DELETE", "/api/bank-accounts/" + first.id(), token, null, null);
        assertSuccess(deleteDefault, 200);
        assertThat(json(deleteDefault).path("data").isNull()).isTrue();
        assertThat(jdbc.queryForObject("select count(*) from bank_accounts where customer_id=? and is_default", Integer.class,
                owner.id())).isZero();
        HttpResponse<String> repeat = send("DELETE", "/api/bank-accounts/" + first.id(), token, null, null);
        assertError(repeat, 404, "RESOURCE_NOT_FOUND");
        HttpResponse<String> deleteOther = send("DELETE", "/api/bank-accounts/" + second.id(), token, null, null);
        assertSuccess(deleteOther, 200);
        assertThat(jdbc.queryForObject("select count(*) from bank_accounts where customer_id=?", Integer.class, owner.id())).isZero();
        assertError(send("PATCH", "/api/bank-accounts/999999/default", token, null, null), 404, "RESOURCE_NOT_FOUND");
    }

    @Test
    void compositeForeignKeyBlocksWrongOwnerAndReferencedDelete() throws Exception {
        Account owner = account("p08-fk-owner", Role.CUSTOMER, CustomerStatus.ACTIVE);
        Account foreign = account("p08-fk-foreign", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String token = login(owner);
        BankAccountResponse account = create(token, "Private Bank", "000099887766", true);
        String fkName = jdbc.queryForObject("select conname from pg_constraint where conname=?", String.class, PAYOUT_FK);
        assertThat(fkName).isEqualTo(PAYOUT_FK);
        try (Connection connection = dataSource.getConnection(); PreparedStatement wrong = connection.prepareStatement(
                "insert into payouts(bank_account_id,recipient_id) values (?,?)")) {
            wrong.setLong(1, account.id()); wrong.setLong(2, foreign.id());
            org.assertj.core.api.Assertions.assertThatThrownBy(wrong::executeUpdate).satisfies(failure -> {
                SQLException sql = findSqlException(failure);
                assertThat(sql.getSQLState()).isEqualTo("23503");
                assertThat(sql.getMessage()).contains(PAYOUT_FK);
            });
        }

        Map<String, Object> bankBefore = jdbc.queryForMap("select * from bank_accounts where id=?", account.id());
        try (Connection holder = dataSource.getConnection(); ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            holder.setAutoCommit(false);
            int holderPid = backendPid(holder);
            insertPayout(holder, account.id(), owner.id());
            ExecutorService executor = Executors.newSingleThreadExecutor();
            try {
                CompletableFuture<HttpResponse<String>> deleting = CompletableFuture.supplyAsync(() ->
                        awaitSend("DELETE", "/api/bank-accounts/" + account.id(), token, null, null), executor);
                int waiterPid = waitForBlockedBy(holderPid);
                assertThat(waiterPid).isNotEqualTo(holderPid);
                System.out.println("P08_FK_RACE holderPid=" + holderPid + " waiterPid=" + waiterPid
                        + " pgBlockingPids=" + blockingPids(waiterPid));
                assertThat(jdbc.queryForObject("select count(*) from bank_accounts where id=?", Integer.class, account.id())).isEqualTo(1);
                holder.commit();
                HttpResponse<String> response = deleting.get(8, TimeUnit.SECONDS);
                assertError(response, 409, "BANK_ACCOUNT_IN_USE");
                String trace = response.headers().firstValue("X-Request-ID").orElseThrow();
                assertThat(response.body()).doesNotContain("000099887766", "Private Bank", PAYOUT_FK, "23503");
                assertThat(logs.rendered()).contains("errorCode=BANK_ACCOUNT_IN_USE",
                        "traceId=" + trace)
                        .doesNotContain("000099887766", "Private Bank", "Synthetic Owner", "23503", "SQLState");
                assertThat(jdbc.queryForMap("select * from bank_accounts where id=?", account.id())).isEqualTo(bankBefore);
                assertThat(jdbc.queryForObject("select is_default from bank_accounts where id=?", Boolean.class, account.id())).isTrue();
                assertThat(jdbc.queryForObject("select count(*) from payouts where bank_account_id=? and recipient_id=?",
                        Integer.class, account.id(), owner.id())).isEqualTo(1);
            } finally {
                try { holder.rollback(); } catch (SQLException ignored) { }
                executor.shutdownNow();
            }
        }
    }

    @Test
    void twoDefaultChangesSerializeOnCustomerRowLockAndHideIntermediateState() throws Exception {
        Account owner = account("p08-default-race-owner", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String token = login(owner);
        long first = create(token, "Bank", "10000001", true).id();
        long second = create(token, "Bank", "10000002", false).id();
        long third = create(token, "Bank", "10000003", false).id();
        CountDownLatch holderPaused = new CountDownLatch(1);
        CountDownLatch releaseHolder = new CountDownLatch(1);
        AtomicInteger holderPid = new AtomicInteger(-1);
        doAnswer(invocation -> {
            Object result = SpySupport.callRealMethod(invocation);
            if ("bank-account-default".equals(invocation.getArgument(0))) {
                holderPid.set(jdbc.queryForObject("select pg_backend_pid()", Integer.class));
                holderPaused.countDown();
                if (!releaseHolder.await(8, TimeUnit.SECONDS)) throw new IllegalStateException("P08 holder release timed out");
            }
            return result;
        }).when(actionLogService).bankAccountChanged(anyString(), anyLong(), anyLong());
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            CompletableFuture<HttpResponse<String>> holder = CompletableFuture.supplyAsync(() ->
                    awaitSend("PATCH", "/api/bank-accounts/" + second + "/default", token, null, null), executor);
            assertThat(holderPaused.await(6, TimeUnit.SECONDS)).isTrue();
            assertThat(jdbc.queryForObject("select count(*) from bank_accounts where customer_id=? and is_default", Integer.class,
                    owner.id())).isEqualTo(1);
            assertThat(jdbc.queryForObject("select id from bank_accounts where customer_id=? and is_default", Long.class,
                    owner.id())).isEqualTo(first);
            CompletableFuture<HttpResponse<String>> waiter = CompletableFuture.supplyAsync(() ->
                    awaitSend("PATCH", "/api/bank-accounts/" + third + "/default", token, null, null), executor);
            int waiterPid = waitForBlockedBy(holderPid.get());
            assertThat(waiterPid).isNotEqualTo(holderPid.get());
            System.out.println("P08_DEFAULT_RACE holderPid=" + holderPid.get() + " waiterPid=" + waiterPid
                    + " pgBlockingPids=" + blockingPids(waiterPid) + " intermediateDefaultVisible=false");
            releaseHolder.countDown();
            HttpResponse<String> firstResponse = holder.get(8, TimeUnit.SECONDS);
            HttpResponse<String> secondResponse = waiter.get(8, TimeUnit.SECONDS);
            assertSuccess(firstResponse, 200);
            assertSuccess(secondResponse, 200);
            assertThat(jdbc.queryForObject("select id from bank_accounts where customer_id=? and is_default", Long.class,
                    owner.id())).isEqualTo(third);
            assertThat(jdbc.queryForObject("select count(*) from bank_accounts where customer_id=? and is_default", Integer.class,
                    owner.id())).isEqualTo(1);
            String rendered = logs.rendered();
            assertThat(rendered).contains("action=bank-account-default", "bankAccountId=" + second,
                    "bankAccountId=" + third, "traceId=" + firstResponse.headers().firstValue("X-Request-ID").orElseThrow(),
                    "traceId=" + secondResponse.headers().firstValue("X-Request-ID").orElseThrow())
                    .doesNotContain("10000001", "10000002", "10000003");
        } finally {
            releaseHolder.countDown();
            executor.shutdownNow();
        }
    }

    @Test
    void defaultThenDeleteOfSameRowSerializeWithoutPromotingAnotherAccount() throws Exception {
        Account owner = account("p08-default-delete-owner", Role.CUSTOMER, CustomerStatus.ACTIVE);
        String token = login(owner);
        long originalDefault = create(token, "Bank", "20000001", true).id();
        long target = create(token, "Bank", "20000002", false).id();
        CountDownLatch paused = new CountDownLatch(1);
        CountDownLatch release = new CountDownLatch(1);
        AtomicInteger blockerPid = new AtomicInteger(-1);
        doAnswer(invocation -> {
            Object result = SpySupport.callRealMethod(invocation);
            if ("bank-account-default".equals(invocation.getArgument(0))) {
                blockerPid.set(jdbc.queryForObject("select pg_backend_pid()", Integer.class));
                paused.countDown();
                if (!release.await(8, TimeUnit.SECONDS)) throw new IllegalStateException("P08 default/delete release timed out");
            }
            return result;
        }).when(actionLogService).bankAccountChanged(anyString(), anyLong(), anyLong());
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            CompletableFuture<HttpResponse<String>> setting = CompletableFuture.supplyAsync(() ->
                    awaitSend("PATCH", "/api/bank-accounts/" + target + "/default", token, null, null), executor);
            assertThat(paused.await(6, TimeUnit.SECONDS)).isTrue();
            CompletableFuture<HttpResponse<String>> deleting = CompletableFuture.supplyAsync(() ->
                    awaitSend("DELETE", "/api/bank-accounts/" + target, token, null, null), executor);
            int waiterPid = waitForBlockedBy(blockerPid.get());
            assertThat(waiterPid).isNotEqualTo(blockerPid.get());
            System.out.println("P08_DEFAULT_DELETE holderPid=" + blockerPid.get() + " waiterPid=" + waiterPid
                    + " pgBlockingPids=" + blockingPids(waiterPid));
            release.countDown();
            assertSuccess(setting.get(8, TimeUnit.SECONDS), 200);
            assertSuccess(deleting.get(8, TimeUnit.SECONDS), 200);
            assertThat(jdbc.queryForObject("select count(*) from bank_accounts where id=?", Integer.class, target)).isZero();
            assertThat(jdbc.queryForObject("select is_default from bank_accounts where id=?", Boolean.class, originalDefault)).isFalse();
            assertThat(jdbc.queryForObject("select count(*) from bank_accounts where customer_id=? and is_default", Integer.class,
                    owner.id())).isZero();
        } finally {
            release.countDown();
            executor.shutdownNow();
        }
    }

private BankAccountResponse create(String token, String bankName, String accountNumber, boolean makeDefault) throws Exception {
        HttpResponse<String> response = post("/api/bank-accounts", token,
                createBody(bankName, accountNumber, "Synthetic Owner", makeDefault));
        assertSuccess(response, 201);
        assertThat(response.body()).doesNotContain(accountNumber);
        return mapper.treeToValue(json(response).path("data"), BankAccountResponse.class);
    }

    private String createBody(String bankName, String accountNumber, String holder, boolean makeDefault) {
        return "{\"bankName\":\"" + jsonEscape(bankName) + "\",\"accountNumber\":\"" + jsonEscape(accountNumber)
                + "\",\"accountHolder\":\"" + jsonEscape(holder) + "\",\"makeDefault\":" + makeDefault + "}";
    }

    private Account account(String label, Role role, CustomerStatus status) {
        String random = suffix();
        String email = label + "-" + random + "@example.test";
        String phone = "P" + random.substring(0, 19);
        Long id = jdbc.queryForObject("insert into customers(full_name,email,phone,password_hash,email_verified,kyc_status,role,status) "
                + "values (?,?,?,?,?,?,?,?) returning id", Long.class, "Synthetic " + label, email, phone,
                passwordEncoder.encode(PASSWORD), true, KycStatus.NONE.name(), role.name(), status.name());
        return new Account(id, email, phone);
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
    private HttpResponse<String> patch(String path, String token, String body) throws Exception {
        return send("PATCH", path, token, body, body == null ? null : "application/json");
    }

    private HttpResponse<String> send(String method, String path, String token, String body, String contentType) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri(path)).timeout(Duration.ofSeconds(12)).header("Accept", "application/json");
        if (token != null) builder.header("Authorization", "Bearer " + token);
        if (contentType != null) builder.header("Content-Type", contentType);
        HttpRequest.BodyPublisher publisher = body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body);
        return CLIENT.send(builder.method(method, publisher).build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> sendChunked(String method, String path, String token, byte[] body, String contentType) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri(path)).timeout(Duration.ofSeconds(12)).header("Accept", "application/json")
                .header("Content-Type", contentType);
        if (token != null) builder.header("Authorization", "Bearer " + token);
        return CLIENT.send(builder.method(method, HttpRequest.BodyPublishers.ofInputStream(
                () -> new ByteArrayInputStream(body))).build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> awaitSend(String method, String path, String token, String body, String contentType) {
        try { return send(method, path, token, body, contentType); }
        catch (Exception exception) { throw new IllegalStateException("P08 concurrent HTTP request failed", exception); }
    }

    private JsonNode json(HttpResponse<String> response) throws Exception { return mapper.readTree(response.body()); }

    private void assertSuccess(HttpResponse<String> response, int status) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode envelope = json(response);
        assertThat(envelope.path("success").asBoolean()).isTrue();
        assertThat(envelope.path("code").asText()).isEqualTo("OK");
        assertThat(envelope.path("errors")).isEmpty();
        assertTrace(response, envelope);
        assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
    }

    private void assertError(HttpResponse<String> response, int status, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
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

    private List<String> fieldNames(JsonNode node) {
        List<String> names = new ArrayList<>();
        node.propertyNames().forEach(names::add);
        return names;
    }

    private int waitForBlockedBy(int blockerPid) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(6);
        while (System.nanoTime() < deadline) {
            List<Integer> blocked = blockedBy(blockerPid);
            if (!blocked.isEmpty()) return blocked.getFirst();
            Thread.sleep(40);
        }
        throw new AssertionError("No PostgreSQL waiter reported pg_blocking_pids blocker=" + blockerPid
                + "; active=" + jdbc.queryForList("select pid,wait_event_type,wait_event,state from pg_stat_activity where datname=current_database()"));
    }

    private List<Integer> blockedBy(int blockerPid) {
        return jdbc.query("select pid from pg_stat_activity where pid<>pg_backend_pid() "
                        + "and state='active' and ? = any(pg_blocking_pids(pid)) order by pid",
                (rs, row) -> rs.getInt(1), blockerPid);
    }

    private List<Integer> blockingPids(int waiterPid) {
        return jdbc.query("select unnest(pg_blocking_pids(?))", (rs, row) -> rs.getInt(1), waiterPid);
    }

    private int backendPid(Connection connection) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("select pg_backend_pid()")) {
            try (var result = statement.executeQuery()) { result.next(); return result.getInt(1); }
        }
    }

    private void insertPayout(Connection connection, long bankId, long recipientId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "insert into payouts(bank_account_id,recipient_id) values (?,?)")) {
            statement.setLong(1, bankId); statement.setLong(2, recipientId); statement.executeUpdate();
        }
    }

    private static SQLException findSqlException(Throwable failure) {
        for (Throwable current = failure; current != null; current = current.getCause()) {
            if (current instanceof SQLException sql) return sql;
        }
        throw new AssertionError("Expected PostgreSQL SQLException in failure chain", failure);
    }

    private void await(CountDownLatch latch, String failureMessage) {
        try { if (!latch.await(8, TimeUnit.SECONDS)) throw new IllegalStateException(failureMessage); }
        catch (InterruptedException exception) { Thread.currentThread().interrupt(); throw new IllegalStateException(failureMessage); }
    }

    private URI uri(String path) { return URI.create("http://127.0.0.1:" + port + path); }
    private String suffix() { return UUID.randomUUID().toString().replace("-", ""); }
    private String jsonEscape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }
    private record Account(long id, String email, String phone) { }

    private static final class ThreadSafeLogCapture extends AppenderBase<ILoggingEvent> implements AutoCloseable {
        private final Logger root;
        private final List<ILoggingEvent> events = Collections.synchronizedList(new ArrayList<>());

        private ThreadSafeLogCapture() {
            LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
            setContext(context);
            setName("p08-log-capture-" + UUID.randomUUID());
            root = context.getLogger(Logger.ROOT_LOGGER_NAME);
            start();
            root.addAppender(this);
        }

        @Override protected void append(ILoggingEvent event) {
            event.prepareForDeferredProcessing();
            events.add(event);
        }

        private String rendered() {
            synchronized (events) {
                return events.stream().map(event -> event.getFormattedMessage() + " throwable="
                        + (event.getThrowableProxy() == null ? "none" : event.getThrowableProxy().getClassName()))
                        .collect(Collectors.joining("\n"));
            }
        }

        @Override public void close() {
            root.detachAppender(this);
            stop();
        }
    }
}
