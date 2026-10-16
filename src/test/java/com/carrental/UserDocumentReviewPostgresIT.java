package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.reset;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.ThrowableProxyUtil;
import ch.qos.logback.core.AppenderBase;
import com.carrental.dto.response.ApiResponse;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DocumentVerifyStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.enums.UserDocumentType;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerStatusLock;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.service.DocumentReviewLogger;
import com.carrental.storage.CanonicalDocumentImage;
import com.carrental.storage.DocumentImageFormat;
import com.carrental.storage.PrivateDocumentReceipt;
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
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import javax.imageio.ImageIO;
import javax.sql.DataSource;
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
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.context.annotation.Primary;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Actual HTTP/security/transaction/filesystem regression for P06 on isolated PostgreSQL. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false",
        "spring.datasource.hikari.connection-init-sql=SET lock_timeout TO '5s'",
        "app.customer.status-lock-timeout-ms=350"
})
@Import(UserDocumentReviewPostgresIT.FixedClockConfiguration.class)
class UserDocumentReviewPostgresIT {

    private static final String PASSWORD = "P06 synthetic test password";
    private static final HttpClient CLIENT = HttpClient.newHttpClient();
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final MutableTestClock TEST_CLOCK = new MutableTestClock(Instant.now(), ZONE);
    private static final Path PRIVATE_ROOT = createPrivateRoot();
    @Container private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:15.13-alpine");

    @TestConfiguration(proxyBeanMethods = false)
    static class FixedClockConfiguration {
        @Bean @Primary Clock p06Clock() { return TEST_CLOCK; }
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
        registry.add("app.security.jwt.private-key-location", TestJwtKeys::privateKeyLocation);
        registry.add("app.security.jwt.public-key-location", TestJwtKeys::publicKeyLocation);
        registry.add("app.document.storage.enabled", () -> "true");
        registry.add("app.document.storage.root", () -> PRIVATE_ROOT.toString());
    }

    @Autowired private Environment environment;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private DataSource dataSource;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JsonMapper mapper;
    @MockitoSpyBean private PlatformTransactionManager transactionManager;
    @MockitoSpyBean private UserDocumentRepository documents;
    @MockitoSpyBean private PrivateDocumentStorage storage;
    @MockitoSpyBean private CustomerStatusLock statusLock;
    @MockitoSpyBean private DocumentReviewLogger reviewLogger;

    @AfterEach
    void resetTestHooksAndClock() {
        TEST_CLOCK.set(Instant.now());
        reset(transactionManager, documents, storage, statusLock, reviewLogger);
    }

    @AfterAll
    static void cleanExternalPrivateRoot() throws Exception {
        Path temp = Path.of(System.getProperty("java.io.tmpdir")).toRealPath();
        Path root = PRIVATE_ROOT.toRealPath();
        if (!root.startsWith(temp) || root.equals(temp) || !root.getFileName().toString().startsWith("sba301-p06-review-")) {
            throw new IllegalStateException("Refusing to remove an unexpected P06 test storage root");
        }
        try (var entries = Files.list(root)) {
            for (Path entry : entries.toList()) {
                if (Files.isRegularFile(entry) && !Files.isSymbolicLink(entry)) Files.delete(entry);
            }
        }
        Files.deleteIfExists(root);
    }

    @Test
    void healthIsUpOverHttpWithPostgresContextAndMatchingTrace() throws Exception {
        HttpResponse<String> response = get("/api/health", null);
        assertApiSuccess(response, 200);
        assertThat(mapper.readTree(response.body()).path("data").path("status").asText()).isEqualTo("UP");
        assertThat(response.headers().firstValue(RequestTraceFilter.HEADER_NAME)).isPresent();
        System.out.println("P06_HTTP_HEALTH_JSON " + response.body());
        System.out.println("P06_HTTP_HEALTH status=200 dataStatus=UP traceMatched=true postgresContext=true");
    }

    @Test
    void strictHttpContractAuthorizationAndSelfReviewAreEnforcedWithoutMutation() throws Exception {
        Account admin = account("review-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account customer = account("review-customer", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String adminToken = login(admin);
        String customerToken = login(customer);
        SeededDocument ownDocument = seedDocument(admin, UserDocumentType.PASSPORT, unique("SELF"),
                "Admin Owner", LocalDate.of(1990, 1, 2), "Hanoi", LocalDate.of(2010, 1, 2), null, null,
                true, true);
        SeededDocument target = seedDocument(customer, UserDocumentType.PASSPORT, unique("STRICT"),
                "Customer Owner", LocalDate.of(1990, 1, 2), "Hanoi", LocalDate.of(2010, 1, 2), null, null,
                true, false);
        Map<String, Object> before = documentAudit(target.id());
        Set<String> filesBefore = fileNames();

        HttpResponse<String> self = patch(reviewPath(ownDocument.id()), adminToken, "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"self\"}");
        assertApiError(self, 403, "DOCUMENT_SELF_REVIEW_FORBIDDEN");
        assertApiError(patch(reviewPath(target.id()), customerToken, "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"no\"}"),
                403, "ACCESS_DENIED");
        assertApiError(patch(reviewPath(target.id()), null, "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"no\"}"),
                401, "AUTHENTICATION_FAILED");
        assertApiError(patch(reviewPath(0), adminToken, "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"no\"}"),
                400, "INVALID_REQUEST");
        assertApiError(patch(reviewPath(999999999), adminToken, "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"no\"}"),
                404, "RESOURCE_NOT_FOUND");

        String sentinel = "P06_REVIEW_INPUT_SENTINEL";
        List<String> invalidBodies = List.of(
                "{}", "{\"verifyStatus\":null}", "{\"verifyStatus\":\"PENDING\"}",
                "{\"verifyStatus\":\"approved\"}", "{\"verifyStatus\":12}", "{\"verifyStatus\":true}",
                "{\"verifyStatus\":[]}", "{\"verifyStatus\":{}}",
                "{\"verifyStatus\":\"APPROVED\",\"rejectReason\":\"" + sentinel + "\"}",
                "{\"verifyStatus\":\"REJECTED\"}", "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":null}",
                "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"   \"}",
                "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"" + "x".repeat(501) + "\"}",
                "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"x\",\"actorId\":1}",
                "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"x\",\"kycStatus\":\"VERIFIED\"}",
                "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"x\",\"verifyStatusPresent\":true}",
                "{\"verifyStatus\":\"REJECTED\",\"verifyStatus\":\"APPROVED\",\"rejectReason\":\"x\"}",
                "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"x\",\"rejectReason\":\"y\"}",
                "{malformed json");
        try (SafeLogCapture logs = new SafeLogCapture()) {
            for (String body : invalidBodies) {
                HttpResponse<String> response = patch(reviewPath(target.id()), adminToken, body);
                assertApiError(response, 400, "INVALID_REQUEST");
                assertThat(response.body()).doesNotContain(sentinel);
            }
            assertThat(logs.rendered()).doesNotContain(sentinel);
        }
        assertApiError(patch(reviewPath(target.id()) + "?debug=true", adminToken,
                "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"x\"}"), 400, "INVALID_REQUEST");
        assertThat(documentAudit(target.id())).isEqualTo(before);
        assertThat(fileNames()).isEqualTo(filesBefore);

        jdbc.update("update customers set status='LOCKED' where id=?", admin.id());
        assertApiError(patch(reviewPath(target.id()), adminToken,
                "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"x\"}"), 401, "INVALID_TOKEN");
        assertThat(documentAudit(target.id())).isEqualTo(before);
        System.out.println("P06_HTTP_STRICT_AUTH self=403 customer=403 anonymous=401 locked=401 invalidPayloads="
                + invalidBodies.size() + " unchanged=true");
    }

