# F1new Review

- **Review status:** CHANGES_REQUESTED (not approved)
- **Repository:** `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`
- **Branch:** `feature/function_01`
- **Date:** 2026-11-06

## Decision

The initial review returned CHANGES_REQUESTED. On 2026-11-06 the owner accepted the package-duration policy (R1), accepted the current database-error logging behavior as a known risk (R3), and chose to keep the existing phone validation (R4). R2 was fixed in the Postman collection by removing five unimplemented bank-account routes. The updated JSON parses, and its 35 expected operations match the checked-in OpenAPI operations after excluding the five known legacy bank-account paths. A later rerun had Docker available and executed the isolated PostgreSQL suite; `clean verify -Ppostgres-it` did not pass (52 Surefire pass; 94 Failsafe with 5 failures and 2 errors). The new package/voucher HTTP/PostgreSQL suite and executable-JAR health smoke passed, but existing regression failures remain. This review is CHANGES_REQUESTED and is not an approval.

No production application source, schema, reference, or production migration was edited during the review rerun. Production persistence in `src/main/java` uses Spring Data JPA repositories and `EntityManager`; the search found no `JdbcTemplate`, `JdbcClient`, `JdbcOperations`, or direct `java.sql` access there. Integration tests do use `JdbcTemplate`/JDBC for fixture seeding and assertions, including `Function1PackageVoucherPostgresIT` and older F1 regression classes. If the JPA-only rule includes tests as well as production code, converting those test fixtures remains outstanding. Test-only changes made to get the isolated PostgreSQL probe onto the current contract are documented below; all other dirty-tree changes were preserved.

## Latest verification rerun — 2026-11-06

- Environment: Docker Engine **28.5.2**, Testcontainers PostgreSQL **15.13**, JDK **21.0.8**. All database tests used disposable containers; no shared database or Supabase connection was used.
- `cd carrental-BE; .\mvnw.cmd verify -Ppostgres-it '-Dit.test=Function1PackageVoucherPostgresIT'`: **BUILD SUCCESS**, Surefire 52/52 and Function 1 package/voucher HTTP/PostgreSQL tests 3/3.
- `cd carrental-BE; .\mvnw.cmd clean verify -Ppostgres-it`: **BUILD FAILURE**. Surefire 52/52 passed. Failsafe ran 94 tests, with **5 failures, 2 errors, 0 skipped** (146 tests across both phases).
- `Function1PackageVoucherPostgresIT` 3/3 PASS; `AuthSecurityPostgresIT` 17/17 PASS; `DriverConcurrencyPostgresIT` 2/2 PASS; `DriverProfilePostgresIT` 12/12 PASS; `Function1ExecutableJarSmokeIT` 1/1 PASS; `UserDocumentPostgresIT` 16/16 PASS; `VoucherAdminPostgresIT` 7/7 PASS.
- Remaining failing regressions:
  - `CustomerManagementPostgresIT`: two assertions still expect the previous status-log text/prefix; the observed safe log uses `customer-status actorId=... targetId=... ACTIVE -> LOCKED reasonProvided=true`.
  - `Function1WorkflowPostgresIT`: exact profile-key assertion omits the new additive `zaloPhone` and `contactNote` fields.
  - `UserDocumentReviewPostgresIT`: the concurrent approve/reject case observed **200/200** where the test expects **200/409**; this is the potentially serious behavior issue. A likely cause to verify is that `review()` first loads the `UserDocument` with `findById` to get the owner, then asks for the same entity with `findWithLockById`; the first entity is already managed in that transaction, so the lock query may leave stale `PENDING` state in the persistence context. A scalar owner-id projection before the owner/document locks would avoid loading the document early. This hypothesis has not been fixed or retested. The upload/review test's log filter also appears stale: it searches for `action=document-review`, while the current service emits `document-review actorId=...`; the zero match is not proof that no log event was emitted.
  - `Function1PostgresIT`: two errors because this older integration-test setup does not apply the F1new support migration and its `customers` table lacks `contact_note`.
