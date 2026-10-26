# Đối chiếu toàn bộ entity với schema leader

Ngày 2026-10-15. Nguồn: file `schema.sql` gốc trên Desktop, bản reference hash khớp; reflection trên annotations entity và inherited base fields hiện tại. **5 bảng, 59 cột, không thiếu/dư cột hoặc sai kiểu/length/nullability/enum được kiểm tra.** Đây là audit offline, chưa đọc schema trên Supabase thật.

- IDs Long/IDENTITY; DATE→LocalDate; TIMESTAMP→LocalDateTime; NUMERIC(14,0)→BigDecimal.
- bank_accounts không updated_at; không bổ sung để giống generic BaseEntity.
- UNIQUE/composite/partial indexes, CHECK, FK và triggers được giữ trong SQL leader; không cần thêm entity F2/F3/F4 để biểu diễn các tham chiếu ngược.
- Khớp cột không chứng minh database từ xa đã khởi tạo hoặc quyền RLS đã được cấu hình.

### `customers` ↔ `Customer` — 14 cột

| Cột SQL gốc | Java field / type | Nullable | Đối chiếu |
|---|---|---|---|
| `id` BIGINT | `id` / `Long` | Không | KHỚP |
| `full_name` VARCHAR(150) | `fullName` / `String` | Không | KHỚP |
| `email` VARCHAR(150) | `email` / `String` | Không | KHỚP |
| `phone` VARCHAR(20) | `phone` / `String` | Không | KHỚP |
| `password_hash` VARCHAR(255) | `passwordHash` / `String` | Không | KHỚP |
| `date_of_birth` DATE | `dateOfBirth` / `LocalDate` | Có | KHỚP |
| `address` VARCHAR(300) | `address` / `String` | Có | KHỚP |
| `avatar_url` VARCHAR(500) | `avatarUrl` / `String` | Có | KHỚP |
| `email_verified` BOOLEAN | `emailVerified` / `boolean` | Không | KHỚP |
| `kyc_status` VARCHAR(20) | `kycStatus` / `KycStatus` | Không | KHỚP |
| `role` VARCHAR(20) | `role` / `Role` | Không | KHỚP |
| `status` VARCHAR(20) | `status` / `CustomerStatus` | Không | KHỚP |
| `created_at` TIMESTAMP | `createdAt` / `LocalDateTime` | Không | KHỚP |
| `updated_at` TIMESTAMP | `updatedAt` / `LocalDateTime` | Không | KHỚP |

### `user_documents` ↔ `UserDocument` — 18 cột

| Cột SQL gốc | Java field / type | Nullable | Đối chiếu |
|---|---|---|---|
| `id` BIGINT | `id` / `Long` | Không | KHỚP |
| `customer_id` BIGINT | `customer` / `Customer` | Không | KHỚP |
| `doc_type` VARCHAR(30) | `docType` / `UserDocumentType` | Không | KHỚP |
| `doc_number` VARCHAR(50) | `docNumber` / `String` | Không | KHỚP |
| `full_name_on_doc` VARCHAR(150) | `fullNameOnDoc` / `String` | Có | KHỚP |
| `date_of_birth_on_doc` DATE | `dateOfBirthOnDoc` / `LocalDate` | Có | KHỚP |
| `issue_place` VARCHAR(200) | `issuePlace` / `String` | Có | KHỚP |
| `issue_date` DATE | `issueDate` / `LocalDate` | Có | KHỚP |
| `expires_at` DATE | `expiresAt` / `LocalDate` | Có | KHỚP |
| `license_class` VARCHAR(10) | `licenseClass` / `String` | Có | KHỚP |
| `front_image_url` VARCHAR(500) | `frontImageUrl` / `String` | Không | KHỚP |
| `back_image_url` VARCHAR(500) | `backImageUrl` / `String` | Có | KHỚP |
| `verify_status` VARCHAR(20) | `verifyStatus` / `DocumentVerifyStatus` | Không | KHỚP |
| `reject_reason` VARCHAR(500) | `rejectReason` / `String` | Có | KHỚP |
| `verified_by` BIGINT | `verifiedBy` / `Customer` | Có | KHỚP |
| `verified_at` TIMESTAMP | `verifiedAt` / `LocalDateTime` | Có | KHỚP |
| `created_at` TIMESTAMP | `createdAt` / `LocalDateTime` | Không | KHỚP |
| `updated_at` TIMESTAMP | `updatedAt` / `LocalDateTime` | Không | KHỚP |

### `drivers` ↔ `Driver` — 5 cột

| Cột SQL gốc | Java field / type | Nullable | Đối chiếu |
|---|---|---|---|
| `id` BIGINT | `id` / `Long` | Không | KHỚP |
| `customer_id` BIGINT | `customer` / `Customer` | Không | KHỚP |
| `status` VARCHAR(20) | `status` / `DriverStatus` | Không | KHỚP |
| `created_at` TIMESTAMP | `createdAt` / `LocalDateTime` | Không | KHỚP |
| `updated_at` TIMESTAMP | `updatedAt` / `LocalDateTime` | Không | KHỚP |

### `bank_accounts` ↔ `BankAccount` — 7 cột

| Cột SQL gốc | Java field / type | Nullable | Đối chiếu |
|---|---|---|---|
| `id` BIGINT | `id` / `Long` | Không | KHỚP |
| `customer_id` BIGINT | `customer` / `Customer` | Không | KHỚP |
| `bank_name` VARCHAR(100) | `bankName` / `String` | Không | KHỚP |
| `account_number` VARCHAR(30) | `accountNumber` / `String` | Không | KHỚP |
| `account_holder` VARCHAR(150) | `accountHolder` / `String` | Không | KHỚP |
| `is_default` BOOLEAN | `isDefault` / `boolean` | Không | KHỚP |
| `created_at` TIMESTAMP | `createdAt` / `LocalDateTime` | Không | KHỚP |

### `vouchers` ↔ `Voucher` — 15 cột

| Cột SQL gốc | Java field / type | Nullable | Đối chiếu |
|---|---|---|---|
| `id` BIGINT | `id` / `Long` | Không | KHỚP |
| `code` VARCHAR(50) | `code` / `String` | Không | KHỚP |
| `description` VARCHAR(300) | `description` / `String` | Có | KHỚP |
| `discount_type` VARCHAR(10) | `discountType` / `DiscountType` | Không | KHỚP |
| `discount_value` NUMERIC(14,0) | `discountValue` / `BigDecimal` | Không | KHỚP |
| `max_discount` NUMERIC(14,0) | `maxDiscount` / `BigDecimal` | Có | KHỚP |
| `min_order_amount` NUMERIC(14,0) | `minOrderAmount` / `BigDecimal` | Không | KHỚP |
| `start_at` TIMESTAMP | `startAt` / `LocalDateTime` | Không | KHỚP |
| `end_at` TIMESTAMP | `endAt` / `LocalDateTime` | Không | KHỚP |
| `usage_limit` INT | `usageLimit` / `Integer` | Có | KHỚP |
| `per_user_limit` INT | `perUserLimit` / `Integer` | Không | KHỚP |
| `used_count` INT | `usedCount` / `Integer` | Không | KHỚP |
| `status` VARCHAR(20) | `status` / `VoucherStatus` | Không | KHỚP |
| `created_at` TIMESTAMP | `createdAt` / `LocalDateTime` | Không | KHỚP |
| `updated_at` TIMESTAMP | `updatedAt` / `LocalDateTime` | Không | KHỚP |
