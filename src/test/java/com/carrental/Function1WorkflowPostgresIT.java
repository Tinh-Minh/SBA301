package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.exception.ErrorCode;
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
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
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
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Real HTTP/JWT/security/storage workflow across the five Function 1 tables on isolated PostgreSQL. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false"
})
@Import(Function1WorkflowPostgresIT.FixedClockConfiguration.class)
class Function1WorkflowPostgresIT {
    private static final String PASSWORD = "P10 synthetic account password";
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final Instant BASE = Instant.parse("2026-10-14T03:00:00Z");
    private static final MutableTestClock TEST_CLOCK = new MutableTestClock(BASE, ZONE);
    private static final Path PRIVATE_ROOT = createPrivateRoot();
    private static final HttpClient CLIENT = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    @Container private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:15.13-alpine");

    @TestConfiguration(proxyBeanMethods = false)
    static class FixedClockConfiguration {
        @Bean @Primary java.time.Clock p10WorkflowClock() { return TEST_CLOCK; }
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
        registry.add("app.document.storage.root", PRIVATE_ROOT::toString);
    }

    @LocalServerPort private int port;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JsonMapper mapper;

    @AfterEach
    void resetClock() { TEST_CLOCK.set(BASE); }

    @AfterAll
    static void removePrivateRoot() throws Exception {
        if (!Files.exists(PRIVATE_ROOT)) return;
        Path temp = Path.of(System.getProperty("java.io.tmpdir")).toRealPath();
        Path root = PRIVATE_ROOT.toRealPath();
        if (!root.startsWith(temp) || root.equals(temp) || !root.getFileName().toString().startsWith("sba301-p10-workflow-private-")) {
            throw new IllegalStateException("Refusing to remove an unexpected P10 private root");
        }
        try (var entries = Files.walk(root)) {
            for (Path entry : entries.sorted(java.util.Comparator.reverseOrder()).toList()) Files.deleteIfExists(entry);
        }
    }

