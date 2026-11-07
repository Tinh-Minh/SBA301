package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verifyNoInteractions;

import com.carrental.entity.Driver;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.enums.DocumentType;
import com.carrental.repository.DriverRepository;
import com.carrental.service.DriverEligibilityService;
import com.carrental.storage.PrivateDocumentStorage;
import com.carrental.web.RequestTraceFilter;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.context.annotation.Primary;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Actual PostgreSQL/security/HTTP contract for P07 driver profiles and current eligibility. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1,classpath:db/migration/it-support",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false"
})
@Import(DriverProfilePostgresIT.FixedClockConfiguration.class)
class DriverProfilePostgresIT {

    private static final String PASSWORD = "P07 synthetic account password";
    private static final HttpClient CLIENT = HttpClient.newHttpClient();
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final MutableTestClock TEST_CLOCK = new MutableTestClock(Instant.parse("2026-10-14T03:00:00Z"), ZONE);
    private static final Path PRIVATE_ROOT = createPrivateRoot();
    @Container private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:15.13-alpine");

    @TestConfiguration(proxyBeanMethods = false)
    static class FixedClockConfiguration {
        @Bean @Primary java.time.Clock p07Clock() { return TEST_CLOCK; }
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("app.security.jwt.issuer", () -> TestJwtKeys.ISSUER);
        registry.add("app.security.jwt.audience", () -> TestJwtKeys.AUDIENCE);
        registry.add("app.security.jwt.access-token-ttl", () -> "PT5M");
        registry.add("app.security.jwt.clock-skew", () -> "PT30S");
        registry.add("app.document.storage.enabled", () -> "true");
        registry.add("app.document.storage.root", () -> PRIVATE_ROOT.toString());
    }

    @Autowired private JdbcTemplate jdbc;
    @Autowired private Environment environment;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JsonMapper mapper;
    @MockitoSpyBean private PrivateDocumentStorage storage;
    @MockitoSpyBean private DriverRepository drivers;
    @Autowired private DriverEligibilityService eligibility;

    @AfterEach
    void resetHooksAndClock() {
        TEST_CLOCK.set(Instant.parse("2026-10-14T03:00:00Z"));
        reset(drivers, storage);
    }

    @AfterAll
    static void cleanupPrivateRoot() throws Exception {
        if (!Files.exists(PRIVATE_ROOT)) return;
        Path temp = Path.of(System.getProperty("java.io.tmpdir")).toRealPath();
        Path root = PRIVATE_ROOT.toRealPath();
        if (!root.startsWith(temp) || root.equals(temp) || !root.getFileName().toString().startsWith("sba301-p07-private-")) {
            throw new IllegalStateException("Refusing to remove an unexpected P07 storage root");
        }
        try (var entries = Files.walk(root)) {
            for (Path entry : entries.sorted(java.util.Comparator.reverseOrder()).toList()) Files.deleteIfExists(entry);
        }
    }

    @Test
    void createIsOwnOnlyPendingAndCurrentEligibilityIsDifferentFromStoredStatus() throws Exception {
        Account owner = account("create-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        var created = send("POST", "/api/drivers", token, null);
        assertSuccess(created, 201);
        JsonNode data = mapper.readTree(created.body()).path("data");
        long driverId = data.path("id").asLong();
        assertThat(data.path("customerId").asLong()).isEqualTo(owner.id());
        assertThat(data.path("status").asText()).isEqualTo("PENDING");
        assertThat(data.path("createdAt").isTextual()).isTrue();
        assertThat(data.path("updatedAt").isTextual()).isTrue();
        assertThat(fieldNames(data)).containsExactlyInAnyOrder("id", "customerId", "status", "createdAt", "updatedAt");
        assertThat(created.headers().firstValue("Location").orElseThrow()).endsWith("/api/drivers/" + driverId);
        assertThat(created.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        assertTrace(created);

        var me = send("GET", "/api/drivers/me", token, null);
        assertSuccess(me, 200);
        assertThat(mapper.readTree(me.body()).path("data").path("id").asLong()).isEqualTo(driverId);
        var eligibility = send("GET", "/api/drivers/me/eligibility", token, null);
        assertSuccess(eligibility, 200);
        JsonNode current = mapper.readTree(eligibility.body()).path("data");
        assertThat(current.path("driverStatus").asText()).isEqualTo("PENDING");
        assertThat(current.path("eligibleNow").asBoolean()).isFalse();
        assertThat(current.path("ineligibilityReasonCode").asText()).isEqualTo("DRIVER_NOT_ACTIVE");
        assertThat(current.path("customerId").asLong()).isEqualTo(owner.id());
        assertThat(current.path("driverId").asLong()).isEqualTo(driverId);
        assertThat(eligibility.body()).doesNotContain(owner.email(), "passwordHash", "docNumber", "licenseClass", PRIVATE_ROOT.toString());

        var duplicate = send("POST", "/api/drivers", token, null);
        assertError(duplicate, 409, "DRIVER_PROFILE_ALREADY_EXISTS");
        assertThat(driverCount(owner.id())).isEqualTo(1);
        assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id())).isEqualTo("NONE");
        System.out.println("P07_CREATE status=201 stored=PENDING currentEligible=false duplicate=409 bodyless=true");
    }

