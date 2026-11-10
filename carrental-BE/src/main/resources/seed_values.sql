-- =====================================================================
-- SEED DATA CHO FUNCTION 4 (F4 NEW) & POSTMAN TEST SUITE
-- =====================================================================

-- 0. Gói dịch vụ đăng tin (Listing Packages)
INSERT INTO listing_packages (
    id, name, code, price, duration_days, priority_level, badge_label, description, is_active, created_at, updated_at
)
VALUES 
(1, 'Gói Cơ Bản (7 Ngày)', 'PKG_BASIC', 50000, 7, 1, 'THƯỜNG', 'Đăng bài hiển thị chuẩn trong 7 ngày, tiếp cận khách thuê thông thường.', true, NOW(), NOW()),
(2, 'Gói Tiêu Chuẩn (30 Ngày)', 'PKG_STANDARD', 180000, 30, 2, 'NỔI BẬT', 'Hiển thị trong 30 ngày, ưu tiên xuất hiện trước các tin cơ bản.', true, NOW(), NOW()),
(3, 'Gói VIP Nổi Bật (90 Ngày)', 'PKG_VIP', 450000, 90, 3, 'VIP PRO', 'Ghim đầu danh sách, hiển thị huy hiệu VIP nổi bật, tối đa lượng khách liên hệ.', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    price = EXCLUDED.price,
    duration_days = EXCLUDED.duration_days,
    priority_level = EXCLUDED.priority_level,
    badge_label = EXCLUDED.badge_label,
    updated_at = NOW();

SELECT setval(pg_get_serial_sequence('listing_packages', 'id'), (SELECT COALESCE(MAX(id), 1) FROM listing_packages));

-- 1. Tài khoản test (Admin, Chủ xe, Khách thuê)
-- Mật khẩu mặc định: password123
INSERT INTO customers (
    id, full_name, email, phone, password_hash, email_verified, kyc_status, role, status, created_at, updated_at
)
VALUES 
(7, 'Hệ Thống Admin', 'admin@carrental.com', '0900000001', '$2a$10$Pbzn2e63dKrK9GvWRoxkqehF4fTr3Pxlq8aU63OKZ5yR/dH53YrVa', true, 'VERIFIED', 'ADMIN', 'ACTIVE', NOW(), NOW()),
(8, 'Trần Văn Chủ Xe', 'chuxe@gmail.com', '0909876543', '$2a$10$Pbzn2e63dKrK9GvWRoxkqehF4fTr3Pxlq8aU63OKZ5yR/dH53YrVa', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE', NOW(), NOW()),
(9, 'Nguyễn Văn Khách', 'khach@gmail.com', '0901234567', '$2a$10$Pbzn2e63dKrK9GvWRoxkqehF4fTr3Pxlq8aU63OKZ5yR/dH53YrVa', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

SELECT setval(pg_get_serial_sequence('customers', 'id'), (SELECT COALESCE(MAX(id), 1) FROM customers));

-- 2. Xe mẫu thuộc sở hữu của Chủ xe (id 8) - Đã duyệt (ACTIVE) nhưng chưa đăng tin (UNLISTED)
INSERT INTO cars (
    id, owner_id, license_plate, brand, model, manufacture_year, car_type, 
    seats, transmission, fuel_type, color, description, features, city, district, 
    pickup_address, rental_price_per_day, rental_price_per_month, 
    status, listing_status, created_at, updated_at
)
VALUES (
    1, 8, '51H-99999', 'Toyota', 'Vios G', 2022, 'SEDAN', 
    5, 'AUTOMATIC', 'GASOLINE', 'Trắng', 'Xe gia đình bảo dưỡng kỹ, nội thất sạch sẽ thơm tho.', '[]'::jsonb, 
    'TP. Hồ Chí Minh', 'Quận 7', '123 Nguyen Van Linh, Quan 7, TP. HCM', 
    600000, 15000000, 'ACTIVE', 'UNLISTED', NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET 
    owner_id = EXCLUDED.owner_id,
    license_plate = EXCLUDED.license_plate,
    status = EXCLUDED.status,
    listing_status = EXCLUDED.listing_status,
    updated_at = NOW();

SELECT setval(pg_get_serial_sequence('cars', 'id'), (SELECT COALESCE(MAX(id), 1) FROM cars));

