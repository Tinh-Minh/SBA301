package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.carrental.config.security.BootstrapAdminProperties;
import com.carrental.entity.Customer;
import com.carrental.repository.CustomerRepository;
import com.carrental.service.impl.AdminBootstrapService;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.PlainJWT;
import com.nimbusds.jwt.SignedJWT;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.context.annotation.Import;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.IThrowableProxy;
import ch.qos.logback.core.AppenderBase;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

/** End-to-end security and account persistence checks against an isolated PostgreSQL instance. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1,classpath:db/migration/it-support",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false"
})
@Import(AuthSecurityTestFixtures.class)
class AuthSecurityPostgresIT {
    private static final String SUFFIX = UUID.randomUUID().toString().replace("-", "");
    private static final String PASSWORD = "  fake-test-password  ";
    private static final String ALLOWED_ORIGIN = "http://localhost:5173";
    private static final HttpClient CLIENT = HttpClient.newHttpClient();

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
        properties.add("app.security.jwt.secret-key", () -> TestJwtKeys.HS256_SECRET);
        properties.add("app.security.cors.allowed-origins", () -> ALLOWED_ORIGIN);
    }

    @LocalServerPort private int port;
    @Autowired private JsonMapper objectMapper;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private Clock clock;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AdminBootstrapService bootstrapService;
    @MockitoSpyBean private CustomerRepository customers;

    @Test
    void registrationNormalizesIdentityAppliesServerDefaultsAndStoresOnlyBCryptHash() throws Exception {
        String email = email("register");
        String phone = phone("r");
        String markerPassword = "  registration fake password  ";
        HttpResponse<String> response = post("/api/auth/register", registerJson("  Test Customer  ",
                "  " + email.toUpperCase(java.util.Locale.ROOT) + "  ", " " + phone + " ", markerPassword));

        assertThat(response.statusCode()).isEqualTo(201);
        JsonNode envelope = json(response);
        JsonNode profile = envelope.path("data");
        assertThat(envelope.path("success").asBoolean()).isTrue();
        assertThat(profile.path("email").asText()).isEqualTo(email);
        assertThat(profile.path("fullName").asText()).isEqualTo("Test Customer");
        assertThat(profile.path("phone").asText()).isEqualTo(phone);
        assertThat(profile.path("role").asText()).isEqualTo("CUSTOMER");
        assertThat(profile.path("status").asText()).isEqualTo("ACTIVE");
        assertThat(profile.path("kycStatus").asText()).isEqualTo("NONE");
        assertThat(profile.path("emailVerified").asBoolean()).isFalse();
        assertThat(profile.path("createdAt").isTextual()).isTrue();
        assertThat(profile.has("passwordHash")).isFalse();
        assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        assertThat(response.headers().firstValue("Set-Cookie")).isEmpty();
        assertTrace(response, envelope);

        Map<String, Object> row = jdbc.queryForMap("select password_hash, role, status, kyc_status, email_verified, "
                + "created_at, updated_at from customers where email=?", email);
        String hash = (String) row.get("password_hash");
        assertThat(hash).matches("^\\$2[aby]\\$(0[4-9]|[12][0-9]|3[01])\\$[./A-Za-z0-9]{53}$");
        assertThat(passwordEncoder.matches(markerPassword, hash)).isTrue();
        assertThat(hash).isNotEqualTo(markerPassword);
        assertThat(row).containsEntry("role", "CUSTOMER").containsEntry("status", "ACTIVE")
                .containsEntry("kyc_status", "NONE").containsEntry("email_verified", false);
        assertThat(row.get("created_at")).isNotNull();
        assertThat(row.get("updated_at")).isNotNull();
    }

    @Test
    void registrationRejectsMassAssignmentUnknownPropertiesAndOverlongUnicodePasswordSafely() throws Exception {
        String email = email("mass");
        String phone = phone("m");
        String body = registerJson("Test", email, phone, PASSWORD).replace("\"password\"", "\"role\":\"ADMIN\",\"status\":\"LOCKED\",\"password\"");
        HttpResponse<String> massAssignment = post("/api/auth/register", body);
        assertThat(massAssignment.statusCode()).isEqualTo(400);
        assertThat(json(massAssignment).path("code").asText()).isEqualTo("INVALID_REQUEST");
        assertThat(jdbc.queryForObject("select count(*) from customers where email=?", Integer.class, email)).isZero();

        String unicodePassword = "😀".repeat(32);
        HttpResponse<String> tooLong = post("/api/auth/register",
                registerJson("Test", email("unicode"), phone("u"), unicodePassword));
        assertThat(tooLong.statusCode()).isEqualTo(400);
        JsonNode error = json(tooLong);
        assertThat(error.path("code").asText()).isEqualTo("VALIDATION_ERROR");
        assertThat(error.path("errors").toString()).contains("password");
        assertThat(tooLong.body()).doesNotContain(unicodePassword);
    }

    @Test
    void emailAndPhoneConflictsReturnOnlyTheSafeConflictEnvelope() throws Exception {
        String email = email("duplicate");
        String phone = phone("d");
        assertThat(post("/api/auth/register", registerJson("Test", email, phone, PASSWORD)).statusCode()).isEqualTo(201);
        HttpResponse<String> emailConflict = post("/api/auth/register",
                registerJson("Other", email.toUpperCase(java.util.Locale.ROOT), phone("e"), PASSWORD));
        HttpResponse<String> phoneConflict = post("/api/auth/register",
                registerJson("Other", email("phone-conflict"), phone, PASSWORD));
        for (HttpResponse<String> response : List.of(emailConflict, phoneConflict)) {
            assertThat(response.statusCode()).isEqualTo(409);
            assertThat(json(response).path("code").asText()).isEqualTo("ACCOUNT_ALREADY_EXISTS");
            assertThat(response.body()).doesNotContain(email).doesNotContain(phone);
            assertTrace(response, json(response));
        }
    }

    @Test
    void postgresConstraintConflictsKeepTraceLogsButNeverLogInputOrCredentialMarkers() throws Exception {
        String emailMarker = "r1-email-" + SUFFIX + "@example.test";
        String emailOwnerPhone = phone("em");
        String phoneOwnerEmail = email("phone-owner");
        String phoneMarker = "P" + SUFFIX.substring(0, 19);
        String emailCandidatePhone = phone("ec");
        String phoneCandidateEmail = email("phone-candidate");
        String passwordMarker = "R1_PASSWORD_SENTINEL_" + SUFFIX;
        String hashMarker = "HASH_SENTINEL_" + SUFFIX;
        String ownerPassword = "R1 test owner password";

        insertCustomer("Email owner", emailMarker, emailOwnerPhone, passwordEncoder.encode(ownerPassword));
        insertCustomer("Phone owner", phoneOwnerEmail, phoneMarker, hashMarker);

        doReturn(false).when(customers).existsByEmailIgnoreCase(emailMarker);
        doReturn(false).when(customers).existsByPhone(phoneMarker);

        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            String bearerToken = loginToken(emailMarker, ownerPassword);
            HttpResponse<String> emailConflict = post("/api/auth/register",
                    registerJson("Email collision", emailMarker, emailCandidatePhone, passwordMarker),
                    Map.of("Authorization", "Bearer " + bearerToken));
            HttpResponse<String> phoneConflict = post("/api/auth/register",
                    registerJson("Phone collision", phoneCandidateEmail, phoneMarker, passwordMarker),
                    Map.of("Authorization", "Bearer " + bearerToken));

            assertError(emailConflict, 409, "ACCOUNT_ALREADY_EXISTS");
            assertError(phoneConflict, 409, "ACCOUNT_ALREADY_EXISTS");
            assertThat(jdbc.queryForObject("select count(*) from customers where lower(email)=lower(?)",
                    Integer.class, emailMarker)).isEqualTo(1);
            assertThat(jdbc.queryForObject("select count(*) from customers where email=?",
                    Integer.class, phoneCandidateEmail)).isZero();
            assertThat(jdbc.queryForObject("select count(*) from customers where phone=?",
                    Integer.class, phoneMarker)).isEqualTo(1);

            var saves = org.mockito.ArgumentCaptor.forClass(Customer.class);
            verify(customers, times(2)).saveAndFlush(saves.capture());
            assertThat(saves.getAllValues()).extracting(Customer::getEmail)
                    .containsExactlyInAnyOrder(emailMarker, phoneCandidateEmail);
            List<String> candidateHashes = saves.getAllValues().stream()
                    .map(Customer::getPasswordHash).toList();
            assertThat(candidateHashes).allMatch(hash ->
                    hash.matches("^\\$2[aby]\\$(0[4-9]|[12][0-9]|3[01])\\$[./A-Za-z0-9]{53}$"));

            String capturedLogs = logs.snapshot().stream()
                    .map(AuthSecurityPostgresIT::renderLogEvent)
                    .collect(Collectors.joining("\n"));
            String emailTrace = emailConflict.headers().firstValue("X-Request-ID").orElseThrow();
            String phoneTrace = phoneConflict.headers().firstValue("X-Request-ID").orElseThrow();
            assertThat(capturedLogs)
                    .contains("Registration conflict traceId=" + emailTrace + " constraint=uq_customers_email_lower")
                    .contains("Registration conflict traceId=" + phoneTrace + " constraint=customers_phone_key")
                    .doesNotContain(emailMarker, phoneMarker, passwordMarker, hashMarker, bearerToken);
            candidateHashes.forEach(hash -> assertThat(capturedLogs).doesNotContain(hash));
        }
    }

    @Test
    void concurrentRegistrationUsesThePostgresUniqueIndexAsTheFinalGuard() throws Exception {
        String email = email("race");
        CountDownLatch start = new CountDownLatch(1);
        int requests = 8;
        try (var executor = Executors.newFixedThreadPool(requests)) {
            List<CompletableFuture<HttpResponse<String>>> pending = new ArrayList<>();
            for (int index = 0; index < requests; index++) {
                String submittedEmail = index % 2 == 0
                        ? email.toUpperCase(java.util.Locale.ROOT)
                        : " " + email + " ";
                String body = registerJson("Race " + index, submittedEmail, phone("r" + index), PASSWORD);
                pending.add(CompletableFuture.supplyAsync(() -> awaitAndPost(start, body), executor));
            }
            start.countDown();
            List<Integer> statuses = pending.stream().map(CompletableFuture::join)
                    .map(HttpResponse::statusCode).toList();
            assertThat(statuses.stream().filter(status -> status == 201).count()).isEqualTo(1);
            assertThat(statuses.stream().filter(status -> status == 409).count()).isEqualTo(requests - 1);
            assertThat(statuses).doesNotContain(500);
            assertThat(jdbc.queryForObject("select count(*) from customers where lower(email)=lower(?)", Integer.class, email))
                    .isEqualTo(1);
        }
    }

    @Test
    void loginPreservesPasswordWhitespaceAndEmitsRequiredShortLivedHS256Claims() throws Exception {
        String email = email("login");
        String phone = phone("l");
        assertThat(post("/api/auth/register", registerJson("Login Customer", email, phone, PASSWORD)).statusCode())
                .isEqualTo(201);
        Long id = jdbc.queryForObject("select id from customers where email=?", Long.class, email);
        HttpResponse<String> response = post("/api/auth/login", loginJson(" " + email.toUpperCase(java.util.Locale.ROOT) + " ", PASSWORD));
        assertThat(response.statusCode()).isEqualTo(200);
        JsonNode envelope = json(response);
        JsonNode data = envelope.path("data");
        String token = data.path("accessToken").asText();
        assertThat(token.split("\\.")).hasSize(3);
        assertThat(data.path("tokenType").asText()).isEqualTo("Bearer");
        assertThat(data.path("expiresIn").asLong()).isEqualTo(300);
        assertThat(data.path("account").path("id").asLong()).isEqualTo(id);
        assertThat(data.path("account").path("role").asText()).isEqualTo("CUSTOMER");
        assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        assertThat(response.headers().firstValue("Set-Cookie")).isEmpty();
        assertThat(response.body()).doesNotContain(PASSWORD);
        assertTrace(response, envelope);

        SignedJWT decoded = SignedJWT.parse(token);
        JWTClaimsSet claims = decoded.getJWTClaimsSet();
        assertThat(decoded.getHeader().getAlgorithm()).isEqualTo(JWSAlgorithm.HS256);
        assertThat(claims.getSubject()).isEqualTo(id.toString());
        assertThat(claims.getIssuer()).isEqualTo(TestJwtKeys.ISSUER);
        assertThat(claims.getAudience()).containsExactly(TestJwtKeys.AUDIENCE);
        assertThat(claims.getIssueTime()).isNotNull();
        assertThat(claims.getExpirationTime().toInstant().getEpochSecond()
                - claims.getIssueTime().toInstant().getEpochSecond()).isEqualTo(300);
        assertThat(claims.getClaims()).doesNotContainKeys("role", "passwordHash", "phone", "email");
        assertThat(jdbc.queryForObject("select email_verified from customers where id=?", Boolean.class, id)).isFalse();
    }

    @Test
    void invalidPasswordUnknownEmailAndLockedAccountShareTheSameLoginFailure() throws Exception {
        String email = email("generic-login");
        Long id = registerAndGetId(email, phone("g"), PASSWORD);
        HttpResponse<String> badPassword = post("/api/auth/login", loginJson(email, "wrong password"));
        HttpResponse<String> missingAccount = post("/api/auth/login", loginJson(email("missing"), PASSWORD));
        jdbc.update("update customers set status='LOCKED' where id=?", id);
        HttpResponse<String> lockedAccount = post("/api/auth/login", loginJson(email, PASSWORD));

        List<HttpResponse<String>> responses = List.of(badPassword, missingAccount, lockedAccount);
        for (HttpResponse<String> response : responses) {
            assertThat(response.statusCode()).isEqualTo(401);
            assertThat(json(response).path("code").asText()).isEqualTo("AUTHENTICATION_FAILED");
            assertThat(response.body()).doesNotContain(PASSWORD).doesNotContain("wrong password");
        }
        assertThat(json(badPassword).path("message").asText())
                .isEqualTo(json(missingAccount).path("message").asText())
                .isEqualTo(json(lockedAccount).path("message").asText());
    }

    @Test
    void malformedOrUnsupportedStoredPasswordHashesReturnGenericUnauthorizedWithoutLoggingHash() throws Exception {
        String passwordMarker = "R3_PASSWORD_SENTINEL_" + SUFFIX;
        Map<String, String> invalidHashes = new LinkedHashMap<>();
        invalidHashes.put(email("bcrypt-cost-high"), "$2a$99$" + "A".repeat(53));
        invalidHashes.put(email("bcrypt-cost-low"), "$2a$03$" + "B".repeat(53));
        invalidHashes.put(email("unsupported-prefix"), "{unsupported}HASH_PREFIX_SENTINEL_" + SUFFIX);
        invalidHashes.put(email("plaintext-hash"), "PLAINTEXT_HASH_SENTINEL_" + SUFFIX);

        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            int phoneNumber = 1;
            for (Map.Entry<String, String> invalidHash : invalidHashes.entrySet()) {
                insertCustomer("Malformed hash", invalidHash.getKey(), phone("h" + phoneNumber++), invalidHash.getValue());
                HttpResponse<String> response = post("/api/auth/login",
                        loginJson(invalidHash.getKey(), passwordMarker));
                assertError(response, 401, "AUTHENTICATION_FAILED");
                assertThat(json(response).path("message").asText())
                        .isEqualTo("Thông tin xác thực không hợp lệ hoặc không được phép đăng nhập");
                assertThat(response.body()).doesNotContain(invalidHash.getValue(), passwordMarker);
            }

            String validEmail = email("valid-hash-control");
            assertThat(registerAndGetId(validEmail, phone("vh"), PASSWORD)).isPositive();
            HttpResponse<String> validLogin = post("/api/auth/login", loginJson(validEmail, PASSWORD));
            assertThat(validLogin.statusCode()).isEqualTo(200);
            assertTrace(validLogin, json(validLogin));

            HttpResponse<String> wrongPassword = post("/api/auth/login", loginJson(validEmail, "different fake password"));
            assertError(wrongPassword, 401, "AUTHENTICATION_FAILED");
            assertThat(json(validLogin).path("message").asText())
                    .isEqualTo("Thành công");

            String capturedLogs = logs.snapshot().stream()
                    .map(AuthSecurityPostgresIT::renderLogEvent)
                    .collect(Collectors.joining("\n"));
            assertThat(capturedLogs).doesNotContain(passwordMarker, validEmail,
                    "bcrypt-cost-high", "bcrypt-cost-low", "unsupported-prefix", "plaintext-hash");
            invalidHashes.values().forEach(hash -> assertThat(capturedLogs).doesNotContain(hash));
        }
    }

    @Test
    void loginDatabaseFailureRemainsServerErrorInsteadOfGenericBadCredentials() throws Exception {
        String email = email("login-database-failure");
        registerAndGetId(email, phone("df"), PASSWORD);
        doThrow(new DataAccessResourceFailureException("SENTINEL_LOGIN_DATABASE_FAILURE"))
                .when(customers).findByEmailIgnoreCase(email);

        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            HttpResponse<String> response = post("/api/auth/login", loginJson(email, PASSWORD));
            assertError(response, 503, "DEPENDENCY_UNAVAILABLE");
            assertThat(response.body()).doesNotContain(email, PASSWORD, "SENTINEL_LOGIN_DATABASE_FAILURE");
            String capturedLogs = logs.snapshot().stream()
                    .map(AuthSecurityPostgresIT::renderLogEvent)
                    .collect(Collectors.joining("\n"));
            assertThat(capturedLogs).contains("Database dependency unavailable")
                    .doesNotContain(email, PASSWORD, "SENTINEL_LOGIN_DATABASE_FAILURE");
        }
    }

    @Test
    void invalidJWTVariantsAreRejectedByTheRealDecoderAndFilterChain() throws Exception {
        Long id = registerAndGetId(email("jwt-matrix"), phone("j"), PASSWORD);
        Instant now = clock.instant().truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
        List<String> invalidTokens = new ArrayList<>();
        invalidTokens.add(TestJwtKeys.signHs256Token(claims(id.toString(), TestJwtKeys.ISSUER, "wrong-audience",
                now.minusSeconds(1), now.plusSeconds(60), null)));
        invalidTokens.add(TestJwtKeys.signHs256Token(claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now.minusSeconds(120), now.minusSeconds(90), null)));
        invalidTokens.add(TestJwtKeys.signHs256Token(claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), now.plusSeconds(120))));
        invalidTokens.add(TestJwtKeys.signHs256Token(claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now.plusSeconds(120), now.plusSeconds(60), null)));
        invalidTokens.add(TestJwtKeys.signHs256Token(claims("0", TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null)));
        invalidTokens.add(TestJwtKeys.signHs256Token(claims("9223372036854775808123", TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null)));
        invalidTokens.add(TestJwtKeys.signHs256Token(claims("not-a-number", TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null)));
        invalidTokens.add(TestJwtKeys.signHs256Token(Map.of()));

        Map<String, Object> noIssuedAt = claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null);
        noIssuedAt.remove("iat");
        invalidTokens.add(TestJwtKeys.signHs256Token(noIssuedAt));
        Map<String, Object> noExpiration = claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null);
        noExpiration.remove("exp");
        invalidTokens.add(TestJwtKeys.signHs256Token(noExpiration));
        Map<String, Object> noSubject = claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null);
        noSubject.remove("sub");
        invalidTokens.add(TestJwtKeys.signHs256Token(noSubject));
        Map<String, Object> noIssuer = claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null);
        noIssuer.remove("iss");
        invalidTokens.add(TestJwtKeys.signHs256Token(noIssuer));
        Map<String, Object> noAudience = claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null);
        noAudience.remove("aud");
        invalidTokens.add(TestJwtKeys.signHs256Token(noAudience));
        invalidTokens.add(TestJwtKeys.signHs256Token(claims(id.toString(), "https://wrong.example.test", TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null)));
        invalidTokens.add(TestJwtKeys.signHs256Token(claims(id.toString(), "SENTINEL_NOT_A_URL", TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null)));
        invalidTokens.add(TestJwtKeys.signHs256Token(claims(id.toString(), "", TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null)));
        Map<String, Object> nonStringIssuer = claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null);
        nonStringIssuer.put("iss", 12345);
        invalidTokens.add(TestJwtKeys.signHs256Token(nonStringIssuer));
        invalidTokens.add(signedRs256Token(claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                now, now.plusSeconds(120), null)));
        invalidTokens.add(new PlainJWT(new JWTClaimsSet.Builder().subject(id.toString()).build()).serialize());
        invalidTokens.add(TestJwtKeys.signHs256Token(
                claims(id.toString(), TestJwtKeys.ISSUER, TestJwtKeys.AUDIENCE,
                        now, now.plusSeconds(120), null),
                "wrong-function1-test-secret-key-for-hs256"));

        HttpResponse<String> valid = post("/api/auth/login", loginJson(email("jwt-matrix"), PASSWORD));
        String validToken = json(valid).path("data").path("accessToken").asText();
        assertThat(TestJwtKeys.ISSUER).isEqualTo("sba301:function1:test-issuer");
        assertThat(get("/api/customers/me", validToken, Map.of()).statusCode()).isEqualTo(200);
        String[] parts = validToken.split("\\.");
        parts[1] = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"sub\":\"999\"}".getBytes(StandardCharsets.UTF_8));
        invalidTokens.add(String.join(".", parts));

        try (ThreadSafeLogCapture logs = new ThreadSafeLogCapture()) {
            for (String token : invalidTokens) {
                HttpResponse<String> response = get("/api/customers/me", token, Map.of());
                assertThat(response.statusCode()).as("invalid JWT rejected").isEqualTo(401);
                JsonNode envelope = json(response);
                assertThat(envelope.path("code").asText()).isEqualTo("INVALID_TOKEN");
                assertThat(response.body()).doesNotContain(token);
                assertTrace(response, envelope);
            }
            String capturedLogs = logs.snapshot().stream()
                    .map(AuthSecurityPostgresIT::renderLogEvent)
                    .collect(Collectors.joining("\n"));
            assertThat(capturedLogs).doesNotContain("Unable to convert claim 'iss'", "Servlet.service()",
                    "SENTINEL_NOT_A_URL");
        }
    }

    @Test
    void currentDatabaseStatusAndRoleOverrideEveryTokenRoleClaim() throws Exception {
        String customerEmail = email("current-customer");
        Long customerId = registerAndGetId(customerEmail, phone("c"), PASSWORD);
        String customerToken = loginToken(customerEmail, PASSWORD);
        HttpResponse<String> me = get("/api/customers/me?customerId=9223372036854775807", customerToken, Map.of());
        assertThat(me.statusCode()).isEqualTo(200);
        JsonNode profile = json(me).path("data");
        assertThat(profile.path("id").asLong()).isEqualTo(customerId);
        assertThat(profile.has("passwordHash")).isFalse();

        Map<String, Object> forgedRoleClaims = claims(customerId.toString(), TestJwtKeys.ISSUER,
                TestJwtKeys.AUDIENCE, clock.instant().minusSeconds(1), clock.instant().plusSeconds(180), null);
        forgedRoleClaims.put("role", "ADMIN");
        String forgedRole = TestJwtKeys.signHs256Token(forgedRoleClaims);
        assertError(get("/__test/security/admin", forgedRole, Map.of()), 403, "ACCESS_DENIED");
        assertError(get("/__test/security/admin", customerToken, Map.of()), 403, "ACCESS_DENIED");

        String adminEmail = email("bootstrap-admin-role");
        AdminBootstrapService.Result created = bootstrapService.ensureAdmin(bootstrapProperties(
                adminEmail, phone("A"), "Bootstrap Admin", "admin fake password"));
        assertThat(created).isEqualTo(AdminBootstrapService.Result.CREATED);
        String adminToken = loginToken(adminEmail, "admin fake password");
        assertThat(get("/__test/security/admin", adminToken, Map.of()).statusCode()).isEqualTo(200);
        Long adminId = jdbc.queryForObject("select id from customers where email=?", Long.class, adminEmail);
        jdbc.update("update customers set role='CUSTOMER' where id=?", adminId);
        assertError(get("/__test/security/admin", adminToken, Map.of()), 403, "ACCESS_DENIED");

        jdbc.update("update customers set status='LOCKED' where id=?", customerId);
        assertError(get("/api/customers/me", customerToken, Map.of()), 401, "INVALID_TOKEN");

        String deletedEmail = email("deleted-customer");
        Long deletedId = registerAndGetId(deletedEmail, phone("x"), PASSWORD);
        String deletedToken = loginToken(deletedEmail, PASSWORD);
        jdbc.update("delete from customers where id=?", deletedId);
        assertError(get("/api/customers/me", deletedToken, Map.of()), 401, "INVALID_TOKEN");
    }

    @Test
    void authenticationAndAuthorizationResponsesHaveTraceAndAllowedOriginCanRead401() throws Exception {
        HttpResponse<String> missingToken = get("/api/customers/me", null, Map.of("Origin", ALLOWED_ORIGIN));
        assertError(missingToken, 401, "AUTHENTICATION_FAILED");
        assertThat(missingToken.headers().firstValue("Access-Control-Allow-Origin").orElse(null)).isEqualTo(ALLOWED_ORIGIN);
        assertThat(missingToken.headers().firstValue("WWW-Authenticate").orElse("")).isEqualTo("Bearer");
        assertError(get("/api/customers/me", null, Map.of()), 401, "AUTHENTICATION_FAILED");

        HttpRequest preflight = HttpRequest.newBuilder(uri("/api/customers/me"))
                .header("Origin", ALLOWED_ORIGIN)
                .header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "Authorization")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .build();
        HttpResponse<String> allowedPreflight = CLIENT.send(preflight, HttpResponse.BodyHandlers.ofString());
        assertThat(allowedPreflight.statusCode()).isBetween(200, 299);
        assertThat(allowedPreflight.headers().firstValue("Access-Control-Allow-Origin").orElse(null)).isEqualTo(ALLOWED_ORIGIN);
        assertThat(allowedPreflight.headers().firstValue("Access-Control-Expose-Headers").orElse("")).contains("X-Request-ID");
        assertThat(allowedPreflight.headers().firstValue("Access-Control-Allow-Credentials")).isEmpty();

        HttpRequest deniedPreflightRequest = HttpRequest.newBuilder(uri("/api/customers/me"))
                .header("Origin", "https://outside.example.test")
                .header("Access-Control-Request-Method", "GET")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .build();
        HttpResponse<String> deniedPreflight = CLIENT.send(deniedPreflightRequest, HttpResponse.BodyHandlers.ofString());
        assertThat(deniedPreflight.statusCode()).isEqualTo(403);
        assertThat(deniedPreflight.headers().firstValue("Access-Control-Allow-Origin")).isEmpty();
        assertThat(deniedPreflight.headers().firstValue("X-Request-ID")).isPresent();
        System.out.println("CORS_DENIED_STATUS=" + deniedPreflight.statusCode() + " BODY=" + deniedPreflight.body());
    }

    @Test
    void databaseLookupFailureInJwtConverterReturnsSafe503AndClearsRequestContext() throws Exception {
        String email = email("db-failure");
        Long id = registerAndGetId(email, phone("f"), PASSWORD);
        String token = loginToken(email, PASSWORD);
        doThrow(new DataAccessResourceFailureException("SENTINEL_PRIVATE_DATABASE_DIAGNOSTIC"))
                .when(customers).findById(id);

        HttpResponse<String> response = get("/api/customers/me", token, Map.of());
        assertError(response, 503, "DEPENDENCY_UNAVAILABLE");
        assertThat(response.body()).doesNotContain("SENTINEL_PRIVATE_DATABASE_DIAGNOSTIC").doesNotContain(token);
    }

    @Test
    void bootstrapIsDisabledByDefaultAndEnabledModeIsIdempotentWithoutPromotingOrUnlocking() throws Exception {
        String disabledEmail = email("bootstrap-disabled");
        BootstrapAdminProperties disabled = new BootstrapAdminProperties();
        assertThat(bootstrapService.ensureAdmin(disabled)).isEqualTo(AdminBootstrapService.Result.DISABLED);
        assertThat(jdbc.queryForObject("select count(*) from customers where email=?", Integer.class, disabledEmail)).isZero();

        BootstrapAdminProperties incomplete = new BootstrapAdminProperties();
        incomplete.setEnabled(true);
        incomplete.setPassword("SENTINEL_BOOTSTRAP_PASSWORD");
        assertThatThrownBy(() -> bootstrapService.ensureAdmin(incomplete))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Bootstrap admin configuration is incomplete or invalid")
                .hasMessageNotContaining("SENTINEL_BOOTSTRAP_PASSWORD");

        String email = email("bootstrap-enabled");
        String firstPassword = "bootstrap fake password 1";
        BootstrapAdminProperties enabled = bootstrapProperties(" " + email.toUpperCase(java.util.Locale.ROOT) + " ",
                " " + phone("b") + " ", " First Admin ", firstPassword);
        assertThat(bootstrapService.ensureAdmin(enabled)).isEqualTo(AdminBootstrapService.Result.CREATED);
        Long id = jdbc.queryForObject("select id from customers where email=?", Long.class, email);
        String hash = jdbc.queryForObject("select password_hash from customers where id=?", String.class, id);
        assertThat(passwordEncoder.matches(firstPassword, hash)).isTrue();
        assertThat(jdbc.queryForMap("select role, status, kyc_status, email_verified from customers where id=?", id))
                .containsEntry("role", "ADMIN").containsEntry("status", "ACTIVE")
                .containsEntry("kyc_status", "NONE").containsEntry("email_verified", false);
        BootstrapAdminProperties changed = bootstrapProperties(email, phone("z"), "Changed Admin", "changed fake password");
        assertThat(bootstrapService.ensureAdmin(changed)).isEqualTo(AdminBootstrapService.Result.ALREADY_PRESENT);
        assertThat(jdbc.queryForObject("select password_hash from customers where id=?", String.class, id)).isEqualTo(hash);
        assertThat(jdbc.queryForObject("select full_name from customers where id=?", String.class, id)).isEqualTo("First Admin");

        String customerEmail = email("bootstrap-customer");
        Long customerId = registerAndGetId(customerEmail, phone("q"), PASSWORD);
        assertThatThrownBy(() -> bootstrapService.ensureAdmin(bootstrapProperties(customerEmail,
                phone("q"), "Cannot Promote", "bootstrap fake password")))
                .isInstanceOf(IllegalStateException.class);
        assertThat(jdbc.queryForObject("select role from customers where id=?", String.class, customerId)).isEqualTo("CUSTOMER");

        String lockedAdminEmail = email("bootstrap-locked");
        Long lockedAdminId = jdbc.queryForObject("insert into customers(full_name,email,phone,password_hash,role,status) "
                + "values ('Locked Admin',?,?,?, 'ADMIN','LOCKED') returning id", Long.class,
                lockedAdminEmail, phone("k"), passwordEncoder.encode("existing fake password"));
        assertThatThrownBy(() -> bootstrapService.ensureAdmin(bootstrapProperties(lockedAdminEmail,
                phone("k"), "Do Not Unlock", "bootstrap fake password")))
                .isInstanceOf(IllegalStateException.class);
        assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, lockedAdminId)).isEqualTo("LOCKED");

        String collisionEmail = email("bootstrap-phone-conflict");
        String usedPhone = phone("p");
        registerAndGetId(email("bootstrap-phone-owner"), usedPhone, PASSWORD);
        assertThatThrownBy(() -> bootstrapService.ensureAdmin(bootstrapProperties(collisionEmail,
                usedPhone, "Phone Conflict", "bootstrap fake password")))
                .isInstanceOf(IllegalStateException.class);
        assertThat(jdbc.queryForObject("select count(*) from customers where email=?", Integer.class, collisionEmail)).isZero();
    }

    private Long registerAndGetId(String email, String phone, String password) throws Exception {
        HttpResponse<String> registered = post("/api/auth/register", registerJson("Integration Customer", email, phone, password));
        assertThat(registered.statusCode()).isEqualTo(201);
        return json(registered).path("data").path("id").asLong();
    }

    private Long insertCustomer(String fullName, String email, String phone, String passwordHash) {
        return jdbc.queryForObject("insert into customers(full_name,email,phone,password_hash,role,status,kyc_status,email_verified) "
                        + "values (?,?,?,?,'CUSTOMER','ACTIVE','NONE',false) returning id",
                Long.class, fullName, email, phone, passwordHash);
    }

    private String loginToken(String email, String password) throws Exception {
        HttpResponse<String> response = post("/api/auth/login", loginJson(email, password));
        assertThat(response.statusCode()).isEqualTo(200);
        return json(response).path("data").path("accessToken").asText();
    }

    private String registerJson(String name, String email, String phone, String password) throws Exception {
        return objectMapper.writeValueAsString(Map.of("fullName", name, "email", email, "phone", phone, "password", password));
    }

    private String loginJson(String email, String password) throws Exception {
        return objectMapper.writeValueAsString(Map.of("email", email, "password", password));
    }

    private HttpResponse<String> post(String path, String json) throws Exception {
        return post(path, json, Map.of());
    }

    private HttpResponse<String> post(String path, String json, Map<String, String> headers) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri(path)).header("Content-Type", "application/json")
                .header("Accept", "application/json");
        headers.forEach(builder::header);
        HttpRequest request = builder.POST(HttpRequest.BodyPublishers.ofString(json)).build();
        return CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(String path, String token, Map<String, String> headers) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri(path)).header("Accept", "application/json");
        if (token != null) builder.header("Authorization", "Bearer " + token);
        headers.forEach(builder::header);
        return CLIENT.send(builder.GET().build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) { return URI.create("http://127.0.0.1:" + port + path); }

    private JsonNode json(HttpResponse<String> response) throws Exception {
        return objectMapper.readTree(response.body());
    }

    private void assertTrace(HttpResponse<String> response, JsonNode envelope) {
        String trace = response.headers().firstValue("X-Request-ID").orElseThrow();
        assertThat(UUID.fromString(trace)).isNotNull();
        assertThat(envelope.path("traceId").asText()).isEqualTo(trace);
    }

    private void assertError(HttpResponse<String> response, int status, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode envelope = json(response);
        assertThat(envelope.path("success").asBoolean()).isFalse();
        assertThat(envelope.path("code").asText()).isEqualTo(code);
        assertThat(envelope.path("data").isNull()).isTrue();
        assertThat(envelope.path("errors").isArray()).isTrue();
        assertThat(envelope.path("errors")).isEmpty();
        assertTrace(response, envelope);
    }

    private String email(String label) { return label + "-" + SUFFIX + "@example.test"; }
    private String phone(String prefix) { return prefix + SUFFIX.substring(0, 18); }

    private HttpResponse<String> awaitAndPost(CountDownLatch start, String body) {
        try {
            start.await();
            return post("/api/auth/register", body);
        } catch (Exception exception) {
            throw new IllegalStateException("Concurrent registration request failed", exception);
        }
    }

    private BootstrapAdminProperties bootstrapProperties(String email, String phone, String fullName, String password) {
        BootstrapAdminProperties properties = new BootstrapAdminProperties();
        properties.setEnabled(true);
        properties.setEmail(email);
        properties.setPhone(phone);
        properties.setFullName(fullName);
        properties.setPassword(password);
        return properties;
    }

    private static String renderLogEvent(ILoggingEvent event) {
        StringBuilder rendered = new StringBuilder(event.getFormattedMessage());
        rendered.append(' ').append(event.getMDCPropertyMap());
        appendThrowable(rendered, event.getThrowableProxy());
        return rendered.toString();
    }

    private static void appendThrowable(StringBuilder rendered, IThrowableProxy throwable) {
        if (throwable == null) return;
        rendered.append(' ').append(throwable.getClassName()).append(": ").append(throwable.getMessage());
        appendThrowable(rendered, throwable.getCause());
        for (IThrowableProxy suppressed : throwable.getSuppressed()) {
            appendThrowable(rendered, suppressed);
        }
    }

    /** Temporary root appender that snapshots formatted events and throwable causes safely across HTTP threads. */
    private static final class ThreadSafeLogCapture extends AppenderBase<ILoggingEvent> implements AutoCloseable {
        private final Logger root;
        private final List<ILoggingEvent> events = Collections.synchronizedList(new ArrayList<>());

        private ThreadSafeLogCapture() {
            LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
            setContext(context);
            setName("p03-fix01-log-capture-" + UUID.randomUUID());
            root = context.getLogger(Logger.ROOT_LOGGER_NAME);
            start();
            root.addAppender(this);
        }

        @Override
        protected void append(ILoggingEvent event) {
            event.prepareForDeferredProcessing();
            events.add(event);
        }

        private List<ILoggingEvent> snapshot() {
            synchronized (events) {
                return List.copyOf(events);
            }
        }

        @Override
        public void close() {
            root.detachAppender(this);
            stop();
        }
    }

    private Map<String, Object> claims(String sub, String issuer, String audience,
            Instant issuedAt, Instant expiresAt, Instant notBefore) {
        Map<String, Object> claims = new LinkedHashMap<>();
        if (issuer != null) claims.put("iss", issuer);
        if (audience != null) claims.put("aud", List.of(audience));
        if (sub != null) claims.put("sub", sub);
        if (issuedAt != null) claims.put("iat", Date.from(issuedAt));
        if (expiresAt != null) claims.put("exp", Date.from(expiresAt));
        if (notBefore != null) claims.put("nbf", Date.from(notBefore));
        return claims;
    }

    private String signedRs256Token(Map<String, Object> claims) throws Exception {
        JWTClaimsSet.Builder claimSet = new JWTClaimsSet.Builder();
        claims.forEach(claimSet::claim);
        SignedJWT signed = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.RS256).type(JOSEObjectType.JWT).build(), claimSet.build());
        signed.sign(new RSASSASigner(TestJwtKeys.privateKey()));
        return signed.serialize();
    }
}