    @Test
    void approvalCommitsReviewAndKycSnapshotTogetherAndLeavesFilesAndAccountDataIntact() throws Exception {
        Account admin = account("approve-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("approve-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(admin);
        SeededDocument document = seedDocument(owner, UserDocumentType.CITIZEN_ID, unique("APPROVE"),
                "Identity Name", LocalDate.of(1992, 5, 6), "Da Nang", LocalDate.of(2012, 5, 6), null, null,
                true, true);
        Map<String, Object> beforeDocument = documentAudit(document.id());
        Map<String, Object> beforeOwner = customerSnapshot(owner.id());
        Set<String> filesBefore = fileNames();

        HttpResponse<String> response = patch(reviewPath(document.id()), token, "{\"verifyStatus\":\"APPROVED\"}");
        assertApiSuccess(response, 200);
        assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        JsonNode data = mapper.readTree(response.body()).path("data");
        assertThat(data.path("document").path("verifyStatus").asText()).isEqualTo("APPROVED");
        assertThat(data.path("document").path("verifiedById").asLong()).isEqualTo(admin.id());
        assertThat(data.path("document").path("verifiedAt").asText()).isNotBlank();
        assertThat(data.path("document").path("rejectReason").isNull()).isTrue();
        assertThat(data.path("kycStatus").asText()).isEqualTo("VERIFIED");
        assertThat(data.path("evaluatedOn").asText()).isEqualTo(LocalDate.now(TEST_CLOCK).toString());
        assertThat(response.body()).doesNotContain(PRIVATE_ROOT.toString(), "private-local:", "frontImageUrl", "backImageUrl");

        Map<String, Object> afterDocument = documentAudit(document.id());
        Map<String, Object> afterOwner = customerSnapshot(owner.id());
        assertThat(afterDocument.get("verify_status")).isEqualTo("APPROVED");
        assertThat(afterDocument.get("verified_by")).isEqualTo(admin.id());
        assertThat(afterDocument.get("reject_reason")).isNull();
        assertThat(afterDocument.get("created_at")).isEqualTo(beforeDocument.get("created_at"));
        assertThat(afterDocument.get("updated_at")).isNotEqualTo(beforeDocument.get("updated_at"));
        assertThat(afterOwner.get("kyc_status")).isEqualTo("VERIFIED");
        assertThat(afterOwner.get("full_name")).isEqualTo(beforeOwner.get("full_name"));
        assertThat(afterOwner.get("email")).isEqualTo(beforeOwner.get("email"));
        assertThat(afterOwner.get("phone")).isEqualTo(beforeOwner.get("phone"));
        assertThat(afterOwner.get("role")).isEqualTo(beforeOwner.get("role"));
        assertThat(afterOwner.get("status")).isEqualTo(beforeOwner.get("status"));
        assertThat(fileNames()).isEqualTo(filesBefore);
        HttpResponse<String> current = get("/api/customers/" + owner.id() + "/kyc", token);
        assertApiSuccess(current, 200);
        assertThat(mapper.readTree(current.body()).path("data").path("kycStatus").asText()).isEqualTo("VERIFIED");
        System.out.println("P06_HTTP_APPROVAL 200 status=APPROVED kyc=VERIFIED auditCommitted=true filesUnchanged=true traceMatched=true");
    }

    @Test
    void rejectionAllowsLockedOwnerAndDisabledStorageAndDoesNotDeleteEvidence() throws Exception {
        Account admin = account("reject-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("reject-locked-owner", Role.CUSTOMER, CustomerStatus.LOCKED, KycStatus.NONE);
        String token = login(admin);
        SeededDocument document = seedDocument(owner, UserDocumentType.CITIZEN_ID, unique("REJECT"),
                null, null, null, null, null, null, false, false);
        String sentinel = "P06_PRIVATE_REJECT_REASON";
        doReturn(false).when(storage).isEnabled();
        Set<String> filesBefore = fileNames();

        HttpResponse<String> response = patch(reviewPath(document.id()), token,
                "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"  " + sentinel + "  \"}");
        assertApiSuccess(response, 200);
        JsonNode data = mapper.readTree(response.body()).path("data");
        assertThat(data.path("document").path("verifyStatus").asText()).isEqualTo("REJECTED");
        assertThat(data.path("document").path("rejectReason").asText()).isEqualTo(sentinel);
        assertThat(data.path("kycStatus").asText()).isEqualTo("REJECTED");
        assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, owner.id())).isEqualTo("LOCKED");
        assertThat(fileNames()).isEqualTo(filesBefore);
        try (SafeLogCapture logs = new SafeLogCapture()) {
            // The successful event is emitted after commit and deliberately excludes the reason.
            HttpResponse<String> repeat = patch(reviewPath(document.id()), token,
                    "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"" + sentinel + "\"}");
            assertApiError(repeat, 409, "DOCUMENT_ALREADY_REVIEWED");
            assertThat(logs.rendered()).doesNotContain(sentinel, owner.email());
        }
        System.out.println("P06_HTTP_REJECTION lockedOwner=allowed storageDisabled=true filesUnchanged=true terminal=409");
    }

    @Test
    void approvalRequiresConfirmedMetadataExpiryAndReadableRequiredImages() throws Exception {
        Account admin = account("prereq-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("prereq-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(admin);
        LocalDate today = LocalDate.now(TEST_CLOCK);

        SeededDocument missingFields = seedDocument(owner, UserDocumentType.PASSPORT, unique("MISSING"),
                null, null, null, null, null, null, false, false);
        assertReviewFailureUnchanged(missingFields, token, 409, "DOCUMENT_NOT_APPROVABLE");

        SeededDocument missingBack = seedDocument(owner, UserDocumentType.CITIZEN_ID, unique("BACK"),
                "Valid Name", LocalDate.of(1990, 1, 1), "Hanoi", today.minusYears(10), null, null,
                true, false);
        assertReviewFailureUnchanged(missingBack, token, 409, "DOCUMENT_NOT_APPROVABLE");

        SeededDocument driverNoExpiry = seedDocument(owner, UserDocumentType.DRIVER_LICENSE, unique("NOEXP"),
                "Valid Name", LocalDate.of(1990, 1, 1), "Hanoi", today.minusYears(10), null, "B1",
                true, true);
        assertReviewFailureUnchanged(driverNoExpiry, token, 409, "DOCUMENT_NOT_APPROVABLE");

        SeededDocument expired = seedDocument(owner, UserDocumentType.PASSPORT, unique("EXPIRED"),
                "Valid Name", LocalDate.of(1990, 1, 1), "Hanoi", today.minusYears(10), today.minusDays(1), null,
                true, false);
        assertReviewFailureUnchanged(expired, token, 409, "DOCUMENT_NOT_APPROVABLE");

        SeededDocument futureBirth = seedDocument(owner, UserDocumentType.PASSPORT, unique("FUTUREDOB"),
                "Valid Name", today.plusDays(1), "Hanoi", today.minusYears(1), null, null, true, false);
        assertReviewFailureUnchanged(futureBirth, token, 409, "DOCUMENT_NOT_APPROVABLE");

        SeededDocument futureIssue = seedDocument(owner, UserDocumentType.PASSPORT, unique("FUTUREISSUE"),
                "Valid Name", LocalDate.of(1990, 1, 1), "Hanoi", today.plusDays(1), null, null, true, false);
        assertReviewFailureUnchanged(futureIssue, token, 409, "DOCUMENT_NOT_APPROVABLE");

        String missingNumber = "P06_R1_PRIVATE_NUMBER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        SeededDocument missingStoredFile = seedDocument(owner, UserDocumentType.PASSPORT, missingNumber,
                "P06_R1_PRIVATE_NAME_SENTINEL", LocalDate.of(1990, 1, 1), "P06_R1_PRIVATE_PLACE_SENTINEL",
                today.minusYears(10), null, null, true, false);
        Path storedEvidence = privatePath(missingStoredFile.front());
        assertThat(Files.isRegularFile(storedEvidence)).isTrue();
        Files.delete(storedEvidence);
        assertReviewFailureWithDiagnostic(missingStoredFile, token, 500, ErrorCode.INTERNAL_ERROR,
                "stored-evidence-invalid", "AppException", admin, owner,
                missingNumber, "P06_R1_PRIVATE_NAME_SENTINEL", "P06_R1_PRIVATE_PLACE_SENTINEL", storedEvidence.toString());

        String corruptNumber = "P06_R1_CORRUPT_NUMBER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        SeededDocument corruptEvidence = seedDocument(owner, UserDocumentType.PASSPORT, corruptNumber,
                "P06_R1_CORRUPT_NAME_SENTINEL", LocalDate.of(1990, 1, 1), "Hanoi",
                today.minusYears(10), null, null, true, false);
        Path corruptPath = privatePath(corruptEvidence.front());
        byte[] corruptBytes = "P06_R1_CORRUPT_BYTES_SENTINEL".getBytes(StandardCharsets.UTF_8);
        Files.write(corruptPath, corruptBytes);
        assertReviewFailureWithDiagnostic(corruptEvidence, token, 500, ErrorCode.INTERNAL_ERROR,
                "stored-evidence-validation-failed", "IllegalArgumentException", admin, owner,
                corruptNumber, "P06_R1_CORRUPT_NAME_SENTINEL", "P06_R1_CORRUPT_BYTES_SENTINEL",
                corruptPath.toString(), corruptEvidence.front());
        assertThat(Files.readAllBytes(corruptPath)).containsExactly(corruptBytes);