    @Test
    void realHttpWorkflowPreservesIdentityOwnershipCurrentEligibilityAndVoucherBoundary() throws Exception {
        TEST_CLOCK.set(BASE);
        try (LogCapture logs = new LogCapture()) {
            String suffix = UUID.randomUUID().toString().replace("-", "");
            String privateMarker = "P10-SENTINEL-" + suffix.substring(0, 20);
            Account admin = provisionAdmin(suffix);
            String adminToken = login(admin.email());

            Account customer = register("customer", "P10 Synthetic Customer");
            Account peer = register("peer", "P10 Synthetic Peer");
            String customerToken = login(customer.email());
            String peerToken = login(peer.email());

            // The auth String-setter DTOs have no duplicate-field guard; document the existing P03 runtime.
            HttpResponse<String> duplicateEmailLogin = send("POST", "/api/auth/login", null,
                    "{\"email\":\"" + admin.email() + "\",\"email\":\"" + admin.email()
                            + "\",\"password\":\"" + PASSWORD + "\"}");
            assertThat(duplicateEmailLogin.statusCode()).as("same duplicate email key remains accepted by auth runtime")
                    .isEqualTo(200);
            JsonNode duplicateLoginEnvelope = json(duplicateEmailLogin);
            assertThat(duplicateLoginEnvelope.path("success").asBoolean()).isTrue();
            assertThat(duplicateLoginEnvelope.path("data").path("tokenType").asText()).isEqualTo("Bearer");
            assertThat(duplicateEmailLogin.headers().firstValue("X-Request-ID").orElseThrow())
                    .isEqualTo(duplicateLoginEnvelope.path("traceId").asText());

            byte[] image = png();
            HttpResponse<String> minimumPassportSubmission = uploadMinimumPassport(peerToken,
                    "P10-MIN-PASSPORT-" + suffix, image);
            JsonNode minimumPassport = json(assertSuccess(minimumPassportSubmission, 201)).path("data");
            assertThat(minimumPassport.path("docType").asText()).isEqualTo("PASSPORT");
            assertThat(minimumPassport.path("verifyStatus").asText()).isEqualTo("PENDING");
            assertThat(minimumPassport.path("fullNameOnDoc").isNull()).isTrue();

            int customerDocumentsBeforeLicenseError = jdbc.queryForObject(
                    "select count(*) from user_documents where customer_id=?", Integer.class, customer.id());
            int filesBeforeLicenseError = privateFileCount();
            assertError(uploadLicenseWithoutClass(customerToken, "P10-MISSING-CLASS-" + suffix, image),
                    400, "VALIDATION_ERROR");
            assertThat(jdbc.queryForObject("select count(*) from user_documents where customer_id=?", Integer.class,
                    customer.id())).isEqualTo(customerDocumentsBeforeLicenseError);
            assertThat(privateFileCount()).isEqualTo(filesBeforeLicenseError);

            HttpResponse<String> health = send("GET", "/api/health", null, null);
            assertSuccess(health, 200);
            assertThat(json(health).path("data").path("status").asText()).isEqualTo("UP");
            JsonNode own = json(assertSuccess(send("GET", "/api/customers/me", customerToken, null), 200)).path("data");
            assertFields(own, "id", "fullName", "email", "phone", "dateOfBirth", "address", "avatarUrl",
                    "emailVerified", "kycStatus", "role", "status", "createdAt", "updatedAt");
            assertThat(own.path("id").asLong()).isEqualTo(customer.id());
            assertThat(own.path("role").asText()).isEqualTo("CUSTOMER");
            assertThat(own.path("status").asText()).isEqualTo("ACTIVE");
            assertThat(own.path("kycStatus").asText()).isEqualTo("NONE");

            JsonNode profile = json(assertSuccess(send("PATCH", "/api/customers/me", customerToken,
                    "{\"fullName\":\"P10 Profile Updated\",\"dateOfBirth\":\"1990-01-02\",\"address\":\"Synthetic address\"}"), 200)).path("data");
            assertFields(profile, "id", "fullName", "email", "phone", "dateOfBirth", "address", "avatarUrl",
                    "emailVerified", "kycStatus", "role", "status", "createdAt", "updatedAt");
            assertThat(profile.path("fullName").asText()).isEqualTo("P10 Profile Updated");
            assertThat(jdbc.queryForObject("select full_name from customers where id=?", String.class, customer.id()))
                    .isEqualTo("P10 Profile Updated");

            assertError(send("PATCH", "/api/customers/me", customerToken, "{\"fullName\":null}"),
                    400, "VALIDATION_ERROR");
            String address301 = "A".repeat(301);
            HttpResponse<String> longAddress = send("PATCH", "/api/customers/me", customerToken,
                    "{\"address\":\"" + address301 + "\"}");
            assertError(longAddress, 400, "VALIDATION_ERROR");
            assertThat(longAddress.body()).doesNotContain(address301);
            assertThat(jdbc.queryForObject("select full_name from customers where id=?", String.class, customer.id()))
                    .isEqualTo("P10 Profile Updated");
            JsonNode address300 = json(assertSuccess(send("PATCH", "/api/customers/me", customerToken,
                    "{\"address\":\"" + "A".repeat(300) + "\"}"), 200)).path("data");
            assertThat(address300.path("fullName").asText()).isEqualTo("P10 Profile Updated");
            assertThat(address300.path("address").asText()).hasSize(300);
            JsonNode clearedAddress = json(assertSuccess(send("PATCH", "/api/customers/me", customerToken,
                    "{\"address\":null}"), 200)).path("data");
            assertThat(clearedAddress.path("address").isNull()).isTrue();

            for (String status : List.of("PENDING", "ACTIVE", "SUSPENDED")) {
                assertSuccess(send("GET", "/api/drivers?status=" + status, adminToken, null), 200);
            }
            for (String status : List.of("LOCKED", "INACTIVE")) {
                assertError(send("GET", "/api/drivers?status=" + status, adminToken, null), 400, "INVALID_REQUEST");
            }
            for (String status : List.of("ACTIVE", "INACTIVE")) {
                assertSuccess(send("GET", "/api/vouchers?status=" + status, adminToken, null), 200);
            }
            for (String status : List.of("PENDING", "SUSPENDED", "LOCKED")) {
                assertError(send("GET", "/api/vouchers?status=" + status, adminToken, null), 400, "INVALID_REQUEST");
            }

            String customerStatusBeforeRejectedCommands = jdbc.queryForObject(
                    "select status from customers where id=?", String.class, customer.id());
            String customerAuditBeforeRejectedCommands = jdbc.queryForObject(
                    "select updated_at::text from customers where id=?", String.class, customer.id());
            assertError(send("PATCH", "/api/customers/" + customer.id() + "/status", adminToken,
                    "{\"status\":\"LOCKED\"}"), 400, "INVALID_REQUEST");
            assertError(send("PATCH", "/api/customers/" + customer.id() + "/status", adminToken,
                    "{\"status\":\"LOCKED\",\"reason\":null}"), 400, "VALIDATION_ERROR");
            assertError(send("PATCH", "/api/customers/" + customer.id() + "/status", adminToken,
                    "{\"status\":\"LOCKED\",\"reason\":\"   \"}"), 400, "VALIDATION_ERROR");
            String oversizedCustomerReason = "R".repeat(501);
            HttpResponse<String> oversizedReason = send("PATCH", "/api/customers/" + customer.id() + "/status", adminToken,
                    "{\"status\":\"LOCKED\",\"reason\":\"" + oversizedCustomerReason + "\"}");
            assertError(oversizedReason, 400, "VALIDATION_ERROR");
            assertThat(oversizedReason.body()).doesNotContain(oversizedCustomerReason);
            assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, customer.id()))
                    .isEqualTo(customerStatusBeforeRejectedCommands);
            assertThat(jdbc.queryForObject("select updated_at::text from customers where id=?", String.class, customer.id()))
                    .isEqualTo(customerAuditBeforeRejectedCommands);

