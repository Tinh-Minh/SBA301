package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.reset;

import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.repository.CustomerRepository;
import com.carrental.enums.VerificationStatus;
import com.carrental.enums.DocumentType;
import com.carrental.service.ActionLogService;
import com.carrental.storage.PrivateDocumentStorage.UploadedDocumentImage;
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
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
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
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Real PostgreSQL ordering, unique-race, timeout, review and lifecycle concurrency for P07. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1,classpath:db/migration/it-support",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false",
        "spring.datasource.hikari.connection-init-sql=SET lock_timeout TO '5s'"
})
@Import(DriverConcurrencyPostgresIT.FixedClockConfiguration.class)
class DriverConcurrencyPostgresIT {

    private static final String PASSWORD = "P07 synthetic concurrency password";
    private static final HttpClient CLIENT = HttpClient.newHttpClient();
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final MutableTestClock TEST_CLOCK = new MutableTestClock(Instant.parse("2026-10-14T03:00:00Z"), ZONE);
    private static final Path PRIVATE_ROOT = createPrivateRoot();
    @Container private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:15.13-alpine");

    @TestConfiguration(proxyBeanMethods = false)
    static class FixedClockConfiguration {
        @Bean @Primary java.time.Clock p07ConcurrencyClock() { return TEST_CLOCK; }
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("app.security.jwt.issuer", () -> TestJwtKeys.ISSUER);
        registry.add("app.security.jwt.audience", () -> TestJwtKeys.AUDIENCE);
        registry.add("app.security.jwt.access-token-ttl", () -> "PT20M");
        registry.add("app.security.jwt.clock-skew", () -> "PT30S");
        registry.add("app.document.storage.enabled", () -> "true");
        registry.add("app.document.storage.root", () -> PRIVATE_ROOT.toString());
    }

    @Autowired private JdbcTemplate jdbc;
    @Autowired private Environment environment;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JsonMapper mapper;
    @Autowired private PrivateDocumentStorage storage;
    @Autowired private PlatformTransactionManager realTransactionManager;
    @MockitoSpyBean private ActionLogService actionLogService;
    @MockitoSpyBean private CustomerRepository customers;
    @MockitoSpyBean private PlatformTransactionManager transactionManager;

    @AfterEach
    void resetHooksAndClock() {
        TEST_CLOCK.set(Instant.parse("2026-10-14T03:00:00Z"));
        reset(actionLogService, customers, transactionManager);
    }

    @AfterAll
    static void cleanupPrivateRoot() throws Exception {
        if (!Files.exists(PRIVATE_ROOT)) return;
        Path temp = Path.of(System.getProperty("java.io.tmpdir")).toRealPath();
        Path root = PRIVATE_ROOT.toRealPath();
        if (!root.startsWith(temp) || root.equals(temp) || !root.getFileName().toString().startsWith("sba301-p07-concurrency-")) {
            throw new IllegalStateException("Refusing to remove an unexpected P07 concurrency storage root");
        }
        try (var entries = Files.walk(root)) {
            for (Path entry : entries.sorted(java.util.Comparator.reverseOrder()).toList()) Files.deleteIfExists(entry);
        }
    }


