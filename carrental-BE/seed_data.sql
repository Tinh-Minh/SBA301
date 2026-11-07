-- ==============================================================================
-- DỮ LIỆU MỒI (SEED DATA) CHO KIỂM THỬ API SBA301 CAR RENTAL
-- Chạy script này trong PostgreSQL Database 'carrental' (pgAdmin / DBeaver / psql)
-- Sử dụng subquery để tự động lấy ID chính xác, tránh lỗi khóa ngoại (Foreign Key)
-- ==============================================================================

-- 1. Tạo 2 tài khoản khách hàng test (Người thuê xe và Chủ xe)
INSERT INTO customers (full_name, email, phone, password_hash, email_verified, kyc_status, role, status, created_at, updated_at)
VALUES 
('Nguyen Van Khach', 'khach@gmail.com', '0901234567', '$2a$10$hashDemo123', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE', NOW(), NOW()),
('Tran Van ChuXe', 'chuxe@gmail.com', '0909876543', '$2a$10$hashDemo123', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, role = 'CUSTOMER';

-- 2. Tạo tài khoản ngân hàng cho Chủ xe (lấy ID chủ xe theo email 'chuxe@gmail.com')
INSERT INTO bank_accounts (customer_id, bank_name, account_number, account_holder, is_default, created_at)
VALUES (
    (SELECT id FROM customers WHERE email = 'chuxe@gmail.com' LIMIT 1),
    'Vietcombank', 
    '0071000888999', 
    'TRAN VAN CHUXE', 
    true, 
    NOW()
)
ON CONFLICT (account_number) DO NOTHING;

-- 3. Tạo xe cho chủ xe
INSERT INTO cars (
    owner_id, license_plate, brand, model, manufacture_year, 
    car_type, seats, transmission, fuel_type, city, pickup_address, 
    price_per_hour, price_per_day, deposit_amount, features, status, created_at, updated_at
)
VALUES (
    (SELECT id FROM customers WHERE email = 'chuxe@gmail.com' LIMIT 1), 
    '51H-99999', 'Toyota', 'Vios', 2022, 
    'SEDAN', 5, 'AUTOMATIC', 'GASOLINE', 'TP. Hồ Chí Minh', '123 Nguyen Van Linh, Quan 7', 
    50000, 600000, 2000000, '["GPS", "Bluetooth", "Camera lùi"]'::jsonb, 'ACTIVE', NOW(), NOW()
)
ON CONFLICT (license_plate) DO UPDATE
SET status = 'ACTIVE';

-- 4. Tạo khung giờ thuê xe (Slot)
INSERT INTO car_slots (
    car_id, start_time, end_time, price_per_hour, price_per_day, rental_option, min_rental_hours, status, created_at, updated_at
)
VALUES (
    (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1), 
    NOW() - interval '1 day', NOW() + interval '5 days', 
    50000, 600000, 'BOTH', 1, 'OPEN', NOW(), NOW()
);

-- 5. Tạo đơn thuê xe test (liên kết qua subquery để đảm bảo đúng ID ngoại khóa)
INSERT INTO rental_orders (
    order_code, customer_id, car_id, car_slot_id, rental_type, 
    start_time, end_time, unit_price, quantity, rental_amount, discount_amount, total_amount, deposit_amount, 
    status, payment_status, commission_rate, version, created_at, updated_at
)
VALUES (
    'ORD-2026-001', 
    (SELECT id FROM customers WHERE email = 'khach@gmail.com' LIMIT 1), 
    (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1), 
    (SELECT id FROM car_slots WHERE car_id = (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1) ORDER BY id DESC LIMIT 1), 
    'DAILY', 
    NOW(), NOW() + interval '2 days', 600000, 2, 1200000, 0, 1200000, 2000000, 
    'CONFIRMED', 'UNPAID', 10.00, 0, NOW(), NOW()
)
ON CONFLICT (order_code) DO UPDATE 
SET rental_type = 'DAILY', payment_status = 'UNPAID', total_amount = 1200000, deposit_amount = 2000000;
