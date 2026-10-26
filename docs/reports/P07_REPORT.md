# P07 — Driver profile and current eligibility

## Status

**READY_FOR_REVIEW.** P07 was implemented against all nine prompt steps and U-14/U-15. P01–P06 regression, PostgreSQL HTTP/concurrency, clean verification, executable-JAR packaging probe and live HTTP health passed. P08 is **NOT_STARTED**. No commit/push, shared-database access or schema/reference edit was made.

## Initial state and environment

- Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`; branch `BE`; initial HEAD and `origin/BE`: `2fe712eed12a2af3b61f0a5311bdd3901f614029`.
- The initial status already showed the project as untracked root groups, rather than a clean/fully tracked worktree. Existing files and review history were preserved. No tracked or staged changes were present.
- Java: Temurin/OpenJDK 21.0.8; Maven Wrapper 3.9.11; Docker Desktop 28.5.2. PostgreSQL tests used isolated Testcontainers `postgres:15.13-alpine`.
- `JAVA_HOME` was initially unset in the command shell. I set it to `C:\Program Files\Java\jdk-21` for Maven and packaging commands. No environment-variable dump, real secret, private key or bearer token was recorded.

## Implementation

- Added driver create/read/admin list/status APIs with scoped reads, strict query/body parsing, allowlisted response DTOs, pagination/count at PostgreSQL and trace/no-store behavior. Create accepts no query and rejects the first body byte at request ingress, before multipart resolution, without buffering a body.
- Added status transition/policy service. It rechecks actor and owner inside the transaction, enforces U-15 including no-ops, reuses the shared advisory lock before actor→owner→driver row locks, and maps only SQLState `23505` plus exact `drivers_customer_id_key` to the profile conflict. Status reason is validated and discarded because the schema has no reason/history column.
- Added current eligibility projection using one SQL aggregate statement and shared `KycPolicy`. Activation requires current ACTIVE account, current identity KYC VERIFIED and an owned APPROVED `DRIVER_LICENSE` with non-null expiry `>= today` and nonblank class. Reads separately require stored driver ACTIVE and never auto-suspend it. Internal F2 evaluation takes an explicitly named customer ID and returns a point-in-time DTO.
- Added after-commit success logs and allowlisted positive failure diagnostics; raw reason, SQL/cause text and PII are not logged.
- Added deterministic eligibility unit tests and real HTTP/PostgreSQL regressions for strict/bodyless APIs, scope/paging, state/no-op, KYC/license/Clock, unique fallback, rollback/privacy and P05→P06→P07 integration. Added bounded concurrency tests using actual DB waits and `pg_blocking_pids`.

## Files added or updated

**New production files:**

- `src/main/java/com/carrental/controller/DriverController.java`
- `src/main/java/com/carrental/dto/request/driver/ChangeDriverStatusRequest.java`
- `src/main/java/com/carrental/dto/request/driver/DriverListQuery.java`
- `src/main/java/com/carrental/dto/response/DriverEligibilityReasonCode.java`
- `src/main/java/com/carrental/dto/response/DriverEligibilityResponse.java`
- `src/main/java/com/carrental/dto/response/DriverResponse.java`
- `src/main/java/com/carrental/mapper/DriverMapper.java`
- `src/main/java/com/carrental/repository/DriverEligibilityProjection.java`
- `src/main/java/com/carrental/service/DriverChangeLogger.java`
- `src/main/java/com/carrental/service/DriverEligibilityPolicy.java`
- `src/main/java/com/carrental/service/DriverEligibilityService.java`
- `src/main/java/com/carrental/service/DriverService.java`
- `src/main/java/com/carrental/service/impl/DriverEligibilityServiceImpl.java`
- `src/main/java/com/carrental/service/impl/DriverServiceImpl.java`

**Updated production files:** `src/main/java/com/carrental/repository/CustomerRepository.java` (one-statement eligibility aggregate), `DriverRepository.java` (owner/page/locking queries), `exception/ErrorCode.java` (driver error codes), and `web/RequestTraceFilter.java` (bounded body probe before multipart parsing).

**New tests:** `src/test/java/com/carrental/DriverEligibilityPolicyTest.java`, `DriverProfilePostgresIT.java`, and `DriverConcurrencyPostgresIT.java`.

**New documentation:** `docs/14_DRIVER_PROFILE_ELIGIBILITY.md` and this report.

**Updated documentation:** `AGENTS.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md`, `docs/06_IMPLEMENTATION_PLAN.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/README.md`, `docs/LOCAL_DEVELOPMENT.md`, `docs/12_PRIVATE_DOCUMENT_STORAGE.md`, and `docs/13_DOCUMENT_REVIEW_KYC.md`.

`docs/prompts/`, `docs/reviews/`, `docs/reference/`, entity classes and Flyway migration were not edited.

## Commands and results

Commands below ran from the repository root. Maven used `JAVA_HOME=C:\Program Files\Java\jdk-21`.

| Command | Result |
|---|---|
| `.\mvnw.cmd -B -DskipTests package` | PASS; initial production compile/package |
| `.\mvnw.cmd -B '-Dit.test=DriverProfilePostgresIT#createRejectsEveryNonEmptyBodyQueryAndLockedPrincipalWithoutWriting' verify -Ppostgres-it` | PASS, 1 focused multipart/chunked/body/query/locked-principal regression |
| `.\mvnw.cmd -B '-Dit.test=DriverProfilePostgresIT' verify -Ppostgres-it` | PASS, 10/10 P07 profile/HTTP/PostgreSQL tests |
| `.\mvnw.cmd -B '-Dit.test=DriverConcurrencyPostgresIT' verify -Ppostgres-it` | PASS, 6/6 P07 concurrency tests |
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | **PASS, 124/124**: Surefire 38/38 and Failsafe 86/86; failures 0, errors 0, skipped 0. This includes the 106 P01–P06 regression tests plus 18 P07 tests. |
| `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1` (without `JAVA_HOME` in that shell) | FAIL before probe: script required a JDK 21 `JAVA_HOME`; no application/package assertion ran. |
| Same packaging command after setting `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'` | **PASS**. Probe build passed; local config, fake secret/private-key/bootstrap/document markers, storage path, private key entry and test-only Boot-root helper were absent from executable JAR. |