    @Test
    void authenticatedAdminLockedBeforeStatusCommandIsRecheckedInsideTransaction() throws Exception {
        Account targetAdmin = account("actor-race-target-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account locker = account("actor-race-locker-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        account("actor-race-third-admin", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account owner = account("actor-race-driver-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.NONE);
        long driverId = seedDriver(owner, DriverStatus.PENDING);
        String actorToken = login(targetAdmin);
        String lockerToken = login(locker);
        CountDownLatch actorPassedAuthentication = new CountDownLatch(1);
        CountDownLatch releaseActorToLock = new CountDownLatch(1);
        AtomicBoolean holdNext = new AtomicBoolean(true);
        doAnswer(invocation -> {
            if (holdNext.compareAndSet(true, false)) {
                actorPassedAuthentication.countDown();
                await(releaseActorToLock, "actor request release before advisory lock");
            }
            return SpySupport.callRealMethod(invocation);
        }).when(customers).findWithLockById(anyLong());

        try (SafeLogCapture logs = new SafeLogCapture(); ExecutorService executor = Executors.newFixedThreadPool(2)) {
            CompletableFuture<HttpResponse<String>> staleStatus = CompletableFuture.supplyAsync(() -> sendUnchecked("PATCH",
                    "/api/drivers/" + driverId + "/status", actorToken, "{\"status\":\"ACTIVE\"}"), executor);
            assertThat(actorPassedAuthentication.await(5, TimeUnit.SECONDS)).isTrue();
            var lockAdmin = send("PATCH", "/api/customers/" + targetAdmin.id() + "/status", lockerToken,
                    "{\"status\":\"LOCKED\",\"reason\":\"P07 actor race\"}");
            assertSuccess(lockAdmin, 200);
            releaseActorToLock.countDown();
            var rejected = staleStatus.get(8, TimeUnit.SECONDS);
            assertError(rejected, 401, "INVALID_TOKEN");
            assertThat(driverStatus(driverId)).isEqualTo("PENDING");
            assertThat(logs.count(trace(rejected), "action=driver-status")).isZero();
            System.out.println("P07_ACTOR_LOCK actorAuthenticatedBeforeLock=true dbRecheck=401 driverUnchanged=true");
        } finally {
            releaseActorToLock.countDown();
        }
    }


    @Test
    void ownerLockAndActivationOrderingPreserveStoredVersusCurrentEligibility() throws Exception {
        Account owner = account("owner-order-owner", Role.CUSTOMER, CustomerStatus.ACTIVE, KycStatus.VERIFIED);
        Account locker = account("owner-order-locker", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        Account activator = account("owner-order-activator", Role.ADMIN, CustomerStatus.ACTIVE, KycStatus.NONE);
        long driverId = seedDriver(owner, DriverStatus.PENDING);
        seedProof(owner, "CITIZEN_ID", "APPROVED", LocalDate.of(2027, 10, 14), null);
        seedProof(owner, "DRIVER_LICENSE", "APPROVED", LocalDate.of(2027, 10, 14), "B");
        String lockToken = login(locker);
        String activateToken = login(activator);
        CountDownLatch firstLockFlushed = new CountDownLatch(1);
        CountDownLatch releaseFirstLock = new CountDownLatch(1);
        AtomicReference<Integer> firstHolder = new AtomicReference<>();
        AtomicBoolean holdLock = new AtomicBoolean(true);
        stubCommitBarrier(owner.id(), "LOCKED", null, holdLock, firstLockFlushed, releaseFirstLock, firstHolder);

        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            CompletableFuture<HttpResponse<String>> lockFirst = CompletableFuture.supplyAsync(() -> sendUnchecked("PATCH",
                    "/api/customers/" + owner.id() + "/status", lockToken,
                    "{\"status\":\"LOCKED\",\"reason\":\"owner lock first\"}"), executor);
            assertThat(firstLockFlushed.await(5, TimeUnit.SECONDS)).isTrue();
            CompletableFuture<HttpResponse<String>> activationAfterLock = CompletableFuture.supplyAsync(() -> sendUnchecked("PATCH",
                    "/api/drivers/" + driverId + "/status", activateToken, "{\"status\":\"ACTIVE\"}"), executor);
            int waiterPid = awaitBlockedWaiter(firstHolder.get(), activationAfterLock, Duration.ofSeconds(3));
            awaitBlocking(firstHolder.get(), waiterPid, activationAfterLock, Duration.ofSeconds(1));
            releaseFirstLock.countDown();
            assertSuccess(lockFirst.get(8, TimeUnit.SECONDS), 200);
            assertError(activationAfterLock.get(8, TimeUnit.SECONDS), 409, "DRIVER_NOT_ELIGIBLE");
            assertThat(driverStatus(driverId)).isEqualTo("PENDING");
            System.out.println("P07_OWNER_ORDERING lockCommitFirst=true activation409=true stored=PENDING rowLockWait=true");
        } finally {
            releaseFirstLock.countDown();
        }

        assertSuccess(send("PATCH", "/api/customers/" + owner.id() + "/status", lockToken,
                "{\"status\":\"ACTIVE\",\"reason\":\"unlock for reverse ordering\"}"), 200);
        reset(transactionManager);
        CountDownLatch activationFlushed = new CountDownLatch(1);
        CountDownLatch releaseActivation = new CountDownLatch(1);
        AtomicReference<Integer> activationHolder = new AtomicReference<>();
        AtomicBoolean holdActivation = new AtomicBoolean(true);
        stubCommitBarrier(owner.id(), null, driverId, holdActivation, activationFlushed, releaseActivation, activationHolder);
        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            CompletableFuture<HttpResponse<String>> activationFirst = CompletableFuture.supplyAsync(() -> sendUnchecked("PATCH",
                    "/api/drivers/" + driverId + "/status", activateToken, "{\"status\":\"ACTIVE\"}"), executor);
            assertThat(activationFlushed.await(5, TimeUnit.SECONDS)).isTrue();
            CompletableFuture<HttpResponse<String>> lockAfter = CompletableFuture.supplyAsync(() -> sendUnchecked("PATCH",
                    "/api/customers/" + owner.id() + "/status", lockToken,
                    "{\"status\":\"LOCKED\",\"reason\":\"activation commit first\"}"), executor);
            int waiterPid = awaitBlockedWaiter(activationHolder.get(), lockAfter, Duration.ofSeconds(3));
            awaitBlocking(activationHolder.get(), waiterPid, lockAfter, Duration.ofSeconds(1));
            releaseActivation.countDown();
            assertSuccess(activationFirst.get(8, TimeUnit.SECONDS), 200);
            assertSuccess(lockAfter.get(8, TimeUnit.SECONDS), 200);
            assertThat(driverStatus(driverId)).isEqualTo("ACTIVE");
            assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, owner.id())).isEqualTo("LOCKED");
            var current = send("GET", "/api/drivers/" + driverId + "/eligibility", activateToken, null);
            assertSuccess(current, 200);
            assertThat(mapper.readTree(current.body()).path("data").path("eligibleNow").asBoolean()).isFalse();
            assertThat(mapper.readTree(current.body()).path("data").path("ineligibilityReasonCode").asText()).isEqualTo("ACCOUNT_NOT_ACTIVE");
            System.out.println("P07_OWNER_ORDERING activationCommitFirst=true lockAfter=true stored=ACTIVE currentEligible=false rowLockWait=true");
        } finally {
            releaseActivation.countDown();
        }
    }


private void stubCommitBarrier(long ownerId, String ownerStatus, Long driverId,
            AtomicBoolean holdOnce, CountDownLatch held, CountDownLatch release, AtomicReference<Integer> pid) {
        doAnswer(invocation -> {
            boolean match = false;
            if (ownerStatus != null) {
                Integer count = jdbc.queryForObject("select count(*) from customers where id=? and status=?",
                        Integer.class, ownerId, ownerStatus);
                match = count != null && count == 1;
            } else if (driverId != null) {
                Integer count = jdbc.queryForObject("select count(*) from drivers where id=? and status='ACTIVE'",
                        Integer.class, driverId);
                match = count != null && count == 1;
            }
            if (match && holdOnce.compareAndSet(true, false)) {
                pid.set(jdbc.queryForObject("select pg_backend_pid()", Integer.class));
                held.countDown();
                await(release, "transaction commit release");
            }
            return SpySupport.callRealMethod(invocation);
        }).when(transactionManager).commit(any(TransactionStatus.class));
    }