- `cd carrental-FE; npm run build`: **PASS**, Vite transformed 438 modules.
- Executable Boot JAR process smoke, including HTTP health, passed 1/1 in the full Failsafe run. The focused package suite also verified HTTP profile PUT/PATCH, package permissions/validation and voucher availability on PostgreSQL.
- To isolate the new F1 contract, only test support was adjusted: the synthetic phone in `Function1PackageVoucherPostgresIT` was shortened to fit `customers.phone VARCHAR(20)`, and test-only `V4__listing_car_entity_validation_support.sql` adds current `sqlnew.md` fields missing from the older disposable fixture. No SQL was run from `sqlnew.md`; no production schema/migration/reference was changed.
- The current `carrental-BE/pom.xml` declares Spring Boot **4.0.9** (the runtime log also reported 4.0.9); this rerun did not change the dependency version.
- Current Git state: branch `feature/function_01`; 31 tracked modified paths, 23 untracked paths, 0 staged files. Tracked diff summary: **31 files changed, 722 insertions(+), 77 deletions(-)**. `git diff --check` passed with a line-ending warning for `docs/LOCAL_DEVELOPMENT.md`; `docs/reference/` is clean. No commit or push was made.
- Current untracked paths:
  - `carrental-BE/src/main/java/com/carrental/controller/ListingPackageController.java`
  - `carrental-BE/src/main/java/com/carrental/controller/VoucherCatalogController.java`
  - `carrental-BE/src/main/java/com/carrental/dto/request/listingpackage/ListingPackageCreateRequest.java`
  - `carrental-BE/src/main/java/com/carrental/dto/request/listingpackage/ListingPackageUpdateRequest.java`
  - `carrental-BE/src/main/java/com/carrental/dto/response/ListingPackageResponse.java`
  - `carrental-BE/src/main/java/com/carrental/dto/response/VoucherCatalogResponse.java`
  - `carrental-BE/src/main/java/com/carrental/service/ListingPackageService.java`
  - `carrental-BE/src/main/java/com/carrental/service/VoucherCatalogService.java`
  - `carrental-BE/src/main/java/com/carrental/service/impl/ListingPackageServiceImpl.java`
  - `carrental-BE/src/main/java/com/carrental/service/impl/VoucherCatalogServiceImpl.java`
  - `carrental-BE/src/test/java/com/carrental/Function1PackageVoucherPostgresIT.java`
  - `carrental-BE/src/test/java/com/carrental/service/impl/ListingPackageServiceImplTest.java`
  - `carrental-BE/src/test/java/com/carrental/service/impl/VoucherCatalogServiceImplTest.java`
  - `carrental-BE/src/test/resources/db/migration/it-support/V3__f1new_listing_package_support.sql`
  - `carrental-BE/src/test/resources/db/migration/it-support/V4__listing_car_entity_validation_support.sql`
  - `carrental-FE/src/components/pricing/PackagePricingCards.jsx`
  - `carrental-FE/src/pages/pricing/AdminPackagesPage.jsx`
  - `carrental-FE/src/pages/pricing/PackagePricingPage.jsx`
  - `carrental-FE/src/services/listingPackageService.js`
  - `carrental-FE/src/services/voucherCatalogService.js`
  - `docs/postman/SBA301_Swagger.postman_collection.json`
  - `docs/reports/F1NEW_IMPLEMENTATION_REPORT.md`
  - `docs/reviews/F1NEW_REVIEW.md`
- Git tracks `carrental-BE/.env` even though an ignore rule matches it. The file contents were not read or printed, and the file was not modified or untracked.

The earlier environment and SKIPPED sections below describe the first review attempt, when Docker was unavailable. They are historical and superseded by this rerun.

## Findings

### R1 — Owner accepted: package duration restriction retained

`ListingPackageServiceImpl.updatePackage` rejects any `durationDays` change once `car_subscriptions` contains any row for that package (`carrental-BE/src/main/java/com/carrental/service/impl/ListingPackageServiceImpl.java:109-113`). The predicate does not distinguish active, pending, cancelled, or refunded subscriptions, so one historical/failed purchase prevents an ADMIN from ever correcting the package duration. F1new explicitly allows ADMIN package updates including days, and the form presents duration as an editable field without explaining this restriction. Confirm a business rule or allow changing the package for future purchases while retaining each subscription's already stored dates.