            JsonNode passport = json(assertSuccess(upload(customerToken, "PASSPORT", "P10-PASSPORT-" + suffix,
                    null, image), 201)).path("data");
            JsonNode license = json(assertSuccess(upload(customerToken, "DRIVER_LICENSE", "P10-LICENSE-" + suffix,
                    "B2", image), 201)).path("data");
            assertFields(passport, "id", "customerId", "docType", "docNumber", "fullNameOnDoc", "dateOfBirthOnDoc",
                    "issuePlace", "issueDate", "expiresAt", "licenseClass", "verifyStatus", "rejectReason",
                    "verifiedById", "verifiedAt", "hasFrontImage", "hasBackImage", "createdAt", "updatedAt");
            long passportId = passport.path("id").asLong();
            long licenseId = license.path("id").asLong();
            assertThat(passport.path("verifyStatus").asText()).isEqualTo("PENDING");
            assertThat(json(assertSuccess(send("PATCH", "/api/user-documents/" + passportId + "/review", adminToken,
                    "{\"verifyStatus\":\"APPROVED\"}"), 200)).path("data").path("kycStatus").asText())
                    .isEqualTo("VERIFIED");
            assertSuccess(send("PATCH", "/api/user-documents/" + licenseId + "/review", adminToken,
                    "{\"verifyStatus\":\"APPROVED\"}"), 200);

