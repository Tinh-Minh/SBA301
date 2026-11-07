-- =====================================================================
-- SEED DATA CHO FUNCTION 4 (F4 NEW) & POSTMAN TEST SUITE
-- =====================================================================

-- 1. Tài khoản test (Admin, Chủ xe, Khách thuê)
-- Mật khẩu mặc định: password123
INSERT INTO customers (id, full_name, email, phone, password_hash, email_verified, kyc_status, role, status)
VALUES 
(7, 'Hệ Thống Admin', 'admin@carrental.com', '0900000001', '$2a$10$Pbzn2e63dKrK9GvWRoxkqehF4fTr3Pxlq8aU63OKZ5yR/dH53YrVa', true, 'VERIFIED', 'ADMIN', 'ACTIVE'),
(8, 'Trần Văn Chủ Xe', 'chuxe@gmail.com', '0909876543', '$2a$10$Pbzn2e63dKrK9GvWRoxkqehF4fTr3Pxlq8aU63OKZ5yR/dH53YrVa', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE'),
(9, 'Nguyễn Văn Khách', 'khach@gmail.com', '0901234567', '$2a$10$Pbzn2e63dKrK9GvWRoxkqehF4fTr3Pxlq8aU63OKZ5yR/dH53YrVa', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

SELECT setval(pg_get_serial_sequence('customers', 'id'), (SELECT COALESCE(MAX(id), 1) FROM customers));

-- 2. Xe mẫu thuộc sở hữu của Chủ xe (id 8)
INSERT INTO cars (
    id, owner_id, license_plate, brand, model, manufacture_year, car_type, 
    seats, transmission, fuel_type, color, description, city, district, 
    pickup_address, rental_price_per_day, rental_price_per_month, 
    status, listing_status, price_per_hour, price_per_day, deposit_amount
)
VALUES (
    1, 8, '51H-99999', 'Toyota', 'Vios G', 2022, 'SEDAN', 
    5, 'AUTOMATIC', 'GASOLINE', 'Trắng', 'Xe gia đình bảo dưỡng kỹ, nội thất sạch sẽ thơm tho.', 
    'TP. Hồ Chí Minh', 'Quận 7', '123 Nguyen Van Linh, Quan 7, TP. HCM', 
    600000, 15000000, 'ACTIVE', 'LISTED', 50000, 600000, 2000000
)
ON CONFLICT (id) DO UPDATE SET 
    owner_id = EXCLUDED.owner_id,
    license_plate = EXCLUDED.license_plate,
    status = EXCLUDED.status,
    listing_status = EXCLUDED.listing_status;

SELECT setval(pg_get_serial_sequence('cars', 'id'), (SELECT COALESCE(MAX(id), 1) FROM cars));

-- 3. Gói đăng ký dịch vụ của xe (CarSubscription) trạng thái PENDING_PAYMENT để thực hiện thanh toán
INSERT INTO car_subscriptions (
    id, subscription_code, customer_id, car_id, package_id, 
    package_price, discount_amount, total_amount, status, payment_status
)
VALUES (
    1, 'SUB-202611-0001', 8, 1, 2, 
    180000, 0, 180000, 'PENDING_PAYMENT', 'UNPAID'
)
ON CONFLICT (id) DO UPDATE SET 
    customer_id = EXCLUDED.customer_id,
    car_id = EXCLUDED.car_id,
    package_id = EXCLUDED.package_id,
    total_amount = EXCLUDED.total_amount,
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status;

SELECT setval(pg_get_serial_sequence('car_subscriptions', 'id'), (SELECT COALESCE(MAX(id), 1) FROM car_subscriptions));
