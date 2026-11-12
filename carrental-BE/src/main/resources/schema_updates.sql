-- =====================================================================
-- Thay đổi schema dạng CỘNG THÊM, chạy ở MỌI lần khởi động (DatabaseSeedInitializer).
-- Chỉ được viết lệnh idempotent (IF NOT EXISTS) và không xoá dữ liệu.
-- =====================================================================

-- F1-02: vô hiệu token cũ sau khi đổi mật khẩu
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;

-- F2-05: điều khoản thuê chủ xe nhập ở form đăng xe (trước đây thu trên form nhưng không lưu)
ALTER TABLE cars ADD COLUMN IF NOT EXISTS weekend_price_per_day NUMERIC(14,0) CHECK (weekend_price_per_day >= 0);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS deposit_amount        NUMERIC(14,0) CHECK (deposit_amount >= 0);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS km_limit_per_day      INT CHECK (km_limit_per_day > 0);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS extra_km_fee          NUMERIC(14,0) CHECK (extra_km_fee >= 0);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS late_fee_per_hour     NUMERIC(14,0) CHECK (late_fee_per_hour >= 0);

-- Lưu lý do admin từ chối hồ sơ xe để chủ xe biết cần sửa gì
ALTER TABLE cars ADD COLUMN IF NOT EXISTS reject_reason VARCHAR(500);