The full verification also passed `StorageRootBootJarIT` (1/1): actual Boot `JarLauncher`, unrelated CWD, protected roots rejected, external root accepted, disabled storage initialized without a root, and space/percent/Unicode path handling passed.

## HTTP, policy and concurrency evidence

`Function1PostgresIT.runningWebApplicationServesHealthWithMatchingRequestTrace` made an actual HTTP request to the live embedded server backed by temporary PostgreSQL and test key material. It returned HTTP 200 and:

```json
{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"1dde4c1a-05ea-4963-9a79-f8da7b88bea6"}
```

The response `traceId` matched `X-Request-ID`; `data.status` was `UP`. `Function1PostgresIT` passed 7/7. `UserDocumentReviewPostgresIT` also observed health 200/UP with matching trace in the same full run.

P07 HTTP output confirmed: nonempty body variants rejected with no row; bodyless create returned 201/PENDING and duplicate returned 409; CUSTOMER list 403; foreign/missing details 404; strict transitions and ADMIN self-status 403; invalid-license cases, inclusive expiry today, current KYC over snapshot, locked-owner rules and rollback/no-after-commit event all passed. The real P05 upload→P06 identity/license approval→P07 create/activate flow ended `eligibleNow=true`. A real unique violation used `drivers_customer_id_key`/23505 and returned the safe profile conflict.

PostgreSQL concurrency evidence from the full run:

- Same-owner create: holder PID 61, waiter PID 62; `pg_blocking_pids` confirmed the wait; outcomes 201/409, one row and one success event.
- Actor locked after request authentication: DB recheck returned 401 and left driver unchanged.
- Ordered admin commands: `PENDING→ACTIVE→SUSPENDED`, final `SUSPENDED`.
- Both customer-lock/activation orderings passed: lock commit first yielded activation 409 and stored PENDING; activation commit first left stored ACTIVE after account lock while current eligibility became false.
- P06 approval held against P07 activation: holder/waiter PIDs 61/62 and actual DB block confirmed; release committed approval, then activation observed current VERIFIED KYC and succeeded.
- Explicit advisory contention: holder/waiter PIDs 61/62 and DB blocking confirmed; first request 503, released retry 200.

## Schema, Git state and remaining limits

SHA-256 values match the P06-approved baseline:

| File | SHA-256 |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `docs/reference/MENTOR_NOTES.md` | `FED7B591FC08ED4E507F544F98CA47577457360956A079116528A4E5FB87F61E` |
| `docs/reference/README.md` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |

- Final `git status --short --branch`: `## BE...origin/BE` and the same untracked root groups present initially: `.gitignore`, `.mvn/`, `AGENTS.md`, `README.md`, `config/`, `docs/`, `mvnw`, `mvnw.cmd`, `pom.xml`, `scripts/`, `src/`. All project files remain untracked; final count after adding this report is 210 untracked files.
- `git diff --stat` and `git diff --cached --stat` are empty because the project baseline is untracked. No file was staged; no commit or push was made.
- Testcontainers PostgreSQL is isolated. No shared/production database, deployment, migration application or real secret was used.
- Current eligibility is a point-in-time read, not reservation/assignment authorization. F2 must recheck at its action and protect scheduling itself. The shared global advisory protocol trades write concurrency for simple cross-feature ordering; production throughput/multi-node behavior was not benchmarked.
- The schema has no durable suspension reason/status history. Filesystem/DB crash reconciliation, production ACLs and renewal/revoke remain outside P07. No separate local executable-JAR health launch was performed; health was verified over real HTTP in the PostgreSQL integration app, while the executable JAR was separately exercised by packaging and Boot-root probes.

**P07 READY_FOR_REVIEW; P08 NOT_STARTED.**
