# Function 1 persistence

> Audit2026-10-15: [đối chiếu59 cột](22_ENTITY_SCHEMA_FIELD_MAP.md) không mismatch, không đổi entity/schema leader. Runtime [Supabase/.env](SUPABASE_SETUP.md); Flyway chỉ test scope. Helper full-payee F4 đã bỏ, bank owner/FK constraints giữ. Các mô tả local migration/lịch sử bên dưới không là lệnh apply schema lên Supabase.

P02 maps only `customers`, `user_documents`, `drivers`, `bank_accounts`, and `vouchers` from `docs/reference/schema.sql`. The PostgreSQL baseline used by tests is isolated and does not assert that a shared database has this schema.

## Java ↔ SQL field map

All IDs are database-generated `BIGINT GENERATED ALWAYS AS IDENTITY` and map to `Long`. SQL `TIMESTAMP` columns map to `LocalDateTime`; SQL `DATE` columns map to `LocalDate`. Nullable fields have no Java-side substitute values. Enum columns are stored as their names (`EnumType.STRING`) in VARCHAR columns.

### `customers` ↔ `Customer`

| Java field | SQL column | Type / length | Nullable / default |
|---|---|---|---|
| `id` | `id` | BIGINT identity | No; DB generated |
| `fullName` | `full_name` | VARCHAR(150) | No |
| `email` | `email` | VARCHAR(150) | No |
| `phone` | `phone` | VARCHAR(20) | No; UNIQUE |
| `passwordHash` | `password_hash` | VARCHAR(255) | No |
| `dateOfBirth` | `date_of_birth` | DATE | Yes |
| `address` | `address` | VARCHAR(300) | Yes |
| `avatarUrl` | `avatar_url` | VARCHAR(500) | Yes |
| `emailVerified` | `email_verified` | BOOLEAN | No; `false` |
| `kycStatus` | `kyc_status` | VARCHAR(20), `KycStatus` | No; `NONE` |
| `role` | `role` | VARCHAR(20), `Role` | No; `CUSTOMER` |
| `status` | `status` | VARCHAR(20), `CustomerStatus` | No; `ACTIVE` |
| `createdAt` | `created_at` | TIMESTAMP | No; `vn_now()` |
| `updatedAt` | `updated_at` | TIMESTAMP | No; `vn_now()`, update trigger |

### `user_documents` ↔ `UserDocument`

| Java field | SQL column | Type / length | Nullable / default |
|---|---|---|---|
| `id` | `id` | BIGINT identity | No; DB generated |
| `customer` | `customer_id` | BIGINT FK → customers | No; delete cascade |
| `docType` | `doc_type` | VARCHAR(30), `UserDocumentType` | No |
| `docNumber` | `doc_number` | VARCHAR(50) | No |
| `fullNameOnDoc` | `full_name_on_doc` | VARCHAR(150) | Yes |
| `dateOfBirthOnDoc` | `date_of_birth_on_doc` | DATE | Yes |
| `issuePlace` | `issue_place` | VARCHAR(200) | Yes |
| `issueDate` | `issue_date` | DATE | Yes |
| `expiresAt` | `expires_at` | DATE | Yes |
| `licenseClass` | `license_class` | VARCHAR(10) | Yes; required by CHECK for `DRIVER_LICENSE` |
| `frontImageUrl` | `front_image_url` | VARCHAR(500) | No |
| `backImageUrl` | `back_image_url` | VARCHAR(500) | Yes |
| `verifyStatus` | `verify_status` | VARCHAR(20), `DocumentVerifyStatus` | No; `PENDING` |
| `rejectReason` | `reject_reason` | VARCHAR(500) | Yes |
| `verifiedBy` | `verified_by` | BIGINT nullable FK → customers | Yes; no delete cascade |
| `verifiedAt` | `verified_at` | TIMESTAMP | Yes |
| `createdAt` | `created_at` | TIMESTAMP | No; `vn_now()` |
| `updatedAt` | `updated_at` | TIMESTAMP | No; `vn_now()`, update trigger |

### `drivers` ↔ `Driver`

