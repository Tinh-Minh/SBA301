package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.carrental.entity.BankAccount;
import com.carrental.entity.Customer;
import com.carrental.entity.Driver;
import com.carrental.entity.UserDocument;
import com.carrental.entity.Voucher;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.VerificationStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.enums.DocumentType;
import com.carrental.enums.VoucherStatus;
import com.carrental.repository.BankAccountRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.DriverRepository;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.repository.VoucherRepository;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

/** PostgreSQL-only checks for the Function 1 schema and mappings. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration/function1",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.jpa.open-in-view=false"
})
class Function1PostgresIT {

    private static final String SUFFIX = UUID.randomUUID().toString().replace("-", "");

    @Container
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:15.13-alpine");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        properties.add("spring.datasource.username", POSTGRES::getUsername);
        properties.add("spring.datasource.password", POSTGRES::getPassword);
        properties.add("app.security.jwt.issuer", () -> TestJwtKeys.ISSUER);
        properties.add("app.security.jwt.audience", () -> TestJwtKeys.AUDIENCE);
        properties.add("app.security.jwt.access-token-ttl", () -> "PT5M");
        properties.add("app.security.jwt.clock-skew", () -> "PT30S");
        properties.add("app.security.jwt.private-key-location", TestJwtKeys::privateKeyLocation);
        properties.add("app.security.jwt.public-key-location", TestJwtKeys::publicKeyLocation);
        properties.add("app.security.cors.allowed-origins", () -> "http://localhost:5173");
    }

    @Autowired private JdbcTemplate jdbc;
    @Autowired private Flyway flyway;
    @Autowired private jakarta.persistence.EntityManager entityManager;
    @Autowired private PlatformTransactionManager transactionManager;
    @Autowired private Environment environment;
    @Autowired private CustomerRepository customers;
    @Autowired private UserDocumentRepository documents;
    @Autowired private DriverRepository drivers;
    @Autowired private BankAccountRepository bankAccounts;
    @Autowired private VoucherRepository vouchers;

    @Test
    void baselineMigratesOnlyFunctionOneAndCanBeValidatedTwiceWithoutLosingRows() {
        flyway.validate();

        List<String> tables = jdbc.queryForList("""
                select tablename from pg_tables where schemaname = 'public' order by tablename
                """, String.class);
        assertThat(tables).containsExactlyInAnyOrder("bank_accounts", "customers", "drivers",
                "flyway_schema_history", "user_documents", "vouchers");

        assertThat(jdbc.queryForObject("select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace "
                + "where n.nspname='public' and p.proname in ('vn_now','set_updated_at')", Integer.class)).isEqualTo(2);
        assertThat(jdbc.queryForList("select indexname from pg_indexes where schemaname='public'", String.class))
                .contains("uq_customers_email_lower", "uq_user_doc_approved", "uq_bank_default_per_customer",
                        "idx_user_documents_customer", "idx_bank_accounts_customer");
        assertThat(jdbc.queryForList("select tgname from pg_trigger where not tgisinternal", String.class))
                .containsExactlyInAnyOrder("trg_customers_updated_at", "trg_user_documents_updated_at",
                        "trg_drivers_updated_at", "trg_vouchers_updated_at");
        assertThat(jdbc.queryForList("""
                select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
                where n.nspname='public' and c.relkind='r' and c.relrowsecurity order by c.relname
                """, String.class)).containsExactly("bank_accounts", "customers", "drivers", "user_documents", "vouchers");
        assertThat(jdbc.queryForObject("select count(*) from pg_policies where schemaname='public'", Integer.class))
                .isZero();
        assertThat(jdbc.queryForObject("""
                select count(*) from information_schema.columns
                where table_schema='public' and table_name='bank_accounts' and column_name='updated_at'
                """, Integer.class)).isZero();

        String email = "migration-" + SUFFIX + "@example.test";
        Long markerId = insertCustomer(email, "m" + SUFFIX.substring(0, 18));
        flyway.migrate();
        flyway.validate();
        assertThat(jdbc.queryForObject("select count(*) from customers where id=?", Integer.class, markerId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from flyway_schema_history where success", Integer.class)).isEqualTo(1);
    }

    @Test
    void runningWebApplicationServesHealthWithMatchingRequestTrace() throws Exception {
        int port = environment.getRequiredProperty("local.server.port", Integer.class);
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/api/health")).GET().build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        String traceId = response.headers().firstValue("X-Request-ID").orElseThrow();

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.headers().firstValue("Content-Type").orElse("")).contains("application/json");
        assertThat(response.body()).contains("\"success\":true", "\"code\":\"OK\"",
                "\"message\":\"Thành công\"", "\"data\":{\"status\":\"UP\"}", "\"errors\":[]",
                "\"traceId\":\"" + traceId + "\"");
        System.out.println("LIVE_HEALTH_JSON " + response.body());
    }

    @Test
    void allFiveEntitiesRoundTripGeneratedIdsEnumsDatesMoneyNullsAndLeadingZeroes() {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        tx.executeWithoutResult(status -> {
            Customer customer = customer("map-" + SUFFIX + "@example.test", "p" + SUFFIX.substring(0, 18));
            customer.setDateOfBirth(LocalDate.of(1995, 4, 3));
            customer.setAddress("Test address");
            customer.setKycStatus(KycStatus.PENDING);
            entityManager.persist(customer);
            Customer administrator = customer("admin-" + SUFFIX + "@example.test", "a" + SUFFIX.substring(0, 18));
            administrator.setRole(Role.ADMIN);
            entityManager.persist(administrator);

            UserDocument document = new UserDocument();
            document.setCustomer(customer);
            document.setDocType(DocumentType.CITIZEN_ID);
            document.setDocNumber("DOC-" + SUFFIX);
            document.setFrontImageUrl("private/front");
            document.setFullNameOnDoc("Mapping Person");
            document.setDateOfBirthOnDoc(LocalDate.of(1995, 4, 3));
            document.setIssueDate(LocalDate.of(2020, 1, 1));
            document.setExpiresAt(LocalDate.of(2030, 1, 1));
            document.setVerifyStatus(VerificationStatus.APPROVED);
            document.setVerifiedBy(administrator);
            document.setVerifiedAt(LocalDateTime.of(2026, 10, 13, 9, 15));
            entityManager.persist(document);

            Driver driver = new Driver();
            driver.setCustomer(customer);
            driver.setStatus(DriverStatus.ACTIVE);
            entityManager.persist(driver);

            BankAccount bank = new BankAccount();
            bank.setCustomer(customer);
            bank.setBankName("Example Bank");
            bank.setAccountNumber("000012345678");
            bank.setAccountHolder("Mapping Person");
            bank.setIsDefault(true);
            entityManager.persist(bank);

            Voucher voucher = new Voucher();
            voucher.setCode("MAP-" + SUFFIX);
            voucher.setDiscountType(DiscountType.FIXED);
            voucher.setDiscountValue(new BigDecimal("250000"));
            voucher.setMaxDiscount(BigDecimal.ZERO);
            voucher.setStartAt(LocalDateTime.of(2026, 10, 1, 0, 0));
            voucher.setEndAt(LocalDateTime.of(2026, 11, 1, 0, 0));
            voucher.setUsageLimit(null);
            entityManager.persist(voucher);

            entityManager.flush();
            assertThat(customer.getId()).isNotNull();
            assertThat(document.getId()).isNotNull();
            assertThat(driver.getId()).isNotNull();
            assertThat(bank.getId()).isNotNull();
            assertThat(voucher.getId()).isNotNull();
            assertThat(customer.getCreatedAt()).isNotNull();
            assertThat(customer.getUpdatedAt()).isNotNull();
            assertThat(document.getCreatedAt()).isNotNull();
            assertThat(document.getUpdatedAt()).isNotNull();
            assertThat(driver.getCreatedAt()).isNotNull();
            assertThat(driver.getUpdatedAt()).isNotNull();
            assertThat(bank.getCreatedAt()).isNotNull();
            assertThat(voucher.getCreatedAt()).isNotNull();
            assertThat(voucher.getUpdatedAt()).isNotNull();
            entityManager.clear();

            Customer loaded = entityManager.find(Customer.class, customer.getId());
            UserDocument loadedDocument = entityManager.find(UserDocument.class, document.getId());
            Driver loadedDriver = entityManager.find(Driver.class, driver.getId());
            BankAccount loadedBank = entityManager.find(BankAccount.class, bank.getId());
            Voucher loadedVoucher = entityManager.find(Voucher.class, voucher.getId());
            assertThat(loaded.getDateOfBirth()).isEqualTo(LocalDate.of(1995, 4, 3));
            assertThat(loaded.getKycStatus()).isEqualTo(KycStatus.PENDING);
            assertThat(loaded.getRole()).isEqualTo(Role.CUSTOMER);
            assertThat(loaded.getStatus()).isEqualTo(CustomerStatus.ACTIVE);
            assertThat(loaded.getEmailVerified()).isFalse();
            assertThat(loadedDocument.getDocType()).isEqualTo(DocumentType.CITIZEN_ID);
            assertThat(loadedDocument.getVerifyStatus()).isEqualTo(VerificationStatus.APPROVED);
            assertThat(loadedDocument.getBackImageUrl()).isNull();
            assertThat(loadedDocument.getVerifiedAt()).isEqualTo(LocalDateTime.of(2026, 10, 13, 9, 15));
            assertThat(entityManager.find(Customer.class, administrator.getId()).getRole()).isEqualTo(Role.ADMIN);
            assertThat(loadedDriver.getStatus()).isEqualTo(DriverStatus.ACTIVE);
            assertThat(loadedBank.getAccountNumber()).isEqualTo("000012345678");
            assertThat(loadedBank.getIsDefault()).isTrue();
            assertThat(loadedVoucher.getDiscountType()).isEqualTo(DiscountType.FIXED);
            assertThat(loadedVoucher.getDiscountValue()).isEqualByComparingTo("250000");
            assertThat(loadedVoucher.getMaxDiscount()).isEqualByComparingTo("0");
            assertThat(loadedVoucher.getUsageLimit()).isNull();
            assertThat(loadedVoucher.getMinOrderAmount()).isEqualByComparingTo("0");
            assertThat(loadedVoucher.getPerUserLimit()).isEqualTo(1);
            assertThat(loadedVoucher.getUsedCount()).isZero();
            assertThat(loadedVoucher.getStatus()).isEqualTo(VoucherStatus.ACTIVE);
        });

        LocalDateTime historicalTime = LocalDateTime.of(2000, 1, 1, 0, 0);
        Long historicCustomerId = jdbc.queryForObject("""
                insert into customers(full_name, email, phone, password_hash, created_at, updated_at)
                values ('Before ORM update', ?, ?, 'test-hash', ?, ?) returning id
                """, Long.class, "orm-audit-" + SUFFIX + "@example.test", "h" + SUFFIX.substring(0, 18),
                historicalTime, historicalTime);
        tx.executeWithoutResult(status -> {
            Customer historicCustomer = entityManager.find(Customer.class, historicCustomerId);
            historicCustomer.setFullName("After ORM update");
            entityManager.flush();
            assertThat(historicCustomer.getCreatedAt()).isEqualTo(historicalTime);
            assertThat(historicCustomer.getUpdatedAt()).isAfter(historicalTime);
        });
    }

    @Test
    void databaseDefaultsTriggersAndVietnamTimeFunctionWorkForAuditedTables() {
        Long customer = insertCustomer("audit-" + SUFFIX + "@example.test", "u" + SUFFIX.substring(0, 18));
        Long document = jdbc.queryForObject("""
                insert into user_documents(customer_id, doc_type, doc_number, front_image_url)
                values (?, 'CITIZEN_ID', ?, 'audit/front') returning id
                """, Long.class, customer, "AUD-" + SUFFIX);
        Long driver = jdbc.queryForObject("insert into drivers(customer_id) values (?) returning id", Long.class, customer);
        Long voucher = jdbc.queryForObject("""
                insert into vouchers(code, discount_type, discount_value, start_at, end_at)
                values (?, 'PERCENT', 10, timestamp '2026-10-01', timestamp '2026-11-01') returning id
                """, Long.class, "AUD-" + SUFFIX);

        assertThat(jdbc.queryForMap("select email_verified, kyc_status, role, status, created_at, updated_at "
                + "from customers where id=?", customer))
                .containsEntry("email_verified", false).containsEntry("kyc_status", "NONE")
                .containsEntry("role", "CUSTOMER").containsEntry("status", "ACTIVE");
        assertThat(jdbc.queryForObject("select verify_status from user_documents where id=?", String.class, document))
                .isEqualTo("PENDING");
        assertThat(jdbc.queryForObject("select status from drivers where id=?", String.class, driver)).isEqualTo("PENDING");
        assertThat(jdbc.queryForMap("select status, used_count, min_order_amount, per_user_limit, created_at, updated_at "
                + "from vouchers where id=?", voucher))
                .containsEntry("status", "ACTIVE").containsEntry("used_count", 0)
                .containsEntry("min_order_amount", new BigDecimal("0")).containsEntry("per_user_limit", 1);

        for (String table : List.of("customers", "user_documents", "drivers", "vouchers")) {
            String id = switch (table) {
                case "customers" -> customer.toString();
                case "user_documents" -> document.toString();
                case "drivers" -> driver.toString();
                default -> voucher.toString();
            };
            jdbc.update("update " + table + " set created_at=timestamp '2000-01-01', updated_at=timestamp '2000-01-01' where id=?",
                    Long.valueOf(id));
        }
        jdbc.update("update customers set full_name='Audit changed' where id=?", customer);
        jdbc.update("update user_documents set reject_reason='Audit changed' where id=?", document);
        jdbc.update("update drivers set status='ACTIVE' where id=?", driver);
        jdbc.update("update vouchers set description='Audit changed' where id=?", voucher);
        for (String table : List.of("customers", "user_documents", "drivers", "vouchers")) {
            assertThat(jdbc.queryForObject("select created_at=timestamp '2000-01-01' and updated_at>timestamp '2000-01-01' "
                    + "from " + table + " where id=?", Boolean.class,
                    switch (table) {
                        case "customers" -> customer;
                        case "user_documents" -> document;
                        case "drivers" -> driver;
                        default -> voucher;
                    })).isTrue();
        }
        assertThat(jdbc.queryForObject("""
                select public.vn_now() = (now() at time zone 'Asia/Ho_Chi_Minh')
                """, Boolean.class)).isTrue();
        Boolean vnTimeWhenSessionIsUtc = jdbc.execute((ConnectionCallback<Boolean>) connection -> {
            try (Statement statement = connection.createStatement()) {
                statement.execute("set time zone 'UTC'");
                try (var result = statement.executeQuery("select current_setting('TimeZone')='UTC' and "
                        + "public.vn_now() = (now() at time zone 'Asia/Ho_Chi_Minh')")) {
                    result.next();
                    return result.getBoolean(1);
                }
            }
        });
        assertThat(vnTimeWhenSessionIsUtc).isTrue();
    }

    @Test
    void customerDocumentAndDriverConstraintsAreEnforcedByPostgres() {
        Long owner = insertCustomer("owner-" + SUFFIX + "@example.test", "o" + SUFFIX.substring(0, 18));
        Long reviewer = insertCustomer("reviewer-" + SUFFIX + "@example.test", "r" + SUFFIX.substring(0, 18));
        String email = "duplicate-" + SUFFIX + "@example.test";
        insertCustomer(email, "d" + SUFFIX.substring(0, 18));
        expectConstraintFailure(() -> insertCustomer(email.toUpperCase(), "x" + SUFFIX.substring(0, 18)));
        String phone = "q" + SUFFIX.substring(0, 18);
        insertCustomer("phone-" + SUFFIX + "@example.test", phone);
        expectConstraintFailure(() -> insertCustomer("phone2-" + SUFFIX + "@example.test", phone));
        expectConstraintFailure(() -> jdbc.update("update customers set kyc_status='OUTSIDE_ENUM' where id=?", owner));
        expectConstraintFailure(() -> jdbc.update("update customers set role='OUTSIDE_ENUM' where id=?", owner));
        expectConstraintFailure(() -> jdbc.update("update customers set status='OUTSIDE_ENUM' where id=?", owner));

        insertDocument(owner, "CITIZEN_ID", "PENDING-" + SUFFIX, "PENDING", null, null, null, null);
        insertDocument(owner, "CITIZEN_ID", "PENDING-" + SUFFIX, "PENDING", null, null, null, null);
        insertDocument(owner, "CITIZEN_ID", "APPROVED-" + SUFFIX, "APPROVED", null, null, null, reviewer);
        expectConstraintFailure(() -> insertDocument(owner, "CITIZEN_ID", "APPROVED-" + SUFFIX,
                "APPROVED", null, null, null, reviewer));
        expectConstraintFailure(() -> insertDocument(owner, "DRIVER_LICENSE", "NO-CLASS-" + SUFFIX,
                "PENDING", null, null, null, null));
        expectConstraintFailure(() -> insertDocument(owner, "PASSPORT", "DATES-" + SUFFIX,
                "PENDING", null, LocalDate.of(2030, 1, 1), LocalDate.of(2029, 1, 1), null));
        expectConstraintFailure(() -> insertDocument(Long.MAX_VALUE, "CITIZEN_ID", "NO-OWNER-" + SUFFIX,
                "PENDING", null, null, null, null));
        expectConstraintFailure(() -> insertDocument(owner, "PASSPORT", "NO-REVIEWER-" + SUFFIX,
                "APPROVED", null, null, null, Long.MAX_VALUE));
        expectConstraintFailure(() -> insertDocument(owner, "OUTSIDE_ENUM", "ENUM-" + SUFFIX,
                "PENDING", null, null, null, null));
        expectConstraintFailure(() -> insertDocument(owner, "PASSPORT", "STATUS-" + SUFFIX,
                "OUTSIDE_ENUM", null, null, null, null));

        insertDriver(owner);
        expectConstraintFailure(() -> insertDriver(owner));
        Long driverId = jdbc.queryForObject("select id from drivers where customer_id=?", Long.class, owner);
        expectConstraintFailure(() -> jdbc.update("update drivers set status='OUTSIDE_ENUM' where id=?", driverId));
        assertThat(jdbc.queryForObject("select count(*) from drivers where customer_id=?", Integer.class, owner)).isEqualTo(1);
    }

    @Test
    void bankAndVoucherConstraintsMatchTheLeaderSchema() {
        Long owner = insertCustomer("bank-" + SUFFIX + "@example.test", "b" + SUFFIX.substring(0, 18));
        Long otherOwner = insertCustomer("bank2-" + SUFFIX + "@example.test", "c" + SUFFIX.substring(0, 18));
        insertBank(owner, "Bank", "001234", false);
        Long defaultFalseId = jdbc.queryForObject("""
                insert into bank_accounts(customer_id, bank_name, account_number, account_holder)
                values (?, 'Default Check', 'DEFAULT-001', 'P02 Test') returning id
                """, Long.class, otherOwner);
        assertThat(jdbc.queryForObject("select not is_default and created_at is not null from bank_accounts where id=?",
                Boolean.class, defaultFalseId)).isTrue();
        expectConstraintFailure(() -> insertBank(owner, "Bank", "001234", false));
        insertBank(owner, "Bank", "002345", true);
        expectConstraintFailure(() -> insertBank(owner, "Other Bank", "003456", true));
        insertBank(otherOwner, "Bank", "003456", true);
        assertThat(jdbc.queryForObject("select count(*) from bank_accounts where customer_id=? and is_default", Integer.class,
                owner)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from pg_constraint where conrelid='bank_accounts'::regclass "
                + "and contype='u' and pg_get_constraintdef(oid)='UNIQUE (id, customer_id)'", Integer.class)).isEqualTo(1);

        String code = "VOUCHER-" + SUFFIX;
        insertVoucher(code, "PERCENT", 10, 0, 0, null, 0, "ACTIVE", null);
        expectConstraintFailure(() -> insertVoucher(code, "FIXED", 10, 0, 0, 1, 0, "ACTIVE", null));
        expectConstraintFailure(() -> insertVoucher("PERCENT-" + SUFFIX, "PERCENT", 101, 0, 0, 1, 0, "ACTIVE", null));
        expectConstraintFailure(() -> insertVoucher("ZERO-" + SUFFIX, "FIXED", 0, 0, 0, 1, 0, "ACTIVE", null));
        expectConstraintFailure(() -> insertVoucher("NEG-VALUE-" + SUFFIX, "FIXED", -1, 0, 0, 1, 0, "ACTIVE", null));
        expectConstraintFailure(() -> insertVoucher("NEG-MAX-" + SUFFIX, "FIXED", 100, -1, 0, 1, 0, "ACTIVE", null));
        expectConstraintFailure(() -> insertVoucher("NEG-MIN-" + SUFFIX, "FIXED", 100, 0, -1, 1, 0, "ACTIVE", null));
        expectConstraintFailure(() -> insertVoucher("BAD-DATES-" + SUFFIX, "FIXED", 100, 0, 0, 1, 0,
                "ACTIVE", "timestamp '2026-09-01'"));
        expectConstraintFailure(() -> insertVoucher("BAD-LIMIT-" + SUFFIX, "FIXED", 100, 0, 0, 0, 0, "ACTIVE", null));
        expectConstraintFailure(() -> insertVoucher("BAD-USER-LIMIT-" + SUFFIX, "FIXED", 100, 0, 0, 1, 0,
                "ACTIVE", null, 0));
        expectConstraintFailure(() -> insertVoucher("BAD-USED-" + SUFFIX, "FIXED", 100, 0, 0, 1, -1, "ACTIVE", null));
        expectConstraintFailure(() -> insertVoucher("OVER-USED-" + SUFFIX, "FIXED", 100, 0, 0, 1, 2, "ACTIVE", null));
        expectConstraintFailure(() -> insertVoucher("BAD-TYPE-" + SUFFIX, "OTHER", 10, 0, 0, 1, 0, "ACTIVE", null));
        expectConstraintFailure(() -> insertVoucher("BAD-STATUS-" + SUFFIX, "FIXED", 10, 0, 0, 1, 0, "OTHER", null));
        assertThat(jdbc.queryForObject("select max_discount from vouchers where code=?", BigDecimal.class, code))
                .isEqualByComparingTo("0");
        assertThat(jdbc.queryForObject("select usage_limit from vouchers where code=?", Integer.class, code)).isNull();
    }

    @Test
    void repositoriesEnforceOwnerScopePagesAndTransactionalWriteLocks() {
        Customer one = customers.save(customer("scope1-" + SUFFIX + "@example.test", "s" + SUFFIX.substring(0, 18)));
        Customer two = customers.save(customer("scope2-" + SUFFIX + "@example.test", "t" + SUFFIX.substring(0, 18)));
        assertThat(customers.findByEmailIgnoreCase(one.getEmail().toUpperCase()).map(Customer::getId))
                .contains(one.getId());
        assertThat(customers.existsByEmailIgnoreCase(one.getEmail().toUpperCase())).isTrue();
        assertThat(customers.existsByPhone(one.getPhone())).isTrue();

        UserDocument oneDoc = saveDocument(one, "SCOPE1-" + SUFFIX);
        UserDocument twoDoc = saveDocument(two, "SCOPE2-" + SUFFIX);
        var page = documents.findAll((root, query, cb) -> cb.equal(root.get("customer").get("id"), one.getId()), org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(page.getContent()).extracting(UserDocument::getId).containsExactly(oneDoc.getId());
        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(documents.findByIdAndCustomerId(twoDoc.getId(), one.getId())).isEmpty();
        assertThat(documents.findAll((root, query, cb) -> cb.equal(root.get("verifyStatus"), VerificationStatus.PENDING),
                org.springframework.data.domain.PageRequest.of(0, 50)).getContent())
                .extracting(UserDocument::getId).contains(oneDoc.getId(), twoDoc.getId());
        UserDocument approved = saveDocument(one, "APPROVED-SCOPE-" + SUFFIX);
        approved.setVerifyStatus(VerificationStatus.APPROVED);
        approved = documents.save(approved);
        assertThat(documents.existsByDocTypeAndDocNumberAndVerifyStatus(DocumentType.CITIZEN_ID,
                approved.getDocNumber(), VerificationStatus.APPROVED)).isTrue();

        Driver oneDriver = saveDriver(one);
        saveDriver(two);
        assertThat(drivers.findByCustomerId(one.getId()).map(Driver::getId)).contains(oneDriver.getId());
        assertThat(drivers.findByIdAndCustomerId(oneDriver.getId(), two.getId())).isEmpty();
        BankAccount oneBank = saveBank(one, "SCOPE BANK", "000111", true);
        saveBank(two, "SCOPE BANK", "000222", true);
        assertThat(bankAccounts.findByIdAndCustomerId(oneBank.getId(), two.getId())).isEmpty();
        assertThat(bankAccounts.findAllByCustomerId(one.getId(), org.springframework.data.domain.PageRequest.of(0, 10, org.springframework.data.domain.Sort.by("createdAt").descending())).getContent())
                .extracting(BankAccount::getId).containsExactly(oneBank.getId());
        assertThat(bankAccounts.findByCustomerIdAndIsDefaultTrue(one.getId()).map(BankAccount::getId))
                .contains(oneBank.getId());

        Voucher voucher = vouchers.save(voucher("SCOPE-" + SUFFIX));
        assertThat(vouchers.findByCodeIgnoreCase(voucher.getCode()).map(Voucher::getId)).contains(voucher.getId());
        assertThat(vouchers.existsByCode(voucher.getCode())).isTrue();
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        tx.executeWithoutResult(status -> {
            assertThat(customers.findWithLockById(one.getId()).map(Customer::getId)).contains(one.getId());
            assertThat(vouchers.findWithLockById(voucher.getId()).map(Voucher::getId)).contains(voucher.getId());
        });
    }

    private Long insertCustomer(String email, String phone) {
        return jdbc.queryForObject("""
                insert into customers(full_name, email, phone, password_hash)
                values ('P02 Test', ?, ?, 'test-hash') returning id
                """, Long.class, email, phone);
    }

    private void insertDocument(Long customerId, String type, String number, String status,
            String licenseClass, LocalDate issue, LocalDate expiry, Long reviewerId) {
        jdbc.update(connection -> {
            var statement = connection.prepareStatement("""
                    insert into user_documents(customer_id, doc_type, doc_number, front_image_url, verify_status,
                        license_class, issue_date, expires_at, verified_by)
                    values (?, ?, ?, 'test/front', ?, ?, ?, ?, ?)
                    """);
            statement.setLong(1, customerId);
            statement.setString(2, type);
            statement.setString(3, number);
            statement.setString(4, status);
            statement.setString(5, licenseClass);
            statement.setObject(6, issue);
            statement.setObject(7, expiry);
            if (reviewerId == null) statement.setNull(8, java.sql.Types.BIGINT);
            else statement.setLong(8, reviewerId);
            return statement;
        });
    }

    private void insertDriver(Long customerId) {
        jdbc.update("insert into drivers(customer_id) values (?)", customerId);
    }

    private void insertBank(Long customerId, String bank, String account, boolean isDefault) {
        jdbc.update("insert into bank_accounts(customer_id, bank_name, account_number, account_holder, is_default) "
                + "values (?, ?, ?, 'P02 Test', ?)", customerId, bank, account, isDefault);
    }

    private void insertVoucher(String code, String type, int value, int max, int min, Integer limit,
            int used, String status, String endOverride) {
        insertVoucher(code, type, value, max, min, limit, used, status, endOverride, 1);
    }

    private void insertVoucher(String code, String type, int value, int max, int min, Integer limit,
            int used, String status, String endOverride, int perUser) {
        String endAt = endOverride == null ? "timestamp '2026-11-01'" : endOverride;
        jdbc.update("insert into vouchers(code, discount_type, discount_value, max_discount, min_order_amount, "
                        + "start_at, end_at, usage_limit, per_user_limit, used_count, status) "
                        + "values (?, ?, ?, ?, ?, timestamp '2026-10-01', " + endAt + ", ?, ?, ?, ?)",
                code, type, value, max, min, limit, perUser, used, status);
    }

    private void expectConstraintFailure(Runnable work) {
        TransactionTemplate isolated = new TransactionTemplate(transactionManager);
        assertThatThrownBy(() -> isolated.executeWithoutResult(status -> work.run()))
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }

    private Customer customer(String email, String phone) {
        Customer customer = new Customer();
        customer.setFullName("P02 Test");
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setPasswordHash("test-hash");
        return customer;
    }

    private UserDocument saveDocument(Customer customer, String number) {
        UserDocument document = new UserDocument();
        document.setCustomer(customer);
        document.setDocType(DocumentType.CITIZEN_ID);
        document.setDocNumber(number);
        document.setFrontImageUrl("test/front");
        return documents.save(document);
    }

    private Driver saveDriver(Customer customer) {
        Driver driver = new Driver();
        driver.setCustomer(customer);
        return drivers.save(driver);
    }

    private BankAccount saveBank(Customer customer, String bankName, String accountNumber, boolean isDefault) {
        BankAccount bank = new BankAccount();
        bank.setCustomer(customer);
        bank.setBankName(bankName);
        bank.setAccountNumber(accountNumber);
        bank.setAccountHolder("P02 Test");
        bank.setIsDefault(isDefault);
        return bankAccounts.save(bank);
    }

    private Voucher voucher(String code) {
        Voucher voucher = new Voucher();
        voucher.setCode(code);
        voucher.setDiscountType(DiscountType.PERCENT);
        voucher.setDiscountValue(BigDecimal.TEN);
        voucher.setStartAt(LocalDateTime.of(2026, 10, 1, 0, 0));
        voucher.setEndAt(LocalDateTime.of(2026, 11, 1, 0, 0));
        return voucher;
    }
}