        SeededDocument disabled = seedDocument(owner, UserDocumentType.PASSPORT, unique("DISABLED"),
                "Valid Name", LocalDate.of(1990, 1, 1), "Hanoi", today.minusYears(10), null, null, true, false);
        doReturn(false).when(storage).isEnabled();
        assertReviewFailureWithDiagnostic(disabled, token, 503, ErrorCode.DEPENDENCY_UNAVAILABLE,
                "storage-dependency", "AppException", admin, owner, PRIVATE_ROOT.toString(), disabled.front());
        reset(storage);

        String unavailableCause = "P06_R1_UNAVAILABLE_CAUSE_SENTINEL";
        SeededDocument unavailable = seedDocument(owner, UserDocumentType.PASSPORT, unique("UNAVAILABLE"),
                "P06_R1_UNAVAILABLE_NAME_SENTINEL", LocalDate.of(1990, 1, 1), "Hanoi",
                today.minusYears(10), null, null, true, false);
        doAnswer(invocation -> {
            throw new com.carrental.exception.AppException(ErrorCode.DEPENDENCY_UNAVAILABLE,
                    "Dịch vụ lưu trữ tạm thời không khả dụng", new IllegalStateException(unavailableCause));
        }).when(storage).open(eq(unavailable.front()));
        assertReviewFailureWithDiagnostic(unavailable, token, 503, ErrorCode.DEPENDENCY_UNAVAILABLE,
                "storage-dependency", "AppException", admin, owner,
                unavailableCause, "P06_R1_UNAVAILABLE_NAME_SENTINEL", unavailable.front(), PRIVATE_ROOT.toString());
        reset(storage);

