-- ==============================================================================
-- CAR RENTAL SYSTEM - POSTGRESQL DDL SCHEMA SCRIPT
-- Dự án: SBA301 Car Rental
-- Cơ sở dữ liệu: PostgreSQL (Database name: carrental)
-- ==============================================================================

-- 1. Bật extension cần thiết (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Xóa các bảng cũ theo thứ tự ràng buộc khóa ngoại (CASCADE)
DROP TABLE IF EXISTS action_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payouts CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS dispute_evidences CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS extra_fees CASCADE;
DROP TABLE IF EXISTS handover_images CASCADE;
DROP TABLE IF EXISTS order_handovers CASCADE;
DROP TABLE IF EXISTS rental_orders CASCADE;
DROP TABLE IF EXISTS vouchers CASCADE;
DROP TABLE IF EXISTS user_documents CASCADE;
DROP TABLE IF EXISTS car_documents CASCADE;
DROP TABLE IF EXISTS car_images CASCADE;
DROP TABLE IF EXISTS car_slots CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- ==============================================================================
-- TẠO CÁC BẢNG (TABLE DEFINITIONS)
-- ==============================================================================

-- 1. Bảng Khách hàng & Người dùng hệ thống (Customers)
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    address VARCHAR(300),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'NONE',
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Bảng Tài xế (Drivers)
CREATE TABLE drivers (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Bảng Tài khoản ngân hàng (Bank Accounts)
CREATE TABLE bank_accounts (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(30) NOT NULL UNIQUE,
    account_holder VARCHAR(150) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Bảng Xe cho thuê (Cars)
CREATE TABLE cars (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    driver_id BIGINT UNIQUE REFERENCES drivers(id) ON DELETE SET NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    manufacture_year INT NOT NULL,
    car_type VARCHAR(20) NOT NULL,
    seats INT NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    color VARCHAR(30),
    description TEXT,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    pickup_address VARCHAR(300) NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    price_per_hour NUMERIC(14, 0) NOT NULL,
    price_per_day NUMERIC(14, 0) NOT NULL,
    deposit_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    km_limit_per_day INT,
    extra_km_fee NUMERIC(14, 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_APPROVAL',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Bảng Khung giờ / Lịch xe mở cho thuê (Car Slots)
CREATE TABLE car_slots (
    id BIGSERIAL PRIMARY KEY,
    car_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    price_per_hour NUMERIC(14, 0) NOT NULL,
    price_per_day NUMERIC(14, 0) NOT NULL,
    rental_option VARCHAR(10) NOT NULL DEFAULT 'BOTH',
    min_rental_hours INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Bảng Hình ảnh xe (Car Images)
CREATE TABLE car_images (
    id BIGSERIAL PRIMARY KEY,
    car_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0
);

-- 7. Bảng Giấy tờ xe (Car Documents)
CREATE TABLE car_documents (
    id BIGSERIAL PRIMARY KEY,
    car_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    doc_type VARCHAR(30) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    expires_at DATE,
    verify_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reject_reason VARCHAR(500),
    verified_by BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. Bảng Giấy tờ người dùng (User Documents / CCCD / GPLX)
CREATE TABLE user_documents (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    doc_type VARCHAR(30) NOT NULL,
    doc_number VARCHAR(50) NOT NULL,
    full_name_on_doc VARCHAR(150),
    date_of_birth_on_doc DATE,
    issue_place VARCHAR(200),
    issue_date DATE,
    expires_at DATE,
    license_class VARCHAR(10),
    front_image_url VARCHAR(500) NOT NULL,
    back_image_url VARCHAR(500),
    verify_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reject_reason VARCHAR(500),
    verified_by BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. Bảng Mã giảm giá (Vouchers)
CREATE TABLE vouchers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(300),
    discount_type VARCHAR(10) NOT NULL,
    discount_value NUMERIC(14, 0) NOT NULL,
    max_discount NUMERIC(14, 0),
    min_order_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    usage_limit INT,
    per_user_limit INT NOT NULL DEFAULT 1,
    used_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 10. Bảng Đơn thuê xe (Rental Orders)
CREATE TABLE rental_orders (
    id BIGSERIAL PRIMARY KEY,
    order_code VARCHAR(30) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    car_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE RESTRICT,
    car_slot_id BIGINT NOT NULL REFERENCES car_slots(id) ON DELETE RESTRICT,
    voucher_id BIGINT REFERENCES vouchers(id) ON DELETE SET NULL,
    rental_type VARCHAR(10) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    unit_price NUMERIC(14, 0) NOT NULL,
    quantity INT NOT NULL,
    rental_amount NUMERIC(14, 0) NOT NULL,
    discount_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 0) NOT NULL,
    deposit_amount NUMERIC(14, 0) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    expires_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    cancel_reason VARCHAR(500),
    note VARCHAR(500),
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 11. Bảng Bàn giao xe (Order Handovers)
CREATE TABLE order_handovers (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    handover_type VARCHAR(10) NOT NULL,
    odometer_km INT,
    fuel_percent INT,
    condition_note TEXT,
    handed_at TIMESTAMP NOT NULL,
    renter_confirmed_at TIMESTAMP,
    owner_confirmed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 12. Bảng Hình ảnh bàn giao xe (Handover Images)
CREATE TABLE handover_images (
    id BIGSERIAL PRIMARY KEY,
    handover_id BIGINT NOT NULL REFERENCES order_handovers(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(200)
);

-- 13. Bảng Phí phát sinh (Extra Fees)
CREATE TABLE extra_fees (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    handover_id BIGINT REFERENCES order_handovers(id) ON DELETE SET NULL,
    created_by BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    fee_type VARCHAR(30) NOT NULL,
    amount NUMERIC(14, 0) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 14. Bảng Khiếu nại (Disputes)
CREATE TABLE disputes (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    extra_fee_id BIGINT REFERENCES extra_fees(id) ON DELETE SET NULL,
    raised_by BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    resolution_note TEXT,
    resolved_by BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 15. Bảng Bằng chứng khiếu nại (Dispute Evidences)
CREATE TABLE dispute_evidences (
    id BIGSERIAL PRIMARY KEY,
    dispute_id BIGINT NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    uploaded_by BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    description VARCHAR(300),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 16. Bảng Giao dịch tài chính (Transactions)
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    refund_of_id BIGINT REFERENCES transactions(id) ON DELETE SET NULL,
    dispute_id BIGINT REFERENCES disputes(id) ON DELETE SET NULL,
    extra_fee_id BIGINT REFERENCES extra_fees(id) ON DELETE SET NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount NUMERIC(14, 0) NOT NULL,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    provider_ref VARCHAR(100),
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 17. Bảng Chi trả cho chủ xe (Payouts)
CREATE TABLE payouts (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    recipient_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    bank_account_id BIGINT REFERENCES bank_accounts(id) ON DELETE SET NULL,
    adjustment_transaction_id BIGINT REFERENCES transactions(id) ON DELETE SET NULL,
    gross_amount NUMERIC(14, 0) NOT NULL,
    platform_fee NUMERIC(14, 0) NOT NULL DEFAULT 0,
    net_amount NUMERIC(14, 0) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    note VARCHAR(500),
    paid_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 18. Bảng Đánh giá chuyến đi (Reviews)
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    reviewee_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_reviews_order_reviewer UNIQUE (order_id, reviewer_id)
);

-- 19. Bảng Nhật ký thao tác đơn hàng (Action Logs)
CREATE TABLE action_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    actor_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20),
    note VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- TẠO CÁC CHỈ MỤC (INDEXES) ĐỂ TỐI ƯU TRUY VẤN
-- ==============================================================================
CREATE INDEX idx_cars_owner_id ON cars(owner_id);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_car_slots_car_id ON car_slots(car_id);
CREATE INDEX idx_car_slots_status ON car_slots(status);
CREATE INDEX idx_rental_orders_customer_id ON rental_orders(customer_id);
CREATE INDEX idx_rental_orders_car_id ON rental_orders(car_id);
CREATE INDEX idx_rental_orders_status ON rental_orders(status);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_payouts_order_id ON payouts(order_id);
CREATE INDEX idx_payouts_recipient_id ON payouts(recipient_id);
CREATE INDEX idx_extra_fees_order_id ON extra_fees(order_id);
CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

-- ==============================================================================
-- CHÈN DỮ LIỆU MỒI TEST BAN ĐẦU (INITIAL SEED DATA)
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
    car_type, seats, transmission, fuel_type, color, description, 
    city, pickup_address, price_per_hour, price_per_day, deposit_amount, 
    features, status, created_at, updated_at
)
VALUES (
    (SELECT id FROM customers WHERE email = 'chuxe@gmail.com' LIMIT 1), 
    '51H-99999', 'Toyota', 'Vios', 2022, 
    'SEDAN', 5, 'AUTOMATIC', 'GASOLINE', 'Trắng', 'Xe gia đình mới bảo dưỡng sạch sẽ', 
    'TP. Hồ Chí Minh', '123 Nguyen Van Linh, Quan 7', 
    50000, 600000, 2000000, 
    '["GPS", "Bluetooth", "Camera lùi"]'::jsonb, 'ACTIVE', NOW(), NOW()
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
