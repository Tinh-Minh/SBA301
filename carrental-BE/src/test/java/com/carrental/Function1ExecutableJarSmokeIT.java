package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import java.util.zip.ZipFile;
import org.flywaydb.core.Flyway;

/** Runs the unmodified Maven executable JAR in a child JVM from an external Unicode/space working directory. */
@Testcontainers
class Function1ExecutableJarSmokeIT {
    private static final String PASSWORD = "P10 synthetic jar account password";
    private static final String DB_PASSWORD = "P10-db-" + UUID.randomUUID().toString().replace("-", "");
    @Container private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:15.13-alpine")
            .withDatabaseName("p10_jar_smoke").withUsername("p10_jar_user").withPassword(DB_PASSWORD);
    private static final HttpClient CLIENT = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    @Test
    void standardExecutableJarStartsWithExternalProfileAndServesRealHttpFlow() throws Exception {
        Path repo = Path.of("").toAbsolutePath().normalize();
        Path jar = repo.resolve("target/carrental-be-0.0.1-SNAPSHOT.jar").toRealPath();
        assertThat(jar.startsWith(repo.toRealPath())).isTrue();
        assertNoTestOrLocalResourcesPackaged(jar);
        String jarSha = sha256(jar);

        // Schema setup belongs to the isolated test harness, not the production executable JAR.
        Flyway.configure().dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration/function1", "classpath:db/migration/it-support").load().migrate();

        Path tempBase = Path.of(System.getProperty("java.io.tmpdir")).toRealPath();
        Path runRoot = Files.createTempDirectory(tempBase, "sba301-p10-jar-").toRealPath();
        Path configDirectory = Files.createTempDirectory(tempBase, "sba301-p10-config-").toRealPath();
        Path workingDirectory = runRoot.resolve("別の working directory Ω");
        Path privateRoot = Files.createTempDirectory(tempBase, "sba301-p10-storage-").toRealPath();
        Path logFile = runRoot.resolve("child-process.log");
        Process process = null;
        try {
            Files.createDirectories(configDirectory);
            Files.createDirectories(workingDirectory);
            Files.createDirectories(privateRoot);
            assertExternalTempPath(tempBase, workingDirectory, repo, jar);
            Properties config = new Properties();
            config.setProperty("spring.application.name", "carrental-p10-standard-jar-smoke");
            config.setProperty("spring.datasource.url", POSTGRES.getJdbcUrl());
            config.setProperty("spring.datasource.username", POSTGRES.getUsername());
            config.setProperty("spring.datasource.password", POSTGRES.getPassword());
            config.setProperty("spring.jpa.hibernate.ddl-auto", "validate");
            config.setProperty("spring.jpa.open-in-view", "false");
            config.setProperty("spring.flyway.enabled", "false");
            config.setProperty("spring.flyway.locations", "classpath:db/migration/function1");
            config.setProperty("app.security.jwt.issuer", TestJwtKeys.ISSUER);
            config.setProperty("app.security.jwt.audience", TestJwtKeys.AUDIENCE);
            config.setProperty("app.security.jwt.access-token-ttl", "PT10M");
            config.setProperty("app.security.jwt.clock-skew", "PT30S");
            config.setProperty("app.security.jwt.secret-key", TestJwtKeys.HS256_SECRET);
            config.setProperty("app.security.cors.allowed-origins", "");
            config.setProperty("app.security.bootstrap-admin.enabled", "false");
            config.setProperty("app.document.storage.enabled", "true");
            config.setProperty("app.document.storage.root", privateRoot.toString());
            config.setProperty("app.time.zone", "Asia/Ho_Chi_Minh");
            config.setProperty("server.port", "0");
            config.setProperty("spring.main.banner-mode", "off");
            Path profile = configDirectory.resolve("application-p10-smoke.properties");
            try (OutputStream output = Files.newOutputStream(profile)) { config.store(output, "Synthetic P10 external child-JVM profile"); }

            Path java = Path.of(System.getProperty("java.home"), "bin", isWindows() ? "java.exe" : "java");
            String externalConfigLocation = configDirectory.toUri().toString();
            ProcessBuilder builder = new ProcessBuilder(java.toString(), "-jar", jar.toString(),
                    "--spring.profiles.active=p10-smoke",
                    "--spring.config.additional-location=" + externalConfigLocation);
            builder.directory(workingDirectory.toFile());
            builder.redirectErrorStream(true);
            builder.redirectOutput(logFile.toFile());
            var environment = builder.environment();
            for (String key : new ArrayList<>(environment.keySet())) {
                String normalized = key.toUpperCase(Locale.ROOT);
                if (normalized.matches("DB_.*|JWT_.*|SPRING_DATASOURCE.*|SPRING_FLYWAY.*|SPRING_CONFIG.*|"
                        + "SPRING_PROFILES_ACTIVE|SPRING_APPLICATION_JSON|APP_DOCUMENT_STORAGE.*|BOOTSTRAP_ADMIN_.*|SERVER_PORT")) {
                    environment.remove(key);
                }
            }
            process = builder.start();
            int port = awaitHttpHealth(process, logFile);
            URI base = URI.create("http://127.0.0.1:" + port);
            HttpResponse<String> health = request(base, "GET", "/api/health", null, null, String.class);
            assertSuccess(health, 200);
            assertThat(MAPPER.readTree(health.body()).path("data").path("status").asText()).isEqualTo("UP");

            String suffix = UUID.randomUUID().toString().replace("-", "");
            String customerEmail = "p10-jar-customer-" + suffix + "@example.test";
            String customerPhone = "7" + suffix.substring(0, 19);
            HttpResponse<String> registered = request(base, "POST", "/api/auth/register", null,
                    "{\"fullName\":\"P10 Jar Synthetic Customer\",\"email\":\"" + customerEmail
                            + "\",\"phone\":\"" + customerPhone + "\",\"password\":\"" + PASSWORD + "\"}", String.class);
            assertSuccess(registered, 201);
            JsonNode customer = MAPPER.readTree(registered.body()).path("data");
            long customerId = customer.path("id").asLong();
            String customerToken = login(base, customerEmail);
            HttpResponse<String> me = request(base, "GET", "/api/customers/me", customerToken, null, String.class);
            assertSuccess(me, 200);
            assertThat(MAPPER.readTree(me.body()).path("data").path("id").asLong()).isEqualTo(customerId);

            String adminEmail = "p10-jar-admin-" + suffix + "@example.test";
            String adminPhone = "8" + suffix.substring(0, 19);
            try (Connection connection = DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                    PreparedStatement insert = connection.prepareStatement("insert into customers(full_name,email,phone,password_hash,email_verified,kyc_status,role,status) values(?,?,?,?,true,'NONE','ADMIN','ACTIVE')")) {
                insert.setString(1, "P10 Jar Synthetic Admin");
                insert.setString(2, adminEmail);
                insert.setString(3, adminPhone);
                insert.setString(4, new BCryptPasswordEncoder(10).encode(PASSWORD));
                assertThat(insert.executeUpdate()).isEqualTo(1);
            }
            String adminToken = login(base, adminEmail);

            byte[] image = png();
            String documentId = uploadPassport(base, customerToken, suffix, image);
            HttpResponse<byte[]> ownedDownload = requestBytes(base, "/api/user-documents/" + documentId + "/files/front",
                    customerToken);
            assertThat(ownedDownload.statusCode()).isEqualTo(200);
            assertThat(ownedDownload.headers().firstValue("Content-Type").orElse("")).startsWith("image/png");
            assertThat(ownedDownload.headers().firstValue("Content-Disposition").orElse("")).contains("attachment");
            assertThat(ownedDownload.headers().firstValue("X-Content-Type-Options").orElse("")).isEqualTo("nosniff");
            assertThat(ownedDownload.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
            assertThat(ownedDownload.headers().firstValue("X-Request-ID")).isPresent();
            String peerEmail = "p10-jar-peer-" + suffix + "@example.test";
            String peerPhone = "6" + suffix.substring(0, 19);
            request(base, "POST", "/api/auth/register", null,
                    "{\"fullName\":\"P10 Jar Synthetic Peer\",\"email\":\"" + peerEmail
                            + "\",\"phone\":\"" + peerPhone + "\",\"password\":\"" + PASSWORD + "\"}", String.class);
            String peerToken = login(base, peerEmail);
            HttpResponse<String> foreign = request(base, "GET", "/api/user-documents/" + documentId + "/files/front",
                    peerToken, null, String.class);
            assertError(foreign, 404, "RESOURCE_NOT_FOUND");

            String start = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).minusDays(1)
                    .format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ss"));
            String end = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1)
                    .format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ss"));
            String voucherCode = "P10-JAR-" + suffix.substring(0, 8);
            String validVoucher = "{\"code\":\"" + voucherCode + "\",\"discountType\":\"FIXED\",\"discountValue\":1.0,"
                    + "\"maxDiscount\":0,\"minOrderAmount\":0,\"startAt\":\"" + start + "\",\"endAt\":\"" + end
                    + "\",\"usageLimit\":5,\"perUserLimit\":1}";
            HttpResponse<String> voucher = request(base, "POST", "/api/vouchers", adminToken, validVoucher, String.class);
            assertSuccess(voucher, 201);
            String invalidCode = "P10-JAR-FRACTION-" + suffix.substring(0, 8);
            String invalidVoucher = validVoucher.replace(voucherCode, invalidCode)
                    .replace("\"discountValue\":1.0", "\"discountValue\":1.25");
            HttpResponse<String> rejected = request(base, "POST", "/api/vouchers", adminToken, invalidVoucher, String.class);
            assertThat(rejected.statusCode()).isEqualTo(400);
            assertThat(MAPPER.readTree(rejected.body()).path("success").asBoolean()).isFalse();
            assertThat(rejected.body()).doesNotContain(invalidCode, "1.25");
            try (Connection connection = DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                    PreparedStatement count = connection.prepareStatement("select count(*) from vouchers where code=?")) {
                count.setString(1, invalidCode);
                try (ResultSet result = count.executeQuery()) { assertThat(result.next()).isTrue(); assertThat(result.getInt(1)).isZero(); }
            }
            String childLog = Files.readString(logFile, StandardCharsets.UTF_8);
            assertThat(childLog).contains("p10-smoke");
            assertThat(childLog.contains(customerToken)).isFalse();
            assertThat(childLog.contains(adminToken)).isFalse();
            assertThat(childLog.contains(peerToken)).isFalse();
            assertThat(childLog.contains(PASSWORD)).isFalse();
            assertThat(childLog.contains(DB_PASSWORD)).isFalse();
            System.out.printf("P10_JAR_SMOKE mode=java-jar profile=p10-smoke cwdHasUnicodeAndSpaces=true externalConfigAndKeys=true health=200 trace=true register=201 login/me=200 privateUpload=201 ownerDownload=200 peerDownload=404 validVoucher=201 invalidFraction=400 rows=0 sha256=%s%n", jarSha);
        } finally {
            stopProcess(process);
            cleanupTemp(runRoot, tempBase, repo);
            cleanupTemp(configDirectory, tempBase, repo, "sba301-p10-config-");
            cleanupTemp(privateRoot, tempBase, repo, "sba301-p10-storage-");
        }
    }

    private static int awaitHttpHealth(Process process, Path logFile) throws Exception {
        Pattern portPattern = Pattern.compile("(?i)Tomcat started on port(?:\\(s\\))?:?\\s+(\\d+)");
        long deadline = System.nanoTime() + Duration.ofSeconds(90).toNanos();
        while (System.nanoTime() < deadline) {
            if (!process.isAlive()) {
                String output = Files.exists(logFile) ? Files.readString(logFile, StandardCharsets.UTF_8) : "<no child log>";
                throw new AssertionError("Executable JAR exited before health became available; exit="
                        + process.exitValue() + "; safe child log tail:\n" + safeLogTail(output));
            }
            if (Files.exists(logFile)) {
                Matcher matcher = portPattern.matcher(Files.readString(logFile, StandardCharsets.UTF_8));
                if (matcher.find()) {
                    int port = Integer.parseInt(matcher.group(1));
                    try {
                        HttpResponse<String> response = request(URI.create("http://127.0.0.1:" + port), "GET", "/api/health", null, null, String.class);
                        if (response.statusCode() == 200) return port;
                    } catch (java.io.IOException | InterruptedException ignored) {
                        if (ignored instanceof InterruptedException) Thread.currentThread().interrupt();
                    }
                }
            }
            Thread.sleep(200);
        }
        throw new AssertionError("Timed out waiting for actual executable JAR HTTP health.");
    }

    private static String safeLogTail(String output) {
        List<String> lines = output.lines().toList();
        int start = Math.max(0, lines.size() - 35);
        return String.join("\n", lines.subList(start, lines.size()))
                .replaceAll("(?i)(password|access-token|private-key|public-key)([=: ]+)[^\\s,]+", "$1$2[redacted]")
                .replaceAll("jdbc:postgresql://[^\\s]+", "jdbc:postgresql://[isolated-testcontainer]");
    }

    private static HttpResponse<String> request(URI base, String method, String path, String token, String body,
            Class<String> ignored) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(base.resolve(path)).timeout(Duration.ofSeconds(10));
        if (token != null) builder.header("Authorization", "Bearer " + token);
        if (body != null) builder.header("Content-Type", "application/json");
        return CLIENT.send(builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8)).build(),
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private static HttpResponse<byte[]> requestBytes(URI base, String path, String token) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(base.resolve(path)).timeout(Duration.ofSeconds(10));
        if (token != null) builder.header("Authorization", "Bearer " + token);
        return CLIENT.send(builder.GET().build(), HttpResponse.BodyHandlers.ofByteArray());
    }

    private static String login(URI base, String email) throws Exception {
        HttpResponse<String> response = request(base, "POST", "/api/auth/login", null,
                "{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}", String.class);
        assertSuccess(response, 200);
        return MAPPER.readTree(response.body()).path("data").path("accessToken").asText();
    }

    private static String uploadPassport(URI base, String token, String suffix, byte[] image) throws Exception {
        String boundary = "p10jar-" + UUID.randomUUID().toString().replace("-", "");
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        textPart(body, boundary, "docType", "PASSPORT");
        textPart(body, boundary, "docNumber", "P10-JAR-DOC-" + suffix);
        filePart(body, boundary, "frontImage", image);
        body.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        HttpRequest request = HttpRequest.newBuilder(base.resolve("/api/user-documents"))
                .timeout(Duration.ofSeconds(20)).header("Authorization", "Bearer " + token)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray())).build();
        HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        assertSuccess(response, 201);
        return MAPPER.readTree(response.body()).path("data").path("id").asText();
    }

    private static void textPart(ByteArrayOutputStream out, String boundary, String name, String value) throws Exception {
        out.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + name + "\"\r\n\r\n"
                + value + "\r\n").getBytes(StandardCharsets.UTF_8));
    }

    private static void filePart(ByteArrayOutputStream out, String boundary, String name, byte[] image) throws Exception {
        out.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + name
                + "\"; filename=\"synthetic.png\"\r\nContent-Type: image/png\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        out.write(image);
        out.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private static void assertSuccess(HttpResponse<String> response, int status) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode envelope = MAPPER.readTree(response.body());
        assertThat(envelope.path("success").asBoolean()).isTrue();
        assertThat(response.headers().firstValue("X-Request-ID").orElseThrow()).isEqualTo(envelope.path("traceId").asText());
        assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
    }

    private static void assertError(HttpResponse<String> response, int status, String code) throws Exception {
        assertThat(response.statusCode()).isEqualTo(status);
        JsonNode envelope = MAPPER.readTree(response.body());
        assertThat(envelope.path("success").asBoolean()).isFalse();
        assertThat(envelope.path("code").asText()).isEqualTo(code);
        assertThat(response.headers().firstValue("X-Request-ID").orElseThrow()).isEqualTo(envelope.path("traceId").asText());
    }

    private static byte[] png() throws Exception {
        BufferedImage image = new BufferedImage(16, 16, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < 16; y++) for (int x = 0; x < 16; x++) image.setRGB(x, y, (x * 31 << 16) | (y * 29 << 8) | 0x55);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private static void assertNoTestOrLocalResourcesPackaged(Path jar) throws Exception {
        try (ZipFile zip = new ZipFile(jar.toFile())) {
            List<String> names = zip.stream().map(entry -> entry.getName()).toList();
            assertThat(names).noneMatch(name -> name.endsWith("application-local.properties")
                    || name.contains("/TestJwtKeys.class") || name.contains("Function1WorkflowPostgresIT.class")
                    || name.contains("Function1ExecutableJarSmokeIT.class") || name.contains("/private.pem")
                    || name.contains("/public.pem"));
        }
    }

    private static String sha256(Path path) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(path));
        return java.util.HexFormat.of().formatHex(digest);
    }

    private static void assertExternalTempPath(Path temp, Path runRoot, Path repo, Path jar) throws Exception {
        Path resolved = runRoot.toRealPath();
        assertThat(resolved.startsWith(temp)).isTrue();
        assertThat(resolved.startsWith(repo.toRealPath())).isFalse();
        assertThat(resolved.startsWith(jar.getParent())).isFalse();
        assertThat(resolved.toString()).contains("Ω").contains(" ");
    }

    private static void stopProcess(Process process) throws Exception {
        if (process == null) return;
        if (process.isAlive()) {
            process.toHandle().descendants().forEach(ProcessHandle::destroyForcibly);
            process.destroyForcibly();
            if (!process.waitFor(8, TimeUnit.SECONDS)) throw new IllegalStateException("Executable JAR child did not stop.");
        }
        process.getOutputStream().close();
        process.getInputStream().close();
        process.getErrorStream().close();
    }

    private static void cleanupTemp(Path runRoot, Path temp, Path repo) throws Exception {
        cleanupTemp(runRoot, temp, repo, "sba301-p10-jar-");
    }

    private static void cleanupTemp(Path runRoot, Path temp, Path repo, String prefix) throws Exception {
        if (!Files.exists(runRoot)) return;
        Path root = runRoot.toRealPath();
        if (!root.startsWith(temp) || root.equals(temp) || root.startsWith(repo.toRealPath())
                || !root.getFileName().toString().startsWith(prefix)) {
            throw new IllegalStateException("Refusing to remove an unexpected P10 JAR smoke path.");
        }
        java.nio.file.FileSystemException lastFailure = null;
        for (int attempt = 0; attempt < 40; attempt++) {
            try {
                if (!Files.exists(root)) return;
                try (var files = Files.walk(root)) {
                    for (Path entry : files.sorted(java.util.Comparator.reverseOrder()).toList()) Files.deleteIfExists(entry);
                }
                return;
            } catch (java.nio.file.FileSystemException lockedPath) {
                lastFailure = lockedPath;
                Thread.sleep(100);
            }
        }
        throw lastFailure;
    }

    private static boolean isWindows() { return System.getProperty("os.name").toLowerCase().contains("win"); }
}
