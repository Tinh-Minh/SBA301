# F1new Implementation Report

- **Status:** READY_FOR_REVIEW
- **Repository:** `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`
- **Branch:** `feature/function_01`
- **Review state:** Not approved; waiting for reviewer.

## Result

Implemented the Function 1 profile, listing-package, and voucher-catalog changes described by `F1new.md`. `sqlnew.md` was used only as the code/test contract following the user's decision. Its SQL was not executed. No production migration, schema reference, database, commit, push, or deployment was changed or used.

The worktree was already dirty at the start (28 tracked files modified and 15 untracked paths). I preserved those files and did not reset, checkout, stash, or overwrite their changes. Some package/profile UI and backend classes were already present as untracked or modified files; their provenance is uncertain. The direct edits from this task are identified below.

## Implemented

- Added `PUT /api/customers/me` using the existing profile update service. `PATCH /api/customers/me` remains supported. The frontend now submits PUT. Zalo/contact-note normalization and the 20/255 character limits are enforced by the existing profile service; omitted fields remain unchanged.
- Completed the listing-package path already present in the worktree: public listing uses active packages ordered by descending priority; ADMIN can list all packages and create/update them; no delete endpoint is exposed. A null request body now returns the standard invalid-request error instead of becoming an NPE.
- Kept the voucher route contract compatible: `GET /api/vouchers` remains the ADMIN management list; the existing customer catalog route stays `GET /api/vouchers/available?packageId=...`, which the frontend already uses. The customer catalog filters active status, time window, package minimum amount, global quota, and per-user quota.
- Per-user usage is counted from `car_subscriptions` in one grouped repository query. The implemented rule counts pending, active, and expired subscriptions unless cancelled or refunded; pending reserves a use. Function 3 must revalidate quotas transactionally when creating/cancelling a purchase. This change does not create payments or subscriptions.
- Updated OpenAPI copies and the Swagger route-presence Postman collection for PUT/profile, package, and voucher-catalog routes. Updated implementation status and appended F1new notes to the existing local-development guide.
- Added unit/contract regression and an isolated PostgreSQL HTTP integration test with a test-only fixture migration. No production migration was added.

## Directly edited or created this task

| File | Role |
|---|---|
| `carrental-BE/src/main/java/com/carrental/controller/CustomerController.java` | Adds PUT while preserving PATCH. |
| `carrental-BE/src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java` | Clarifies that the presence-aware request supports profile updates via either method. |
| `carrental-BE/src/main/java/com/carrental/repository/CarSubscriptionRepository.java` | Adds grouped per-customer voucher-use counts. |
| `carrental-BE/src/main/java/com/carrental/service/impl/VoucherCatalogServiceImpl.java` | Filters globally eligible vouchers by per-user quota. |
| `carrental-BE/src/main/java/com/carrental/service/impl/ListingPackageServiceImpl.java` | Rejects null create/update bodies safely. |
| `carrental-BE/src/test/java/com/carrental/Function1OpenApiContractTest.java` | Adds the live package/catalog handlers and verifies PUT/package request/response contracts. |
| `carrental-BE/src/test/java/com/carrental/service/impl/ListingPackageServiceImplTest.java` | Adds package ordering, normalization, null-body, and schema-bound validation tests. |
| `carrental-BE/src/test/java/com/carrental/service/impl/VoucherCatalogServiceImplTest.java` | Adds per-user quota filtering and no-candidate tests. |
| `carrental-BE/src/test/java/com/carrental/Function1PackageVoucherPostgresIT.java` | Adds isolated PostgreSQL/HTTP regression for profile PUT, package access/CRUD, and voucher eligibility. |
| `carrental-BE/src/test/resources/db/migration/it-support/V3__f1new_listing_package_support.sql` | Test-only fixture for new customer fields, packages, and subscriptions. |
| `carrental-FE/src/services/accountService.js` | Makes profile updates use PUT. |
| `carrental-BE/openapi/function1.json`, `docs/api/openapi-function1.json` | Documents PUT and eligibility rules; the two copies parse and have matching content. |
| `docs/postman/SBA301_Swagger.postman_collection.json` | Adds new endpoint-presence checks. |
| `docs/IMPLEMENTATION_STATUS.md` | Records READY_FOR_REVIEW and actual test limitations. |
| `docs/LOCAL_DEVELOPMENT.md` | Restored the clean HEAD guide, then appended F1new notes; earlier P01–P10 guidance is preserved. |
| `docs/reports/F1NEW_IMPLEMENTATION_REPORT.md` | This report. |

The other package controllers/services/DTOs, customer profile fields/service changes, pricing/admin pages, and associated frontend routes were already present in the dirty worktree when I began this implementation. They were inspected and reused; I do not attribute their creation to this task.

## Environment and initial state

- Confirmed repository path and branch: `feature/function_01` (not `BE`).
- Initial inventory: 28 modified tracked files and 15 untracked paths; changes were preserved. Current status includes prior work plus this task.
- JDK: Oracle Java 21.0.8. Maven Wrapper: Maven 3.9.11. Existing `pom.xml` uses Spring Boot 4.0.9; version was not changed for F1new.
- Docker Desktop Linux engine was unavailable (`docker info` could not open the engine pipe).
- `carrental-BE/.env` exists and is tracked by Git even though `.gitignore` has an `.env` rule. I did not read, print, modify, or use it. The JAR probe confirms it is not packaged. This is a repository hygiene/security issue for the reviewer to address separately; no credential values are included here.