**Owner disposition:** Accepted as intended policy; no code change requested. The PostgreSQL package suite ran 3/3, but it updates a newly created package without subscriptions and does not exercise this restriction. The accepted historical-subscription branch remains unverified.

### R2 — Addressed: Swagger Postman smoke aligned with current routes

The collection originally expected five `/api/bank-accounts` operations absent from controllers and asserted 40 total operations. It now omits those five operations and asserts 35, matching the live-route count in `Function1OpenApiContractTest` (`carrental-BE/src/test/java/com/carrental/Function1OpenApiContractTest.java:144-147`). The description now refers to the Function 1 APIs present in the backend.

**Verification:** Postman JSON parses; extracted expected operations count is 35 and exactly matches the checked-in OpenAPI method/path set after excluding the five known legacy bank-account paths (no missing or extra operations). Newman and runtime Swagger fetch remain SKIPPED; this static comparison is not a live-server test.

### R3 — Owner accepted: database-error logging risk retained

`DbErrors.resolveConstraint` does not map the unique constraint for `listing_packages.code`, and `GlobalExceptionHandler.isFunction1Request` omits `packages` (`carrental-BE/src/main/java/com/carrental/util/DbErrors.java`, `carrental-BE/src/main/java/com/carrental/exception/GlobalExceptionHandler.java:137-159`). If two ADMIN create requests race past `existsByCode` and PostgreSQL rejects one, the handler takes its non-Function-1 branch and logs `rootMessage(ex)` as `detail`. PostgreSQL constraint detail may contain the submitted package code. The client receives a generic 409, but raw DB details are written to logs and the result is not the defined `LISTING_PACKAGE_CODE_ALREADY_EXISTS` contract. Add an exact constraint mapping and route packages through the safe Function 1 error branch; cover concurrent duplicate creation with an isolated PostgreSQL regression.

**Owner disposition:** Accepted with no backend change requested. This behavior is not technically remediated: if a package insert races past `existsByCode`, the generic handler can still log database constraint detail. The PostgreSQL package suite ran, but it does not exercise concurrent duplicate-code creation or inspect database-error logs, so the race/fallback path remains unverified.

### R4 — Owner accepted: keep current phone validation

The current diff changes the shared profile phone validator from accepting `+84` or `0` with 8–14 following digits to exactly ten digits beginning with `0` (`carrental-BE/src/main/java/com/carrental/service/impl/CustomerServiceImpl.java:44`; the same restriction is in `RegisterRequest`). The F1new implementation report identifies this pattern change as present in the initial dirty worktree, not a direct F1new edit.

**Owner disposition:** Keep the current phone validation. No source change was made. This does mean `+84...` values previously accepted by the older validator are no longer accepted by PUT/PATCH.

## Review coverage and evidence

### PASS

- Confirmed repository and branch: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, `feature/function_01`.
- Initial review inventory: 31 tracked modifications, 21 untracked paths, no staged changes. Existing dirty changes were preserved.
- JDK `21.0.8`; Maven Wrapper `3.9.11` when run with a process-local `JAVA_HOME` pointing to the installed JDK 21.
- `cd carrental-BE; .\mvnw.cmd clean verify -DskipITs`: BUILD SUCCESS; Surefire **52 tests, 0 failures, 0 errors, 0 skipped**. Failsafe explicitly reported tests skipped. This is not a full PostgreSQL integration PASS.
- Focused suites included in the 52 Surefire tests: `Function1OpenApiContractTest` 4/4, `ListingPackageServiceImplTest` 4/4, `VoucherCatalogServiceImplTest` 3/3, and `PlatformHttpTest` 13/13.
- `cd carrental-FE; npm run build`: PASS; Vite transformed 438 modules.
- OpenAPI and both Postman JSON files parse. `carrental-BE/openapi/function1.json` and `docs/api/openapi-function1.json` have matching SHA-256.
- Updated Swagger Postman expected-operation list: JSON parse PASS; 35 expected operations; exact match against checked-in OpenAPI operations excluding legacy bank-account paths.
- Built executable JAR resource-name probe: `application.properties` present; `application-local.properties`, `.env`, and key resource paths absent. This did not launch the JAR.
- `git diff --check`: PASS. `docs/reference/` is unchanged.
- `.env` metadata only: Git tracks `carrental-BE/.env` even though `carrental-BE/.gitignore:6` matches it. Its contents were not read, printed, modified, or used.

