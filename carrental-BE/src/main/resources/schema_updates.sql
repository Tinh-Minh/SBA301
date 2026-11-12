-- =====================================================================
-- Thay đổi schema dạng CỘNG THÊM, chạy ở MỌI lần khởi động (DatabaseSeedInitializer).
-- Chỉ được viết lệnh idempotent (IF NOT EXISTS) và không xoá dữ liệu.
-- =====================================================================

-- F1-02: vô hiệu token cũ sau khi đổi mật khẩu
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;