| Java field | SQL column | Type / length | Nullable / default |
|---|---|---|---|
| `id` | `id` | BIGINT identity | No; DB generated |
| `customer` | `customer_id` | BIGINT FK → customers | No; UNIQUE; delete cascade |
| `status` | `status` | VARCHAR(20), `DriverStatus` | No; `PENDING` |
| `createdAt` | `created_at` | TIMESTAMP | No; `vn_now()` |
| `updatedAt` | `updated_at` | TIMESTAMP | No; `vn_now()`, update trigger |

### `bank_accounts` ↔ `BankAccount`

| Java field | SQL column | Type / length | Nullable / default |
|---|---|---|---|
| `id` | `id` | BIGINT identity | No; DB generated |
| `customer` | `customer_id` | BIGINT FK → customers | No; delete cascade |
| `bankName` | `bank_name` | VARCHAR(100) | No |
| `accountNumber` | `account_number` | VARCHAR(30), Java `String` | No; leading zeroes preserved |
| `accountHolder` | `account_holder` | VARCHAR(150) | No |
| `isDefault` | `is_default` | BOOLEAN | No; `false` |
| `createdAt` | `created_at` | TIMESTAMP | No; `vn_now()` |

`bank_accounts` has **no** `updated_at`; `BankAccount` extends `BaseEntity` only. No transient or copied audit field is used.

### `vouchers` ↔ `Voucher`

| Java field | SQL column | Type / length | Nullable / default |
|---|---|---|---|
| `id` | `id` | BIGINT identity | No; DB generated |
| `code` | `code` | VARCHAR(50) | No; UNIQUE |
| `description` | `description` | VARCHAR(300) | Yes |
| `discountType` | `discount_type` | VARCHAR(10), `DiscountType` | No |
| `discountValue` | `discount_value` | NUMERIC(14,0), `BigDecimal` | No; > 0 |
| `maxDiscount` | `max_discount` | NUMERIC(14,0), `BigDecimal` | Yes; >= 0 |
| `minOrderAmount` | `min_order_amount` | NUMERIC(14,0), `BigDecimal` | No; `0`; >= 0 |
| `startAt` | `start_at` | TIMESTAMP, `LocalDateTime` | No |
| `endAt` | `end_at` | TIMESTAMP, `LocalDateTime` | No |
| `usageLimit` | `usage_limit` | INT, `Integer` | Yes; if set > 0 |
| `perUserLimit` | `per_user_limit` | INT, `Integer` | No; `1`; > 0 |
| `usedCount` | `used_count` | INT, `Integer` | No; `0`; >= 0 |
| `status` | `status` | VARCHAR(20), `VoucherStatus` | No; `ACTIVE` |
| `createdAt` | `created_at` | TIMESTAMP | No; `vn_now()` |
| `updatedAt` | `updated_at` | TIMESTAMP | No; `vn_now()`, update trigger |

## Enums

