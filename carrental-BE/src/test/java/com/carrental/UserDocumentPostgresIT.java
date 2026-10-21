package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;

import com.carrental.dto.request.document.UserDocumentSubmissionCommand;
import com.carrental.dto.request.document.UserDocumentSubmissionRequest;
import com.carrental.entity.UserDocument;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.security.CurrentAccount;
import com.carrental.service.UserDocumentService;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.storage.CanonicalDocumentImage;
import com.carrental.storage.DocumentImageFormat;
import com.carrental.storage.PrivateDocumentStorage;
import com.carrental.storage.PrivateDocumentReceipt;
import com.carrental.storage.UploadedDocumentImage;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import javax.sql.DataSource;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.IThrowableProxy;
import ch.qos.logback.core.AppenderBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.json.JsonMapper;

/** Real multipart HTTP, PostgreSQL and local filesystem checks with synthetic image data only. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1,classpath:db/migration/it-support",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false",
        "spring.datasource.hikari.connection-init-sql=SET lock_timeout TO '300ms'",
        "server.tomcat.max-http-form-post-size=12MB",
        "server.tomcat.max-swallow-size=-1"
})
class UserDocumentPostgresIT {

    private static final String PASSWORD = "P05 test password only";
    private static final HttpClient CLIENT = HttpClient.newHttpClient();
    private static final Path PRIVATE_ROOT = createPrivateRoot();
    @Container private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:15.13-alpine");

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
    @Autowired private jakarta.persistence.EntityManager entityManager;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JsonMapper mapper;
    @Autowired private UserDocumentService service;
    @MockitoSpyBean private PrivateDocumentStorage storage;
    @MockitoSpyBean private UserDocumentRepository documents;

    @AfterEach
    void clearSecurityAndSpies() {
        SecurityContextHolder.clearContext();
        reset(storage);
        reset(documents);
    }

    @AfterAll
    static void removeOnlyTheResolvedTemporaryRoot() throws Exception {
        Path temp = Path.of(System.getProperty("java.io.tmpdir")).toRealPath();
        Path resolved = PRIVATE_ROOT.toRealPath();
        if (!resolved.startsWith(temp) || resolved.equals(temp) || !resolved.getFileName().toString().startsWith("sba301-p05-private-")) {
            throw new IllegalStateException("Refusing to remove an unexpected document test root");
        }
        try (var paths = Files.list(resolved)) {
            for (Path path : paths.toList()) {
                if (Files.isRegularFile(path) && !Files.isSymbolicLink(path)) Files.delete(path);
            }
        }
        Files.deleteIfExists(resolved);
    }

    @Test
    void enabledExternalPrivateRootAndPostgresApplicationServeHealthWithMatchingTrace() throws Exception {
        int port = environment.getRequiredProperty("local.server.port", Integer.class);
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/api/health")).GET().build();
        HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        String headerTrace = response.headers().firstValue("X-Request-ID").orElseThrow();
        var body = mapper.readTree(response.body());

        assertThat(Files.isDirectory(PRIVATE_ROOT)).isTrue();
        assertThat(PRIVATE_ROOT.toRealPath()).startsWith(Path.of(System.getProperty("java.io.tmpdir")).toRealPath());
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.headers().firstValue("Content-Type").orElse("")).contains("application/json");
        assertThat(body.path("success").asBoolean()).isTrue();
        assertThat(body.path("data").path("status").asText()).isEqualTo("UP");
        assertThat(body.path("traceId").asText()).isEqualTo(headerTrace);
        System.out.println("P05_EXTERNAL_ROOT_HEALTH_HTTP " + response.statusCode() + " bodyTraceMatchesHeader="
                + body.path("traceId").asText().equals(headerTrace) + " storageRoot=temporary-external");
    }

    @Test
    void realMultipartSubmissionIsPendingPrivateAndOwnerScopedForDetailAndBinaryDownload() throws Exception {
        Account owner = account("document-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        long beforeFiles = fileCount();
        byte[] source = syntheticPng();
        HttpResponse<byte[]> submitted = submit(token, fullParts("Ab00123456789", source, source));

        assertThat(submitted.statusCode()).isEqualTo(201);
        String trace = submitted.headers().firstValue("X-Request-ID").orElseThrow();
        String body = new String(submitted.body(), StandardCharsets.UTF_8);
        assertThat(body).contains("\"success\":true", "\"verifyStatus\":\"PENDING\"", "\"docNumber\":\"Ab00123456789\"",
                "\"hasFrontImage\":true", "\"hasBackImage\":true", "\"traceId\":\"" + trace + "\"")
                .doesNotContain("private-local:", PRIVATE_ROOT.toString(), "frontImageUrl", "backImageUrl");
        long id = mapper.readTree(body).path("data").path("id").asLong();
        assertThat(submitted.headers().firstValue("Location").orElseThrow()).isEqualTo("/api/user-documents/" + id);
        assertThat(submitted.headers().firstValue("Cache-Control").orElse("")).contains("no-store");

        Map<String, Object> row = jdbc.queryForMap("select customer_id, doc_type, doc_number, verify_status, reject_reason, verified_by, verified_at, front_image_url, back_image_url from user_documents where id=?", id);
        assertThat(row).containsEntry("customer_id", owner.id()).containsEntry("doc_type", "CITIZEN_ID")
                .containsEntry("doc_number", "Ab00123456789").containsEntry("verify_status", "PENDING")
                .containsEntry("reject_reason", null).containsEntry("verified_by", null).containsEntry("verified_at", null);
        assertThat((String) row.get("front_image_url")).startsWith("private-local:").doesNotContain("http", "/", "\\");
        assertThat((String) row.get("back_image_url")).startsWith("private-local:");
        assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id())).isEqualTo("NONE");
        assertThat(fileCount()).isEqualTo(beforeFiles + 2);

        HttpResponse<byte[]> downloaded = download(id, "front", token);
        assertThat(downloaded.statusCode()).isEqualTo(200);
        assertThat(downloaded.headers().firstValue("Content-Type").orElse("")).startsWith("image/png");
        assertThat(downloaded.headers().firstValue("Content-Disposition").orElse("")).contains("document-" + id + "-front.png");
        assertThat(downloaded.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        assertThat(downloaded.headers().firstValue("X-Content-Type-Options").orElse(null)).isEqualTo("nosniff");
        assertThat(downloaded.headers().firstValue("X-Request-ID")).isPresent();
        BufferedImage decoded = ImageIO.read(new java.io.ByteArrayInputStream(downloaded.body()));
        assertThat(decoded.getWidth()).isEqualTo(3);

        HttpResponse<String> listed = get("/api/user-documents?scope=mine&docType=CITIZEN_ID&verifyStatus=PENDING", token);
        assertThat(listed.statusCode()).isEqualTo(200);
        assertThat(listed.body()).contains("*********6789").doesNotContain("Ab00123456789", "private-local:", PRIVATE_ROOT.toString());
        assertTrace(listed);
        HttpResponse<String> detail = get("/api/user-documents/" + id, token);
        assertThat(detail.statusCode()).isEqualTo(200);
        assertThat(detail.body()).contains("Ab00123456789").doesNotContain("private-local:", PRIVATE_ROOT.toString());

        Account other = account("document-other", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String otherToken = login(other);
        HttpResponse<String> foreignDetail = get("/api/user-documents/" + id, otherToken);
        assertThat(foreignDetail.statusCode()).isEqualTo(404);
        assertThat(foreignDetail.body()).contains("RESOURCE_NOT_FOUND").doesNotContain("Ab00123456789");
        HttpResponse<byte[]> foreignFile = download(id, "front", otherToken);
        assertThat(foreignFile.statusCode()).isEqualTo(404);
        assertThat(new String(foreignFile.body(), StandardCharsets.UTF_8)).contains("RESOURCE_NOT_FOUND");
        assertThat(jdbc.queryForObject("select full_name from customers where id=?", String.class, owner.id())).startsWith("Synthetic");
    }

    @Test
    void strictMultipartFailuresDoNotPersistMetadataOrFiles() throws Exception {
        Account owner = account("document-invalid", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        byte[] image = syntheticPng();
        long beforeRows = documentCount(owner.id());
        long beforeFiles = fileCount();

        List<PartValue> duplicate = fullParts("00123", image, null);
        duplicate.add(new PartValue("docNumber", null, null, "ignored-second-number".getBytes(StandardCharsets.UTF_8)));
        assertApiError(submit(token, duplicate), 400, "INVALID_REQUEST");

        List<PartValue> duplicateFile = fullParts("00123", image, null);
        duplicateFile.add(file("frontImage", "another.png", "image/png", image));
        assertApiError(submit(token, duplicateFile), 400, "INVALID_REQUEST");

        List<PartValue> missingFile = List.of(text("docType", "CITIZEN_ID"), text("docNumber", "00123"));
        assertApiError(submit(token, missingFile), 400, "VALIDATION_ERROR");

        List<PartValue> emptyFile = fullParts("00123", image, null);
        emptyFile.set(emptyFile.size() - 1, file("frontImage", "front.png", "image/png", new byte[0]));
        assertApiError(submit(token, emptyFile), 400, "VALIDATION_ERROR");

        List<PartValue> fileInScalarSlot = fullParts("00123", image, null);
        fileInScalarSlot.add(file("docNumber", "number.txt", "text/plain", "other".getBytes(StandardCharsets.UTF_8)));
        assertApiError(submit(token, fileInScalarSlot), 400, "INVALID_REQUEST");

        List<PartValue> scalarInFileSlot = List.of(text("docType", "CITIZEN_ID"), text("docNumber", "00123"),
                text("frontImage", "not a file"));
        assertApiError(submit(token, scalarInFileSlot), 400, "VALIDATION_ERROR");

        List<PartValue> unknown = fullParts("00123", image, null);
        unknown.add(text("ownerId", "999"));
        assertApiError(submit(token, unknown), 400, "INVALID_REQUEST");

        List<PartValue> helperProperty = fullParts("00123", image, null);
        helperProperty.add(text("statusWasProvided", "true"));
        assertApiError(submit(token, helperProperty), 400, "INVALID_REQUEST");

        assertApiError(submit(token, "/api/user-documents?ownerId=1", fullParts("00123", image, null)),
                400, "INVALID_REQUEST");

        List<PartValue> mismatch = fullParts("00123", image, null);
        mismatch.set(mismatch.size() - 1, file("frontImage", "front.png", "image/jpeg", image));
        assertApiError(submit(token, mismatch), 415, "UNSUPPORTED_MEDIA_TYPE");

        List<PartValue> invalidDate = fullParts("00123", image, null);
        invalidDate.add(text("issueDate", "2030-01-01"));
        invalidDate.add(text("expiresAt", "2029-01-01"));
        assertApiError(submit(token, invalidDate), 400, "VALIDATION_ERROR");

        assertThat(documentCount(owner.id())).isEqualTo(beforeRows);
        assertThat(fileCount()).isEqualTo(beforeFiles);
    }

    @Test
    void validJpegIsServedAndTruncatedOrDamagedImagesNeverPersist() throws Exception {
        Account owner = account("document-integrity", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        byte[] jpeg = syntheticJpeg();
        HttpResponse<byte[]> submitted = submit(token, List.of(text("docType", "CITIZEN_ID"), text("docNumber", "JPG-0007"),
                file("frontImage", "front.jpg", "image/jpeg", jpeg)));
        assertThat(submitted.statusCode()).isEqualTo(201);
        long documentId = mapper.readTree(new String(submitted.body(), StandardCharsets.UTF_8)).path("data").path("id").asLong();
        HttpResponse<byte[]> download = download(documentId, "front", token);
        assertThat(download.statusCode()).isEqualTo(200);
        assertThat(download.headers().firstValue("Content-Type").orElse("" )).startsWith("image/jpeg");
        BufferedImage decoded = ImageIO.read(new java.io.ByteArrayInputStream(download.body()));
        assertThat(decoded.getWidth()).isEqualTo(160);
        assertThat(decoded.getHeight()).isEqualTo(120);
        assertApiError(download(documentId, "back", token), 404, "RESOURCE_NOT_FOUND");

        String locator = jdbc.queryForObject("select front_image_url from user_documents where id=?", String.class, documentId);
        Path stored = PRIVATE_ROOT.resolve(locator.substring("private-local:".length())).normalize();
        assertThat(stored.getParent()).isEqualTo(PRIVATE_ROOT.toRealPath());
        Files.write(stored, java.util.Arrays.copyOf(Files.readAllBytes(stored), Math.toIntExact(Files.size(stored)) - 2));
        assertApiError(download(documentId, "front", token), 500, "INTERNAL_ERROR");
        assertThat(jdbc.queryForObject("select front_image_url from user_documents where id=?", String.class, documentId)).isEqualTo(locator);

        long rowsBefore = documentCount(owner.id());
        long filesBefore = fileCount();
        List<PartValue> invalids = new ArrayList<>();
        invalids.add(file("frontImage", "front.jpg", "image/jpeg", java.util.Arrays.copyOf(jpeg, jpeg.length - 2)));
        invalids.add(file("frontImage", "front.jpg", "image/jpeg", java.util.Arrays.copyOf(jpeg, jpeg.length - 64)));
        invalids.add(file("frontImage", "front.jpg", "image/jpeg", java.util.Arrays.copyOf(jpeg, jpeg.length - Math.max(1, jpeg.length / 3))));
        byte[] png = syntheticPng();
        invalids.add(file("frontImage", "front.png", "image/png", java.util.Arrays.copyOf(png, png.length - 8)));
        byte[] crcBrokenPng = png.clone();
        crcBrokenPng[crcBrokenPng.length - 5] ^= 0x01;
        invalids.add(file("frontImage", "front.png", "image/png", crcBrokenPng));
        invalids.add(file("frontImage", "front.png", "image/svg+xml", png));
        invalids.add(file("frontImage", "front.png", "image/png", "<svg/>".getBytes(StandardCharsets.UTF_8)));

        int index = 0;
        for (PartValue image : invalids) {
            List<PartValue> parts = List.of(text("docType", "CITIZEN_ID"), text("docNumber", "BAD-" + index++), image);
            int status = image.mediaType().equals("image/svg+xml") || image.mediaType().equals("image/png") &&
                    image.bytes().length < 8 ? 415 : 400;
            String code = status == 415 ? "UNSUPPORTED_MEDIA_TYPE" : "VALIDATION_ERROR";
            assertApiError(submit(token, parts), status, code);
        }
        List<PartValue> wrongExtension = List.of(text("docType", "CITIZEN_ID"), text("docNumber", "BAD-EXT"),
                file("frontImage", "front.png", "image/png", jpeg));
        assertApiError(submit(token, wrongExtension), 415, "UNSUPPORTED_MEDIA_TYPE");
        assertThat(documentCount(owner.id())).isEqualTo(rowsBefore);
        assertThat(fileCount()).isEqualTo(filesBefore);
    }

    @Test
    void realOwnerRowLockTimeoutRollsBackAndCleansFileThenRetrySucceeds() throws Exception {
        Account owner = account("document-real-row-lock", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        byte[] image = syntheticPng();
        long filesBefore = fileCount();
        CountDownLatch fileStored = new CountDownLatch(1);
        doAnswer(invocation -> {
            PrivateDocumentReceipt receipt = (PrivateDocumentReceipt) invocation.callRealMethod();
            fileStored.countDown();
            return receipt;
        }).when(storage).store(any(CanonicalDocumentImage.class));
        try (Connection blocker = dataSource.getConnection(); var executor = Executors.newSingleThreadExecutor()) {
            blocker.setAutoCommit(false);
            try (PreparedStatement statement = blocker.prepareStatement("select id from customers where id=? for update")) {
                statement.setLong(1, owner.id());
                try (var rows = statement.executeQuery()) { assertThat(rows.next()).isTrue(); }
            }

            CompletableFuture<HttpResponse<byte[]>> timedOut = CompletableFuture.supplyAsync(
                    () -> submitUnchecked(token, fullParts("ROW-LOCK-FAIL", image, null)), executor);
            assertThat(fileStored.await(8, TimeUnit.SECONDS)).isTrue();
            HttpResponse<byte[]> failure = timedOut.get(12, TimeUnit.SECONDS);
            assertApiError(failure, 503, "DEPENDENCY_UNAVAILABLE");
            assertThat(documentCount(owner.id())).isZero();
            assertThat(fileCount()).isEqualTo(filesBefore);

            blocker.commit();
            HttpResponse<byte[]> retry = submit(token, fullParts("ROW-LOCK-RETRY", syntheticPng(), null));
            assertThat(retry.statusCode()).isEqualTo(201);
            assertThat(documentCount(owner.id())).isEqualTo(1);
            assertThat(fileCount()).isEqualTo(filesBefore + 1);
        }
    }

    @Test
    void concurrentRequestsHaveIndependentReceiptsWhenOneFailsAfterFlush() throws Exception {
        Account failedOwner = account("document-concurrent-fail", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account committedOwner = account("document-concurrent-commit", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String failedToken = login(failedOwner);
        String committedToken = login(committedOwner);
        String failedNumber = "RACE-A-" + UUID.randomUUID().toString().substring(0, 8);
        String committedNumber = "RACE-B-" + UUID.randomUUID().toString().substring(0, 8);
        byte[] image = syntheticPng();
        Set<String> filesBefore = fileNames();
        CountDownLatch bothFlushed = new CountDownLatch(2);
        CountDownLatch release = new CountDownLatch(1);

        doAnswer(invocation -> {
            UserDocument document = invocation.getArgument(0);
            entityManager.persist(document);
            entityManager.flush();
            bothFlushed.countDown();
            if (!release.await(8, TimeUnit.SECONDS)) throw new IllegalStateException("P05 race barrier timed out");
            if (failedNumber.equals(document.getDocNumber())) throw new IllegalStateException("SENTINEL_A_ROLLBACK_AFTER_FLUSH");
            return document;
        }).when(documents).saveAndFlush(any(UserDocument.class));

        try (var executor = Executors.newFixedThreadPool(2)) {
            CompletableFuture<HttpResponse<byte[]>> failed = CompletableFuture.supplyAsync(
                    () -> submitUnchecked(failedToken, fullParts(failedNumber, image, null)), executor);
            CompletableFuture<HttpResponse<byte[]>> committed = CompletableFuture.supplyAsync(
                    () -> submitUnchecked(committedToken, fullParts(committedNumber, image, null)), executor);
            assertThat(bothFlushed.await(10, TimeUnit.SECONDS)).isTrue();
            release.countDown();
            HttpResponse<byte[]> failedResponse = failed.get(15, TimeUnit.SECONDS);
            HttpResponse<byte[]> committedResponse = committed.get(15, TimeUnit.SECONDS);

            assertApiError(failedResponse, 500, "INTERNAL_ERROR");
            assertThat(new String(failedResponse.body(), StandardCharsets.UTF_8)).doesNotContain("SENTINEL_A_ROLLBACK_AFTER_FLUSH");
            assertThat(committedResponse.statusCode()).isEqualTo(201);
            assertThat(documentCount(failedOwner.id())).isZero();
            assertThat(documentCount(committedOwner.id())).isEqualTo(1);
            long committedId = mapper.readTree(new String(committedResponse.body(), StandardCharsets.UTF_8)).path("data").path("id").asLong();
            Map<String, Object> row = jdbc.queryForMap("select customer_id, doc_number, verify_status, reject_reason, verified_by, verified_at, front_image_url, created_at, updated_at from user_documents where id=?", committedId);
            assertThat(row).containsEntry("customer_id", committedOwner.id()).containsEntry("doc_number", committedNumber)
                    .containsEntry("verify_status", "PENDING").containsEntry("reject_reason", null)
                    .containsEntry("verified_by", null).containsEntry("verified_at", null);
            assertThat(row.get("created_at")).isNotNull();
            assertThat(row.get("updated_at")).isNotNull();
            String locator = (String) row.get("front_image_url");
            String filename = locator.substring("private-local:".length());
            Path stored = PRIVATE_ROOT.resolve(filename).normalize();
            assertThat(stored.getParent()).isEqualTo(PRIVATE_ROOT.toRealPath());
            assertThat(Files.isRegularFile(stored)).isTrue();
            HttpResponse<byte[]> downloaded = download(committedId, "front", committedToken);
            assertThat(downloaded.statusCode()).isEqualTo(200);
            assertThat(downloaded.body()).containsExactly(Files.readAllBytes(stored));
            Set<String> createdFiles = new java.util.HashSet<>(fileNames());
            createdFiles.removeAll(filesBefore);
            assertThat(createdFiles).containsExactly(filename);
            assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, failedOwner.id()))
                    .isEqualTo("NONE");
            assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, committedOwner.id()))
                    .isEqualTo("NONE");
        } finally {
            release.countDown();
        }
    }

    @Test
    void inFlightUploadIsRejectedAfterAdminLocksOwnerBeforeMetadataTransaction() throws Exception {
        Account admin = account("document-lock-race-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("document-lock-race-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.PENDING);
        String adminToken = login(admin);
        String ownerToken = login(owner);
        byte[] image = syntheticPng();
        Object updatedAtBefore = jdbc.queryForObject("select updated_at from customers where id=?", Object.class, owner.id());
        long filesBefore = fileCount();
        CountDownLatch stored = new CountDownLatch(1);
        CountDownLatch continueUpload = new CountDownLatch(1);
        doAnswer(invocation -> {
            PrivateDocumentReceipt receipt = (PrivateDocumentReceipt) invocation.callRealMethod();
            stored.countDown();
            if (!continueUpload.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("P05 owner-lock barrier timed out");
            return receipt;
        }).when(storage).store(any(CanonicalDocumentImage.class));

        try (var executor = Executors.newSingleThreadExecutor(); SafeLogCapture logs = new SafeLogCapture()) {
            CompletableFuture<HttpResponse<byte[]>> upload = CompletableFuture.supplyAsync(
                    () -> submitUnchecked(ownerToken, fullParts("LOCK-RACE-0001", image, null)), executor);
            assertThat(stored.await(8, TimeUnit.SECONDS)).isTrue();

            HttpResponse<String> locked = send("PATCH", "/api/customers/" + owner.id() + "/status", adminToken,
                    "application/json", "{\"status\":\"LOCKED\",\"reason\":\"P05 race test\"}".getBytes(StandardCharsets.UTF_8));
            assertThat(locked.statusCode()).isEqualTo(200);
            assertTrace(locked);
            assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, owner.id())).isEqualTo("LOCKED");
            Object updatedAtAfter = jdbc.queryForObject("select updated_at from customers where id=?", Object.class, owner.id());
            assertThat(updatedAtAfter).isNotEqualTo(updatedAtBefore);

            continueUpload.countDown();
            HttpResponse<byte[]> uploadResponse = upload.get(12, TimeUnit.SECONDS);
            assertApiError(uploadResponse, 401, "INVALID_TOKEN");
            assertThat(documentCount(owner.id())).isZero();
            assertThat(fileCount()).isEqualTo(filesBefore);
            assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, owner.id()))
                    .isEqualTo("PENDING");
            assertThat(logs.rendered()).doesNotContain("User document submitted action=user-document-submit");
        } finally {
            continueUpload.countDown();
        }
    }

    @Test
    void storageFailureOnSecondFileCleansFirstRealFileAndLeavesNoDatabaseRow() throws Exception {
        Account owner = account("document-second-write-fail", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        long beforeRows = documentCount(owner.id());
        long beforeFiles = fileCount();
        AtomicInteger stores = new AtomicInteger();
        doAnswer(invocation -> {
            if (stores.incrementAndGet() == 2) throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE);
            return invocation.callRealMethod();
        }).when(storage).store(any(CanonicalDocumentImage.class));

        assertApiError(submit(token, fullParts("00123", syntheticPng(), syntheticPng())), 503, "DEPENDENCY_UNAVAILABLE");
        assertThat(documentCount(owner.id())).isEqualTo(beforeRows);
        assertThat(fileCount()).isEqualTo(beforeFiles);
    }

    @Test
    void staleJwtPrincipalIsRecheckedUnderOwnerRowLockBeforeMetadataWrite() throws Exception {
        Account owner = account("document-stale-principal", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        jdbc.update("update customers set status='LOCKED' where id=?", owner.id());
        CurrentAccount stale = new CurrentAccount(owner.id(), Role.CUSTOMER);
        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                stale, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
        UserDocumentSubmissionRequest metadata = new UserDocumentSubmissionRequest(
                com.carrental.enums.DocumentType.CITIZEN_ID, "00123", null, null, null, null, null, null);
        var image = new UploadedDocumentImage("front.png", "image/png", syntheticPng());
        long beforeRows = documentCount(owner.id());
        long beforeFiles = fileCount();

        assertThatThrownBy(() -> service.submit(stale, new UserDocumentSubmissionCommand(metadata, image, null)))
                .isInstanceOf(AppException.class)
                .extracting(error -> ((AppException) error).errorCode()).isEqualTo(ErrorCode.INVALID_TOKEN);
        assertThat(documentCount(owner.id())).isEqualTo(beforeRows);
        assertThat(fileCount()).isEqualTo(beforeFiles);
        jdbc.update("update customers set status='ACTIVE' where id=?", owner.id());
    }

    @Test
    void listScopeAndQueryValidationAreEnforcedBeforeReturningRows() throws Exception {
        Account customer = account("document-scope", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String customerToken = login(customer);
        assertStringApiError(get("/api/user-documents?scope=all", customerToken), 403, "ACCESS_DENIED");
        assertStringApiError(get("/api/user-documents?scope=mine&customerId=" + customer.id(), customerToken), 403, "ACCESS_DENIED");
        assertStringApiError(get("/api/user-documents?scope=mine&size=1&size=2", customerToken), 400, "INVALID_REQUEST");
        assertStringApiError(get("/api/user-documents?keyword=private", customerToken), 400, "INVALID_REQUEST");
    }

    @Test
    void activeAdminCanListDetailAndDownloadLockedOwnersDocuments() throws Exception {
        Account owner = account("locked-document-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String ownerToken = login(owner);
        HttpResponse<byte[]> submitted = submit(ownerToken, fullParts("A001234", syntheticPng(), null));
        assertThat(submitted.statusCode()).isEqualTo(201);
        long documentId = mapper.readTree(new String(submitted.body(), StandardCharsets.UTF_8)).path("data").path("id").asLong();
        jdbc.update("update customers set status='LOCKED' where id=?", owner.id());

        Account admin = account("documents-active-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        String adminToken = login(admin);
        HttpResponse<String> all = get("/api/user-documents?scope=all&customerId=" + owner.id(), adminToken);
        assertThat(all.statusCode()).isEqualTo(200);
        assertThat(all.body()).contains("\"customerId\":" + owner.id(), "\"docNumberMasked\":\"***1234\"")
                .doesNotContain("A001234", "private-local:");
        HttpResponse<String> detail = get("/api/user-documents/" + documentId, adminToken);
        assertThat(detail.statusCode()).isEqualTo(200);
        assertThat(detail.body()).contains("A001234").doesNotContain("private-local:");
        HttpResponse<byte[]> binary = download(documentId, "front", adminToken);
        assertThat(binary.statusCode()).isEqualTo(200);
        assertThat(ImageIO.read(new java.io.ByteArrayInputStream(binary.body()))).isNotNull();
    }

    @Test
    void frameworkFileSizeLimitReturnsTracedPayloadTooLargeWithoutPersistence() throws Exception {
        Account owner = account("document-size-limit", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        long beforeFiles = fileCount();
        byte[] tooLarge = new byte[5 * 1024 * 1024 + 1];
        List<PartValue> parts = fullParts("00123", tooLarge, null);
        HttpResponse<byte[]> response = submit(token, parts);
        assertApiError(response, 413, "PAYLOAD_TOO_LARGE");

        List<PartValue> oversizedRequest = fullParts("00124", syntheticPng(), null);
        oversizedRequest.add(text("unknown", "x".repeat(11 * 1024 * 1024)));
        assertApiError(submit(token, oversizedRequest), 413, "PAYLOAD_TOO_LARGE");
        assertThat(documentCount(owner.id())).isZero();
        assertThat(fileCount()).isEqualTo(beforeFiles);
    }

    @Test
    void disabledStorageReturns503WithoutCreatingRowsOrFilesButListRemainsAvailable() throws Exception {
        Account owner = account("document-disabled-storage", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        long beforeFiles = fileCount();
        doReturn(false).when(storage).isEnabled();

        assertApiError(submit(token, fullParts("DISABLED-STORE", syntheticPng(), null)), 503, "DEPENDENCY_UNAVAILABLE");
        assertApiError(download(999_999_999L, "front", token), 503, "DEPENDENCY_UNAVAILABLE");
        HttpResponse<String> listing = get("/api/user-documents?scope=mine", token);
        assertThat(listing.statusCode()).isEqualTo(200);
        assertTrace(listing);
        assertThat(documentCount(owner.id())).isZero();
        assertThat(fileCount()).isEqualTo(beforeFiles);
    }

    @Test
    void definiteDatabaseRollbackAfterRealFlushCleansTheSubmissionFiles() throws Exception {
        Account owner = account("document-flush-rollback", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        long beforeFiles = fileCount();
        doAnswer(invocation -> {
            entityManager.persist(invocation.getArgument(0));
            entityManager.flush();
            throw new IllegalStateException("SENTINEL_DOCUMENT_FAILURE_AFTER_FLUSH");
        }).when(documents).saveAndFlush(any(UserDocument.class));
        HttpResponse<byte[]> response = submit(token, fullParts("00123", syntheticPng(), null));
        assertApiError(response, 500, "INTERNAL_ERROR");
        assertThat(new String(response.body(), StandardCharsets.UTF_8)).doesNotContain("SENTINEL_DOCUMENT_FAILURE_AFTER_FLUSH");
        assertThat(documentCount(owner.id())).isZero();
        assertThat(fileCount()).isEqualTo(beforeFiles);
    }

    @Test
    void transactionSystemExceptionInsideCallbackCleansWhenPostgresConfirmsRollback() throws Exception {
        Account owner = account("document-unknown-outcome", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        String token = login(owner);
        long beforeFiles = fileCount();
        doAnswer(invocation -> {
            entityManager.persist(invocation.getArgument(0));
            entityManager.flush();
            throw new org.springframework.transaction.TransactionSystemException("SENTINEL_CALLBACK_FAILURE_AFTER_FLUSH");
        }).when(documents).saveAndFlush(any(UserDocument.class));

        HttpResponse<byte[]> response = submit(token, fullParts("00123", syntheticPng(), null));
        assertApiError(response, 500, "INTERNAL_ERROR");
        assertThat(new String(response.body(), StandardCharsets.UTF_8)).doesNotContain("SENTINEL_CALLBACK_FAILURE_AFTER_FLUSH");
        assertThat(documentCount(owner.id())).isZero();
        assertThat(fileCount()).isEqualTo(beforeFiles);
    }

    @Test
    void cleanupFailurePreservesPrimaryExceptionAndLogsOnlySafeReceiptContext() throws Exception {
        Account owner = account("document-cleanup-failure", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        jdbc.update("update customers set status='ACTIVE' where id=?", owner.id());
        CurrentAccount principal = new CurrentAccount(owner.id(), Role.CUSTOMER);
        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
        UserDocumentSubmissionRequest metadata = new UserDocumentSubmissionRequest(
                com.carrental.enums.DocumentType.CITIZEN_ID, "SENTINEL_PRIVATE_DOC_NUMBER", null, null, null, null, null, null);
        var upload = new UploadedDocumentImage("synthetic.png", "image/png", syntheticPng());
        Set<String> beforeFiles = fileNames();
        String traceId = UUID.randomUUID().toString();
        doAnswer(invocation -> {
            entityManager.persist(invocation.getArgument(0));
            entityManager.flush();
            throw new IllegalStateException("SENTINEL_PRIMARY_FAILURE");
        }).when(documents).saveAndFlush(any(UserDocument.class));
        doThrow(new IllegalStateException("SENTINEL_CLEANUP_FAILURE")).when(storage).delete(any());

        MDC.put(com.carrental.web.RequestTraceFilter.MDC_KEY, traceId);
        try (SafeLogCapture logs = new SafeLogCapture()) {
            assertThatThrownBy(() -> service.submit(principal,
                    new UserDocumentSubmissionCommand(metadata, upload, null)))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("SENTINEL_PRIMARY_FAILURE")
                    .satisfies(primary -> assertThat(primary.getSuppressed()).hasSize(1)
                            .allSatisfy(suppressed -> assertThat(suppressed).hasMessage("SENTINEL_CLEANUP_FAILURE")));
            String rendered = logs.rendered();
            assertThat(rendered).contains("User document cleanup failed action=user-document-cleanup", "receiptId=", "traceId=" + traceId)
                    .doesNotContain("SENTINEL_PRIVATE_DOC_NUMBER", "SENTINEL_PRIMARY_FAILURE", "SENTINEL_CLEANUP_FAILURE",
                            PRIVATE_ROOT.toString(), "private-local:", "synthetic.png");
            assertThat(logs.events()).allSatisfy(event -> assertThat(event.getThrowableProxy()).isNull());
        } finally {
            MDC.remove(com.carrental.web.RequestTraceFilter.MDC_KEY);
        }
        assertThat(documentCount(owner.id())).isZero();
        Set<String> newFiles = new java.util.HashSet<>(fileNames());
        newFiles.removeAll(beforeFiles);
        assertThat(newFiles).hasSize(1);
        Path orphan = PRIVATE_ROOT.resolve(newFiles.iterator().next()).normalize();
        assertThat(orphan.getParent()).isEqualTo(PRIVATE_ROOT.toRealPath());
        Files.delete(orphan);
    }

    private Account account(String label, Role role, CustomerStatus status, KycStatus kyc) {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String email = label + "-" + suffix + "@example.test";
        String phone = "P" + suffix.substring(0, 19);
        String name = "Synthetic " + label;
        Long id = jdbc.queryForObject("insert into customers(full_name,email,phone,password_hash,email_verified,kyc_status,role,status) values (?,?,?,?,false,?,?,?) returning id",
                Long.class, name, email, phone, passwordEncoder.encode(PASSWORD), kyc.name(), role.name(), status.name());
        return new Account(id, email, name);
    }

    private String login(Account account) throws Exception {
        String body = "{\"email\":\"" + account.email() + "\",\"password\":\"" + PASSWORD + "\"}";
        HttpResponse<String> response = send("POST", "/api/auth/login", null, "application/json", body.getBytes(StandardCharsets.UTF_8));
        assertThat(response.statusCode()).isEqualTo(200);
        return mapper.readTree(response.body()).path("data").path("accessToken").asText();
    }

    private HttpResponse<byte[]> submit(String token, List<PartValue> parts) throws Exception {
        return submit(token, "/api/user-documents", parts);
    }

    private HttpResponse<byte[]> submit(String token, String path, List<PartValue> parts) throws Exception {
        String boundary = "P05Boundary" + UUID.randomUUID().toString().replace("-", "");
        byte[] body = multipart(boundary, parts);
        return CLIENT.send(HttpRequest.newBuilder(uri(path)).timeout(java.time.Duration.ofSeconds(20))
                .header("Authorization", "Bearer " + token).header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .header("Accept", "application/json").POST(HttpRequest.BodyPublishers.ofByteArray(body)).build(),
                HttpResponse.BodyHandlers.ofByteArray());
    }

    private HttpResponse<byte[]> submitUnchecked(String token, List<PartValue> parts) {
        try { return submit(token, parts); }
        catch (Exception exception) { throw new IllegalStateException("Synthetic HTTP submission failed", exception); }
    }

    private HttpResponse<byte[]> download(long id, String side, String token) throws Exception {
        return CLIENT.send(HttpRequest.newBuilder(uri("/api/user-documents/" + id + "/files/" + side))
                .header("Authorization", "Bearer " + token).header("Accept", "application/json").GET().build(),
                HttpResponse.BodyHandlers.ofByteArray());
    }

    private HttpResponse<String> get(String path, String token) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(path)).header("Authorization", "Bearer " + token)
                .header("Accept", "application/json").GET().build();
        return CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> send(String method, String path, String token, String contentType, byte[] body) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path)).header("Accept", "application/json");
        if (token != null) request.header("Authorization", "Bearer " + token);
        if (contentType != null) request.header("Content-Type", contentType);
        HttpRequest.BodyPublisher publisher = body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofByteArray(body);
        return CLIENT.send(request.method(method, publisher).build(), HttpResponse.BodyHandlers.ofString());
    }

    private void assertApiError(HttpResponse<byte[]> response, int status, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        String body = new String(response.body(), StandardCharsets.UTF_8);
        assertThat(body).contains("\"success\":false", "\"code\":\"" + code + "\"", "\"data\":null");
        String trace = response.headers().firstValue("X-Request-ID").orElseThrow();
        assertThat(body).contains("\"traceId\":\"" + trace + "\"");
        assertThat(body).doesNotContain(PRIVATE_ROOT.toString());
    }

    private void assertStringApiError(HttpResponse<String> response, int status, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        assertThat(response.body()).contains("\"success\":false", "\"code\":\"" + code + "\"", "\"data\":null");
        assertTrace(response);
    }

    private void assertTrace(HttpResponse<String> response) throws Exception {
        String trace = response.headers().firstValue("X-Request-ID").orElseThrow();
        assertThat(response.body()).contains("\"traceId\":\"" + trace + "\"");
    }

    private long documentCount(long customerId) {
        return jdbc.queryForObject("select count(*) from user_documents where customer_id=?", Long.class, customerId);
    }

    private long fileCount() throws Exception {
        try (var paths = Files.list(PRIVATE_ROOT)) { return paths.count(); }
    }

    private Set<String> fileNames() throws Exception {
        try (var paths = Files.list(PRIVATE_ROOT)) { return paths.map(path -> path.getFileName().toString()).collect(java.util.stream.Collectors.toSet()); }
    }

    private URI uri(String path) { return URI.create("http://127.0.0.1:" + environment.getRequiredProperty("local.server.port", Integer.class) + path); }

    private static List<PartValue> fullParts(String number, byte[] front, byte[] back) {
        List<PartValue> parts = new ArrayList<>(List.of(text("docType", "CITIZEN_ID"), text("docNumber", number),
                file("frontImage", "front.png", "image/png", front)));
        if (back != null) parts.add(file("backImage", "back.png", "image/png", back));
        return parts;
    }

    private static PartValue text(String name, String value) { return new PartValue(name, null, null, value.getBytes(StandardCharsets.UTF_8)); }
    private static PartValue file(String name, String filename, String mediaType, byte[] bytes) { return new PartValue(name, filename, mediaType, bytes); }

    private static byte[] multipart(String boundary, List<PartValue> parts) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        for (PartValue part : parts) {
            output.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.US_ASCII));
            String disposition = "Content-Disposition: form-data; name=\"" + part.name() + "\"";
            if (part.filename() != null) disposition += "; filename=\"" + part.filename() + "\"";
            output.write((disposition + "\r\n").getBytes(StandardCharsets.US_ASCII));
            if (part.mediaType() != null) output.write(("Content-Type: " + part.mediaType() + "\r\n").getBytes(StandardCharsets.US_ASCII));
            output.write("\r\n".getBytes(StandardCharsets.US_ASCII));
            output.write(part.bytes());
            output.write("\r\n".getBytes(StandardCharsets.US_ASCII));
        }
        output.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.US_ASCII));
        return output.toByteArray();
    }

    private static byte[] syntheticPng() throws Exception {
        BufferedImage image = new BufferedImage(3, 2, BufferedImage.TYPE_INT_RGB);
        image.setRGB(1, 1, 0x003399);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private static byte[] syntheticJpeg() throws Exception {
        BufferedImage image = new BufferedImage(160, 120, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                image.setRGB(x, y, ((x * 31 & 0xff) << 16) | ((y * 37 & 0xff) << 8) | ((x + y) * 17 & 0xff));
            }
        }
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        assertThat(ImageIO.write(image, "jpeg", output)).isTrue();
        return output.toByteArray();
    }

    private static Path createPrivateRoot() {
        try {
            Path temp = Path.of(System.getProperty("java.io.tmpdir")).toRealPath();
            Path repository = Path.of(System.getProperty("user.dir")).toRealPath();
            Path root = Files.createTempDirectory(temp, "sba301-p05-private-").toRealPath();
            if (!root.startsWith(temp) || root.startsWith(repository)) throw new IllegalStateException("Unsafe synthetic storage test root");
            return root;
        } catch (Exception exception) {
            throw new ExceptionInInitializerError(exception);
        }
    }

    private record Account(long id, String email, String name) { }
    private record PartValue(String name, String filename, String mediaType, byte[] bytes) { }

    private static final class SafeLogCapture extends AppenderBase<ILoggingEvent> implements AutoCloseable {
        private final Logger root;
        private final List<ILoggingEvent> events = new ArrayList<>();

        SafeLogCapture() {
            LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
            setContext(context);
            setName("p05-safe-log-" + UUID.randomUUID());
            root = context.getLogger(Logger.ROOT_LOGGER_NAME);
            start();
            root.addAppender(this);
        }

        @Override protected void append(ILoggingEvent event) {
            event.prepareForDeferredProcessing();
            events.add(event);
        }

        List<ILoggingEvent> events() { return List.copyOf(events); }

        String rendered() {
            StringBuilder text = new StringBuilder();
            for (ILoggingEvent event : events) {
                text.append(event.getFormattedMessage()).append(' ').append(event.getMDCPropertyMap());
                appendThrowable(text, event.getThrowableProxy());
            }
            return text.toString();
        }

        private static void appendThrowable(StringBuilder text, IThrowableProxy throwable) {
            if (throwable == null) return;
            text.append(' ').append(throwable.getClassName()).append(':').append(throwable.getMessage());
            appendThrowable(text, throwable.getCause());
            for (IThrowableProxy suppressed : throwable.getSuppressed()) appendThrowable(text, suppressed);
        }

        @Override public void close() {
            root.detachAppender(this);
            stop();
        }
    }
}