### FAIL / environment prerequisite

- `docker info --format '{{.ServerVersion}}'` failed because the Docker Desktop Linux engine pipe `//./pipe/dockerDesktopLinuxEngine` is unavailable. This is an unavailable prerequisite, not an application test failure.
- After the user requested a full rerun, Docker Desktop was launched again. `com.docker.service` remained `Stopped`; `Start-Service -Name com.docker.service` failed with `Cannot open 'com.docker.service' service on computer '.'`. The `docker-desktop` WSL distribution could be started, but its process list showed only WSL init processes and no Docker daemon. `docker info` continued waiting for the unavailable engine and was interrupted. The full Testcontainers suite therefore could not be started in this session; Windows administrator access is required to start the Docker service.
- The first Maven command attempt failed before Maven startup because `JAVA_HOME` was unset in this shell. It was rerun successfully with a temporary process-local JDK 21 setting; no persistent environment setting was changed.

### SKIPPED

- `mvnw clean verify -Ppostgres-it` full Testcontainers run: **SKIPPED** because Docker was unavailable; it was not represented as passing.
- New `Function1PackageVoucherPostgresIT` HTTP/PostgreSQL cases, test-only `V3__f1new_listing_package_support.sql` execution, and existing auth/KYC PostgreSQL regressions: **SKIPPED**.
- Real backend process HTTP probes, including `/api/health`, package/admin permission checks, profile PUT/PATCH, voucher catalog, and actual executable-JAR health: **SKIPPED**. MockMvc unit coverage does not replace a real process/database check.
- Newman/Postman requests and browser keyboard/contrast checks: **SKIPPED**. The frontend was build-checked and reviewed statically only.
- No Supabase or shared-database connection, SQL execution, seed, or destructive script execution was attempted. `sqlnew.md` was read only as the user-selected code/test contract. The old `docs/reference/schema.sql` was read only and remains unchanged; its missing F1new fields/tables mean the actual shared schema was not verified.

## Contract and implementation notes

- Profile PUT was added while PATCH remains mapped to the same presence-aware update service. Zalo and contact-note values are stripped, empty values clear to null, and limits of 20/255 are enforced in the service. The new PostgreSQL assertions for persisted values and over-limit rejection were not executed.
- Public packages are queried active-only in descending priority (with an id tie-breaker); admin list includes inactive rows. Controller and service methods require ADMIN and the service reloads active role/status from the database. The integration test contains an ADMIN/customer access case, but it was skipped.
- Voucher compatibility is preserved: `GET /api/vouchers` remains the ADMIN definition list, and the customer catalog remains `GET /api/vouchers/available?packageId=...`. Catalog code checks active package, status/window, package minimum amount, `used_count`/`usage_limit`, and per-user count from `car_subscriptions`; pending subscriptions reserve a user slot, while cancelled/refunded rows do not. Function 3 must still revalidate both quotas transactionally at purchase time. No payment or subscription-creation workflow was added.
- `ListingPackage` mapping and the test-only support migrations agree with the selected `sqlnew.md` fields; the focused PostgreSQL package/voucher tests ran 3/3 and passed Hibernate validation. No production migration or seed was added. This does not validate a shared/external schema; the full legacy regression suite still has the failures listed above.
- The two static OpenAPI copies are synchronized and JSON-valid. The Swagger Postman collection now checks only routes currently represented by the backend contract; the legacy bank-account operations remain in the static OpenAPI files. The existing Function 1 Postman collection has unrelated phone fixture edits already present in the dirty tree; its Newman scenarios were not run here.

## Git state after review

The review did not stage, commit, push, switch branches, reset, or stash. Maven `clean` only removed generated `target` output; the build recreated the executable JAR. The frontend build output is ignored. No source file was changed by this review. Branch is `feature/function_01`; there are no staged changes. The tracked diff is **31 files changed, 722 insertions(+), 77 deletions(-)**; this summary excludes untracked-file contents. `git diff --check` passed. `docs/reference/` is clean.

