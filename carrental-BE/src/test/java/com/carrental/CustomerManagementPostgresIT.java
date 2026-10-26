package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doAnswer;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.IThrowableProxy;
import ch.qos.logback.core.AppenderBase;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.repository.CustomerRepository;
import com.carrental.service.ActionLogService;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mockito;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import javax.sql.DataSource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** HTTP, transaction, race, and privacy checks against an isolated PostgreSQL 15 database. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1,classpath:db/migration/it-support",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false"
})
class CustomerManagementPostgresIT {

    private static final String PASSWORD = "P04 synthetic password only";
    private static final String ALLOWED_ORIGIN = "http://localhost:5173";
    private static final HttpClient CLIENT = HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(3)).build();

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
        properties.add("app.security.cors.allowed-origins", () -> ALLOWED_ORIGIN);
    }

    @LocalServerPort private int port;
    @Autowired private JsonMapper mapper;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private DataSource dataSource;
    @Autowired private PlatformTransactionManager transactionManager;
    @Autowired private PasswordEncoder passwordEncoder;
    @MockitoSpyBean private Clock clock;
    @MockitoSpyBean private CustomerRepository customers;
    @MockitoSpyBean private ActionLogService actionLogService;

    @BeforeEach
    void cleanIsolatedFixtureRows() {
        Mockito.reset(clock, customers, actionLogService);
        jdbc.update("delete from customers");
    }

    @Test
    void profilePatchUsesPrincipalAndHonorsOmittedNullAndTrimSemantics() throws Exception {
        Account owner = account("profile-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.VERIFIED,
                "Original Profile", "1993-02-01", "Retained address", true);
        Account other = account("profile-other", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Other Account", "1985-03-04", "Other address", false);
        String token = login(owner);

        HttpResponse<String> changed = patch("/api/customers/me", token,
                "{\"fullName\":\"  Updated Profile  \",\"dateOfBirth\":null}");
        assertSuccess(changed, 200);
        JsonNode profile = json(changed).path("data");
        assertThat(profile.path("id").asLong()).isEqualTo(owner.id());
        assertThat(profile.path("fullName").asText()).isEqualTo("Updated Profile");
        assertThat(profile.path("dateOfBirth").isNull()).isTrue();
        assertThat(profile.path("address").asText()).isEqualTo("Retained address");
        assertThat(changed.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        assertThat(profile.has("passwordHash")).isFalse();

        HttpResponse<String> cleared = patch("/api/customers/me", token, "{\"address\":\"   \",\"dateOfBirth\":null}");
        assertSuccess(cleared, 200);
        assertThat(json(cleared).path("data").path("address").isNull()).isTrue();
        HttpResponse<String> clearedNull = patch("/api/customers/me", token, "{\"address\":null}");
        assertSuccess(clearedNull, 200);
        assertThat(json(clearedNull).path("data").path("address").isNull()).isTrue();

        // A caller-supplied query ID is not an owner selector; /me remains bound to the authenticated row.
        HttpResponse<String> queryId = patch("/api/customers/me?customerId=" + other.id(), token,
                "{\"fullName\":\"Own Row Only\"}");
        assertSuccess(queryId, 200);
        assertThat(json(queryId).path("data").path("id").asLong()).isEqualTo(owner.id());
        assertThat(jdbc.queryForObject("select full_name from customers where id=?", String.class, owner.id()))
                .isEqualTo("Own Row Only");
        assertThat(jdbc.queryForObject("select full_name from customers where id=?", String.class, other.id()))
                .isEqualTo("Other Account");
        Map<String, Object> row = jdbc.queryForMap("select email, phone, password_hash, role, status, kyc_status, "
                + "email_verified, date_of_birth, address from customers where id=?", owner.id());
        assertThat(row).containsEntry("role", "CUSTOMER").containsEntry("status", "ACTIVE")
                .containsEntry("kyc_status", "VERIFIED").containsEntry("email_verified", true)
                .containsEntry("email", owner.email()).containsEntry("phone", owner.phone());
        assertThat((String) row.get("password_hash"))
                .matches("^\\$2[aby]\\$(0[4-9]|[12][0-9]|3[01])\\$[./A-Za-z0-9]{53}$");
    }

    @Test
    void profilePatchRejectsNullEmptyUnknownDuplicateMalformedAndCoercedJsonWithoutMutation() throws Exception {
        Account owner = account("profile-invalid", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Stable Name", "1991-01-02", "Stable Address", false);
        String token = login(owner);
        List<String> invalidBodies = new ArrayList<>(List.of(
                "{}", "null", "[]", "{\"fullName\":null}", "{\"fullName\":123}",
                "{\"fullName\":\"   \"}",
                "{\"address\":true}", "{\"dateOfBirth\":{}}", "{\"dateOfBirth\":\"not-a-date\"}",
                "{\"fullName\":\"First\",\"fullName\":\"Second\"}",
                "{\"id\":987654321,\"fullName\":\"SENTINEL_UNKNOWN\"}",
                "{\"passwordHash\":\"SENTINEL_HASH\"}", "{malformed-SENTINEL_BODY",
                "{\"fullNamePresent\":true}", "{\"fullNamePresent\":false}",
                "{\"fullNamePresent\":null}", "{\"fullNamePresent\":\"wrong-type\"}",
                "{\"fullNamePresent\":true,\"fullName\":\"Flag name true\"}",
                "{\"fullNamePresent\":false,\"fullName\":\"Flag name false\"}",
                "{\"fullNamePresent\":null,\"fullName\":\"Flag name null\"}",
                "{\"fullNamePresent\":{},\"fullName\":\"Flag name wrong type\"}",
                "{\"dateOfBirthPresent\":true}", "{\"dateOfBirthPresent\":false}",
                "{\"dateOfBirthPresent\":null}", "{\"dateOfBirthPresent\":1}",
                "{\"dateOfBirthPresent\":false,\"dateOfBirth\":null}",
                "{\"dateOfBirthPresent\":null,\"dateOfBirth\":\"2000-01-01\"}",
                "{\"dateOfBirthPresent\":[],\"dateOfBirth\":null}",
                "{\"addressPresent\":true}", "{\"addressPresent\":false}",
                "{\"addressPresent\":null}", "{\"addressPresent\":[]}",
                "{\"addressPresent\":true,\"address\":\"Flag address true\"}",
                "{\"addressPresent\":false,\"address\":\"Flag address false\"}",
                "{\"addressPresent\":null,\"address\":null}",
                "{\"addressPresent\":{},\"address\":\"Flag address wrong type\"}",
                "{\"fullNameWasProvided\":true}", "{\"hasAnyAllowedField\":false}",
                "{\"unknownSentinel\":true,\"fullName\":\"Leading unknown\"}",
                "{\"fullName\":\"Trailing unknown\",\"unknownSentinel\":true}",
                "{\"dateOfBirthPresent\":true,\"address\":\"Flag clear request\"}",
                "{\"fullName\":\"First\",\"fullNamePresent\":false,\"fullName\":\"Second\"}",
                "{\"fullNamePresent\":false,\"fullName\":\"First\",\"fullName\":\"Second\"}",
                "{\"fullName\":\"First\",\"unknownSentinel\":true,\"fullName\":\"Second\"}",
                "{\"fullName\":null,\"fullName\":\"Second\"}"));
        invalidBodies.add(mapper.writeValueAsString(Map.of("address", "A".repeat(301))));
        Map<String, Object> beforeRejectedBodies = jdbc.queryForMap("select * from customers where id=?", owner.id());
        List<String> forbiddenInternalKeys = List.of(
                "{\"fullNamePresent\":false}",
                "{\"dateOfBirthPresent\":true}",
                "{\"addressPresent\":null}",
                "{\"dateOfBirthPresent\":true,\"address\":\"Flag clear request\"}",
                "{\"fullName\":\"First\",\"fullNamePresent\":false,\"fullName\":\"Second\"}",
                "{\"fullName\":\"First\",\"unknownSentinel\":true,\"fullName\":\"Second\"}");
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            for (String body : invalidBodies) {
                HttpResponse<String> response = patch("/api/customers/me", token, body);
                assertThat(response.statusCode()).as("request body must be rejected").isEqualTo(400);
                assertTrace(response, json(response));
                assertThat(response.body()).doesNotContain("SENTINEL_UNKNOWN", "SENTINEL_HASH", "malformed-SENTINEL_BODY",
                        "rejectedValue", "passwordHash", "Flag", "fullNamePresent", "dateOfBirthPresent", "addressPresent");
                assertThat(jdbc.queryForMap("select * from customers where id=?", owner.id())).isEqualTo(beforeRejectedBodies);
            }
            for (String body : forbiddenInternalKeys) {
                HttpResponse<String> response = patch("/api/customers/me", token, body);
                assertError(response, 400, "INVALID_REQUEST");
                assertThat(response.body()).doesNotContain("Flag clear request", "unknownSentinel", "fullNamePresent");
                assertThat(jdbc.queryForMap("select * from customers where id=?", owner.id())).isEqualTo(beforeRejectedBodies);
            }
            assertThat(logs.rendered()).doesNotContain("SENTINEL_UNKNOWN", "SENTINEL_HASH", "Flag",
                    "fullNamePresent", "dateOfBirthPresent", "addressPresent", "unknownSentinel");
        }

        String tooLongName = "N".repeat(151);
        HttpResponse<String> longName = patch("/api/customers/me", token,
                mapper.writeValueAsString(Map.of("fullName", tooLongName)));
        assertError(longName, 400, "VALIDATION_ERROR");
        assertThat(longName.body()).doesNotContain(tooLongName);

        assertThat(jdbc.queryForMap("select full_name, date_of_birth, address, status, role from customers where id=?", owner.id()))
                .containsEntry("full_name", "Stable Name").containsEntry("date_of_birth", java.sql.Date.valueOf("1991-01-02"))
                .containsEntry("address", "Stable Address").containsEntry("status", "ACTIVE").containsEntry("role", "CUSTOMER");
        assertThat(jdbc.queryForMap("select * from customers where id=?", owner.id())).isEqualTo(beforeRejectedBodies);
    }

    @Test
    void profilePatchUsesVietnamClockAndDatabaseAuditOnlyForRealChanges() throws Exception {
        Account owner = account("profile-audit", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Audit Name", "2000-01-01", "Audit Address", false);
        String token = login(owner);
        Map<String, Object> original = jdbc.queryForMap("select created_at, updated_at from customers where id=?", owner.id());

        HttpResponse<String> noOp = patch("/api/customers/me", token,
                "{\"fullName\":\" Audit Name \",\"address\":\"Audit Address\"}");
        assertSuccess(noOp, 200);
        Map<String, Object> afterNoOp = jdbc.queryForMap("select created_at, updated_at from customers where id=?", owner.id());
        assertThat(afterNoOp).containsEntry("created_at", original.get("created_at"))
                .containsEntry("updated_at", original.get("updated_at"));

        HttpResponse<String> changed = patch("/api/customers/me", token, "{\"fullName\":\"Changed Audit Name\"}");
        assertSuccess(changed, 200);
        Map<String, Object> afterChange = jdbc.queryForMap("select created_at, updated_at from customers where id=?", owner.id());
        assertThat(afterChange.get("created_at")).isEqualTo(original.get("created_at"));
        assertThat(afterChange.get("updated_at")).isNotEqualTo(original.get("updated_at"));
        assertThat(json(changed).path("data").path("updatedAt").asText())
                .isEqualTo(afterChange.get("updated_at").toString().replace(" ", "T"));

        // 2026-10-12 17:00Z is midnight at the configured Vietnam clock on 2026-10-13.
        try {
            Mockito.doReturn(Instant.parse("2026-10-12T17:00:00Z")).when(clock).instant();
            String fixedClockToken = login(owner);
            assertSuccess(patch("/api/customers/me", fixedClockToken, "{\"dateOfBirth\":\"2026-10-13\"}"), 200);
            HttpResponse<String> futureDate = patch("/api/customers/me", fixedClockToken, "{\"dateOfBirth\":\"2026-10-14\"}");
            assertError(futureDate, 400, "VALIDATION_ERROR");
            assertThat(futureDate.body()).contains("dateOfBirth");
        } finally {
            Mockito.reset(clock);
        }
    }

    @Test
    void adminListFiltersCountsPagesEscapesLikeAndReturnsAllowlistedDtos() throws Exception {
        Account admin = account("list-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "P04 Admin", null, null, false);
        String token = login(admin);
        HttpResponse<String> adminProfile = patch("/api/customers/me", token, "{\"fullName\":\"Admin Self Profile\"}");
        assertSuccess(adminProfile, 200);
        assertThat(json(adminProfile).path("data").path("id").asLong()).isEqualTo(admin.id());
        String marker = "P04LIST" + suffix();
        Account nameMatch = account("list-name-" + marker, Role.CUSTOMER, CustomerStatus.LOCKED, KycStatus.REJECTED,
                "Unique " + marker + "% literal", "1994-05-06", "Hidden address", false);
        Account emailMatch = account("list-email-" + marker, Role.CUSTOMER, CustomerStatus.LOCKED, KycStatus.REJECTED,
                "Second unrelated name", null, null, false);
        Account filteredOut = account("list-out-" + marker, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.REJECTED,
                "Unique " + marker + " other", null, null, false);

        HttpResponse<String> firstPage = get("/api/customers?status=LOCKED&kycStatus=REJECTED&keyword="
                + encode(marker.toLowerCase(java.util.Locale.ROOT)) + "&page=0&size=1&sort=fullName,asc", token);
        assertSuccess(firstPage, 200);
        JsonNode page0 = json(firstPage).path("data");
        assertThat(page0.path("content").size()).isEqualTo(1);
        assertThat(page0.path("totalElements").asLong()).isEqualTo(2);
        assertThat(page0.path("page").asInt()).isZero();
        assertThat(page0.path("size").asInt()).isEqualTo(1);
        assertThat(firstPage.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        JsonNode summary = page0.path("content").get(0);
        assertThat(fieldNames(summary)).containsExactlyInAnyOrder("id", "fullName", "email", "phone", "role", "status",
                "kycStatus", "emailVerified", "createdAt", "updatedAt");
        assertThat(summary.has("passwordHash")).isFalse();
        assertThat(summary.has("address")).isFalse();
        assertThat(summary.has("dateOfBirth")).isFalse();
        assertThat(summary.has("avatarUrl")).isFalse();
        assertThat(summary.has("bankAccounts")).isFalse();

        HttpResponse<String> secondPage = get("/api/customers?status=LOCKED&kycStatus=REJECTED&keyword="
                + encode(marker.toLowerCase(java.util.Locale.ROOT)) + "&page=1&size=1&sort=fullName,asc", token);
        assertSuccess(secondPage, 200);
        assertThat(json(secondPage).path("data").path("totalElements").asLong()).isEqualTo(2);
        assertThat(json(secondPage).path("data").path("content").size()).isEqualTo(1);

        HttpResponse<String> beyond = get("/api/customers?status=LOCKED&kycStatus=REJECTED&keyword="
                + encode(marker.toLowerCase(java.util.Locale.ROOT)) + "&page=99&size=1&sort=fullName,asc", token);
        assertSuccess(beyond, 200);
        assertThat(json(beyond).path("data").path("content")).isEmpty();
        assertThat(json(beyond).path("data").path("totalElements").asLong()).isEqualTo(2);

        // A percent sign in user input is literal and does not widen the database LIKE pattern.
        HttpResponse<String> literalPercent = get("/api/customers?keyword=" + encode(marker + "%")
                + "&page=0&size=20&sort=id,asc", token);
        assertSuccess(literalPercent, 200);
        assertThat(json(literalPercent).path("data").path("content")).hasSize(1);
        assertThat(json(literalPercent).path("data").path("content").get(0).path("id").asLong()).isEqualTo(nameMatch.id());

        HttpResponse<String> emailSearch = get("/api/customers?keyword=" + encode(emailMatch.email().split("@")[0])
                + "&page=0&size=20&sort=createdAt,DESC", token);
        assertSuccess(emailSearch, 200);
        assertThat(json(emailSearch).path("data").path("content").toString()).contains(emailMatch.email());
        assertThat(json(emailSearch).path("data").path("content").toString()).doesNotContain(filteredOut.email());

        HttpResponse<String> detail = get("/api/customers/" + nameMatch.id(), token);
        assertSuccess(detail, 200);
        JsonNode detailDto = json(detail).path("data");
        assertThat(fieldNames(detailDto)).containsExactlyInAnyOrder("id", "fullName", "email", "phone", "role", "status",
                "kycStatus", "emailVerified", "createdAt", "updatedAt", "dateOfBirth", "address");
        assertThat(detailDto.has("passwordHash")).isFalse();
        assertThat(detailDto.has("avatarUrl")).isFalse();
        assertThat(detailDto.has("userDocuments")).isFalse();
        assertThat(detailDto.has("bankAccounts")).isFalse();
        assertThat(detail.headers().firstValue("Cache-Control").orElse("")).contains("no-store");

        Account tieOne = account("tie-one-" + marker, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Same Sort Name " + marker, null, null, false);
        Account tieTwo = account("tie-two-" + marker, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Same Sort Name " + marker, null, null, false);
        HttpResponse<String> stableTie = get("/api/customers?keyword=" + encode(marker)
                + "&page=0&size=20&sort=fullName,asc", token);
        assertSuccess(stableTie, 200);
        List<Long> tieIds = new ArrayList<>();
        for (JsonNode item : json(stableTie).path("data").path("content")) {
            if (item.path("fullName").asText().equals("Same Sort Name " + marker)) tieIds.add(item.path("id").asLong());
        }
        assertThat(tieIds).containsExactly(tieOne.id(), tieTwo.id());
    }

    @Test
    void adminListRejectsInvalidRepeatedHugeAndUnlistedQueryParameters() throws Exception {
        String token = login(account("list-invalid-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "List Admin", null, null, false));
        List<String> paths = List.of(
                "/api/customers?status=UNKNOWN", "/api/customers?kycStatus=UNKNOWN",
                "/api/customers?page=-1", "/api/customers?page=2147483648", "/api/customers?page=2147483647&size=100",
                "/api/customers?size=0", "/api/customers?size=101", "/api/customers?sort=role,asc",
                "/api/customers?sort=createdAt,desc,extra", "/api/customers?sort=createdAt,sideways",
                "/api/customers?sort=id,asc&sort=id,desc", "/api/customers?status=ACTIVE&status=LOCKED",
                "/api/customers?unexpected=1", "/api/customers?keyword=" + "x".repeat(151));
        for (String path : paths) {
            HttpResponse<String> response = get(path, token);
            assertError(response, 400, "INVALID_REQUEST");
            assertThat(response.body()).doesNotContain("role,asc", "sideways", "unexpected", "xxxx");
        }
    }

    @Test
    void customerAndLockedAdminCannotUseAdminEndpointsAndAuthorizationPrecedesListQuery() throws Exception {
        Account customer = account("access-customer", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Access Customer", null, null, false);
        Account lockedAdmin = account("access-locked-admin", Role.ADMIN, CustomerStatus.LOCKED, KycStatus.NONE,
                "Locked Admin", null, null, false);
        String customerToken = login(customer);

        assertError(get("/api/customers", null), 401, "AUTHENTICATION_FAILED");
        Mockito.clearInvocations(customers);
        assertError(get("/api/customers?page=0&size=10", customerToken), 403, "ACCESS_DENIED");
        assertError(get("/api/customers?status=NOT_A_STATUS", customerToken), 403, "ACCESS_DENIED");
        Mockito.verify(customers, Mockito.never()).findAll(Mockito.any(org.springframework.data.jpa.domain.Specification.class),
                Mockito.any(org.springframework.data.domain.Pageable.class));
        assertError(get("/api/customers/9223372036854770000", customerToken), 403, "ACCESS_DENIED");
        assertError(patch("/api/customers/9223372036854770000/status", customerToken,
                "{\"status\":\"LOCKED\",\"reason\":\"valid reason\"}"), 403, "ACCESS_DENIED");
        assertError(post("/api/auth/login", "{\"email\":\"" + lockedAdmin.email()
                + "\",\"password\":\"" + PASSWORD + "\"}"), 401, "AUTHENTICATION_FAILED");
        String adminToken = login(account("missing-detail-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Missing Detail Admin", null, null, false));
        assertError(get("/api/customers/999999999999", adminToken), 404, "RESOURCE_NOT_FOUND");
        assertError(get("/api/customers/0", adminToken), 400, "INVALID_REQUEST");
    }

    @Test
    void statusCommandValidatesReasonAndEnumRejectsMassAssignmentAndDuplicateProperties() throws Exception {
        Account admin = account("status-invalid-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Status Admin", null, null, false);
        Account customer = account("status-invalid-customer", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.PENDING,
                "Status Customer", null, null, false);
        String token = login(admin);
        List<String> invalidBodies = List.of(
                "{}", "null", "[]", "{\"status\":\"LOCKED\"}",
                "{\"status\":\"OTHER\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"status\":2,\"reason\":\"SENTINEL_REASON\"}",
                "{\"status\":\"LOCKED\",\"reason\":null}",
                "{\"status\":\"LOCKED\",\"reason\":\"   \"}",
                "{\"status\":\"ACTIVE\",\"reason\":\"   \"}",
                "{\"status\":\"LOCKED\",\"reason\":\"reason\",\"role\":\"ADMIN\"}",
                "{\"status\":\"ACTIVE\",\"status\":\"LOCKED\",\"reason\":\"duplicate\"}",
                "{\"statusPresent\":true,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"statusPresent\":false,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"statusPresent\":null,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"statusPresent\":\"wrong-type\",\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"statusWasProvided\":true,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"reasonPresent\":true,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"reasonPresent\":false,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"reasonPresent\":null,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"reasonPresent\":1,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"reasonWasProvided\":true,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"unknownSentinel\":true,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                "{\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\",\"unknownSentinel\":true}",
                "{\"status\":\"ACTIVE\",\"statusPresent\":false,\"status\":\"LOCKED\",\"reason\":\"Synthetic review\"}",
                "{\"status\":\"LOCKED\",\"reason\":\"first\",\"reasonPresent\":false,\"reason\":\"SENTINEL_DUPLICATE\"}",
                "{\"status\":\"LOCKED\",\"unknownSentinel\":true,\"status\":\"ACTIVE\",\"reason\":\"SENTINEL_REASON\"}");
        Map<String, Object> beforeRejectedCommands = jdbc.queryForMap("select * from customers where id=?", customer.id());
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            for (String body : invalidBodies) {
                HttpResponse<String> response = patch("/api/customers/" + customer.id() + "/status", token, body);
                assertThat(response.statusCode()).isEqualTo(400);
                assertTrace(response, json(response));
                assertThat(response.body()).doesNotContain("SENTINEL_REASON", "SENTINEL_DUPLICATE", "duplicate",
                        "passwordHash", "statusPresent", "reasonPresent");
                assertThat(jdbc.queryForMap("select * from customers where id=?", customer.id())).isEqualTo(beforeRejectedCommands);
            }
            List<String> forbiddenInternalKeys = List.of(
                    "{\"statusPresent\":false,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                    "{\"reasonPresent\":null,\"status\":\"LOCKED\",\"reason\":\"SENTINEL_REASON\"}",
                    "{\"status\":\"ACTIVE\",\"statusPresent\":false,\"status\":\"LOCKED\",\"reason\":\"Synthetic review\"}",
                    "{\"status\":\"LOCKED\",\"reason\":\"first\",\"reasonPresent\":false,\"reason\":\"SENTINEL_DUPLICATE\"}");
            for (String body : forbiddenInternalKeys) {
                HttpResponse<String> response = patch("/api/customers/" + customer.id() + "/status", token, body);
                assertError(response, 400, "INVALID_REQUEST");
                assertThat(response.body()).doesNotContain("SENTINEL_REASON", "SENTINEL_DUPLICATE", "statusPresent", "reasonPresent");
                assertThat(jdbc.queryForMap("select * from customers where id=?", customer.id())).isEqualTo(beforeRejectedCommands);
            }
            assertThat(logs.rendered()).doesNotContain("Customer status changed", "SENTINEL_REASON", "SENTINEL_DUPLICATE",
                    "statusPresent", "reasonPresent", "unknownSentinel");
        }
        String overLimit = "R".repeat(501);
        HttpResponse<String> tooLong = patch("/api/customers/" + customer.id() + "/status", token,
                mapper.writeValueAsString(Map.of("status", "LOCKED", "reason", overLimit)));
        assertError(tooLong, 400, "VALIDATION_ERROR");
        assertThat(tooLong.body()).doesNotContain(overLimit);
        assertThat(jdbc.queryForMap("select * from customers where id=?", customer.id())).isEqualTo(beforeRejectedCommands);
    }

    @Test
    void statusLifecycleAppliesToNextRequestAndUnlockAllowsUnexpiredTokenAgain() throws Exception {
        Account admin = account("status-life-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Lifecycle Admin", null, null, false);
        Account customer = account("status-life-customer", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.VERIFIED,
                "Lifecycle Customer", "1992-06-07", "Lifecycle Address", true);
        String adminToken = login(admin);
        String oldCustomerToken = login(customer);
        String reasonMarker = "SENTINEL_REASON_LIFECYCLE";

        HttpResponse<String> locked = patch("/api/customers/" + customer.id() + "/status", adminToken,
                mapper.writeValueAsString(Map.of("status", "LOCKED", "reason", reasonMarker)));
        assertSuccess(locked, 200);
        assertThat(json(locked).path("data").path("status").asText()).isEqualTo("LOCKED");
        assertThat(locked.body()).doesNotContain(reasonMarker, "passwordHash", "userDocuments", "bankAccounts");
        assertError(get("/api/customers/me", oldCustomerToken), 401, "INVALID_TOKEN");
        assertError(post("/api/auth/login", "{\"email\":\"" + customer.email()
                + "\",\"password\":\"" + PASSWORD + "\"}"), 401, "AUTHENTICATION_FAILED");

        HttpResponse<String> unlocked = patch("/api/customers/" + customer.id() + "/status", adminToken,
                "{\"status\":\"ACTIVE\",\"reason\":\"restore access\"}");
        assertSuccess(unlocked, 200);
        assertThat(json(unlocked).path("data").path("status").asText()).isEqualTo("ACTIVE");
        assertSuccess(get("/api/customers/me", oldCustomerToken), 200);
        Map<String, Object> unchanged = jdbc.queryForMap("select role, kyc_status, full_name, date_of_birth, address, "
                + "email_verified from customers where id=?", customer.id());
        assertThat(unchanged).containsEntry("role", "CUSTOMER").containsEntry("kyc_status", "VERIFIED")
                .containsEntry("full_name", "Lifecycle Customer").containsEntry("address", "Lifecycle Address")
                .containsEntry("email_verified", true);
    }

    @Test
    void selfLockIsRejectedWithPrecedenceAndNoOpDoesNotTouchAuditOrLogChange() throws Exception {
        Account admin = account("self-lock-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Only Active Admin", null, null, false);
        String token = login(admin);
        Object before = jdbc.queryForObject("select updated_at from customers where id=?", Object.class, admin.id());
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            HttpResponse<String> selfLock = patch("/api/customers/" + admin.id() + "/status", token,
                    "{\"status\":\"LOCKED\",\"reason\":\"self lock check\"}");
            assertError(selfLock, 409, "ADMIN_SELF_LOCK_FORBIDDEN");
            HttpResponse<String> noOp = patch("/api/customers/" + admin.id() + "/status", token,
                    "{\"status\":\"ACTIVE\",\"reason\":\"no-op reason\"}");
            assertSuccess(noOp, 200);
            assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, admin.id())).isEqualTo("ACTIVE");
            assertThat(jdbc.queryForObject("select count(*) from customers where role='ADMIN' and status='ACTIVE'", Integer.class))
                    .isGreaterThanOrEqualTo(1);
            assertThat(jdbc.queryForObject("select updated_at from customers where id=?", Object.class, admin.id())).isEqualTo(before);
            assertThat(logs.rendered()).doesNotContain("Customer status changed", "self lock check", "no-op reason");
        }
    }

    @Test
    void twoAdminRequestsRacingToLockEachOtherLeaveOneActiveAndRecheckTheWaitingActor() throws Exception {
        Account first = account("race-admin-a", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Race Admin A", null, null, false);
        Account second = account("race-admin-b", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Race Admin B", null, null, false);
        String firstToken = login(first);
        String secondToken = login(second);
        CountDownLatch arrived = new CountDownLatch(2);
        CountDownLatch release = new CountDownLatch(1);
        doAnswer(invocation -> {
            arrived.countDown();
            if (!release.await(8, TimeUnit.SECONDS)) throw new IllegalStateException("status race barrier timed out");
            return SpySupport.callRealMethod(invocation);
        }).when(customers).findWithLockByRoleOrderByIdAsc(Role.ADMIN);
        try (var executor = Executors.newFixedThreadPool(2)) {
            CompletableFuture<HttpResponse<String>> a = CompletableFuture.supplyAsync(() -> awaitPatch(
                    "/api/customers/" + second.id() + "/status", firstToken, "{\"status\":\"LOCKED\",\"reason\":\"race A\"}"), executor);
            CompletableFuture<HttpResponse<String>> b = CompletableFuture.supplyAsync(() -> awaitPatch(
                    "/api/customers/" + first.id() + "/status", secondToken, "{\"status\":\"LOCKED\",\"reason\":\"race B\"}"), executor);
            // Both calls reach the secured service's serialization point after bearer authentication has succeeded.
            assertThat(arrived.await(8, TimeUnit.SECONDS)).isTrue();
            release.countDown();
            List<HttpResponse<String>> responses = List.of(a.get(12, TimeUnit.SECONDS), b.get(12, TimeUnit.SECONDS));
            assertThat(responses.stream().filter(response -> response.statusCode() == 200).count()).isEqualTo(1);
            assertThat(responses.stream().filter(response -> response.statusCode() == 401).count()).isEqualTo(1);
            for (HttpResponse<String> response : responses) assertTrace(response, json(response));
            assertThat(jdbc.queryForObject("select count(*) from customers where role='ADMIN' and status='ACTIVE'", Integer.class))
                    .isEqualTo(1);
            Account activeSurvivor = jdbc.queryForObject("select id,full_name,email,phone from customers "
                    + "where role='ADMIN' and status='ACTIVE' limit 1", (rs, row) ->
                    new Account(rs.getLong("id"), rs.getString("full_name"), rs.getString("email"), rs.getString("phone")));
            Account lockedPeer = activeSurvivor.id() == first.id() ? second : first;
            HttpResponse<String> unlockedPeer = patch("/api/customers/" + lockedPeer.id() + "/status",
                    activeSurvivor.id() == first.id() ? firstToken : secondToken,
                    "{\"status\":\"ACTIVE\",\"reason\":\"restore another admin\"}");
            assertSuccess(unlockedPeer, 200);
            assertThat(jdbc.queryForObject("select count(*) from customers where role='ADMIN' and status='ACTIVE'", Integer.class))
                    .isEqualTo(2);
        } finally {
            release.countDown();
        }
    }

    @Test
    void concurrentCommandsForOneTargetProduceOneMutationAndOneNoOp() throws Exception {
        Account first = account("same-target-admin-a", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Same Target Admin A", null, null, false);
        Account second = account("same-target-admin-b", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Same Target Admin B", null, null, false);
        Account target = account("same-target-user", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Same Target User", null, null, false);
        String firstToken = login(first);
        String secondToken = login(second);
        CountDownLatch arrived = new CountDownLatch(2);
        CountDownLatch release = new CountDownLatch(1);
        doAnswer(invocation -> {
            arrived.countDown();
            if (!release.await(8, TimeUnit.SECONDS)) throw new IllegalStateException("status race barrier timed out");
            return SpySupport.callRealMethod(invocation);
        }).when(customers).findWithLockById(Mockito.anyLong());
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture(); var executor = Executors.newFixedThreadPool(2)) {
            CompletableFuture<HttpResponse<String>> a = CompletableFuture.supplyAsync(() -> awaitPatch(
                    "/api/customers/" + target.id() + "/status", firstToken,
                    "{\"status\":\"LOCKED\",\"reason\":\"first request\"}"), executor);
            CompletableFuture<HttpResponse<String>> b = CompletableFuture.supplyAsync(() -> awaitPatch(
                    "/api/customers/" + target.id() + "/status", secondToken,
                    "{\"status\":\"LOCKED\",\"reason\":\"second request\"}"), executor);
            assertThat(arrived.await(8, TimeUnit.SECONDS)).isTrue();
            release.countDown();
            assertThat(a.get(12, TimeUnit.SECONDS).statusCode()).isEqualTo(200);
            assertThat(b.get(12, TimeUnit.SECONDS).statusCode()).isEqualTo(200);
            assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, target.id())).isEqualTo("LOCKED");
            assertThat(logs.rendered().lines().filter(line -> line.contains("Customer status changed action=customer-status")
                    && line.contains("targetId=" + target.id())).count()).isEqualTo(1);
        } finally {
            release.countDown();
        }
    }

    @Test
    void profileAndStatusRaceNeverResurrectsLockedAccountOrLosesCommittedProfile() throws Exception {
        Account admin = account("profile-race-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Profile Race Admin", null, null, false);
        Account customer = account("profile-race-target", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Before Race", null, "Before Address", false);
        String adminToken = login(admin);
        String customerToken = login(customer);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            CompletableFuture<HttpResponse<String>> profile = CompletableFuture.supplyAsync(() -> awaitConcurrentPatch(
                    ready, start, "/api/customers/me", customerToken, "{\"fullName\":\"Committed Profile\"}"), executor);
            CompletableFuture<HttpResponse<String>> status = CompletableFuture.supplyAsync(() -> awaitConcurrentPatch(
                    ready, start, "/api/customers/" + customer.id() + "/status", adminToken,
                    "{\"status\":\"LOCKED\",\"reason\":\"race lock\"}"), executor);
            assertThat(ready.await(8, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            HttpResponse<String> profileResponse = profile.get(12, TimeUnit.SECONDS);
            HttpResponse<String> statusResponse = status.get(12, TimeUnit.SECONDS);
            assertThat(statusResponse.statusCode()).isEqualTo(200);
            assertThat(profileResponse.statusCode()).isIn(200, 401);
            assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, customer.id())).isEqualTo("LOCKED");
            String persistedName = jdbc.queryForObject("select full_name from customers where id=?", String.class, customer.id());
            assertThat(persistedName).isEqualTo(profileResponse.statusCode() == 200 ? "Committed Profile" : "Before Race");
        } finally {
            start.countDown();
        }
    }

    @Test
    void rollbackAfterFlushLeavesStatusAuditAndAfterCommitLogUntouched() throws Exception {
        Account admin = account("rollback-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Rollback Admin", null, null, false);
        Account target = account("rollback-target", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "Rollback Target", null, null, false);
        String token = login(admin);
        Object before = jdbc.queryForObject("select updated_at from customers where id=?", Object.class, target.id());
        doAnswer(invocation -> {
            SpySupport.callRealMethod(invocation);
            throw new IllegalStateException("SENTINEL_FAILURE_AFTER_FLUSH");
        }).when(actionLogService).customerStatusChanged(Mockito.anyLong(), Mockito.anyLong(), Mockito.any(), Mockito.any(), Mockito.anyBoolean());
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            HttpResponse<String> response = patch("/api/customers/" + target.id() + "/status", token,
                    "{\"status\":\"LOCKED\",\"reason\":\"rollback reason\"}");
            assertError(response, 500, "INTERNAL_ERROR");
            assertThat(response.body()).doesNotContain("SENTINEL_FAILURE_AFTER_FLUSH", "rollback reason");
            assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, target.id())).isEqualTo("ACTIVE");
            assertThat(jdbc.queryForObject("select updated_at from customers where id=?", Object.class, target.id())).isEqualTo(before);
            assertThat(logs.rendered()).doesNotContain("Customer status changed", "rollback reason", "SENTINEL_FAILURE_AFTER_FLUSH");
        } finally {
            Mockito.reset(customers);
            Mockito.reset(actionLogService);
        }
        // Row locks are released on rollback.
        assertSuccess(patch("/api/customers/" + target.id() + "/status", token,
                "{\"status\":\"LOCKED\",\"reason\":\"retry after rollback\"}"), 200);
    }

@Test
    void statusLogsContainSafeMetadataButNeverReasonOrCustomerIdentifiers() throws Exception {
        String marker = suffix();
        Account admin = account("safe-log-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "SENTINEL_NAME_" + marker, null, null, false);
        Account target = account("safe-log-target", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "SENTINEL_TARGET_NAME_" + marker, null, "SENTINEL_ADDRESS_" + marker, false);
        String token = login(admin);
        String reason = "SENTINEL_REASON_" + marker;
        String keyword = "SENTINEL_KEYWORD_" + marker;
        String passwordHash = jdbc.queryForObject("select password_hash from customers where id=?", String.class, admin.id());
        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            Account searchAdmin = account("safe-log-search-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                    "Safe Log Search", null, null, false);
            HttpResponse<String> search = get("/api/customers?keyword=" + encode(keyword), login(searchAdmin));
            assertSuccess(search, 200);
            HttpResponse<String> changed = patch("/api/customers/" + target.id() + "/status", token,
                    mapper.writeValueAsString(Map.of("status", "LOCKED", "reason", reason)));
            assertSuccess(changed, 200);
            String rendered = logs.rendered();
            String traceId = changed.headers().firstValue("X-Request-ID").orElseThrow();
            assertThat(rendered).contains("Customer status changed action=customer-status traceId=" + traceId,
                    "actorId=" + admin.id(), "targetId=" + target.id(), "oldStatus=ACTIVE", "newStatus=LOCKED",
                    "reasonProvided=true", "traceId=" + traceId);
            assertThat(rendered).doesNotContain(reason, keyword, admin.email(), admin.phone(), target.email(), target.phone(),
                    admin.fullName(), target.fullName(), "SENTINEL_ADDRESS_" + marker, passwordHash, token);
        }
    }

    @Test
    void corsAllowsPatchPreflightAndKeepsAuthorizationSeparateFromOriginPolicy() throws Exception {
        HttpRequest preflight = HttpRequest.newBuilder(uri("/api/customers/me"))
                .header("Origin", ALLOWED_ORIGIN)
                .header("Access-Control-Request-Method", "PATCH")
                .header("Access-Control-Request-Headers", "authorization,content-type")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build();
        HttpResponse<String> allowed = CLIENT.send(preflight, HttpResponse.BodyHandlers.ofString());
        assertThat(allowed.statusCode()).isBetween(200, 299);
        assertThat(allowed.headers().firstValue("Access-Control-Allow-Methods").orElse("")).contains("PATCH");
        assertThat(allowed.headers().firstValue("Access-Control-Allow-Origin").orElse(null)).isEqualTo(ALLOWED_ORIGIN);
        assertThat(allowed.headers().firstValue("Access-Control-Allow-Credentials")).isEmpty();
        assertThat(allowed.headers().firstValue("X-Request-ID")).isPresent();

        Account customer = account("cors-customer", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE,
                "CORS Customer", null, null, false);
        String customerToken = login(customer);
        HttpResponse<String> profile = patch("/api/customers/me", customerToken,
                "{\"fullName\":\"Allowed origin customer\"}", Map.of("Origin", ALLOWED_ORIGIN));
        assertSuccess(profile, 200);
        assertThat(profile.headers().firstValue("Access-Control-Allow-Origin").orElse(null)).isEqualTo(ALLOWED_ORIGIN);

        Account adminTarget = account("cors-admin-target", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE,
                "CORS Admin Target", null, null, false);
        HttpResponse<String> forbidden = patch("/api/customers/" + adminTarget.id() + "/status", customerToken,
                "{\"status\":\"LOCKED\",\"reason\":\"cors role check\"}", Map.of("Origin", ALLOWED_ORIGIN));
        assertError(forbidden, 403, "ACCESS_DENIED");
        assertThat(forbidden.headers().firstValue("Access-Control-Allow-Origin").orElse(null)).isEqualTo(ALLOWED_ORIGIN);

        HttpRequest deniedRequest = HttpRequest.newBuilder(uri("/api/customers/me"))
                .header("Origin", "https://outside.example.test")
                .header("Access-Control-Request-Method", "PATCH")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build();
        HttpResponse<String> denied = CLIENT.send(deniedRequest, HttpResponse.BodyHandlers.ofString());
        assertThat(denied.statusCode()).isEqualTo(403);
        assertThat(denied.headers().firstValue("Access-Control-Allow-Origin")).isEmpty();
    }

    private Account account(String label, Role role, CustomerStatus status, KycStatus kyc,
            String name, String dob, String address, boolean emailVerified) {
        String random = suffix();
        String email = label.toLowerCase(java.util.Locale.ROOT) + "-" + random + "@example.test";
        String phone = "P" + random.substring(0, 19);
        Long id = jdbc.queryForObject("insert into customers(full_name,email,phone,password_hash,email_verified,kyc_status,role,status) "
                        + "values (?,?,?,?,?,?,?,?) returning id", Long.class, name, email, phone,
                passwordEncoder.encode(PASSWORD), emailVerified, kyc.name(), role.name(), status.name());
        jdbc.update("update customers set date_of_birth=?, address=? where id=?",
                dob == null ? null : java.sql.Date.valueOf(dob), address, id);
        return new Account(id, name, email, phone);
    }

    private String login(Account account) throws Exception {
        HttpResponse<String> response = post("/api/auth/login", mapper.writeValueAsString(
                Map.of("email", account.email(), "password", PASSWORD)));
        if (response.statusCode() != 200) throw new AssertionError("Synthetic account login failed: " + response.statusCode());
        return json(response).path("data").path("accessToken").asText();
    }

    private HttpResponse<String> get(String path, String token) throws Exception {
        return send("GET", path, token, null, Map.of());
    }

    private HttpResponse<String> post(String path, String body) throws Exception {
        return send("POST", path, null, body, Map.of());
    }

    private HttpResponse<String> patch(String path, String token, String body) throws Exception {
        return patch(path, token, body, Map.of());
    }

    private HttpResponse<String> patch(String path, String token, String body, Map<String, String> headers) throws Exception {
        return send("PATCH", path, token, body, headers);
    }

    private HttpResponse<String> send(String method, String path, String token, String body,
            Map<String, String> headers) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri(path)).timeout(Duration.ofSeconds(8))
                .header("Accept", "application/json");
        if (body != null) builder.header("Content-Type", "application/json");
        if (token != null) builder.header("Authorization", "Bearer " + token);
        headers.forEach(builder::header);
        HttpRequest.BodyPublisher publisher = body == null
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body);
        return CLIENT.send(builder.method(method, publisher).build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> awaitPatch(String path, String token, String body) {
        try {
            return patch(path, token, body);
        } catch (Exception exception) {
            throw new IllegalStateException("Concurrent customer command failed", exception);
        }
    }

    private HttpResponse<String> awaitConcurrentPatch(CountDownLatch ready, CountDownLatch start,
            String path, String token, String body) {
        try {
            ready.countDown();
            if (!start.await(8, TimeUnit.SECONDS)) throw new IllegalStateException("concurrent request start timed out");
            return patch(path, token, body);
        } catch (Exception exception) {
            throw new IllegalStateException("Concurrent profile/status request failed", exception);
        }
    }

    private JsonNode json(HttpResponse<String> response) throws Exception {
        return mapper.readTree(response.body());
    }

    private void assertSuccess(HttpResponse<String> response, int status) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode envelope = json(response);
        assertThat(envelope.path("success").asBoolean()).isTrue();
        assertThat(envelope.path("code").asText()).isEqualTo("OK");
        assertThat(envelope.path("errors")).isEmpty();
        assertTrace(response, envelope);
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

    private Set<String> fieldNames(JsonNode node) {
        return Set.copyOf(node.propertyNames());
    }

    private URI uri(String path) { return URI.create("http://127.0.0.1:" + port + path); }
    private String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
    private String suffix() { return UUID.randomUUID().toString().replace("-", ""); }

    private record Account(long id, String fullName, String email, String phone) { }

    private static final class ThreadSafeLogCapture extends AppenderBase<ILoggingEvent> implements AutoCloseable {
        private final Logger root;
        private final List<ILoggingEvent> events = Collections.synchronizedList(new ArrayList<>());

        private ThreadSafeLogCapture() {
            LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
            setContext(context);
            setName("p04-log-capture-" + UUID.randomUUID());
            root = context.getLogger(Logger.ROOT_LOGGER_NAME);
            start();
            root.addAppender(this);
        }

        @Override
        protected void append(ILoggingEvent event) {
            event.prepareForDeferredProcessing();
            events.add(event);
        }

        private String rendered() {
            synchronized (events) {
                return events.stream().map(CustomerManagementPostgresIT::renderLogEvent).collect(Collectors.joining("\n"));
            }
        }

        @Override
        public void close() {
            root.detachAppender(this);
            stop();
        }
    }

    private static String renderLogEvent(ILoggingEvent event) {
        StringBuilder rendered = new StringBuilder(event.getFormattedMessage()).append(' ').append(event.getMDCPropertyMap());
        appendThrowable(rendered, event.getThrowableProxy());
        return rendered.toString();
    }

    private static void appendThrowable(StringBuilder rendered, IThrowableProxy throwable) {
        if (throwable == null) return;
        rendered.append(' ').append(throwable.getClassName()).append(": ").append(throwable.getMessage());
        appendThrowable(rendered, throwable.getCause());
        for (IThrowableProxy suppressed : throwable.getSuppressed()) appendThrowable(rendered, suppressed);
    }
}