    @Test
    void createRejectsEveryNonEmptyBodyQueryAndLockedPrincipalWithoutWriting() throws Exception {
        var unauthenticated = send("POST", "/api/drivers", null, null);
        assertError(unauthenticated, 401, "AUTHENTICATION_FAILED");

        List<RawBody> bodies = List.of(
                new RawBody("json-object", "{}", "application/json", false),
                new RawBody("whitespace", " \r\n", "application/json", false),
                new RawBody("form", "status=PENDING", "application/x-www-form-urlencoded", false),
                new RawBody("multipart", "--p07\r\nContent-Disposition: form-data; name=\"status\"\r\n\r\nPENDING\r\n--p07--\r\n",
                        "multipart/form-data; boundary=p07", false),
                new RawBody("chunked", "{}", "application/json", true));
        for (RawBody body : bodies) {
            Account owner = account("body-" + body.label(), Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
            HttpResponse<String> response = sendRawCreate(login(owner), body);
            assertThat(response.statusCode()).as(body.label()).isEqualTo(400);
            assertError(response, 400, "INVALID_REQUEST");
            assertThat(driverCount(owner.id())).as(body.label()).isZero();
        }
        Account queryOwner = account("query-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        assertError(send("POST", "/api/drivers?customerId=" + queryOwner.id(), login(queryOwner), null),
                400, "INVALID_REQUEST");
        assertThat(driverCount(queryOwner.id())).isZero();

        Account owner = account("locked-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account admin = account("lock-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        String ownerToken = login(owner);
        var locked = send("PATCH", "/api/customers/" + owner.id() + "/status", login(admin),
                "{\"status\":\"LOCKED\",\"reason\":\"P07 synthetic lock\"}");
        assertSuccess(locked, 200);
        assertError(send("POST", "/api/drivers", ownerToken, null), 401, "INVALID_TOKEN");
        assertThat(driverCount(owner.id())).isZero();
        System.out.println("P07_CREATE_REJECTIONS unauthenticated=401 bodyVariants=5 query=400 lockedToken=401 rows=0");
    }

    @Test
    void adminListIsDatabasePagedAndScopedReadsHideForeignProfiles() throws Exception {
        Account admin = account("list-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account first = account("list-first", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account second = account("list-second", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account third = account("list-third", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        long firstId = seedDriver(first, DriverStatus.PENDING);
        long secondId = seedDriver(second, DriverStatus.ACTIVE);
        seedDriver(third, DriverStatus.PENDING);
        String adminToken = login(admin);
        String firstToken = login(first);

        var page = send("GET", "/api/drivers?status=PENDING&page=0&size=1&sort=customerId,asc", adminToken, null);
        assertError(page, 400, "INVALID_REQUEST"); // customerId is a filter, not a sort field.
        page = send("GET", "/api/drivers?status=PENDING&page=0&size=1&sort=id,asc", adminToken, null);
        assertSuccess(page, 200);
        JsonNode pageData = mapper.readTree(page.body()).path("data");
        assertThat(pageData.path("content").size()).isEqualTo(1);
        assertThat(pageData.path("totalElements").asLong()).isEqualTo(2);
        var filtered = send("GET", "/api/drivers?status=ACTIVE&customerId=" + second.id(), adminToken, null);
        assertSuccess(filtered, 200);
        JsonNode filteredData = mapper.readTree(filtered.body()).path("data");
        assertThat(filteredData.path("totalElements").asLong()).isEqualTo(1);
        assertThat(filteredData.path("content").get(0).path("id").asLong()).isEqualTo(secondId);
        assertThat(fieldNames(filteredData.path("content").get(0)))
                .containsExactlyInAnyOrder("id", "customerId", "status", "createdAt", "updatedAt");

        assertError(send("GET", "/api/drivers", firstToken, null), 403, "ACCESS_DENIED");
        assertError(send("PATCH", "/api/drivers/" + firstId + "/status", firstToken,
                "{\"status\":\"ACTIVE\"}"), 403, "ACCESS_DENIED");
        assertError(send("GET", "/api/drivers/" + secondId, firstToken, null), 404, "RESOURCE_NOT_FOUND");
        assertError(send("GET", "/api/drivers/999999999", firstToken, null), 404, "RESOURCE_NOT_FOUND");
        assertError(send("GET", "/api/drivers/0", adminToken, null), 400, "INVALID_REQUEST");
        assertError(send("GET", "/api/drivers?status=PENDING&status=ACTIVE", adminToken, null), 400, "INVALID_REQUEST");
        assertError(send("GET", "/api/drivers?eligibleNow=true", adminToken, null), 400, "INVALID_REQUEST");
        assertError(send("GET", "/api/drivers?page=0&size=101", adminToken, null), 400, "INVALID_REQUEST");
        System.out.println("P07_HTTP_SCOPE adminDbPageAndCount=true customerListStatus=403 foreignAndMissing=404");
    }

    @Test
    void currentEligibilityUsesCurrentKycAndClockWithoutAutosuspendingStoredActive() throws Exception {
        Account admin = account("clock-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("clock-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.VERIFIED);
        long driverId = seedDriver(owner, DriverStatus.ACTIVE);
        seedDocument(owner, "CITIZEN_ID", "APPROVED", LocalDate.of(2026, 10, 13), null);
        seedDocument(owner, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 10, 14), "B");
        String token = login(owner);

        var onBoundary = send("GET", "/api/drivers/" + driverId + "/eligibility", token, null);
        assertSuccess(onBoundary, 200);
        JsonNode eligible = mapper.readTree(onBoundary.body()).path("data");
        assertThat(eligible.path("evaluatedOn").asText()).isEqualTo("2026-10-14");
        assertThat(eligible.path("kycStatus").asText()).isEqualTo("NONE");
        assertThat(eligible.path("hasValidDriverLicense").asBoolean()).isTrue();
        assertThat(eligible.path("eligibleNow").asBoolean()).isFalse();
        assertThat(eligible.path("ineligibilityReasonCode").asText()).isEqualTo("IDENTITY_NOT_VERIFIED");
        assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id()))
                .isEqualTo("VERIFIED"); // snapshot is deliberately not overwritten by a read.

        seedDocument(owner, "PASSPORT", "APPROVED", null, null); // a second, non-expiring current identity proof.
        var multipleProofs = send("GET", "/api/drivers/me/eligibility", token, null);
        assertSuccess(multipleProofs, 200);
        JsonNode current = mapper.readTree(multipleProofs.body()).path("data");
        assertThat(current.path("kycStatus").asText()).isEqualTo("VERIFIED");
        assertThat(current.path("eligibleNow").asBoolean()).isTrue();

        TEST_CLOCK.set(Instant.parse("2026-10-15T03:00:00Z"));
        String tokenTomorrow = login(owner);
        var expiredAtNextDate = send("GET", "/api/drivers/me/eligibility", tokenTomorrow, null);
        assertSuccess(expiredAtNextDate, 200);
        JsonNode afterExpiry = mapper.readTree(expiredAtNextDate.body()).path("data");
        assertThat(afterExpiry.path("eligibleNow").asBoolean()).isFalse();
        assertThat(afterExpiry.path("ineligibilityReasonCode").asText()).isEqualTo("VALID_DRIVER_LICENSE_REQUIRED");
        assertThat(afterExpiry.path("driverStatus").asText()).isEqualTo("ACTIVE");
        assertThat(jdbc.queryForObject("select status from drivers where id=?", String.class, driverId)).isEqualTo("ACTIVE");
        assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id())).isEqualTo("VERIFIED");
        assertThat(jdbc.queryForObject("select count(*) from pg_trigger where tgrelid='drivers'::regclass and not tgisinternal", Integer.class))
                .isEqualTo(1);
        System.out.println("P07_CLOCK boundaryInclusive=true currentKycNotSnapshot=true expiryNoAutosuspend=true");
    }

    @Test
    void activationRequiresCurrentIdentityAndOneValidOwnedApprovedLicense() throws Exception {
        Account admin = account("eligibility-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        String adminToken = login(admin);
        List<LicenseCase> cases = new ArrayList<>();
        cases.add(new LicenseCase("missing-expiry", "DRIVER_LICENSE", "APPROVED", null, "B", false));
        cases.add(new LicenseCase("expired", "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 10, 13), "B", false));
        cases.add(new LicenseCase("pending", "DRIVER_LICENSE", "PENDING", LocalDate.of(2026, 11, 1), "B", false));
        cases.add(new LicenseCase("rejected", "DRIVER_LICENSE", "REJECTED", LocalDate.of(2026, 11, 1), "B", false));
        cases.add(new LicenseCase("wrong-type", "PASSPORT", "APPROVED", LocalDate.of(2026, 11, 1), "B", false));
        cases.add(new LicenseCase("blank-class", "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 11, 1), " ", false));
        cases.add(new LicenseCase("wrong-owner", "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 11, 1), "B", true));

        for (LicenseCase testCase : cases) {
            Account owner = account("license-" + testCase.label(), Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.VERIFIED);
            seedDriver(owner, DriverStatus.PENDING);
            seedDocument(owner, "CITIZEN_ID", "APPROVED", LocalDate.of(2027, 1, 1), null);
            Account licenseOwner = testCase.wrongOwner()
                    ? account("license-peer-" + testCase.label(), Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE) : owner;
            seedDocument(licenseOwner, testCase.type(), testCase.status(), testCase.expiresAt(), testCase.licenseClass());
            var activation = send("PATCH", "/api/drivers/" + driverId(owner.id()) + "/status", adminToken,
                    "{\"status\":\"ACTIVE\"}");
            assertError(activation, 409, "DRIVER_NOT_ELIGIBLE");
            assertThat(driverStatus(owner.id())).isEqualTo("PENDING");
        }

        Account multiple = account("license-multiple", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        seedDriver(multiple, DriverStatus.PENDING);
        seedDocument(multiple, "CITIZEN_ID", "APPROVED", LocalDate.of(2026, 10, 14), null);
        seedDocument(multiple, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 10, 13), "B");
        seedDocument(multiple, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 10, 14), "C");
        var allowed = send("PATCH", "/api/drivers/" + driverId(multiple.id()) + "/status", adminToken,
                "{\"status\":\"ACTIVE\"}");
        assertSuccess(allowed, 200);
        assertThat(driverStatus(multiple.id())).isEqualTo("ACTIVE");

        Account staleSnapshot = account("license-stale-snapshot", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.VERIFIED);
        seedDriver(staleSnapshot, DriverStatus.PENDING);
        seedDocument(staleSnapshot, "CITIZEN_ID", "APPROVED", LocalDate.of(2026, 10, 13), null);
        seedDocument(staleSnapshot, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 11, 1), "B");
        assertError(send("PATCH", "/api/drivers/" + driverId(staleSnapshot.id()) + "/status", adminToken,
                "{\"status\":\"ACTIVE\"}"), 409, "DRIVER_NOT_ELIGIBLE");
        assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, staleSnapshot.id()))
                .isEqualTo("VERIFIED");
        System.out.println("P07_ACTIVATION invalidLicenseCases=" + cases.size() + " inclusiveToday=true anyValidProof=true snapshotOnlyRejected=true");
    }

    @Test
    void postgresProjectionMatchesJava21StripForWhitespaceMatrixAndPositiveControls() {
        List<String> values = new ArrayList<>();
        for (int codePoint = Character.MIN_CODE_POINT; codePoint <= Character.MAX_CODE_POINT; codePoint++) {
            if (Character.isWhitespace(codePoint)) values.add(new String(Character.toChars(codePoint)));
        }
        values.add("");
        values.add("\t\u2003");
        values.add("\r\n\f");
        values.add("\u1680\u2028\u2029\u3000");
        values.add("B");
        values.add(" \tB\u2003");
        values.add("\u00a0"); // NBSP is not Character.isWhitespace and must remain a nonblank value.

        int index = 0;
        int javaWhitespaceCases = 0;
        for (String licenseClass : values) {
            assertThat(licenseClass.codePointCount(0, licenseClass.length())).isLessThanOrEqualTo(10);
            Account owner = account("strip-matrix-" + index++, Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
            seedDocument(owner, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 11, 1), licenseClass);

            boolean expected = !licenseClass.strip().isEmpty();
            boolean actual = eligibility.evaluateForCustomer(owner.id()).hasValidDriverLicense();
            String label = licenseClass.codePoints()
                    .mapToObj(codePoint -> String.format("U+%04X", codePoint))
                    .collect(java.util.stream.Collectors.joining("+"));
            assertThat(actual).as("license class code points %s", label).isEqualTo(expected);
            if (!expected) javaWhitespaceCases++;
        }

        Account multiple = account("strip-multiple-proof", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        seedDocument(multiple, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 11, 1), "\t\u2003");
        seedDocument(multiple, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 11, 1), " B ");
        assertThat(eligibility.evaluateForCustomer(multiple.id()).hasValidDriverLicense()).isTrue();
        System.out.println("P07_FIX_01_STRIP_MATRIX cases=" + values.size() + " javaWhitespaceCases="
                + javaWhitespaceCases + " controls=B,trimmed-B,NBSP mixed=true multipleProof=true");
    }

    @Test
    void blankApprovedLegacyLicenseCannotActivateOrAppearCurrentlyEligible() throws Exception {
        Account admin = account("blank-legacy-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        String adminToken = login(admin);
        List<String> blankClasses = List.of("\t", "\u2003");
        reset(storage);

        try (SafeLogCapture logs = new SafeLogCapture()) {
            int index = 0;
            for (String blankClass : blankClasses) {
                Account pendingOwner = account("blank-pending-" + index, Role.CUSTOMER,
                        CustomerStatus.ACTIVE, KycStatus.VERIFIED);
                long pendingDriver = seedDriver(pendingOwner, DriverStatus.PENDING);
                seedDocument(pendingOwner, "CITIZEN_ID", "APPROVED", LocalDate.of(2027, 1, 1), null);
                seedDocument(pendingOwner, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 11, 1), blankClass);
                String pendingToken = login(pendingOwner);
                List<String> pendingAudit = auditSnapshot(pendingOwner.id(), pendingDriver);

                var pendingOwnerRead = send("GET", "/api/drivers/me/eligibility", pendingToken, null);
                assertSuccess(pendingOwnerRead, 200);
                JsonNode pendingData = mapper.readTree(pendingOwnerRead.body()).path("data");
                assertThat(pendingData.path("hasValidDriverLicense").asBoolean()).isFalse();
                assertThat(pendingData.path("eligibleNow").asBoolean()).isFalse();
                assertThat(pendingData.path("ineligibilityReasonCode").asText()).isEqualTo("DRIVER_NOT_ACTIVE");

                var pendingAdminRead = send("GET", "/api/drivers/" + pendingDriver + "/eligibility", adminToken, null);
                assertSuccess(pendingAdminRead, 200);
                assertThat(mapper.readTree(pendingAdminRead.body()).path("data").path("hasValidDriverLicense").asBoolean())
                        .isFalse();
                var pendingActivation = send("PATCH", "/api/drivers/" + pendingDriver + "/status", adminToken,
                        "{\"status\":\"ACTIVE\"}");
                assertError(pendingActivation, 409, "DRIVER_NOT_ELIGIBLE");
                String pendingTrace = pendingActivation.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
                assertThat(logs.countWith(pendingTrace, "action=driver-status")).isZero();
                assertThat(driverStatus(pendingOwner.id())).isEqualTo("PENDING");
                assertThat(auditSnapshot(pendingOwner.id(), pendingDriver)).isEqualTo(pendingAudit);

                Account activeOwner = account("blank-active-" + index, Role.CUSTOMER,
                        CustomerStatus.ACTIVE, KycStatus.VERIFIED);
                long activeDriver = seedDriver(activeOwner, DriverStatus.ACTIVE);
                seedDocument(activeOwner, "CITIZEN_ID", "APPROVED", LocalDate.of(2027, 1, 1), null);
                seedDocument(activeOwner, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 11, 1), blankClass);
                String activeToken = login(activeOwner);
                List<String> activeAudit = auditSnapshot(activeOwner.id(), activeDriver);

                var activeOwnerRead = send("GET", "/api/drivers/me/eligibility", activeToken, null);
                assertSuccess(activeOwnerRead, 200);
                JsonNode activeOwnerData = mapper.readTree(activeOwnerRead.body()).path("data");
                assertThat(activeOwnerData.path("hasValidDriverLicense").asBoolean()).isFalse();
                assertThat(activeOwnerData.path("eligibleNow").asBoolean()).isFalse();
                assertThat(activeOwnerData.path("ineligibilityReasonCode").asText())
                        .isEqualTo("VALID_DRIVER_LICENSE_REQUIRED");

                var activeAdminRead = send("GET", "/api/drivers/" + activeDriver + "/eligibility", adminToken, null);
                assertSuccess(activeAdminRead, 200);
                JsonNode activeAdminData = mapper.readTree(activeAdminRead.body()).path("data");
                assertThat(activeAdminData.path("hasValidDriverLicense").asBoolean()).isFalse();
                assertThat(activeAdminData.path("eligibleNow").asBoolean()).isFalse();
                assertThat(eligibility.evaluateForCustomer(activeOwner.id()).hasValidDriverLicense()).isFalse();

                var activeNoOp = send("PATCH", "/api/drivers/" + activeDriver + "/status", adminToken,
                        "{\"status\":\"ACTIVE\"}");
                assertError(activeNoOp, 409, "DRIVER_NOT_ELIGIBLE");
                String activeTrace = activeNoOp.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
                assertThat(logs.countWith(activeTrace, "action=driver-status")).isZero();
                assertThat(driverStatus(activeOwner.id())).isEqualTo("ACTIVE");
                assertThat(auditSnapshot(activeOwner.id(), activeDriver)).isEqualTo(activeAudit);
                index++;
            }

            Account suspendedOwner = account("blank-suspended", Role.CUSTOMER,
                    CustomerStatus.ACTIVE, KycStatus.VERIFIED);
            long suspendedDriver = seedDriver(suspendedOwner, DriverStatus.SUSPENDED);
            seedDocument(suspendedOwner, "CITIZEN_ID", "APPROVED", LocalDate.of(2027, 1, 1), null);
            seedDocument(suspendedOwner, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2026, 11, 1), "\u2003");
            List<String> suspendedAudit = auditSnapshot(suspendedOwner.id(), suspendedDriver);
            var reactivation = send("PATCH", "/api/drivers/" + suspendedDriver + "/status", adminToken,
                    "{\"status\":\"ACTIVE\"}");
            assertError(reactivation, 409, "DRIVER_NOT_ELIGIBLE");
            String suspendedTrace = reactivation.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
            assertThat(logs.countWith(suspendedTrace, "action=driver-status")).isZero();
            assertThat(driverStatus(suspendedOwner.id())).isEqualTo("SUSPENDED");
            assertThat(auditSnapshot(suspendedOwner.id(), suspendedDriver)).isEqualTo(suspendedAudit);
        }

        verifyNoInteractions(storage);
        System.out.println("P07_FIX_01_HTTP tabAndEmSpace=pending409_activeIneligible_noOp409_suspendedReactivation409 "
                + "ownerAdminInternal=true auditStable=true noCommittedEvent=true storageUntouched=true");
    }

    @Test
    void strictTransitionMatrixReasonPolicyNoOpsAndAdminSelfChangeAreEnforced() throws Exception {
        Account admin = account("transition-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("transition-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        long driverId = seedDriver(owner, DriverStatus.PENDING);
        seedDocument(owner, "CITIZEN_ID", "APPROVED", LocalDate.of(2027, 1, 1), null);
        seedDocument(owner, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2027, 1, 1), "B");
        String adminToken = login(admin);

        List<String> invalidBodies = List.of("{}", "{\"status\":null}", "{\"status\":1}",
                "{\"status\":\"PENDING\"}", "{\"status\":\"ACTIVE\",\"ownerId\":2}",
                "{\"status\":\"ACTIVE\",\"status\":\"ACTIVE\"}",
                "{\"status\":\"ACTIVE\",\"licenseClass\":\"B\"}",
                "{\"status\":\"SUSPENDED\",\"reason\":\"  \"}",
                "{\"status\":\"ACTIVE\",\"reason\":\"must-not-be-accepted\"}");
        for (String body : invalidBodies) {
            var invalid = send("PATCH", "/api/drivers/" + driverId + "/status", adminToken, body);
            assertThat(invalid.statusCode()).isEqualTo(400);
            assertThat(mapper.readTree(invalid.body()).path("code").asText())
                    .isIn("INVALID_REQUEST", "VALIDATION_ERROR");
        }
        var queryCommand = send("PATCH", "/api/drivers/" + driverId + "/status?reason=x", adminToken,
                "{\"status\":\"ACTIVE\"}");
        assertError(queryCommand, 400, "INVALID_REQUEST");
        assertThat(driverStatus(owner.id())).isEqualTo("PENDING");

        var pendingToSuspend = send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"SUSPENDED\",\"reason\":\"policy\"}");
        assertError(pendingToSuspend, 409, "INVALID_DRIVER_STATUS_TRANSITION");
        var activated = send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"ACTIVE\",\"reason\":null}");
        assertSuccess(activated, 200);
        String updatedAt = jdbc.queryForObject("select updated_at::text from drivers where id=?", String.class, driverId);
        var activeNoOp = send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"ACTIVE\"}");
        assertSuccess(activeNoOp, 200);
        assertThat(jdbc.queryForObject("select updated_at::text from drivers where id=?", String.class, driverId)).isEqualTo(updatedAt);

        // Snapshot may remain VERIFIED after the identity proof expires: ACTIVE no-op rechecks current evidence.
        jdbc.update("update user_documents set expires_at='2026-10-13' where customer_id=? and doc_type='CITIZEN_ID'", owner.id());
        var noLongerEligible = send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"ACTIVE\"}");
        assertError(noLongerEligible, 409, "DRIVER_NOT_ELIGIBLE");
        assertThat(driverStatus(owner.id())).isEqualTo("ACTIVE");

        var suspended = send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"SUSPENDED\",\"reason\":\"  reason sentinel  \"}");
        assertSuccess(suspended, 200);
        String suspendedUpdatedAt = jdbc.queryForObject("select updated_at::text from drivers where id=?", String.class, driverId);
        var suspendedNoOp = send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"SUSPENDED\",\"reason\":\"second reason\"}");
        assertSuccess(suspendedNoOp, 200);
        assertThat(jdbc.queryForObject("select updated_at::text from drivers where id=?", String.class, driverId))
                .isEqualTo(suspendedUpdatedAt);
        assertError(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"ACTIVE\"}"), 409, "DRIVER_NOT_ELIGIBLE");

        Account adminOwner = account("self-admin-driver", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        long selfDriver = seedDriver(adminOwner, DriverStatus.ACTIVE);
        seedDocument(adminOwner, "CITIZEN_ID", "APPROVED", LocalDate.of(2027, 1, 1), null);
        seedDocument(adminOwner, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2027, 1, 1), "B");
        var selfNoOp = send("PATCH", "/api/drivers/" + selfDriver + "/status", login(adminOwner),
                "{\"status\":\"ACTIVE\"}");
        assertError(selfNoOp, 403, "DRIVER_SELF_STATUS_CHANGE_FORBIDDEN");
        var selfSuspend = send("PATCH", "/api/drivers/" + selfDriver + "/status", login(adminOwner),
                "{\"status\":\"SUSPENDED\",\"reason\":\"self test\"}");
        assertError(selfSuspend, 403, "DRIVER_SELF_STATUS_CHANGE_FORBIDDEN");
        assertThat(driverStatus(adminOwner.id())).isEqualTo("ACTIVE");
        System.out.println("P07_TRANSITIONS strict=true pendingSuspend=409 activeNoOpRechecks=true suspendedNoOpNoTouch=true adminSelf=403");
    }

    @Test
    void adminMaySuspendActiveProfileOfLockedOwnerButCannotActivateOrReactivateIt() throws Exception {
        Account admin = account("locked-driver-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("locked-driver-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        long driverId = seedDriver(owner, DriverStatus.PENDING);
        seedDocument(owner, "CITIZEN_ID", "APPROVED", LocalDate.of(2027, 1, 1), null);
        seedDocument(owner, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2027, 1, 1), "B");
        String adminToken = login(admin);
        assertSuccess(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"ACTIVE\"}"), 200);
        assertSuccess(send("PATCH", "/api/customers/" + owner.id() + "/status", adminToken,
                "{\"status\":\"LOCKED\",\"reason\":\"owner lock\"}"), 200);

        assertError(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"ACTIVE\"}"), 409, "DRIVER_NOT_ELIGIBLE");
        var current = send("GET", "/api/drivers/" + driverId + "/eligibility", adminToken, null);
        assertSuccess(current, 200);
        assertThat(mapper.readTree(current.body()).path("data").path("ineligibilityReasonCode").asText())
                .isEqualTo("ACCOUNT_NOT_ACTIVE");
        assertThat(driverStatus(owner.id())).isEqualTo("ACTIVE");
        assertSuccess(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"SUSPENDED\",\"reason\":\"suspend locked owner profile\"}"), 200);
        assertThat(driverStatus(owner.id())).isEqualTo("SUSPENDED");
        System.out.println("P07_LOCKED_OWNER activationDenied=true adminSuspensionAllowed=true noAccountUnlock=true");
    }

    @Test
    void realDriverUniqueConstraintFallbackReturnsConflictAndSafeDiagnostic() throws Exception {
        Account admin = account("unique-fallback-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("unique-fallback-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        long existingDriver = seedDriver(owner, DriverStatus.PENDING);
        String token = login(owner);
        String constraint = jdbc.queryForObject("select conname from pg_constraint where conrelid='drivers'::regclass and contype='u'",
                String.class);
        assertThat(constraint).isEqualTo("drivers_customer_id_key");
        doAnswer(invocation -> invocation.<Long>getArgument(0) == owner.id() ? false : SpySupport.callRealMethod(invocation))
                .when(drivers).existsByCustomerId(anyLong());

        try (SafeLogCapture logs = new SafeLogCapture()) {
            var response = send("POST", "/api/drivers", token, null);
            assertError(response, 409, "DRIVER_PROFILE_ALREADY_EXISTS");
            String trace = response.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
            ILoggingEvent event = logs.singleForTrace(trace);
            assertThat(event.getFormattedMessage()).contains("errorCode=DRIVER_PROFILE_ALREADY_EXISTS", "traceId=" + trace);
            assertThat(event.getThrowableProxy()).isNull();
            assertThat(logs.rendered()).doesNotContain(PASSWORD, owner.email(), "P07 unique-fallback-owner");
        }
        assertThat(driverCount(owner.id())).isEqualTo(1);
        assertThat(driverId(owner.id())).isEqualTo(existingDriver);
        assertThat(jdbc.queryForObject("select status from drivers where id=?", String.class, existingDriver)).isEqualTo("PENDING");
        System.out.println("P07_UNIQUE_FALLBACK constraint=drivers_customer_id_key real23505=true conflict409 safeDiagnostic=true rollback=true");
    }

    @Test
    void rollbackAfterDriverFlushDoesNotPersistRowOrEmitCommitEvent() throws Exception {
        Account owner = account("rollback-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        AtomicBoolean failOnce = new AtomicBoolean(true);
        doAnswer(invocation -> {
            Driver driver = (Driver) invocation.getArgument(0);
            Driver saved = (Driver) SpySupport.callRealMethod(invocation);
            if (driver.getCustomer().getId().equals(owner.id()) && failOnce.compareAndSet(true, false)) {
                throw new IllegalStateException("P07 private rollback sentinel");
            }
            return saved;
        }).when(drivers).saveAndFlush(any(Driver.class));

        try (SafeLogCapture logs = new SafeLogCapture()) {
            var response = send("POST", "/api/drivers", token, null);
            assertError(response, 500, "INTERNAL_ERROR");
            String trace = response.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
            assertThat(logs.rendered()).doesNotContain("P07 private rollback sentinel", PASSWORD);
            assertThat(logs.countWith(trace, "action=driver-create")).isZero();
            assertThat(logs.countWith(trace, "Unhandled request failure")).isEqualTo(1);
        }
        assertThat(driverCount(owner.id())).isZero();
        System.out.println("P07_ROLLBACK postFlushFailure=500 rowCount=0 afterCommitEvent=0 safeTrace=true");
    }

    @Test
    void endToEndUploadReviewDriverActivationAndEligibilityUsesRealHttpAndPrivateFiles() throws Exception {
        Account owner = account("e2e-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account admin = account("e2e-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        String ownerToken = login(owner);
        String adminToken = login(admin);
        LocalDate today = LocalDate.of(2026, 10, 14);

        JsonNode identity = uploadDocument(ownerToken, DocumentType.CITIZEN_ID, "E2E-ID", null, today);
        assertSuccess(review(adminToken, identity.path("id").asLong()), 200);
        JsonNode license = uploadDocument(ownerToken, DocumentType.DRIVER_LICENSE, "E2E-LICENSE", "B", today);
        assertSuccess(review(adminToken, license.path("id").asLong()), 200);
        assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id())).isEqualTo("VERIFIED");

        var created = send("POST", "/api/drivers", ownerToken, null);
        assertSuccess(created, 201);
        long driverId = mapper.readTree(created.body()).path("data").path("id").asLong();
        assertThat(mapper.readTree(created.body()).path("data").path("status").asText()).isEqualTo("PENDING");
        assertSuccess(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                "{\"status\":\"ACTIVE\"}"), 200);

        var eligibility = send("GET", "/api/drivers/me/eligibility", ownerToken, null);
        assertSuccess(eligibility, 200);
        JsonNode data = mapper.readTree(eligibility.body()).path("data");
        assertThat(data.path("eligibleNow").asBoolean()).isTrue();
        assertThat(data.path("kycStatus").asText()).isEqualTo("VERIFIED");
        assertThat(data.path("hasValidDriverLicense").asBoolean()).isTrue();
        assertThat(data.path("evaluatedOn").asText()).isEqualTo("2026-10-14");
        assertThat(eligibility.body()).doesNotContain("E2E-ID", "E2E-LICENSE", "licenseClass", "private-local:", PRIVATE_ROOT.toString());
        assertThat(jdbc.queryForObject("select count(*) from drivers where customer_id=? and status='ACTIVE'", Integer.class, owner.id()))
                .isEqualTo(1);
        System.out.println("P07_END_TO_END P05_upload=PENDING P06_review=APPROVED P07_create=201_activate=ACTIVE eligibleNow=true");
    }

    private JsonNode uploadDocument(String token, DocumentType type, String number, String licenseClass,
            LocalDate expiry) throws Exception {
        String boundary = "p07-" + UUID.randomUUID().toString().replace("-", "");
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        addTextPart(output, boundary, "docType", type.name());
        addTextPart(output, boundary, "docNumber", number + "-" + UUID.randomUUID().toString().substring(0, 8));
        addTextPart(output, boundary, "fullNameOnDoc", "Synthetic E2E Person");
        addTextPart(output, boundary, "dateOfBirthOnDoc", "1990-01-01");
        addTextPart(output, boundary, "issuePlace", "Test province");
        addTextPart(output, boundary, "issueDate", "2020-01-01");
        addTextPart(output, boundary, "expiresAt", expiry.toString());
        if (licenseClass != null) addTextPart(output, boundary, "licenseClass", licenseClass);
        addFilePart(output, boundary, "frontImage", "front.png", png());
        if (type == DocumentType.CITIZEN_ID || type == DocumentType.DRIVER_LICENSE) {
            addFilePart(output, boundary, "backImage", "back.png", png());
        }
        output.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        HttpRequest request = HttpRequest.newBuilder(uri("/api/user-documents"))
                .timeout(Duration.ofSeconds(20)).header("Authorization", "Bearer " + token)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(output.toByteArray())).build();
        var response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        assertSuccess(response, 201);
        return mapper.readTree(response.body()).path("data");
    }

    private HttpResponse<String> review(String token, long documentId) throws Exception {
        return send("PATCH", "/api/user-documents/" + documentId + "/review", token,
                "{\"verifyStatus\":\"APPROVED\"}");
    }

    private void addTextPart(ByteArrayOutputStream output, String boundary, String name, String value) throws Exception {
        output.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + name + "\"\r\n\r\n" + value + "\r\n")
                .getBytes(StandardCharsets.UTF_8));
    }

    private void addFilePart(ByteArrayOutputStream output, String boundary, String name, String filename, byte[] bytes) throws Exception {
        output.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + name + "\"; filename=\"" + filename
                + "\"\r\nContent-Type: image/png\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(bytes);
        output.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private HttpResponse<String> send(String method, String path, String token, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri(path)).timeout(Duration.ofSeconds(20));
        if (token != null) builder.header("Authorization", "Bearer " + token);
        if (body != null) builder.header("Content-Type", "application/json");
        HttpRequest.BodyPublisher publisher = body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8);
        return CLIENT.send(builder.method(method, publisher).build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> sendRawCreate(String token, RawBody body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri("/api/drivers")).timeout(Duration.ofSeconds(20))
                .header("Authorization", "Bearer " + token).header("Content-Type", body.contentType());
        HttpRequest.BodyPublisher publisher = body.chunked()
                ? HttpRequest.BodyPublishers.ofInputStream(() -> new java.io.ByteArrayInputStream(body.content().getBytes(StandardCharsets.UTF_8)))
                : HttpRequest.BodyPublishers.ofString(body.content(), StandardCharsets.UTF_8);
        return CLIENT.send(builder.POST(publisher).build(), HttpResponse.BodyHandlers.ofString());
    }

    private Account account(String label, Role role, CustomerStatus status, KycStatus kyc) {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String email = label + "-" + suffix + "@example.test";
        String phone = "7" + suffix.substring(0, 19);
        long id = jdbc.queryForObject("""
                insert into customers(full_name,email,phone,password_hash,role,status,kyc_status,email_verified)
                values(?,?,?,?,?,?,?,false) returning id
                """, Long.class, "P07 " + label, email, phone, passwordEncoder.encode(PASSWORD), role.name(), status.name(), kyc.name());
        return new Account(id, email, role, status);
    }

    private String login(Account account) throws Exception {
        var response = send("POST", "/api/auth/login", null,
                "{\"email\":\"" + account.email() + "\",\"password\":\"" + PASSWORD + "\"}");
        assertSuccess(response, 200);
        return mapper.readTree(response.body()).path("data").path("accessToken").asText();
    }

    private long seedDriver(Account owner, DriverStatus status) {
        return jdbc.queryForObject("insert into drivers(customer_id,status) values(?,?) returning id",
                Long.class, owner.id(), status.name());
    }

    private void seedDocument(Account owner, String type, String status, LocalDate expiresAt, String licenseClass) {
        jdbc.update("""
                insert into user_documents(customer_id,doc_type,doc_number,full_name_on_doc,date_of_birth_on_doc,
                    issue_place,issue_date,expires_at,license_class,front_image_url,back_image_url,verify_status)
                values(?,?,?,?,?,?,?,?,?,?,?,?)
                """, owner.id(), type, "P07-DOC-" + UUID.randomUUID(), "Synthetic Test Person",
                LocalDate.of(1990, 1, 1), "Test province", LocalDate.of(2020, 1, 1), expiresAt,
                licenseClass, "private-local:test-only", type.equals("PASSPORT") ? null : "private-local:test-back", status);
    }

    private long driverId(long customerId) {
        return jdbc.queryForObject("select id from drivers where customer_id=?", Long.class, customerId);
    }

    private int driverCount(long customerId) {
        return jdbc.queryForObject("select count(*) from drivers where customer_id=?", Integer.class, customerId);
    }

    private List<String> auditSnapshot(long customerId, long driverId) {
        List<String> snapshot = new ArrayList<>();
        snapshot.add(jdbc.queryForObject("select created_at::text || '|' || updated_at::text from customers where id=?",
                String.class, customerId));
        snapshot.add(jdbc.queryForObject("select created_at::text || '|' || updated_at::text from drivers where id=?",
                String.class, driverId));
        snapshot.addAll(jdbc.query("select created_at::text || '|' || updated_at::text from user_documents "
                        + "where customer_id=? order by id", (row, rowNumber) -> row.getString(1), customerId));
        return List.copyOf(snapshot);
    }

    private String driverStatus(long customerId) {
        return jdbc.queryForObject("select status from drivers where customer_id=?", String.class, customerId);
    }

    private List<String> fieldNames(JsonNode node) {
        return new ArrayList<>(node.propertyNames());
    }

    private void assertSuccess(HttpResponse<String> response, int status) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode body = mapper.readTree(response.body());
        String trace = response.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
        assertThat(body.path("success").asBoolean()).isTrue();
        assertThat(body.path("traceId").asText()).isEqualTo(trace);
    }

    private void assertError(HttpResponse<String> response, int status, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode body = mapper.readTree(response.body());
        String trace = response.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
        assertThat(body.path("success").asBoolean()).isFalse();
        assertThat(body.path("code").asText()).isEqualTo(code);
        assertThat(body.path("traceId").asText()).isEqualTo(trace);
    }

    private void assertTrace(HttpResponse<String> response) throws Exception {
        JsonNode body = mapper.readTree(response.body());
        assertThat(response.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow())
                .isEqualTo(body.path("traceId").asText());
    }

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + environment.getRequiredProperty("local.server.port", Integer.class) + path);
    }

    private static byte[] png() throws Exception {
        BufferedImage image = new BufferedImage(16, 12, BufferedImage.TYPE_INT_RGB);
        image.setRGB(0, 0, 0x334455);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private static Path createPrivateRoot() {
        try {
            return Files.createTempDirectory("sba301-p07-private-").toAbsolutePath();
        } catch (java.io.IOException exception) {
            throw new ExceptionInInitializerError(exception);
        }
    }

    private static final class SafeLogCapture implements AutoCloseable {
        private final List<Logger> loggers = List.of(
                (Logger) LoggerFactory.getLogger("com.carrental.service.impl.ActionLogServiceImpl"),
                (Logger) LoggerFactory.getLogger("com.carrental.exception.GlobalExceptionHandler"));
        private final CapturingAppender appender = new CapturingAppender();

        private SafeLogCapture() {
            appender.setContext((LoggerContext) LoggerFactory.getILoggerFactory());
            appender.start();
            loggers.forEach(logger -> logger.addAppender(appender));
        }

        private ILoggingEvent singleForTrace(String trace) {
            List<ILoggingEvent> matches = events().stream()
                    .filter(event -> event.getFormattedMessage().contains("traceId=" + trace)).toList();
            assertThat(matches).hasSize(1);
            return matches.getFirst();
        }

        private List<ILoggingEvent> events() { return List.copyOf(appender.events); }
        private String rendered() { return events().stream().map(ILoggingEvent::getFormattedMessage).toList().toString(); }
        private long countWith(String trace, String marker) {
            return events().stream().filter(event -> event.getFormattedMessage().contains("traceId=" + trace)
                    && event.getFormattedMessage().contains(marker)).count();
        }

        @Override public void close() { loggers.forEach(logger -> logger.detachAppender(appender)); appender.stop(); }
    }

    private static final class CapturingAppender extends AppenderBase<ILoggingEvent> {
        private final List<ILoggingEvent> events = new java.util.concurrent.CopyOnWriteArrayList<>();
        @Override protected void append(ILoggingEvent event) { events.add(event); }
    }

    private record Account(long id, String email, Role role, CustomerStatus status) { }
    private record RawBody(String label, String content, String contentType, boolean chunked) { }
    private record LicenseCase(String label, String type, String status, LocalDate expiresAt,
            String licenseClass, boolean wrongOwner) { }
}