## Commands and results

| Command/check | Result |
|---|---|
| `git status --short --branch`, `git diff --stat`, `git ls-files --others --exclude-standard` | PASS — initial and final state inventoried; no reset/checkout/stash/commit/push. |
| `docker info --format '{{.ServerVersion}}'` | FAIL prerequisite — Docker Desktop Linux engine pipe unavailable. PostgreSQL tests therefore did not reach test bodies. |
| Initial `mvn clean verify` without `JAVA_HOME` | FAIL before Maven — `JAVA_HOME` was unset. |
| Early `JAVA_HOME=JDK21; mvnw clean verify` | FAIL — 45 tests, 44 passed and the old OpenAPI/MVC parity test failed. The parity fixture was updated for the live controllers and route contract. |
| `mvnw -DskipTests compile` | PASS — 179 production Java sources compiled. |
| Focused OpenAPI/package/voucher tests | PASS — 11 tests, 0 failures/errors/skips. A preceding test compile exposed a test-fixture builder issue; it was fixed and the focused suite passed. |
| `mvnw clean verify` | FAIL at Failsafe startup — all 52 Surefire tests passed; 11 Testcontainers integration classes could not start because Docker was unavailable. `Function1PackageVoucherPostgresIT` did not reach its test methods. |
| `mvnw clean verify -DskipITs` | PASS — 52 tests, 0 failures/errors/skips; Failsafe explicitly skipped. The executable Boot JAR was built/repackaged. This is not evidence that PostgreSQL integration passed. |
| `npm run build` | PASS — Vite transformed 438 modules and completed production build. |
| Boot JAR resource probe using `jar tf` | PASS — `application.properties` is present; `.env`, `application-local.properties`, and private-key resource paths are absent. The JAR was not launched. |
| OpenAPI/Postman JSON parse | PASS — all three JSON files parse. OpenAPI file copies match. |
| `git diff --check` | PASS after restoring the existing local-development guide. |
| Local full-app startup/real-port health request | SKIPPED — no isolated PostgreSQL was available; the local `.env` was intentionally not used, avoiding any possibility of contacting a shared database. |
| Newman/Postman execution | SKIPPED — the collection was updated but not sent to any server. |

`mvn clean` removed generated `carrental-BE/target` output and the successful build recreated the JAR. No source, reference, or pre-existing user document was removed.

## HTTP and Clock evidence

`PlatformHttpTest` passed as part of the 52-test suite, including 13 MockMvc HTTP cases. It asserted `/api/health` returns HTTP 200 and a JSON success envelope with `data.status=UP`, empty errors, and a response `traceId` equal to `X-Request-ID`. The observed body contract was equivalent to:

```json
{"success":true,"code":"OK","data":{"status":"UP"},"errors":[],"traceId":"<request-uuid>"}
```

The same suite checked the default `Asia/Ho_Chi_Minh` Clock and configured `Asia/Bangkok` override. This is MockMvc evidence only; a full local process/real-port health call was not run.

## Decisions and deviations

- `docs/reference/schema.sql` is unchanged. It does not match the new fields/tables, so the user-selected `sqlnew.md` contract was used for code and isolated-test fixture design only. Neither SQL file was executed, and the actual Supabase schema was not queried or verified.
- The customer voucher route remains `/api/vouchers/available?packageId=...`; `GET /api/vouchers` remains the existing ADMIN endpoint. A generic customer `GET /api/vouchers` was not introduced because package price is needed to determine eligibility and the existing catalog route is already used.
- The per-user rule treats PENDING_PAYMENT as a reservation and excludes CANCELLED/REFUNDED records. The exact use/cancellation lifecycle should be confirmed with Function 3 before checkout is implemented.
- The static OpenAPI still has legacy bank-account paths without corresponding controllers in this checkout. To keep this scoped change from deleting a pre-existing bank contract, the MVC parity test filters those known legacy paths and checks all 35 live scoped handlers. This mismatch remains visible for review and is not claimed as globally resolved.
- The basic pricing UI reads prices from the API. Automated WCAG/contrast tooling and interactive keyboard/browser review were not run; frontend evidence is build-only.

## Remaining limitations / next review checks

1. Run `mvnw clean verify` with a working Docker engine; verify `Function1PackageVoucherPostgresIT`, existing auth/KYC Postgres regressions, and the executable-JAR HTTP smoke test.
2. Verify the deployed leader schema matches `sqlnew.md` before running the app. `docs/reference/schema.sql` remains older and untouched.
3. Review the pending-voucher reservation policy with Function 3 and ensure its create/cancel operations update `used_count` and enforce both quotas atomically.
4. Resolve the tracked `.env` repository issue separately without exposing its contents; rotate credentials if it contains active values.
5. Review the pre-existing bank-account OpenAPI/controller mismatch and the lack of browser-level accessibility checks.

## Final Git status and diff summary

Branch is `feature/function_01`; there are no staged changes, commits, or pushes. Current `git status --short --branch` shows **31 tracked modified files** and **21 untracked paths**. The tracked diff summary is **31 files changed, 720 insertions(+), 77 deletions(-)**; this includes pre-existing dirty changes and excludes untracked-file contents. `docs/reference/` has no changes.

Tracked modified paths:

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

Untracked paths:

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
```

No P02/P03 prompt work, schema/reference edits, shared-DB access, commit, push, or deployment was performed.