| Enum | Persisted values |
|---|---|
| `Role` | `CUSTOMER`, `ADMIN` |
| `CustomerStatus` | `ACTIVE`, `LOCKED` |
| `KycStatus` | `NONE`, `PENDING`, `VERIFIED`, `REJECTED` |
| `UserDocumentType` | `CITIZEN_ID`, `DRIVER_LICENSE`, `PASSPORT` |
| `DocumentVerifyStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `DriverStatus` | `PENDING`, `ACTIVE`, `SUSPENDED` |
| `DiscountType` | `PERCENT`, `FIXED` |
| `VoucherStatus` | `ACTIVE`, `INACTIVE` |

Enums use string values compatible with schema VARCHAR and CHECK constraints. No extra role/status values or transition rules were introduced.

## Constraints, indexes, triggers, and audit

The local baseline reproduces the Function 1 DDL from the source schema:

- Unique constraints: customer phone; approved document `(doc_type, doc_number)` through a partial index; one driver per customer; bank account `(customer_id, bank_name, account_number)` and `(id, customer_id)`; one default bank account per customer through a partial index; voucher code.
- Foreign keys: documents and drivers and banks point to customers with `ON DELETE CASCADE`; `verified_by` points to customers without cascade.
- Checks: allowed string values for all enum columns; document date order and driver's licence class; positive/zero monetary ranges and voucher time/percentage/quota rules as in the leader SQL.
- Named indexes: `uq_customers_email_lower`, `uq_user_doc_approved`, `uq_bank_default_per_customer`, `idx_user_documents_customer`, `idx_bank_accounts_customer`.
- Functions: `public.vn_now()` returns a timestamp in Asia/Ho_Chi_Minh wall time; `public.set_updated_at()` assigns `vn_now()` on update.
- Triggers: `trg_customers_updated_at`, `trg_user_documents_updated_at`, `trg_drivers_updated_at`, and `trg_vouchers_updated_at`.
- Row-level security is enabled for exactly the five Function 1 tables. The baseline creates no policy or grant. PostgreSQL test ownership bypasses RLS, so these tests do not demonstrate application role/customer/admin access.

`BaseEntity` maps identity and DB-generated `created_at`. `AuditedEntity` adds DB-generated `updated_at`; Hibernate's generated-value mapping reads these after insert/update flushes. Java auditing, lifecycle timestamp setters, and client setters for ID/audit fields are not used. `vn_now()` follows PostgreSQL transaction time, so created/updated need not differ within one transaction. Leader SQL does not define bank `updated_at`; adding it awaits leader agreement.

## Migration and local test setup

The isolated P02 migration is `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql`. Application properties use `ddl-auto=validate`, `open-in-view=false`, and `spring.sql.init.mode=never`. Flyway points to `classpath:db/migration/function1`, but is disabled by default. Tests enable it against a new Testcontainers PostgreSQL 15.13 database; `clean` is disabled and `baseline-on-migrate` is false.

Run on Windows with Docker available:

```powershell
.\mvnw.cmd -B clean verify -Ppostgres-it
.\scripts\verify-local-config-packaging.ps1
```

For local runtime setup and safe handling of an isolated empty database, see [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md). This V1 baseline is not a migration plan for a shared database. Before integration with a DB that already has schema/history, the database leader must coordinate schema verification, Flyway history, migration ordering, and deployment. Do not baseline existing tables or run this baseline against the shared database.

## Repository contract and deferred work

P01–P09 APPROVED theo [review P09-FIX-01](reviews/P09_FIX_01_REVIEW.md), R1 CLOSED. Native root/cleanup/current KYC/scoped queries/latest counter/exact decimal giữ. P10 CHANGES_REQUESTED; P10-FIX-01 đồng bộ spec/docs/regressions mà không thay entity/schema. Isolated PostgreSQL/HTTP workflow và full regression đạt trên Testcontainers 15.13, không dùng shared DB. P10-FIX-01 READY_FOR_REVIEW; xem [P10 report](reports/P10_REPORT.md) và [fix report](reports/P10_FIX_01_REPORT.md); historical reports/reviews giữ nguyên.

- `CustomerRepository` performs case-insensitive email lookup/existence using `lower(email)`, phone existence checks, a pessimistic write-lock query by ID, ADMIN list Specification paging/count, and a role/status count used under P04 serialization.
- `UserDocumentRepository` scopes detail/list queries to `customer_id` before paging, supports admin status pages, and supports approved-document lookup.
- `DriverRepository` scopes lookup by owner and supports owner-specific detail lookup.
- `BankAccountRepository` scopes all account queries to one owner, pages/counts in PostgreSQL, and offers owner-scoped ascending-ID pessimistic locks for the P08 write protocol.
- `VoucherRepository` looks up/checks exact code and provides a pessimistic write-lock query by ID.

Pessimistic row locks require an open transaction. CustomerStatusLock adds no schema object; customer/document/bank/voucher filtering and counts run in PostgreSQL. P08 keeps advisory→customer→ascending bank locks and the leader partial unique/composite FK. P09 writes use advisory→actor→voucher locks and current-counter quota checks, with U-21 exact case-preserving code lookup. `VoucherRepository.findByIdForUpdate` remains an internal building block for compatible F3 transactions. Repositories do not implement F3 pricing/reservation or select rental orders. RLS runtime roles/policies and full F3 quota integration remain future work; entities are not HTTP DTOs.