Final `git status --short --branch` contains **31 tracked modified paths**:

```text
carrental-BE/openapi/function1.json
carrental-BE/src/main/java/com/carrental/config/security/SecurityConfiguration.java
carrental-BE/src/main/java/com/carrental/controller/CustomerController.java
carrental-BE/src/main/java/com/carrental/dto/request/auth/RegisterRequest.java
carrental-BE/src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java
carrental-BE/src/main/java/com/carrental/dto/response/CustomerProfileResponse.java
carrental-BE/src/main/java/com/carrental/exception/ErrorCode.java
carrental-BE/src/main/java/com/carrental/repository/CarSubscriptionRepository.java
carrental-BE/src/main/java/com/carrental/repository/ListingPackageRepository.java
carrental-BE/src/main/java/com/carrental/repository/VoucherRepository.java
carrental-BE/src/main/java/com/carrental/service/impl/CustomerServiceImpl.java
carrental-BE/src/main/resources/application.properties
carrental-BE/src/test/java/com/carrental/AuthSecurityPostgresIT.java
carrental-BE/src/test/java/com/carrental/CustomerManagementPostgresIT.java
carrental-BE/src/test/java/com/carrental/Function1OpenApiContractTest.java
carrental-FE/src/components/Header.jsx
carrental-FE/src/components/account/ProfileEditor.jsx
carrental-FE/src/components/admin/AdminSidebar.jsx
carrental-FE/src/pages/account/ProfilePage.jsx
carrental-FE/src/routes/admin.routes.jsx
carrental-FE/src/routes/paths.js
carrental-FE/src/routes/public.routes.jsx
carrental-FE/src/services/accountService.js
carrental-FE/src/services/endpoints.js
carrental-FE/src/styles/style.css
docs/FUNCTION1_PROJECT_STRUCTURE.md
docs/IMPLEMENTATION_STATUS.md
docs/LOCAL_DEVELOPMENT.md
docs/SUPABASE_SETUP.md
docs/api/openapi-function1.json
docs/postman/SBA301_Function1.postman_collection.json
```

It contains **22 untracked paths**:

```text
carrental-BE/src/main/java/com/carrental/controller/ListingPackageController.java
carrental-BE/src/main/java/com/carrental/controller/VoucherCatalogController.java
carrental-BE/src/main/java/com/carrental/dto/request/listingpackage/ListingPackageCreateRequest.java
carrental-BE/src/main/java/com/carrental/dto/request/listingpackage/ListingPackageUpdateRequest.java
carrental-BE/src/main/java/com/carrental/dto/response/ListingPackageResponse.java
carrental-BE/src/main/java/com/carrental/dto/response/VoucherCatalogResponse.java
carrental-BE/src/main/java/com/carrental/service/ListingPackageService.java
carrental-BE/src/main/java/com/carrental/service/VoucherCatalogService.java
carrental-BE/src/main/java/com/carrental/service/impl/ListingPackageServiceImpl.java
carrental-BE/src/main/java/com/carrental/service/impl/VoucherCatalogServiceImpl.java
carrental-BE/src/test/java/com/carrental/Function1PackageVoucherPostgresIT.java
carrental-BE/src/test/java/com/carrental/service/impl/ListingPackageServiceImplTest.java
carrental-BE/src/test/java/com/carrental/service/impl/VoucherCatalogServiceImplTest.java
carrental-BE/src/test/resources/db/migration/it-support/V3__f1new_listing_package_support.sql
carrental-FE/src/components/pricing/PackagePricingCards.jsx
carrental-FE/src/pages/pricing/AdminPackagesPage.jsx
carrental-FE/src/pages/pricing/PackagePricingPage.jsx
carrental-FE/src/services/listingPackageService.js
carrental-FE/src/services/voucherCatalogService.js
docs/postman/SBA301_Swagger.postman_collection.json
docs/reports/F1NEW_IMPLEMENTATION_REPORT.md
docs/reviews/F1NEW_REVIEW.md
```

The `.env` tracking/ignore metadata is recorded separately above; its content was not inspected.