    private int awaitBlockedWaiter(int holderPid, CompletableFuture<?> request, Duration timeout) throws Exception {
        long deadline = System.nanoTime() + timeout.toNanos();
        do {
            if (request.isDone()) throw new AssertionError("HTTP operation completed before its expected PostgreSQL wait");
            List<Integer> pids = jdbc.queryForList("""
                    select pid from pg_stat_activity
                    where pid <> ? and state='active' and wait_event_type='Lock'
                      and ? = any(pg_blocking_pids(pid))
                    order by query_start desc
                    """, Integer.class, holderPid, holderPid);
            if (!pids.isEmpty()) return pids.getFirst();
            TimeUnit.MILLISECONDS.sleep(15);
        } while (System.nanoTime() < deadline);
        throw new AssertionError("No PostgreSQL row-lock waiter observed within " + timeout.toMillis() + "ms");
    }

    private long awaitBlocking(int holderPid, int waiterPid, CompletableFuture<?> request, Duration timeout) throws Exception {
        long start = System.nanoTime();
        long deadline = start + timeout.toNanos();
        do {
            if (request.isDone()) throw new AssertionError("HTTP operation completed before PostgreSQL reported its blocker");
            Boolean blocked = jdbc.queryForObject("select ? = any(pg_blocking_pids(?::integer))",
                    Boolean.class, holderPid, waiterPid);
            if (Boolean.TRUE.equals(blocked)) return TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);
            TimeUnit.MILLISECONDS.sleep(10);
        } while (System.nanoTime() < deadline);
        throw new AssertionError("PostgreSQL pg_blocking_pids did not report the expected holder");
    }

    private void await(CountDownLatch latch, String label) {
        try {
            if (!latch.await(8, TimeUnit.SECONDS)) throw new IllegalStateException(label + " timed out");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(label + " interrupted", exception);
        }
    }

    private Account account(String label, Role role, CustomerStatus status, KycStatus kyc) {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String email = label + "-" + suffix + "@example.test";
        String phone = "8" + suffix.substring(0, 19);
        long id = jdbc.queryForObject("""
                insert into customers(full_name,email,phone,password_hash,role,status,kyc_status,email_verified)
                values(?,?,?,?,?,?,?,false) returning id
                """, Long.class, "P07 " + label, email, phone, passwordEncoder.encode(PASSWORD), role.name(), status.name(), kyc.name());
        return new Account(id, email);
    }

    private String login(Account account) throws Exception {
        var response = send("POST", "/api/auth/login", null,
                "{\"email\":\"" + account.email() + "\",\"password\":\"" + PASSWORD + "\"}");
        assertSuccess(response, 200);
        return mapper.readTree(response.body()).path("data").path("accessToken").asText();
    }

    private long seedDriver(Account owner, DriverStatus status) {
        return jdbc.queryForObject("insert into drivers(customer_id,status) values(?,?) returning id", Long.class, owner.id(), status.name());
    }

    private void seedProof(Account owner, String type, String status, LocalDate expiry, String licenseClass) {
        jdbc.update("""
                insert into user_documents(customer_id,doc_type,doc_number,full_name_on_doc,date_of_birth_on_doc,
                    issue_place,issue_date,expires_at,license_class,front_image_url,back_image_url,verify_status)
                values(?,?,?,?,?,?,?,?,?,?,?,?)
                """, owner.id(), type, "P07-CONC-DOC-" + UUID.randomUUID(), "Synthetic Concurrent Person",
                LocalDate.of(1990, 1, 1), "Test province", LocalDate.of(2020, 1, 1), expiry,
                licenseClass, "private-local:test-only", type.equals("PASSPORT") ? null : "private-local:test-back", status);
    }

    private long seedPendingLicense(Account owner) throws Exception {
        String front = storage.store(new UploadedDocumentImage("test.png", "image/png", png())).locator();
        String back = storage.store(new UploadedDocumentImage("test.png", "image/png", png())).locator();
        return jdbc.queryForObject("""
                insert into user_documents(customer_id,doc_type,doc_number,full_name_on_doc,date_of_birth_on_doc,
                    issue_place,issue_date,expires_at,license_class,front_image_url,back_image_url,verify_status)
                values(?,'DRIVER_LICENSE',?,'Review Race Person','1990-01-01','Test province','2020-01-01',
                    '2027-10-14','B',?,?, 'PENDING') returning id
                """, Long.class, owner.id(), "P07-LICENSE-" + UUID.randomUUID(), front, back);
    }

    private HttpResponse<String> send(String method, String path, String token, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri(path)).timeout(Duration.ofSeconds(20));
        if (token != null) builder.header("Authorization", "Bearer " + token);
        if (body != null) builder.header("Content-Type", "application/json");
        HttpRequest.BodyPublisher publisher = body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8);
        return CLIENT.send(builder.method(method, publisher).build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> sendUnchecked(String method, String path, String token, String body) {
        try { return send(method, path, token, body); }
        catch (Exception exception) { throw new IllegalStateException("Synthetic HTTP request failed", exception); }
    }

    private void assertSuccess(HttpResponse<String> response, int status) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode body = mapper.readTree(response.body());
        assertThat(body.path("success").asBoolean()).isTrue();
        assertThat(body.path("traceId").asText()).isEqualTo(trace(response));
    }

    private void assertError(HttpResponse<String> response, int status, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode body = mapper.readTree(response.body());
        assertThat(body.path("success").asBoolean()).isFalse();
        assertThat(body.path("code").asText()).isEqualTo(code);
        assertThat(body.path("traceId").asText()).isEqualTo(trace(response));
    }

    private String trace(HttpResponse<String> response) {
        return response.headers().firstValue(RequestTraceFilter.HEADER_NAME).orElseThrow();
    }

    private String driverStatus(long driverId) {
        return jdbc.queryForObject("select status from drivers where id=?", String.class, driverId);
    }

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + environment.getRequiredProperty("local.server.port", Integer.class) + path);
    }

    private static byte[] png() throws Exception {
        BufferedImage image = new BufferedImage(16, 12, BufferedImage.TYPE_INT_RGB);
        image.setRGB(0, 0, 0x445566);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private static Path createPrivateRoot() {
        try { return Files.createTempDirectory("sba301-p07-concurrency-").toAbsolutePath(); }
        catch (java.io.IOException exception) { throw new ExceptionInInitializerError(exception); }
    }

    private record Account(long id, String email) { }

    private static final class SafeLogCapture implements AutoCloseable {
        private final Logger logger = (Logger) LoggerFactory.getLogger("com.carrental.service.impl.ActionLogServiceImpl");
        private final CapturingAppender appender = new CapturingAppender();
        private SafeLogCapture() {
            appender.setContext((LoggerContext) LoggerFactory.getILoggerFactory());
            appender.start();
            logger.addAppender(appender);
        }
        private long count(String trace, String marker) {
            return appender.events.stream().filter(event -> event.getFormattedMessage().contains("traceId=" + trace)
                    && event.getFormattedMessage().contains(marker)).count();
        }
        @Override public void close() { logger.detachAppender(appender); appender.stop(); }
    }

    private static final class CapturingAppender extends AppenderBase<ILoggingEvent> {
        private final List<ILoggingEvent> events = new java.util.concurrent.CopyOnWriteArrayList<>();
        @Override protected void append(ILoggingEvent event) { events.add(event); }
    }
}