            HttpResponse<byte[]> ownerDownload = sendBinary("GET", "/api/user-documents/" + licenseId + "/files/front", customerToken);
            assertBinaryTrace(ownerDownload);
            assertThat(ownerDownload.statusCode()).isEqualTo(200);
            assertThat(ownerDownload.headers().firstValue("Content-Type").orElse("")).startsWith("image/png");
            assertThat(ownerDownload.headers().firstValue("Content-Disposition").orElse("")).contains("attachment");
            assertThat(ownerDownload.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
            assertThat(ownerDownload.headers().firstValue("X-Content-Type-Options").orElse(""))
                    .contains("nosniff");
            assertThat(ownerDownload.body()).startsWith(new byte[]{(byte) 0x89, 'P', 'N', 'G'});
            assertError(send("GET", "/api/user-documents/" + licenseId + "/files/front", peerToken, null),
                    404, "RESOURCE_NOT_FOUND");

            JsonNode driver = json(assertSuccess(send("POST", "/api/drivers", customerToken, null), 201)).path("data");
            assertFields(driver, "id", "customerId", "status", "createdAt", "updatedAt");
            long driverId = driver.path("id").asLong();
            assertThat(driver.path("status").asText()).isEqualTo("PENDING");
            String driverAuditBeforeRejectedCommands = jdbc.queryForObject(
                    "select updated_at::text from drivers where id=?", String.class, driverId);
            assertError(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                    "{\"status\":\"ACTIVE\",\"reason\":\"not accepted\"}"), 400, "INVALID_REQUEST");
            assertError(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                    "{\"status\":\"SUSPENDED\"}"), 400, "VALIDATION_ERROR");
            assertError(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                    "{\"status\":\"SUSPENDED\",\"reason\":null}"), 400, "VALIDATION_ERROR");
            assertThat(jdbc.queryForObject("select status from drivers where id=?", String.class, driverId)).isEqualTo("PENDING");
            assertThat(jdbc.queryForObject("select updated_at::text from drivers where id=?", String.class, driverId))
                    .isEqualTo(driverAuditBeforeRejectedCommands);
            assertSuccess(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                    "{\"status\":\"ACTIVE\"}"), 200);
            assertError(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                    "{\"status\":\"SUSPENDED\",\"reason\":\"   \"}"), 400, "VALIDATION_ERROR");
            assertThat(jdbc.queryForObject("select status from drivers where id=?", String.class, driverId)).isEqualTo("ACTIVE");
            assertSuccess(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                    "{\"status\":\"SUSPENDED\",\"reason\":\"synthetic suspension\"}"), 200);
            assertSuccess(send("PATCH", "/api/drivers/" + driverId + "/status", adminToken,
                    "{\"status\":\"ACTIVE\",\"reason\":null}"), 200);
            JsonNode eligible = json(assertSuccess(send("GET", "/api/drivers/" + driverId + "/eligibility", customerToken, null), 200))
                    .path("data");
            assertThat(eligible.path("eligibleNow").asBoolean()).isTrue();
            assertThat(eligible.path("kycStatus").asText()).isEqualTo("VERIFIED");

            String fullAccountNumber = "0010" + suffix.substring(0, 12);
            JsonNode bankOne = json(assertSuccess(send("POST", "/api/bank-accounts", customerToken,
                    "{\"bankName\":\"P10 Synthetic Bank\",\"accountNumber\":\"" + fullAccountNumber
                            + "\",\"accountHolder\":\"P10 Synthetic Owner\"}"), 201)).path("data");
            assertFields(bankOne, "id", "customerId", "bankName", "accountNumberMasked", "accountHolder", "isDefault", "createdAt");
            long bankOneId = bankOne.path("id").asLong();
            assertThat(bankOne.path("isDefault").asBoolean()).isFalse();
            assertThat(bankOne.path("accountNumberMasked").asText()).doesNotContain(fullAccountNumber);
            String bankTwoNumber = "0020" + suffix.substring(0, 12);
            JsonNode bankTwo = json(assertSuccess(send("POST", "/api/bank-accounts", customerToken,
                    "{\"bankName\":\"P10 Synthetic Bank\",\"accountNumber\":\"" + bankTwoNumber
                            + "\",\"accountHolder\":\"P10 Synthetic Owner\",\"makeDefault\":true}"), 201)).path("data");
            long bankTwoId = bankTwo.path("id").asLong();
            assertThat(bankTwo.path("isDefault").asBoolean()).isTrue();
            JsonNode bankThree = json(assertSuccess(send("POST", "/api/bank-accounts", customerToken,
                    "{\"bankName\":\"P10 Other Bank\",\"accountNumber\":\"0030" + suffix.substring(0, 12)
                            + "\",\"accountHolder\":\"P10 Synthetic Owner\",\"makeDefault\":false}"), 201)).path("data");
            assertThat(bankThree.path("isDefault").asBoolean()).isFalse();
            assertSuccess(send("PATCH", "/api/bank-accounts/" + bankOneId + "/default", customerToken, null), 200);
            String selectedAudit = jdbc.queryForObject("select created_at::text from bank_accounts where id=?", String.class, bankOneId);
            assertSuccess(send("PATCH", "/api/bank-accounts/" + bankOneId + "/default", customerToken, null), 200);
            assertThat(jdbc.queryForObject("select created_at::text from bank_accounts where id=?", String.class, bankOneId))
                    .isEqualTo(selectedAudit);
            assertSuccess(send("DELETE", "/api/bank-accounts/" + bankOneId, customerToken, null), 200);
            assertThat(jdbc.queryForObject("select count(*) from bank_accounts where customer_id=? and is_default", Integer.class,
                    customer.id())).isZero();
            assertError(send("GET", "/api/bank-accounts/" + bankTwoId, peerToken, null), 404, "RESOURCE_NOT_FOUND");
            assertError(send("GET", "/api/bank-accounts/" + bankTwoId, adminToken, null), 404, "RESOURCE_NOT_FOUND");

            String voucherCode = "P10-CASE-" + suffix.substring(0, 8);
            String validVoucher = "{\"code\":\"" + voucherCode
                    + "\",\"discountType\":\"FIXED\",\"discountValue\":250,\"maxDiscount\":0,"
                    + "\"minOrderAmount\":0,\"startAt\":\"2026-10-14T09:00:00\","
                    + "\"endAt\":\"2026-10-15T23:59:00\",\"usageLimit\":10,\"perUserLimit\":1}";
            JsonNode voucher = json(assertSuccess(send("POST", "/api/vouchers", adminToken, validVoucher), 201)).path("data");
            assertFields(voucher, "id", "code", "description", "discountType", "discountValue", "maxDiscount",
                    "minOrderAmount", "startAt", "endAt", "usageLimit", "perUserLimit", "usedCount", "status",
                    "createdAt", "updatedAt", "windowState", "evaluatedAt");
            long voucherId = voucher.path("id").asLong();
            assertThat(voucher.path("status").asText()).isEqualTo("ACTIVE");
            assertThat(voucher.path("usedCount").asInt()).isZero();
            assertThat(voucher.path("windowState").asText()).isEqualTo("CURRENT");

            String voucherAuditBeforeIncompleteUpdates = jdbc.queryForObject(
                    "select updated_at::text from vouchers where id=?", String.class, voucher.path("id").asLong());
            assertError(send("PUT", "/api/vouchers/" + voucher.path("id").asLong(), adminToken,
                    "{\"description\":\"incomplete\"}"), 400, "INVALID_REQUEST");
            assertError(send("PUT", "/api/vouchers/" + voucher.path("id").asLong(), adminToken,
                    "{\"usageLimit\":10}"), 400, "INVALID_REQUEST");
            assertThat(jdbc.queryForObject("select updated_at::text from vouchers where id=?", String.class,
                    voucher.path("id").asLong())).isEqualTo(voucherAuditBeforeIncompleteUpdates);

            String duplicateCommandCode = "P10-DUPLICATE-" + suffix.substring(0, 8);
            String duplicateCommandBody = validVoucher.replace("\"code\":\"" + voucherCode + "\"",
                    "\"code\":\"" + duplicateCommandCode + "\",\"code\":\"" + duplicateCommandCode + "\"");
            assertError(send("POST", "/api/vouchers", adminToken, duplicateCommandBody), 400, "INVALID_REQUEST");
            assertThat(jdbc.queryForObject("select count(*) from vouchers where code=?", Integer.class,
                    duplicateCommandCode)).isZero();

            for (String[] invalidCase : List.of(
                    new String[] {"discountValue", "12.5", "VALIDATION_ERROR"},
                    new String[] {"discountValue", "12.00000000000000001", "VALIDATION_ERROR"},
                    new String[] {"maxDiscount", "12.5", "VALIDATION_ERROR"},
                    new String[] {"minOrderAmount", "12.5", "VALIDATION_ERROR"},
                    new String[] {"discountValue", "100.00000000000000001", "VALIDATION_ERROR"})) {
                String field = invalidCase[0];
                String raw = invalidCase[1];
                String rejectedCode = "12.5".equals(raw) && "discountValue".equals(field)
                        ? privateMarker : "P10-INVALID-" + suffix.substring(0, 6);
                String fieldToken = "\"" + field + "\":";
                String rejectedBody = validVoucher.replace(voucherCode, rejectedCode)
                        .replace(fieldToken + (field.equals("discountValue") ? "250" : "0"), fieldToken + raw);
                HttpResponse<String> rejected = send("POST", "/api/vouchers", adminToken, rejectedBody);
                assertError(rejected, 400, invalidCase[2]);
                assertThat(rejected.body()).doesNotContain(raw, rejectedCode);
                assertThat(jdbc.queryForObject("select count(*) from vouchers where code=?", Integer.class,
                        rejectedCode)).isZero();
            }
            String percentageOverLimit = validVoucher.replace(voucherCode, "P10-PERCENT-" + suffix.substring(0, 6))
                    .replace("\"discountType\":\"FIXED\"", "\"discountType\":\"PERCENT\"")
                    .replace("\"discountValue\":250", "\"discountValue\":101");
            assertError(send("POST", "/api/vouchers", adminToken, percentageOverLimit), 400, "VALIDATION_ERROR");
            assertThat(jdbc.queryForObject("select count(*) from vouchers where code=?", Integer.class,
                    "P10-PERCENT-" + suffix.substring(0, 6))).isZero();

            for (String[] quotaCase : List.of(
                    new String[] {"usageLimit", "1.0"},
                    new String[] {"usageLimit", "1e0"},
                    new String[] {"perUserLimit", "1.0"},
                    new String[] {"perUserLimit", "1e0"})) {
                String quota = quotaCase[0];
                String quotaToken = "\"" + quota + "\":1";
                String invalidQuotaBody = validVoucher.replace(voucherCode, "P10-QUOTA-" + suffix.substring(0, 6))
                        .replace(quotaToken, "\"" + quota + "\":" + quotaCase[1]);
                assertError(send("POST", "/api/vouchers", adminToken, invalidQuotaBody), 400, "INVALID_REQUEST");
                assertThat(jdbc.queryForObject("select count(*) from vouchers where code=?", Integer.class,
                        "P10-QUOTA-" + suffix.substring(0, 6))).isZero();
            }

            String decimalAmountCode = "P10-DECIMAL-AMOUNT-" + suffix.substring(0, 6);
            String decimalAmountBody = validVoucher.replace(voucherCode, decimalAmountCode)
                    .replace("\"discountValue\":250", "\"discountValue\":1.0")
                    .replace("\"maxDiscount\":0", "\"maxDiscount\":0e0")
                    .replace("\"minOrderAmount\":0", "\"minOrderAmount\":0.0");
            JsonNode decimalAmount = json(assertSuccess(send("POST", "/api/vouchers", adminToken,
                    decimalAmountBody), 201)).path("data");
            assertThat(decimalAmount.path("discountValue").decimalValue()).isEqualByComparingTo("1");
            assertThat(decimalAmount.path("maxDiscount").decimalValue()).isEqualByComparingTo("0");
            assertThat(decimalAmount.path("minOrderAmount").decimalValue()).isEqualByComparingTo("0");

            String exponentAmountCode = "P10-EXP-AMOUNT-" + suffix.substring(0, 6);
            String exponentAmountBody = validVoucher.replace(voucherCode, exponentAmountCode)
                    .replace("\"discountValue\":250", "\"discountValue\":1e0")
                    .replace("\"maxDiscount\":0", "\"maxDiscount\":1.0")
                    .replace("\"minOrderAmount\":0", "\"minOrderAmount\":1e0");
            assertSuccess(send("POST", "/api/vouchers", adminToken, exponentAmountBody), 201);

            String percentBoundaryCode = "P10-PERCENT-100-" + suffix.substring(0, 5);
            String percentBoundaryBody = validVoucher.replace(voucherCode, percentBoundaryCode)
                    .replace("\"discountType\":\"FIXED\"", "\"discountType\":\"PERCENT\"")
                    .replace("\"discountValue\":250", "\"discountValue\":100.0")
                    .replace("\"maxDiscount\":0", "\"maxDiscount\":1.0")
                    .replace("\"minOrderAmount\":0", "\"minOrderAmount\":0e0");
            assertSuccess(send("POST", "/api/vouchers", adminToken, percentBoundaryBody), 201);

            String defaultVoucherCode = "P10-DEFAULT-" + suffix.substring(0, 6);
            String defaultVoucherBody = "{\"code\":\"" + defaultVoucherCode
                    + "\",\"discountType\":\"FIXED\",\"discountValue\":1,"
                    + "\"startAt\":\"2026-10-14T09:00:00\",\"endAt\":\"2026-10-15T23:59:00\"}";
            JsonNode defaultVoucher = json(assertSuccess(send("POST", "/api/vouchers", adminToken,
                    defaultVoucherBody), 201)).path("data");
            assertThat(defaultVoucher.path("description").isNull()).isTrue();
            assertThat(defaultVoucher.path("maxDiscount").isNull()).isTrue();
            assertThat(defaultVoucher.path("minOrderAmount").decimalValue()).isEqualByComparingTo("0");
            assertThat(defaultVoucher.path("usageLimit").isNull()).isTrue();
            assertThat(defaultVoucher.path("perUserLimit").asInt()).isEqualTo(1);

            assertSuccess(send("PUT", "/api/vouchers/" + voucherId, adminToken,
                    "{\"description\":\"Synthetic handoff\",\"usageLimit\":10}"), 200);
            assertSuccess(send("PATCH", "/api/vouchers/" + voucherId + "/status", adminToken,
                    "{\"status\":\"INACTIVE\"}"), 200);
            assertSuccess(send("PATCH", "/api/vouchers/" + voucherId + "/status", adminToken,
                    "{\"status\":\"ACTIVE\"}"), 200);
            JsonNode filtered = json(assertSuccess(send("GET", "/api/vouchers?code=" + voucherCode + "&window=CURRENT",
                    adminToken, null), 200)).path("data");
            assertFields(filtered, "content", "page", "size", "totalElements", "totalPages");
            assertThat(filtered.path("totalElements").asInt()).isEqualTo(1);
            assertError(send("POST", "/api/vouchers", customerToken, validVoucher.replace(voucherCode, "P10-CUSTOMER-DENIED")),
                    403, "ACCESS_DENIED");
            String customerAuditBeforeLock = jdbc.queryForObject("select updated_at::text from customers where id=?", String.class,
                    customer.id());
            long tokenExpiry = jwtExpiration(customerToken);
            assertThat(tokenExpiry).isGreaterThan(TEST_CLOCK.instant().getEpochSecond());
            assertSuccess(send("GET", "/api/customers/me", customerToken, null), 200);
            List<String> protectedStateBeforeLock = protectedState(customer.id());
            int filesBeforeLock = privateFileCount();
            assertSuccess(send("PATCH", "/api/customers/" + customer.id() + "/status", adminToken,
                    "{\"status\":\"LOCKED\",\"reason\":\"P10 synthetic policy probe\"}"), 200);
            assertError(send("GET", "/api/customers/me", customerToken, null), 401, "INVALID_TOKEN");
            assertThat(protectedState(customer.id())).containsExactlyElementsOf(protectedStateBeforeLock);
            assertThat(privateFileCount()).isEqualTo(filesBeforeLock);
            assertThat(jdbc.queryForObject("select status from customers where id=?", String.class, customer.id())).isEqualTo("LOCKED");
            assertThat(jdbc.queryForObject("select updated_at::text from customers where id=?", String.class, customer.id()))
                    .isNotEqualTo(customerAuditBeforeLock);
            assertSuccess(send("PATCH", "/api/customers/" + customer.id() + "/status", adminToken,
                    "{\"status\":\"ACTIVE\",\"reason\":\"P10 synthetic unlock\"}"), 200);
            String unlockedToken = login(customer.email());
            assertSuccess(send("GET", "/api/customers/me", unlockedToken, null), 200);

            String storedDriverAudit = jdbc.queryForObject("select updated_at::text from drivers where id=?", String.class, driverId);
            TEST_CLOCK.set(BASE.plus(Duration.ofDays(2)));
            String futureCustomerToken = login(customer.email());
            String futureAdminToken = login(admin.email());
            JsonNode futureKyc = json(assertSuccess(send("GET", "/api/customers/me/kyc", futureCustomerToken, null), 200))
                    .path("data");
            assertThat(futureKyc.path("kycStatus").asText()).isEqualTo("VERIFIED");
            JsonNode currentEligibility = json(assertSuccess(send("GET", "/api/drivers/" + driverId + "/eligibility",
                    futureCustomerToken, null), 200)).path("data");
            assertThat(currentEligibility.path("driverStatus").asText()).isEqualTo("ACTIVE");
            assertThat(currentEligibility.path("eligibleNow").asBoolean()).isFalse();
            assertThat(currentEligibility.path("ineligibilityReasonCode").asText()).isEqualTo("VALID_DRIVER_LICENSE_REQUIRED");
            assertThat(jdbc.queryForObject("select status from drivers where id=?", String.class, driverId)).isEqualTo("ACTIVE");
            assertThat(jdbc.queryForObject("select updated_at::text from drivers where id=?", String.class, driverId))
                    .isEqualTo(storedDriverAudit);
            JsonNode futureVoucher = json(assertSuccess(send("GET", "/api/vouchers/" + voucherId, futureAdminToken, null), 200))
                    .path("data");
            assertThat(futureVoucher.path("status").asText()).isEqualTo("ACTIVE");
            assertThat(futureVoucher.path("windowState").asText()).isEqualTo("ENDED");
            assertThat(jdbc.queryForObject("select kyc_status from customers where id=?", String.class, customer.id()))
                    .isEqualTo("VERIFIED");

            List<String> captured = logs.messages();
            assertThat(captured).anyMatch(line -> line.contains("action=document-review"));
            assertThat(captured).anyMatch(line -> line.contains("action=driver-status"));
            assertThat(captured).anyMatch(line -> line.contains("action=bank-account-create"));
            assertThat(captured.stream().filter(line -> line.contains("action=bank-account-default")).count()).isEqualTo(1);
            assertThat(captured).anyMatch(line -> line.contains("action=voucher-create"));
            assertThat(captured).noneMatch(line -> line.contains(customerToken) || line.contains(peerToken)
                    || line.contains(adminToken) || line.contains(privateMarker) || line.contains(fullAccountNumber)
                    || line.contains(bankTwoNumber) || line.contains("P10-PASSPORT-" + suffix)
                    || line.contains("P10-LICENSE-" + suffix) || line.contains(customer.email()));
            System.out.printf("P10_WORKFLOW customerId=%d peerId=%d passportId=%d licenseId=%d driverId=%d bankIds=%d,%d voucherId=%d clockBase=2026-10-14 clockAdvanced=2026-10-16 storedDriver=ACTIVE currentEligible=false currentKyc=VERIFIED voucherWindow=ENDED%n",
                    customer.id(), peer.id(), passportId, licenseId, driverId, bankTwoId, bankThree.path("id").asLong(), voucherId);
            System.out.println("P10_WORKFLOW_TRACE health/json/binary=matched; foreignDocument/customerBank/adminBank=404; lockedOldJwt=401; voucherCustomer=403; fractionalVoucher=400/rows0; committedLogs=positive/privacy=clean");
        } finally {
            TEST_CLOCK.set(BASE);
        }
    }

    private Account provisionAdmin(String suffix) {
        String email = "p10-admin-" + suffix + "@example.test";
        String phone = "8" + suffix.substring(0, 19);
        long id = jdbc.queryForObject("insert into customers(full_name,email,phone,password_hash,email_verified,kyc_status,role,status) "
                        + "values (?,?,?,?,?,?,?,?) returning id", Long.class, "P10 Synthetic Admin", email, phone,
                passwordEncoder.encode(PASSWORD), true, KycStatus.NONE.name(), Role.ADMIN.name(), CustomerStatus.ACTIVE.name());
        return new Account(id, email);
    }

    private Account register(String label, String name) throws Exception {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String email = label + "-" + suffix + "@example.test";
        String phone = "7" + suffix.substring(0, 19);
        HttpResponse<String> response = send("POST", "/api/auth/register", null,
                "{\"fullName\":\"" + name + "\",\"email\":\"" + email + "\",\"phone\":\"" + phone
                        + "\",\"password\":\"" + PASSWORD + "\"}");
        JsonNode data = json(assertSuccess(response, 201)).path("data");
        assertThat(data.path("role").asText()).isEqualTo("CUSTOMER");
        assertThat(data.path("status").asText()).isEqualTo("ACTIVE");
        assertThat(data.path("kycStatus").asText()).isEqualTo("NONE");
        return new Account(data.path("id").asLong(), email);
    }

    private String login(String email) throws Exception {
        HttpResponse<String> response = send("POST", "/api/auth/login", null,
                "{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}");
        JsonNode data = json(assertSuccess(response, 200)).path("data");
        assertThat(data.path("tokenType").asText()).isEqualTo("Bearer");
        return data.path("accessToken").asText();
    }

    private HttpResponse<String> upload(String token, String type, String number, String licenseClass, byte[] image)
            throws Exception {
        return uploadMultipart(token, type, number, licenseClass, image, true, true);
    }

    private HttpResponse<String> uploadMinimumPassport(String token, String number, byte[] image) throws Exception {
        return uploadMultipart(token, "PASSPORT", number, null, image, false, false);
    }

    private HttpResponse<String> uploadLicenseWithoutClass(String token, String number, byte[] image) throws Exception {
        return uploadMultipart(token, "DRIVER_LICENSE", number, null, image, false, true);
    }

    private HttpResponse<String> uploadMultipart(String token, String type, String number, String licenseClass,
            byte[] image, boolean includeLicenseClass, boolean includeApprovalMetadata) throws Exception {
        String boundary = "p10-" + UUID.randomUUID().toString().replace("-", "");
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        addText(bytes, boundary, "docType", type);
        addText(bytes, boundary, "docNumber", number);
        if (includeApprovalMetadata) {
            addText(bytes, boundary, "fullNameOnDoc", "P10 Synthetic Customer");
            addText(bytes, boundary, "dateOfBirthOnDoc", "1990-01-02");
            addText(bytes, boundary, "issuePlace", "Synthetic province");
            addText(bytes, boundary, "issueDate", "2020-01-01");
        }
        if ("DRIVER_LICENSE".equals(type) && includeApprovalMetadata) {
            addText(bytes, boundary, "expiresAt", "2026-10-15");
        }
        if ("DRIVER_LICENSE".equals(type) && includeLicenseClass) addText(bytes, boundary, "licenseClass", licenseClass);
        addFile(bytes, boundary, "frontImage", "synthetic-front.png", image);
        if ("DRIVER_LICENSE".equals(type)) addFile(bytes, boundary, "backImage", "synthetic-back.png", image);
        bytes.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        HttpRequest request = HttpRequest.newBuilder(uri("/api/user-documents"))
                .timeout(Duration.ofSeconds(20)).header("Authorization", "Bearer " + token)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes.toByteArray())).build();
        return CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private void addText(ByteArrayOutputStream output, String boundary, String name, String value) throws Exception {
        output.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + name
                + "\"\r\n\r\n" + value + "\r\n").getBytes(StandardCharsets.UTF_8));
    }

    private void addFile(ByteArrayOutputStream output, String boundary, String name, String filename, byte[] content)
            throws Exception {
        output.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + name + "\"; filename=\""
                + filename + "\"\r\nContent-Type: image/png\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(content);
        output.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private HttpResponse<String> send(String method, String path, String token, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri(path)).timeout(Duration.ofSeconds(20));
        if (token != null) builder.header("Authorization", "Bearer " + token);
        if (body != null) builder.header("Content-Type", "application/json");
        return CLIENT.send(builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8)).build(),
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private HttpResponse<byte[]> sendBinary(String method, String path, String token) throws Exception {
        return CLIENT.send(HttpRequest.newBuilder(uri(path)).timeout(Duration.ofSeconds(20))
                        .header("Authorization", "Bearer " + token).GET().build(),
                HttpResponse.BodyHandlers.ofByteArray());
    }

    private HttpResponse<String> assertSuccess(HttpResponse<String> response, int status) throws Exception {
        assertThat(response.statusCode()).as("safe response envelope: %s", response.body()).isEqualTo(status);
        JsonNode envelope = json(response);
        assertThat(envelope.path("success").asBoolean()).isTrue();
        assertThat(envelope.path("code").asText()).isEqualTo("OK");
        assertThat(response.headers().firstValue("X-Request-ID").orElseThrow())
                .isEqualTo(envelope.path("traceId").asText());
        assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        return response;
    }

    private void assertError(HttpResponse<String> response, int status, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode envelope = json(response);
        assertThat(envelope.path("success").asBoolean()).isFalse();
        assertThat(envelope.path("code").asText()).isEqualTo(code);
        assertThat(response.headers().firstValue("X-Request-ID").orElseThrow())
                .isEqualTo(envelope.path("traceId").asText());
    }

    private void assertBinaryTrace(HttpResponse<byte[]> response) {
        assertThat(response.headers().firstValue("X-Request-ID")).isPresent();
    }

    private JsonNode json(HttpResponse<String> response) throws Exception { return mapper.readTree(response.body()); }

    private void assertFields(JsonNode node, String... expected) {
        java.util.Set<String> actual = new java.util.HashSet<>();
        node.propertyNames().forEach(actual::add);
        assertThat(actual).containsExactlyInAnyOrder(expected);
    }
    private URI uri(String path) { return URI.create("http://127.0.0.1:" + port + path); }

    private long jwtExpiration(String token) throws Exception {
        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);
        JsonNode claims = mapper.readTree(Base64.getUrlDecoder().decode(parts[1]));
        return claims.path("exp").asLong();
    }

    private List<String> protectedState(long customerId) {
        List<String> state = new ArrayList<>();
        state.addAll(jdbc.query("select id || '|' || verify_status || '|' || created_at::text || '|' || updated_at::text "
                        + "from user_documents where customer_id=? order by id", (rs, n) -> rs.getString(1), customerId));
        state.addAll(jdbc.query("select id || '|' || status || '|' || updated_at::text from drivers where customer_id=? order by id",
                (rs, n) -> rs.getString(1), customerId));
        state.addAll(jdbc.query("select id || '|' || account_number || '|' || is_default || '|' || created_at::text "
                        + "from bank_accounts where customer_id=? order by id", (rs, n) -> rs.getString(1), customerId));
        return List.copyOf(state);
    }

    private int privateFileCount() throws Exception {
        try (var files = Files.walk(PRIVATE_ROOT)) { return (int) files.filter(Files::isRegularFile).count(); }
    }

    private static byte[] png() throws Exception {
        BufferedImage image = new BufferedImage(24, 24, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < 24; y++) for (int x = 0; x < 24; x++) image.setRGB(x, y, (x * 31 << 16) | (y * 29 << 8) | 0x44);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private static Path createPrivateRoot() {
        try { return Files.createTempDirectory("sba301-p10-workflow-private-").toRealPath(); }
        catch (Exception exception) { throw new IllegalStateException("Unable to create isolated P10 private root", exception); }
    }

    private record Account(long id, String email) { }

    private static final class LogCapture extends AppenderBase<ILoggingEvent> implements AutoCloseable {
        private final Logger root = (Logger) LoggerFactory.getLogger(Logger.ROOT_LOGGER_NAME);
        private final List<String> events = new CopyOnWriteArrayList<>();
        LogCapture() { setContext((LoggerContext) LoggerFactory.getILoggerFactory()); start(); root.addAppender(this); }
        @Override protected void append(ILoggingEvent event) { events.add(event.getFormattedMessage()); }
        List<String> messages() { return List.copyOf(events); }
        @Override public void close() { root.detachAppender(this); stop(); }
    }
}