        SeededDocument expiresToday = seedDocument(owner, UserDocumentType.PASSPORT, unique("TODAY"),
                "Valid Name", LocalDate.of(1990, 1, 1), "Hanoi", today, today, null, true, false);
        HttpResponse<String> accepted = patch(reviewPath(expiresToday.id()), token, "{\"verifyStatus\":\"APPROVED\"}");
        assertApiSuccess(accepted, 200);
        assertThat(mapper.readTree(accepted.body()).path("data").path("kycStatus").asText()).isEqualTo("VERIFIED");
        System.out.println("P06_APPROVAL_PREREQUISITES yesterday=409 today=200 futureDates=409 requiredBack=409 missingStored=500 disabled=503 unavailable=503 safeDiagnostics=true");
    }

    @Test
    void currentKycUsesOneTimeSensitiveIdentityAggregateAndDoesNotWriteSnapshotOrAudit() throws Exception {
        Account admin = account("kyc-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("kyc-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account pendingOwner = account("kyc-pending", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account rejectedOwner = account("kyc-rejected", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account driverOwner = account("kyc-driver-only", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String adminToken = login(admin);
        String ownerToken = login(owner);
        LocalDate today = LocalDate.now(TEST_CLOCK);

        seedDocument(owner, UserDocumentType.CITIZEN_ID, unique("VALID"), "Private Name", LocalDate.of(1990, 1, 1),
                "Private Place", today.minusYears(5), today, null, false, false, DocumentVerifyStatus.APPROVED);
        seedDocument(owner, UserDocumentType.PASSPORT, unique("PENDING"), "Other Name", LocalDate.of(1990, 1, 1),
                "Private Place", today.minusYears(5), null, null, false, false, DocumentVerifyStatus.PENDING);
        seedDocument(owner, UserDocumentType.PASSPORT, unique("REJECTED"), "Other Name", LocalDate.of(1990, 1, 1),
                "Private Place", today.minusYears(5), null, null, false, false, DocumentVerifyStatus.REJECTED);
        seedDocument(pendingOwner, UserDocumentType.CITIZEN_ID, unique("PEND"), null, null, null, null, null, null,
                false, false, DocumentVerifyStatus.PENDING);
        seedDocument(pendingOwner, UserDocumentType.PASSPORT, unique("REJ"), null, null, null, null, null, null,
                false, false, DocumentVerifyStatus.REJECTED);
        seedDocument(rejectedOwner, UserDocumentType.PASSPORT, unique("ONLYREJ"), null, null, null, null, null, null,
                false, false, DocumentVerifyStatus.REJECTED);
        seedDocument(driverOwner, UserDocumentType.DRIVER_LICENSE, unique("ONLYDL"), null, null, null, null, today.plusYears(1),
                "B1", false, false, DocumentVerifyStatus.APPROVED);

        Map<String, Object> ownerBefore = customerSnapshot(owner.id());
        HttpResponse<String> mine = get("/api/customers/me/kyc", ownerToken);
        assertApiSuccess(mine, 200);
        JsonNode mineData = mapper.readTree(mine.body()).path("data");
        assertThat(mineData.path("customerId").asLong()).isEqualTo(owner.id());
        assertThat(mineData.path("accountStatus").asText()).isEqualTo("ACTIVE");
        assertThat(mineData.path("kycStatus").asText()).isEqualTo("VERIFIED");
        assertThat(mineData.path("evaluatedOn").asText()).isEqualTo(today.toString());
        assertThat(mine.body()).doesNotContain("Private Name", uniqueMarker(), "docNumber", "documentNumber", "filePath", PRIVATE_ROOT.toString());
        assertThat(customerSnapshot(owner.id())).isEqualTo(ownerBefore);

        assertKycStatus(adminToken, pendingOwner, "PENDING");
        assertKycStatus(adminToken, rejectedOwner, "REJECTED");
        assertKycStatus(adminToken, driverOwner, "NONE");
        assertApiError(get("/api/customers/" + owner.id() + "/kyc", ownerToken), 403, "ACCESS_DENIED");
        assertApiError(get("/api/customers/me/kyc", null), 401, "AUTHENTICATION_FAILED");
        assertApiError(get("/api/customers/999999999/kyc", adminToken), 404, "RESOURCE_NOT_FOUND");

        Account locked = account("kyc-locked-target", Role.CUSTOMER, CustomerStatus.LOCKED, KycStatus.NONE);
        assertKycStatus(adminToken, locked, "NONE");
        Account becameLocked = account("kyc-becomes-locked", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String oldToken = login(becameLocked);
        jdbc.update("update customers set status='LOCKED' where id=?", becameLocked.id());
        assertApiError(get("/api/customers/me/kyc", oldToken), 401, "INVALID_TOKEN");
        System.out.println("P06_CURRENT_KYC precedence=VERIFIED>PENDING>REJECTED>NONE identityOnly=true readonly=true lockedOwnerAdmin=true");
    }

    @Test
    void currentKycExpiryChangesAtNextClockDayWithoutMutatingSnapshotOrDocument() throws Exception {
        Account owner = account("kyc-boundary", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        LocalDate today = LocalDate.now(TEST_CLOCK);
        SeededDocument expiring = seedDocument(owner, UserDocumentType.PASSPORT, unique("BOUNDARY"),
                null, null, null, null, today, null, false, false, DocumentVerifyStatus.APPROVED);
        Map<String, Object> beforeCustomer = customerSnapshot(owner.id());
        Map<String, Object> beforeDoc = documentAudit(expiring.id());

        HttpResponse<String> todayResponse = get("/api/customers/me/kyc", login(owner));
        assertApiSuccess(todayResponse, 200);
        assertThat(mapper.readTree(todayResponse.body()).path("data").path("kycStatus").asText()).isEqualTo("VERIFIED");
        TEST_CLOCK.set(today.plusDays(1).atStartOfDay(ZONE).toInstant().plusSeconds(1));
        HttpResponse<String> tomorrowResponse = get("/api/customers/me/kyc", login(owner));
        assertApiSuccess(tomorrowResponse, 200);
        JsonNode tomorrow = mapper.readTree(tomorrowResponse.body()).path("data");
        assertThat(tomorrow.path("kycStatus").asText()).isEqualTo("NONE");
        assertThat(tomorrow.path("evaluatedOn").asText()).isEqualTo(today.plusDays(1).toString());
        assertThat(documentAudit(expiring.id())).isEqualTo(beforeDoc);
        assertThat(customerSnapshot(owner.id())).isEqualTo(beforeCustomer);
        System.out.println("P06_CLOCK_EXPIRY today=VERIFIED nextDay=NONE mutation=false snapshotUnchanged=true");
    }

    @Test
    void uniqueApprovedConstraintIsAuthorityForSameOwnerAndCrossOwnerConflicts() throws Exception {
        Account admin = account("unique-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("unique-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account ownerTwo = account("unique-owner-two", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(admin);
        LocalDate today = LocalDate.now(TEST_CLOCK);

        String sameNumber = unique("SAME_NUMBER");
        SeededDocument sameA = seedComplete(owner, sameNumber);
        SeededDocument sameB = seedComplete(owner, sameNumber);
        doReturn(java.util.Optional.empty()).when(documents).findFirstByDocTypeAndDocNumberAndVerifyStatus(
                any(UserDocumentType.class), anyString(), eq(DocumentVerifyStatus.APPROVED));
        HttpResponse<String> sameWinner = patch(reviewPath(sameA.id()), token, "{\"verifyStatus\":\"APPROVED\"}");
        assertApiSuccess(sameWinner, 200);
        assertReviewFailureWithDiagnostic(sameB, token, 409, ErrorCode.APPROVED_DOCUMENT_CONFLICT,
                "approved-document-unique-conflict", "DataIntegrityViolationException", admin, owner,
                sameNumber, PRIVATE_ROOT.toString(), sameB.front());
        assertThat(jdbc.queryForObject("select verify_status from user_documents where id=?", String.class, sameB.id()))
                .isEqualTo("PENDING");

        Account crossOwnerOne = account("unique-cross-owner-one", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String crossNumber = unique("CROSS_OWNER");
        SeededDocument crossA = seedComplete(crossOwnerOne, crossNumber);
        SeededDocument crossB = seedComplete(ownerTwo, crossNumber);
        CountDownLatch start = new CountDownLatch(1);
        try (SafeLogCapture logs = new SafeLogCapture(); var executor = Executors.newFixedThreadPool(2)) {
            CompletableFuture<HttpResponse<String>> first = CompletableFuture.supplyAsync(() -> awaitAndPatch(start, crossA.id(), token), executor);
            CompletableFuture<HttpResponse<String>> second = CompletableFuture.supplyAsync(() -> awaitAndPatch(start, crossB.id(), token), executor);
            start.countDown();
            HttpResponse<String> firstResponse = first.get(18, TimeUnit.SECONDS);
            HttpResponse<String> secondResponse = second.get(18, TimeUnit.SECONDS);
            List<Integer> statuses = new ArrayList<>(List.of(firstResponse.statusCode(), secondResponse.statusCode()));
            statuses.sort(Integer::compareTo);
            assertThat(statuses).containsExactly(200, 409);
            HttpResponse<String> loser = firstResponse.statusCode() == 409 ? firstResponse : secondResponse;
            assertThat(mapper.readTree(loser.body()).path("code").asText()).isEqualTo("APPROVED_DOCUMENT_CONFLICT");
            SeededDocument loserDocument = firstResponse.statusCode() == 409 ? crossA : crossB;
            Account loserOwner = firstResponse.statusCode() == 409 ? crossOwnerOne : ownerTwo;
            String traceId = loser.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
            assertReviewFailureEvent(logs, traceId, ErrorCode.APPROVED_DOCUMENT_CONFLICT,
                    "approved-document-unique-conflict", "DataIntegrityViolationException", admin,
                    loserOwner, loserDocument, crossNumber,
                    loserDocument.front(), PRIVATE_ROOT.toString());
        }
        assertThat(jdbc.queryForObject("select count(*) from user_documents where doc_type='CITIZEN_ID' and doc_number=? and verify_status='APPROVED'",
                Integer.class, crossNumber)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from user_documents where doc_type='CITIZEN_ID' and doc_number=? and verify_status='PENDING'",
                Integer.class, crossNumber)).isEqualTo(1);
        Long losingOwnerId = jdbc.queryForObject("select customer_id from user_documents where doc_type='CITIZEN_ID' and doc_number=? and verify_status='PENDING'",
                Long.class, crossNumber);
        assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, losingOwnerId))
                .isEqualTo("NONE");
        System.out.println("P06_UNIQUE_23505 actualFlushConstraint=true sameOwner=409 crossOwnerRace=one200_one409 loserKycNotPromoted=true");
    }

    @Test
    void concurrentReviewsOfOnePendingDocumentProduceOneWinnerAndOneTerminalConflict() throws Exception {
        Account firstAdmin = account("same-doc-admin-a", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account secondAdmin = account("same-doc-admin-b", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("same-doc-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String firstToken = login(firstAdmin);
        String secondToken = login(secondAdmin);
        SeededDocument document = seedComplete(owner, unique("SAME_DOC_RACE"));
        Set<String> filesBefore = fileNames();
        CountDownLatch start = new CountDownLatch(1);
        try (SafeLogCapture logs = new SafeLogCapture(); var executor = Executors.newFixedThreadPool(2)) {
            CompletableFuture<HttpResponse<String>> approve = CompletableFuture.supplyAsync(
                    () -> awaitPatch(start, reviewPath(document.id()), firstToken, "{\"verifyStatus\":\"APPROVED\"}"), executor);
            CompletableFuture<HttpResponse<String>> reject = CompletableFuture.supplyAsync(
                    () -> awaitPatch(start, reviewPath(document.id()), secondToken,
                            "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"concurrent decision\"}"), executor);
            start.countDown();
            HttpResponse<String> a = approve.get(18, TimeUnit.SECONDS);
            HttpResponse<String> b = reject.get(18, TimeUnit.SECONDS);
            assertThat(List.of(a.statusCode(), b.statusCode())).containsExactlyInAnyOrder(200, 409);
            HttpResponse<String> winner = a.statusCode() == 200 ? a : b;
            HttpResponse<String> loser = a.statusCode() == 409 ? a : b;
            assertApiError(loser, 409, "DOCUMENT_ALREADY_REVIEWED");
            assertApiSuccess(winner, 200);
            assertThat(jdbc.queryForObject("select count(*) from user_documents where id=? and verify_status in ('APPROVED','REJECTED')",
                    Integer.class, document.id())).isEqualTo(1);
            assertThat(fileNames()).isEqualTo(filesBefore);
            String status = mapper.readTree(winner.body()).path("data").path("document").path("verifyStatus").asText();
            String expectedKyc = status.equals("APPROVED") ? "VERIFIED" : "REJECTED";
            assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id())).isEqualTo(expectedKyc);
            assertThat(logs.rendered()).contains("action=document-review").doesNotContain("concurrent decision", owner.email());
            assertThat(logs.events().stream().filter(event -> event.getFormattedMessage().contains("action=document-review")).count())
                    .isEqualTo(1);
        }
        System.out.println("P06_REVIEW_RACE sameDocument=one200_one409 successLog=1 lostUpdate=false");
    }

    @Test
    void actorLockedAfterAuthenticationIsRejectedAfterGlobalLockRecheck() throws Exception {
        Account reviewer = account("stale-review-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account otherAdmin = account("lock-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("lock-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String reviewerToken = login(reviewer);
        String otherToken = login(otherAdmin);
        SeededDocument document = seedComplete(owner, unique("ACTOR_LOCK"));
        Set<String> filesBefore = fileNames();
        CountDownLatch reviewBeforeAdvisory = new CountDownLatch(1);
        CountDownLatch releaseReview = new CountDownLatch(1);
        AtomicInteger calls = new AtomicInteger();
        doAnswer(invocation -> {
            if (calls.incrementAndGet() == 1) {
                reviewBeforeAdvisory.countDown();
                if (!releaseReview.await(8, TimeUnit.SECONDS)) throw new IllegalStateException("P06 review barrier timed out");
            }
            return invocation.callRealMethod();
        }).when(statusLock).acquire();
        try (var executor = Executors.newSingleThreadExecutor()) {
            CompletableFuture<HttpResponse<String>> review = CompletableFuture.supplyAsync(
                    () -> patchUnchecked(reviewPath(document.id()), reviewerToken, "{\"verifyStatus\":\"APPROVED\"}"), executor);
            assertThat(reviewBeforeAdvisory.await(8, TimeUnit.SECONDS)).isTrue();
            HttpResponse<String> lock = patch("/api/customers/" + reviewer.id() + "/status", otherToken,
                    "{\"status\":\"LOCKED\",\"reason\":\"P06 actor lock test\"}");
            assertApiSuccess(lock, 200);
            releaseReview.countDown();
            assertApiError(review.get(12, TimeUnit.SECONDS), 401, "INVALID_TOKEN");
        } finally {
            releaseReview.countDown();
        }
        assertThat(documentAudit(document.id()).get("verify_status")).isEqualTo("PENDING");
        assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id())).isEqualTo("NONE");
        assertThat(fileNames()).isEqualTo(filesBefore);
        System.out.println("P06_ACTOR_RECHECK lockedAfterAuthentication=401 documentAndKycUnchanged=true");
    }

    @Test
    void ownerRowLockTimeoutReturnsTraced503RollsBackAndRetryCanSucceed() throws Exception {
        Account admin = account("lock-timeout-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("lock-timeout-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(admin);
        SeededDocument document = seedComplete(owner, unique("ROW_LOCK"));
        Map<String, Object> before = documentAudit(document.id());
        Set<String> filesBefore = fileNames();
        try (Connection blocker = dataSource.getConnection()) {
            blocker.setAutoCommit(false);
            try (PreparedStatement query = blocker.prepareStatement("select id from customers where id=? for update")) {
                query.setLong(1, owner.id());
                query.executeQuery().close();
            }
            HttpResponse<String> blocked = patch(reviewPath(document.id()), token, "{\"verifyStatus\":\"APPROVED\"}");
            assertApiError(blocked, 503, "DEPENDENCY_UNAVAILABLE");
            assertThat(documentAudit(document.id())).isEqualTo(before);
            assertThat(fileNames()).isEqualTo(filesBefore);
            blocker.rollback();
        }
        HttpResponse<String> retry = patch(reviewPath(document.id()), token, "{\"verifyStatus\":\"APPROVED\"}");
        assertApiSuccess(retry, 200);
        assertThat(jdbc.queryForObject("select verify_status from user_documents where id=?", String.class, document.id()))
                .isEqualTo("APPROVED");
        System.out.println("P06_POSTGRES_OWNER_ROW_LOCK timeout=503 traceMatched=true rollbackClean=true releaseRetry=200");
    }

    @Test
    void reviewRollbackAfterDocumentAndKycFlushKeepsBothRowsAndFilesAndEmitsNoSuccessLog() throws Exception {
        Account admin = account("rollback-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("rollback-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(admin);
        SeededDocument document = seedComplete(owner, unique("ROLLBACK"));
        Map<String, Object> beforeDocument = documentAudit(document.id());
        Map<String, Object> beforeOwner = customerSnapshot(owner.id());
        Set<String> filesBefore = fileNames();
        doAnswer(invocation -> {
            invocation.callRealMethod();
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void beforeCommit(boolean readOnly) {
                    throw new IllegalStateException("P06_AFTER_KYC_FLUSH_SENTINEL");
                }
            });
            return null;
        }).when(reviewLogger).record(anyLong(), anyLong(), anyLong(), any(), any(), any(), any(), any(), anyBoolean());

        try (SafeLogCapture logs = new SafeLogCapture()) {
            HttpResponse<String> response = patch(reviewPath(document.id()), token, "{\"verifyStatus\":\"APPROVED\"}");
            assertApiError(response, 500, "INTERNAL_ERROR");
            assertThat(response.body()).doesNotContain("P06_AFTER_KYC_FLUSH_SENTINEL");
            assertThat(logs.rendered()).doesNotContain("P06_AFTER_KYC_FLUSH_SENTINEL", owner.email(), PRIVATE_ROOT.toString());
            assertThat(logs.events()).noneMatch(event -> event.getFormattedMessage().contains("Document review committed"));
        }
        assertThat(documentAudit(document.id())).isEqualTo(beforeDocument);
        assertThat(customerSnapshot(owner.id())).isEqualTo(beforeOwner);
        assertThat(fileNames()).isEqualTo(filesBefore);
        System.out.println("P06_ROLLBACK afterDocumentAndKycFlush=true documentRollback=true customerRollback=true noSuccessLog=true filesUnchanged=true");
    }

    @Test
    void reviewAndNewSubmissionOverlapOnlyDuringPreTransactionFileStage() throws Exception {
        Account admin = account("submit-review-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("submit-review-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String adminToken = login(admin);
        String ownerToken = login(owner);
        SeededDocument existing = seedComplete(owner, unique("EXISTING"));
        CountDownLatch fileWritten = new CountDownLatch(1);
        CountDownLatch allowSubmission = new CountDownLatch(1);
        AtomicBoolean firstStore = new AtomicBoolean(true);
        doAnswer(invocation -> {
            PrivateDocumentReceipt receipt = (PrivateDocumentReceipt) invocation.callRealMethod();
            if (firstStore.compareAndSet(true, false)) {
                fileWritten.countDown();
                if (!allowSubmission.await(8, TimeUnit.SECONDS)) throw new IllegalStateException("P06 submission barrier timed out");
            }
            return receipt;
        }).when(storage).store(any(CanonicalDocumentImage.class));

        try (var executor = Executors.newSingleThreadExecutor()) {
            List<Part> submissionParts = newSubmissionParts(unique("CONCURRENT_SUBMISSION"));
            CompletableFuture<HttpResponse<byte[]>> upload = CompletableFuture.supplyAsync(
                    () -> submitUnchecked(ownerToken, submissionParts), executor);
            assertThat(fileWritten.await(8, TimeUnit.SECONDS)).isTrue();
            HttpResponse<String> reviewed = patch(reviewPath(existing.id()), adminToken,
                    "{\"verifyStatus\":\"APPROVED\"}");
            assertApiSuccess(reviewed, 200);
            assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id()))
                    .isEqualTo("VERIFIED");
            allowSubmission.countDown();
            HttpResponse<byte[]> submitted = upload.get(15, TimeUnit.SECONDS);
            assertApiSuccess(submitted, 201);
        } finally {
            allowSubmission.countDown();
        }
        assertThat(jdbc.queryForObject("select count(*) from user_documents where customer_id=?", Integer.class, owner.id()))
                .isEqualTo(2);
        assertThat(jdbc.queryForObject("select count(*) from user_documents where customer_id=? and verify_status='PENDING'",
                Integer.class, owner.id())).isEqualTo(1);
        assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id())).isEqualTo("VERIFIED");
        HttpResponse<String> current = get("/api/customers/me/kyc", ownerToken);
        assertApiSuccess(current, 200);
        assertThat(mapper.readTree(current.body()).path("data").path("kycStatus").asText()).isEqualTo("VERIFIED");
        System.out.println("P06_REVIEW_SUBMISSION preTransactionFileStageOverlap=true reviewCommitThenSubmit201 pendingPreserved=true snapshot=VERIFIED current=VERIFIED");
    }

    @Test
    void uploadTransactionOwnerLockBlocksReviewUntilPendingProofCommits() throws Exception {
        Account admin = account("db-contention-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("db-contention-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String adminToken = login(admin);
        String ownerToken = login(owner);
        String oldNumber = unique("CONTENTED_OLD");
        SeededDocument existing = seedComplete(owner, oldNumber);
        Map<String, Object> oldBefore = documentAudit(existing.id());
        Map<String, Object> ownerBefore = customerSnapshot(owner.id());
        Set<String> filesBefore = fileNames();
        byte[] oldFrontBytes = Files.readAllBytes(privatePath(existing.front()));
        String submittedNumber = unique("CONTENTED_NEW");
        String privateReason = "P06_R2_PRIVATE_REASON_SENTINEL";
        CountDownLatch uploadRowFlushed = new CountDownLatch(1);
        CountDownLatch allowUploadCommit = new CountDownLatch(1);
        CountDownLatch reviewTransactionPidCaptured = new CountDownLatch(1);
        AtomicBoolean holdUploadOnce = new AtomicBoolean(true);
        AtomicReference<Integer> holderPid = new AtomicReference<>();
        AtomicReference<Integer> waiterPid = new AtomicReference<>();
        List<Part> submissionParts = newSubmissionParts(submittedNumber);

        doAnswer(invocation -> {
            Integer localCount = jdbc.queryForObject(
                    "select count(*) from user_documents where customer_id=? and doc_number=? and verify_status='PENDING'",
                    Integer.class, owner.id(), submittedNumber);
            if (localCount != null && localCount == 1 && holdUploadOnce.compareAndSet(true, false)) {
                holderPid.set(jdbc.queryForObject("select pg_backend_pid()", Integer.class));
                uploadRowFlushed.countDown();
                if (!allowUploadCommit.await(8, TimeUnit.SECONDS)) {
                    throw new IllegalStateException("P06 upload transaction barrier timed out");
                }
            }
            return invocation.callRealMethod();
        }).when(transactionManager).commit(any(TransactionStatus.class));

        doAnswer(invocation -> {
            Object acquired = invocation.callRealMethod();
            waiterPid.set(jdbc.queryForObject("select pg_backend_pid()", Integer.class));
            reviewTransactionPidCaptured.countDown();
            return acquired;
        }).when(statusLock).acquire();

        try (SafeLogCapture logs = new SafeLogCapture(); var executor = Executors.newFixedThreadPool(2)) {
            CompletableFuture<HttpResponse<byte[]>> upload = CompletableFuture.supplyAsync(
                    () -> submitUnchecked(ownerToken, submissionParts), executor);
            CompletableFuture<HttpResponse<String>> review = null;
            try {
                assertThat(uploadRowFlushed.await(8, TimeUnit.SECONDS)).isTrue();
                assertThat(holderPid.get()).isNotNull();
                assertThat(jdbc.queryForObject(
                        "select count(*) from user_documents where customer_id=? and doc_number=?",
                        Integer.class, owner.id(), submittedNumber)).isZero();

                review = CompletableFuture.supplyAsync(() -> patchUnchecked(reviewPath(existing.id()), adminToken,
                        "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"" + privateReason + "\"}"), executor);
                assertThat(reviewTransactionPidCaptured.await(8, TimeUnit.SECONDS)).isTrue();
                assertThat(waiterPid.get()).isNotNull().isNotEqualTo(holderPid.get());
                long blockedMillis = awaitPostgresBlocking(waiterPid.get(), holderPid.get(), review, Duration.ofSeconds(3));
                assertThat(review.isDone()).isFalse();
                assertThat(jdbc.queryForObject(
                        "select count(*) from user_documents where customer_id=? and doc_number=?",
                        Integer.class, owner.id(), submittedNumber)).isZero();
                System.out.println("P06_DB_CONTENTION holderPid=" + holderPid.get() + " waiterPid=" + waiterPid.get()
                        + " pgBlockingPidsConfirmed=true waiterBlockedMillis=" + blockedMillis
                        + " uncommittedSubmissionInvisible=true reviewIncompleteBeforeRelease=true");

                allowUploadCommit.countDown();
                HttpResponse<byte[]> submitted = upload.get(15, TimeUnit.SECONDS);
                assertApiSuccess(submitted, 201);
                HttpResponse<String> reviewed = review.get(15, TimeUnit.SECONDS);
                assertApiSuccess(reviewed, 200);
                JsonNode reviewData = mapper.readTree(reviewed.body()).path("data");
                assertThat(reviewData.path("document").path("verifyStatus").asText()).isEqualTo("REJECTED");
                assertThat(reviewData.path("kycStatus").asText()).isEqualTo("PENDING");
                assertThat(reviewData.path("evaluatedOn").asText()).isEqualTo(LocalDate.now(TEST_CLOCK).toString());

                JsonNode submissionData = mapper.readTree(submitted.body()).path("data");
                long newDocumentId = submissionData.path("id").asLong();
                assertThat(newDocumentId).isPositive();
                Map<String, Object> afterOld = documentAudit(existing.id());
                assertThat(afterOld.get("verify_status")).isEqualTo("REJECTED");
                assertThat(afterOld.get("reject_reason")).isEqualTo(privateReason);
                assertThat(afterOld.get("verified_by")).isEqualTo(admin.id());
                assertThat(afterOld.get("verified_at")).isNotNull();
                assertThat(afterOld.get("created_at")).isEqualTo(oldBefore.get("created_at"));
                assertThat(jdbc.queryForObject("select count(*) from user_documents where id=? and customer_id=? "
                                + "and doc_type='CITIZEN_ID' and doc_number=? and verify_status='PENDING' "
                                + "and verified_by is null and verified_at is null and reject_reason is null",
                        Integer.class, newDocumentId, owner.id(), submittedNumber)).isEqualTo(1);
                assertThat(jdbc.queryForObject("select count(*) from user_documents where customer_id=? and doc_number=?",
                        Integer.class, owner.id(), submittedNumber)).isEqualTo(1);
                assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id()))
                        .isEqualTo("PENDING");
                Map<String, Object> ownerAfter = customerSnapshot(owner.id());
                assertThat(ownerAfter.get("kyc_status")).isEqualTo("PENDING");
                for (String unchanged : List.of("full_name", "email", "phone", "role", "status", "email_verified", "created_at")) {
                    assertThat(ownerAfter.get(unchanged)).as("owner field %s is unchanged", unchanged)
                            .isEqualTo(ownerBefore.get(unchanged));
                }

                Set<String> filesAfter = fileNames();
                assertThat(filesAfter).hasSize(filesBefore.size() + 1).containsAll(filesBefore);
                String newFront = jdbc.queryForObject("select front_image_url from user_documents where id=?", String.class, newDocumentId);
                Path newFrontPath = privatePath(newFront);
                assertThat(Files.isRegularFile(newFrontPath)).isTrue();
                HttpResponse<byte[]> existingDownload = download(existing.id(), "front", ownerToken);
                assertThat(existingDownload.statusCode()).isEqualTo(200);
                assertThat(existingDownload.body()).containsExactly(oldFrontBytes);
                HttpResponse<byte[]> newDownload = download(newDocumentId, "front", ownerToken);
                assertThat(newDownload.statusCode()).isEqualTo(200);
                assertThat(newDownload.body()).containsExactly(Files.readAllBytes(newFrontPath));
                assertThat(fileNames()).isEqualTo(filesAfter);

                HttpResponse<String> current = get("/api/customers/me/kyc", ownerToken);
                assertApiSuccess(current, 200);
                assertThat(mapper.readTree(current.body()).path("data").path("kycStatus").asText()).isEqualTo("PENDING");
                String reviewTrace = reviewed.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
                List<ILoggingEvent> committedReviewEvents = logs.events().stream()
                        .filter(event -> event.getFormattedMessage().contains("action=document-review "))
                        .filter(event -> event.getFormattedMessage().contains("traceId=" + reviewTrace))
                        .toList();
                assertThat(committedReviewEvents).hasSize(1);
                assertThat(committedReviewEvents.get(0).getFormattedMessage())
                        .contains("ownerId=" + owner.id(), "documentId=" + existing.id(),
                                "oldStatus=PENDING", "newStatus=REJECTED", "oldKyc=NONE", "newKyc=PENDING",
                                "reasonProvided=true");
                assertThat(logs.rendered()).doesNotContain(privateReason, submittedNumber, oldNumber,
                        owner.email(), owner.name(), PRIVATE_ROOT.toString(), existing.front(), existing.back(), newFront);
                System.out.println("P06_REVIEW_UPLOAD_DB_CONTENTION upload=201_PENDING review=200_REJECTED "
                        + "snapshot=PENDING current=PENDING oldCreatedAtPreserved=true metadataAuditFilesDownloads=true "
                        + "reviewAfterCommitLog=1 piiFree=true");
            } finally {
                allowUploadCommit.countDown();
                if (review != null && !review.isDone()) {
                    try { review.get(10, TimeUnit.SECONDS); } catch (Exception ignored) { }
                }
                if (!upload.isDone()) {
                    try { upload.get(10, TimeUnit.SECONDS); } catch (Exception ignored) { }
                }
            }
        }
    }

    @Test
    void lockedAdminTokenIsDeniedOnKycReadAndAdminCanReadLockedOwners() throws Exception {
        Account admin = account("kyc-access-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account locked = account("kyc-access-locked", Role.CUSTOMER, CustomerStatus.LOCKED, KycStatus.REJECTED);
        Account laterLocked = account("kyc-access-later", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String adminToken = login(admin);
        String laterToken = login(laterLocked);
        HttpResponse<String> lockedTarget = get("/api/customers/" + locked.id() + "/kyc", adminToken);
        assertApiSuccess(lockedTarget, 200);
        JsonNode data = mapper.readTree(lockedTarget.body()).path("data");
        assertThat(data.path("accountStatus").asText()).isEqualTo("LOCKED");
        assertThat(data.path("kycStatus").asText()).isEqualTo("NONE");
        jdbc.update("update customers set status='LOCKED' where id=?", laterLocked.id());
        assertApiError(get("/api/customers/me/kyc", laterToken), 401, "INVALID_TOKEN");
        System.out.println("P06_KYC_AUTH lockedActor=401 adminLockedTarget=200");
    }

    private void assertKycStatus(String token, Account account, String expected) throws Exception {
        HttpResponse<String> response = get("/api/customers/" + account.id() + "/kyc", token);
        assertApiSuccess(response, 200);
        assertThat(mapper.readTree(response.body()).path("data").path("kycStatus").asText()).isEqualTo(expected);
    }

    private void assertReviewFailureUnchanged(SeededDocument document, String token, int status, String code) throws Exception {
        Map<String, Object> before = documentAudit(document.id());
        Set<String> files = fileNames();
        HttpResponse<String> response = patch(reviewPath(document.id()), token, "{\"verifyStatus\":\"APPROVED\"}");
        assertApiError(response, status, code);
        assertThat(documentAudit(document.id())).isEqualTo(before);
        assertThat(fileNames()).isEqualTo(files);
    }

    private void assertReviewFailureWithDiagnostic(SeededDocument document, String token, int status,
            ErrorCode errorCode, String category, String exceptionType, Account actor, Account owner,
            String... privateSentinels)
            throws Exception {
        Map<String, Object> beforeDocument = documentAudit(document.id());
        Map<String, Object> beforeOwner = customerSnapshot(owner.id());
        Set<String> beforeFiles = fileNames();
        try (SafeLogCapture logs = new SafeLogCapture()) {
            HttpResponse<String> response = patch(reviewPath(document.id()), token,
                    "{\"verifyStatus\":\"APPROVED\"}");
            assertApiError(response, status, errorCode.name());
            String traceId = response.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
            List<ILoggingEvent> matching = logs.events().stream()
                    .filter(event -> event.getFormattedMessage().contains("action=document-review-failure"))
                    .filter(event -> event.getFormattedMessage().contains("traceId=" + traceId))
                    .toList();
            assertThat(matching).hasSize(1);
            ILoggingEvent event = matching.get(0);
            assertThat(event.getFormattedMessage()).contains("category=" + category,
                    "errorCode=" + errorCode.name(), "actorId=" + actor.id(), "ownerId=" + owner.id(),
                    "documentId=" + document.id(), "exceptionType=" + exceptionType);
            if (errorCode == ErrorCode.DEPENDENCY_UNAVAILABLE) {
                assertThat(event.getLevel()).isEqualTo(Level.WARN);
            } else if (errorCode == ErrorCode.APPROVED_DOCUMENT_CONFLICT) {
                assertThat(event.getLevel()).isEqualTo(Level.WARN);
                assertThat(event.getFormattedMessage()).contains("constraint=uq_user_doc_approved").doesNotContain("23505");
            } else {
                assertThat(event.getLevel()).isEqualTo(Level.ERROR);
            }
            assertThat(event.getThrowableProxy()).isNull();
            assertThat(response.body()).doesNotContain(privateSentinels);
            assertThat(logs.rendered()).doesNotContain(privateSentinels);
        }
        assertThat(documentAudit(document.id())).isEqualTo(beforeDocument);
        assertThat(customerSnapshot(owner.id())).isEqualTo(beforeOwner);
        assertThat(fileNames()).isEqualTo(beforeFiles);
    }

    private void assertReviewFailureEvent(SafeLogCapture logs, String traceId, ErrorCode errorCode,
            String category, String exceptionType, Account actor, Account owner, SeededDocument document,
            String... expectedSafeAndPrivateValues) {
        List<ILoggingEvent> matching = logs.events().stream()
                .filter(event -> event.getFormattedMessage().contains("action=document-review-failure"))
                .filter(event -> event.getFormattedMessage().contains("traceId=" + traceId))
                .toList();
        assertThat(matching).hasSize(1);
        ILoggingEvent event = matching.get(0);
        assertThat(event.getFormattedMessage()).contains("category=" + category,
                "errorCode=" + errorCode.name(), "actorId=" + actor.id(), "ownerId=" + owner.id(),
                "documentId=" + document.id(), "exceptionType=" + exceptionType);
        assertThat(event.getLevel()).isEqualTo(errorCode == ErrorCode.DEPENDENCY_UNAVAILABLE
                || errorCode == ErrorCode.APPROVED_DOCUMENT_CONFLICT ? Level.WARN : Level.ERROR);
        if (errorCode == ErrorCode.APPROVED_DOCUMENT_CONFLICT) {
            assertThat(event.getFormattedMessage()).contains("constraint=uq_user_doc_approved").doesNotContain("23505");
        }
        assertThat(event.getThrowableProxy()).isNull();
        assertThat(logs.rendered()).doesNotContain(expectedSafeAndPrivateValues);
    }

    private SeededDocument seedComplete(Account owner, String number) throws Exception {
        LocalDate today = LocalDate.now(TEST_CLOCK);
        return seedDocument(owner, UserDocumentType.CITIZEN_ID, number, "Synthetic Identity", LocalDate.of(1991, 2, 3),
                "Synthetic City", today.minusYears(8), null, null, true, true);
    }

    private SeededDocument seedDocument(Account owner, UserDocumentType type, String number,
            String fullName, LocalDate birth, String issuePlace, LocalDate issueDate, LocalDate expiresAt,
            String licenseClass, boolean storeFront, boolean storeBack) throws Exception {
        return seedDocument(owner, type, number, fullName, birth, issuePlace, issueDate, expiresAt,
                licenseClass, storeFront, storeBack, DocumentVerifyStatus.PENDING);
    }

    private SeededDocument seedDocument(Account owner, UserDocumentType type, String number,
            String fullName, LocalDate birth, String issuePlace, LocalDate issueDate, LocalDate expiresAt,
            String licenseClass, boolean storeFront, boolean storeBack, DocumentVerifyStatus status) throws Exception {
        String front = storeFront ? storage.store(new CanonicalDocumentImage(png(), DocumentImageFormat.PNG)).locator()
                : locator();
        String back = storeBack ? storage.store(new CanonicalDocumentImage(png(), DocumentImageFormat.PNG)).locator()
                : (type == UserDocumentType.CITIZEN_ID || type == UserDocumentType.DRIVER_LICENSE ? null : null);
        Long id = jdbc.queryForObject("""
                insert into user_documents(customer_id,doc_type,doc_number,full_name_on_doc,date_of_birth_on_doc,
                    issue_place,issue_date,expires_at,license_class,front_image_url,back_image_url,verify_status,
                    reject_reason,verified_by,verified_at)
                values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) returning id
                """, Long.class, owner.id(), type.name(), number, fullName, birth, issuePlace, issueDate, expiresAt,
                licenseClass, front, back, status.name(), status == DocumentVerifyStatus.REJECTED ? "synthetic rejection" : null,
                null, null);
        return new SeededDocument(id, owner, type, number, front, back);
    }

    private Account account(String label, Role role, CustomerStatus status, KycStatus kyc) {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String email = label + "-" + suffix + "@example.test";
        String phone = "6" + suffix.substring(0, 19);
        String name = "P06 " + label;
        Long id = jdbc.queryForObject("insert into customers(full_name,email,phone,password_hash,email_verified,kyc_status,role,status) "
                + "values (?,?,?,?,false,?,?,?) returning id", Long.class,
                name, email, phone, passwordEncoder.encode(PASSWORD), kyc.name(), role.name(), status.name());
        return new Account(id, email, name);
    }

    private String login(Account account) throws Exception {
        HttpResponse<String> response = send("POST", "/api/auth/login", null,
                "{\"email\":\"" + account.email() + "\",\"password\":\"" + PASSWORD + "\"}");
        assertApiSuccess(response, 200);
        return mapper.readTree(response.body()).path("data").path("accessToken").asText();
    }

    private HttpResponse<String> get(String path, String token) throws Exception {
        return request("GET", path, token, null);
    }

    private HttpResponse<String> patch(String path, String token, String body) throws Exception {
        return request("PATCH", path, token, body);
    }

    private HttpResponse<String> send(String method, String path, String token, String body) throws Exception {
        return request(method, path, token, body);
    }

    private HttpResponse<String> request(String method, String path, String token, String body) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path)).timeout(Duration.ofSeconds(20))
                .header("Accept", "application/json");
        if (token != null) request.header("Authorization", "Bearer " + token);
        if (body == null) request.method(method, HttpRequest.BodyPublishers.noBody());
        else request.header("Content-Type", "application/json")
                .method(method, HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        return CLIENT.send(request.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private HttpResponse<byte[]> submit(String token, List<Part> parts) throws Exception {
        String boundary = "P06Boundary" + UUID.randomUUID().toString().replace("-", "");
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        for (Part part : parts) {
            body.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + part.name() + "\"")
                    .getBytes(StandardCharsets.US_ASCII));
            if (part.filename() != null) body.write(("; filename=\"" + part.filename() + "\"").getBytes(StandardCharsets.US_ASCII));
            body.write("\r\n".getBytes(StandardCharsets.US_ASCII));
            if (part.mediaType() != null) body.write(("Content-Type: " + part.mediaType() + "\r\n").getBytes(StandardCharsets.US_ASCII));
            body.write("\r\n".getBytes(StandardCharsets.US_ASCII));
            body.write(part.bytes());
            body.write("\r\n".getBytes(StandardCharsets.US_ASCII));
        }
        body.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.US_ASCII));
        HttpRequest request = HttpRequest.newBuilder(uri("/api/user-documents")).timeout(Duration.ofSeconds(20))
                .header("Authorization", "Bearer " + token).header("Accept", "application/json")
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray())).build();
        return CLIENT.send(request, HttpResponse.BodyHandlers.ofByteArray());
    }

    private HttpResponse<byte[]> download(long documentId, String side, String token) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri("/api/user-documents/" + documentId + "/files/" + side))
                .timeout(Duration.ofSeconds(20)).header("Authorization", "Bearer " + token)
                .header("Accept", "application/octet-stream").GET().build();
        return CLIENT.send(request, HttpResponse.BodyHandlers.ofByteArray());
    }

    private long awaitPostgresBlocking(int waiterPid, int holderPid,
            CompletableFuture<?> review, Duration timeout) throws InterruptedException {
        long started = System.nanoTime();
        long deadline = started + timeout.toNanos();
        do {
            if (review.isDone()) {
                throw new AssertionError("Review HTTP request completed before PostgreSQL reported its upload blocker");
            }
            Boolean blocked = jdbc.queryForObject(
                    "select ? = any(pg_blocking_pids(?::integer))", Boolean.class, holderPid, waiterPid);
            if (Boolean.TRUE.equals(blocked)) {
                return TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started);
            }
            TimeUnit.MILLISECONDS.sleep(20);
        } while (System.nanoTime() < deadline);
        throw new AssertionError("PostgreSQL did not report the upload transaction as the review lock blocker within "
                + timeout.toMillis() + "ms");
    }

    private List<Part> newSubmissionParts(String number) throws Exception {
        return List.of(new Part("docType", null, null, "CITIZEN_ID".getBytes(StandardCharsets.UTF_8)),
                new Part("docNumber", null, null, number.getBytes(StandardCharsets.UTF_8)),
                new Part("frontImage", "front.png", "image/png", png()));
    }

    private HttpResponse<byte[]> submitUnchecked(String token, List<Part> parts) {
        try { return submit(token, parts); }
        catch (Exception exception) { throw new IllegalStateException("P06 synthetic submission failed", exception); }
    }

    private HttpResponse<String> patchUnchecked(String path, String token, String body) {
        try { return patch(path, token, body); }
        catch (Exception exception) { throw new IllegalStateException("P06 synthetic review failed", exception); }
    }

    private HttpResponse<String> awaitAndPatch(CountDownLatch start, long id, String token) {
        return awaitPatch(start, reviewPath(id), token, "{\"verifyStatus\":\"APPROVED\"}");
    }

    private HttpResponse<String> awaitPatch(CountDownLatch start, String path, String token, String body) {
        try {
            if (!start.await(8, TimeUnit.SECONDS)) throw new IllegalStateException("P06 start barrier timed out");
            return patch(path, token, body);
        } catch (Exception exception) { throw new IllegalStateException("P06 concurrent HTTP request failed", exception); }
    }

    private void assertApiSuccess(HttpResponse<?> response, int status) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        String body = response.body() instanceof byte[] bytes ? new String(bytes, StandardCharsets.UTF_8) : (String) response.body();
        JsonNode root = mapper.readTree(body);
        assertThat(root.path("success").asBoolean()).isTrue();
        String trace = response.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
        assertThat(root.path("traceId").asText()).isEqualTo(trace);
    }

    private void assertApiError(HttpResponse<String> response, int status, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode root = mapper.readTree(response.body());
        assertThat(root.path("success").asBoolean()).isFalse();
        assertThat(root.path("code").asText()).isEqualTo(code);
        assertThat(root.path("data").isNull()).isTrue();
        String trace = response.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
        assertThat(root.path("traceId").asText()).isEqualTo(trace);
        assertThat(response.body()).doesNotContain(PRIVATE_ROOT.toString());
    }

    private Map<String, Object> documentAudit(long id) {
        return jdbc.queryForMap("select verify_status,reject_reason,verified_by,verified_at,created_at,updated_at "
                + "from user_documents where id=?", id);
    }

    private Map<String, Object> customerSnapshot(long id) {
        return jdbc.queryForMap("select full_name,email,phone,role,status,email_verified,kyc_status,created_at,updated_at "
                + "from customers where id=?", id);
    }

    private Set<String> fileNames() throws Exception {
        try (var paths = Files.list(PRIVATE_ROOT)) {
            return paths.map(path -> path.getFileName().toString()).collect(java.util.stream.Collectors.toSet());
        }
    }

    private Path privatePath(String locator) {
        assertThat(locator).startsWith("private-local:");
        Path path = PRIVATE_ROOT.resolve(locator.substring("private-local:".length())).normalize();
        assertThat(path.startsWith(PRIVATE_ROOT)).isTrue();
        return path;
    }

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + environment.getRequiredProperty("local.server.port", Integer.class) + path);
    }

    private String reviewPath(long id) { return "/api/user-documents/" + id + "/review"; }
    private String unique(String prefix) { return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 20); }
    private String uniqueMarker() { return "P06_NO_DOC_DATA"; }
    private String locator() { return "private-local:" + UUID.randomUUID() + ".png"; }

    private static byte[] png() throws Exception {
        BufferedImage image = new BufferedImage(8, 5, BufferedImage.TYPE_INT_RGB);
        image.setRGB(3, 2, 0x6432a0);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        assertThat(ImageIO.write(image, "png", output)).isTrue();
        return output.toByteArray();
    }

    private static Path createPrivateRoot() {
        try {
            Path temp = Path.of(System.getProperty("java.io.tmpdir")).toRealPath();
            Path repository = Path.of(System.getProperty("user.dir")).toRealPath();
            Path root = Files.createTempDirectory(temp, "sba301-p06-review-").toRealPath();
            if (!root.startsWith(temp) || root.startsWith(repository)) throw new IllegalStateException("Unsafe P06 test root");
            return root;
        } catch (Exception exception) { throw new ExceptionInInitializerError(exception); }
    }

    private record Account(long id, String email, String name) { }
    private record SeededDocument(long id, Account owner, UserDocumentType type, String number, String front, String back) { }
    private record Part(String name, String filename, String mediaType, byte[] bytes) { }

    private static final class SafeLogCapture extends AppenderBase<ILoggingEvent> implements AutoCloseable {
        private final Logger root;
        private final List<ILoggingEvent> events = new ArrayList<>();
        SafeLogCapture() {
            LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
            setContext(context);
            setName("p06-safe-log-" + UUID.randomUUID());
            root = context.getLogger(Logger.ROOT_LOGGER_NAME);
            start();
            root.addAppender(this);
        }
        @Override protected void append(ILoggingEvent event) { events.add(event); }
        List<ILoggingEvent> events() { return List.copyOf(events); }
        String rendered() {
            return events.stream().map(event -> {
                String throwable = event.getThrowableProxy() == null ? ""
                        : ThrowableProxyUtil.asString(event.getThrowableProxy());
                return event.getFormattedMessage() + "\n" + throwable;
            }).collect(java.util.stream.Collectors.joining("\n"));
        }
        @Override public void close() { root.detachAppender(this); stop(); }
    }
}
