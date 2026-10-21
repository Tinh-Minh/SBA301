-- ==============================================================================
-- DỮ LIỆU MỒI (SEED DATA) CHO KIỂM THỬ TOÀN DIỆN HỆ THỐNG SBA301 CAR RENTAL
-- Khớp 100% với cấu trúc bảng trong seed_data.sql (PostgreSQL schema v3)
-- Sử dụng subquery để tự động lấy khóa ngoại chính xác
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. NGƯỜI DÙNG (CUSTOMERS: Admin, Chủ xe, Khách thuê)
-- ------------------------------------------------------------------------------
INSERT INTO customers (id, full_name, email, phone, password_hash, date_of_birth, address, avatar_url, email_verified, kyc_status, role, status, created_at, updated_at)
OVERRIDING SYSTEM VALUE
SELECT v.id, v.full_name, v.email, v.phone, v.password_hash, v.date_of_birth::date, v.address, v.avatar_url, v.email_verified, v.kyc_status, v.role, v.status, NOW(), NOW()
FROM (
    VALUES 
    (1, 'Nguyen Van Khach', 'khach_test1@gmail.com', '0901111111', '$2a$10$hashDemo123', '1998-08-20', '456 Le Van Viet, TP. Thu Duc, TP. HCM', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE'),
    (2, 'Tran Van ChuXe', 'chuxe_test2@gmail.com', '0902222222', '$2a$10$hashDemo123', '1990-05-15', '123 Nguyen Van Linh, Quan 7, TP. HCM', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE')
) AS v(id, full_name, email, phone, password_hash, date_of_birth, address, avatar_url, email_verified, kyc_status, role, status)
WHERE NOT EXISTS (
    SELECT 1 FROM customers c WHERE c.id = v.id
);

INSERT INTO customers (full_name, email, phone, password_hash, date_of_birth, address, avatar_url, email_verified, kyc_status, role, status, created_at, updated_at)
SELECT v.full_name, v.email, v.phone, v.password_hash, v.date_of_birth::date, v.address, v.avatar_url, v.email_verified, v.kyc_status, v.role, v.status, NOW(), NOW()
FROM (
    VALUES 
    ('Hệ Thống Admin', 'admin@carrental.com', '0900000001', '$2a$10$hashDemoAdmin123', '1995-01-01', 'Quận 1, TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', true, 'VERIFIED', 'ADMIN', 'ACTIVE'),
    ('Tran Van ChuXe', 'chuxe@gmail.com', '0909876543', '$2a$10$hashDemo123', '1990-05-15', '123 Nguyen Van Linh, Quan 7, TP. HCM', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE'),
    ('Nguyen Van Khach', 'khach@gmail.com', '0901234567', '$2a$10$hashDemo123', '1998-08-20', '456 Le Van Viet, TP. Thu Duc, TP. HCM', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE')
) AS v(full_name, email, phone, password_hash, date_of_birth, address, avatar_url, email_verified, kyc_status, role, status)
WHERE NOT EXISTS (
    SELECT 1 FROM customers c WHERE lower(c.email) = lower(v.email) OR c.phone = v.phone
);

-- ------------------------------------------------------------------------------
-- 2. GIẤY TỜ NGƯỜI DÙNG (USER_DOCUMENTS: CCCD, GPLX B2)
-- ------------------------------------------------------------------------------
INSERT INTO user_documents (customer_id, doc_type, doc_number, full_name_on_doc, date_of_birth_on_doc, issue_place, issue_date, expires_at, license_class, front_image_url, back_image_url, verify_status, verified_by, verified_at, created_at, updated_at)
SELECT 
    c.id, 
    d.doc_type, 
    d.doc_number, 
    d.full_name_on_doc, 
    d.date_of_birth_on_doc::date, 
    d.issue_place, 
    d.issue_date::date, 
    d.expires_at::date, 
    d.license_class, 
    d.front_image_url, 
    d.back_image_url, 
    d.verify_status, 
    (SELECT id FROM customers WHERE email = 'admin@carrental.com' LIMIT 1), 
    NOW(), NOW(), NOW()
FROM customers c
CROSS JOIN (
    VALUES 
    ('CITIZEN_ID', '079090001111', 'TRAN VAN CHUXE', '1990-05-15', 'Cục Cảnh sát QLHC về TTXH', '2021-05-15', '2035-05-15', NULL, 'https://placehold.co/600x400/png?text=CCCD_Front', 'https://placehold.co/600x400/png?text=CCCD_Back', 'APPROVED'),
    ('DRIVER_LICENSE', '790123456789', 'TRAN VAN CHUXE', '1990-05-15', 'Sở GTVT TP. Hồ Chí Minh', '2020-01-10', '2030-01-10', 'B2', 'https://placehold.co/600x400/png?text=GPLX_Front', 'https://placehold.co/600x400/png?text=GPLX_Back', 'APPROVED')
) AS d(doc_type, doc_number, full_name_on_doc, date_of_birth_on_doc, issue_place, issue_date, expires_at, license_class, front_image_url, back_image_url, verify_status)
WHERE c.email = 'chuxe@gmail.com'
  AND NOT EXISTS (
      SELECT 1 FROM user_documents ud WHERE ud.customer_id = c.id AND ud.doc_type = d.doc_type AND ud.doc_number = d.doc_number
  );

INSERT INTO user_documents (customer_id, doc_type, doc_number, full_name_on_doc, date_of_birth_on_doc, issue_place, issue_date, expires_at, license_class, front_image_url, back_image_url, verify_status, verified_by, verified_at, created_at, updated_at)
SELECT 
    c.id, 
    d.doc_type, 
    d.doc_number, 
    d.full_name_on_doc, 
    d.date_of_birth_on_doc::date, 
    d.issue_place, 
    d.issue_date::date, 
    d.expires_at::date, 
    d.license_class, 
    d.front_image_url, 
    d.back_image_url, 
    d.verify_status, 
    (SELECT id FROM customers WHERE email = 'admin@carrental.com' LIMIT 1), 
    NOW(), NOW(), NOW()
FROM customers c
CROSS JOIN (
    VALUES 
    ('CITIZEN_ID', '079098002222', 'NGUYEN VAN KHACH', '1998-08-20', 'Cục Cảnh sát QLHC về TTXH', '2022-08-20', '2038-08-20', NULL, 'https://placehold.co/600x400/png?text=CCCD_Khach_Front', 'https://placehold.co/600x400/png?text=CCCD_Khach_Back', 'APPROVED'),
    ('DRIVER_LICENSE', '790987654321', 'NGUYEN VAN KHACH', '1998-08-20', 'Sở GTVT TP. Hồ Chí Minh', '2022-09-01', '2032-09-01', 'B1', 'https://placehold.co/600x400/png?text=GPLX_Khach_Front', 'https://placehold.co/600x400/png?text=GPLX_Khach_Back', 'APPROVED')
) AS d(doc_type, doc_number, full_name_on_doc, date_of_birth_on_doc, issue_place, issue_date, expires_at, license_class, front_image_url, back_image_url, verify_status)
WHERE c.email = 'khach@gmail.com'
  AND NOT EXISTS (
      SELECT 1 FROM user_documents ud WHERE ud.customer_id = c.id AND ud.doc_type = d.doc_type AND ud.doc_number = d.doc_number
  );

-- ------------------------------------------------------------------------------
-- 3. HỒ SƠ TÀI XẾ (DRIVERS)
-- ------------------------------------------------------------------------------
INSERT INTO drivers (customer_id, status, created_at, updated_at)
SELECT id, 'ACTIVE', NOW(), NOW()
FROM customers
WHERE email = 'chuxe@gmail.com'
  AND NOT EXISTS (
      SELECT 1 FROM drivers WHERE customer_id = customers.id
  );

-- ------------------------------------------------------------------------------
-- 4. TÀI KHOẢN NGÂN HÀNG (BANK_ACCOUNTS)
-- ------------------------------------------------------------------------------
INSERT INTO bank_accounts (customer_id, bank_name, account_number, account_holder, is_default, created_at)
SELECT v.c_id, v.b_name, v.acc_num, v.acc_holder, v.is_def, NOW()
FROM (
    VALUES 
    ((SELECT id FROM customers WHERE lower(email) = 'chuxe@gmail.com' LIMIT 1), 'Vietcombank', '0071000888999', 'TRAN VAN CHUXE', true),
    ((SELECT id FROM customers WHERE lower(email) = 'khach@gmail.com' LIMIT 1), 'Techcombank', '1903666888999', 'NGUYEN VAN KHACH', true)
) AS v(c_id, b_name, acc_num, acc_holder, is_def)
WHERE v.c_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM bank_accounts ba WHERE ba.account_number = v.acc_num
  );

-- ------------------------------------------------------------------------------
-- 5. XE CHO THUÊ (CARS)
-- ------------------------------------------------------------------------------
INSERT INTO cars (
    owner_id, driver_id, license_plate, brand, model, manufacture_year, 
    car_type, seats, transmission, fuel_type, color, description, features, 
    city, district, pickup_address, latitude, longitude, 
    price_per_hour, price_per_day, deposit_amount, km_limit_per_day, extra_km_fee, status, created_at, updated_at
)
SELECT 
    (SELECT id FROM customers WHERE lower(email) = 'chuxe@gmail.com' LIMIT 1), 
    (SELECT id FROM drivers WHERE customer_id = (SELECT id FROM customers WHERE lower(email) = 'chuxe@gmail.com' LIMIT 1) LIMIT 1),
    '51H-99999', 'Toyota', 'Vios G', 2022, 
    'SEDAN', 5, 'AUTOMATIC', 'GASOLINE', 'Trắng', 'Xe gia đình bảo dưỡng kỹ, nội thất sạch sẽ thơm tho.', 
    '["GPS", "Bluetooth", "Camera lùi", "Cảm biến lốp", "Apple CarPlay"]'::jsonb, 
    'TP. Hồ Chí Minh', 'Quận 7', '123 Nguyen Van Linh, Quan 7, TP. HCM', 10.732500, 106.715000, 
    50000, 600000, 2000000, 300, 5000, 'ACTIVE', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM cars WHERE license_plate = '51H-99999'
);

-- ------------------------------------------------------------------------------
-- 6. HÌNH ẢNH XE (CAR_IMAGES)
-- ------------------------------------------------------------------------------
INSERT INTO car_images (car_id, image_url, is_primary, sort_order)
SELECT 
    (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1), 
    img.url, img.is_pri, img.s_order
FROM (
    VALUES 
    ('https://images.unsplash.com/photo-1549399542-7e3f8b79c341', true, 1),
    ('https://images.unsplash.com/photo-1552519507-da3b142c6e3d', false, 2),
    ('https://images.unsplash.com/photo-1503376780353-7e6692767b70', false, 3)
) AS img(url, is_pri, s_order)
WHERE NOT EXISTS (
    SELECT 1 FROM car_images ci 
    WHERE ci.car_id = (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1)
);

-- ------------------------------------------------------------------------------
-- 7. GIẤY TỜ XE (CAR_DOCUMENTS: Đăng ký xe, Đăng kiểm, Bảo hiểm)
-- ------------------------------------------------------------------------------
INSERT INTO car_documents (car_id, doc_type, file_url, expires_at, verify_status, verified_by, verified_at, created_at)
SELECT 
    (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1),
    cd.doc_type, cd.file_url, cd.expires_at::date, 'APPROVED',
    (SELECT id FROM customers WHERE email = 'admin@carrental.com' LIMIT 1), NOW(), NOW()
FROM (
    VALUES 
    ('REGISTRATION', 'https://placehold.co/600x400/png?text=Car_Registration', '2030-12-31'),
    ('INSPECTION',   'https://placehold.co/600x400/png?text=Car_Inspection',   '2027-06-30'),
    ('INSURANCE',    'https://placehold.co/600x400/png?text=Car_Insurance',    '2027-12-31')
) AS cd(doc_type, file_url, expires_at)
WHERE NOT EXISTS (
    SELECT 1 FROM car_documents 
    WHERE car_id = (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1)
      AND doc_type = cd.doc_type
);

-- ------------------------------------------------------------------------------
-- 8. KHUNG GIỜ MỞ CHO THUÊ (CAR_SLOTS)
-- ------------------------------------------------------------------------------
INSERT INTO car_slots (
    car_id, start_time, end_time, price_per_hour, price_per_day, rental_option, min_rental_hours, status, version, created_at, updated_at
)
SELECT 
    (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1), 
    NOW() - interval '2 days', NOW() + interval '10 days', 
    50000, 600000, 'BOTH', 1, 'OPEN', 0, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM car_slots 
    WHERE car_id = (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1)
      AND status = 'OPEN'
);

-- ------------------------------------------------------------------------------
-- 9. MÃ GIẢM GIÁ (VOUCHERS)
-- ------------------------------------------------------------------------------
INSERT INTO vouchers (code, description, discount_type, discount_value, max_discount, min_order_amount, start_at, end_at, usage_limit, per_user_limit, used_count, status, created_at, updated_at)
SELECT v.code, v.v_desc, v.disc_type, v.disc_val, v.max_disc, v.min_ord, (NOW() - v.start_int)::timestamp, (NOW() + v.end_int)::timestamp, v.u_lim, v.pu_lim, v.u_cnt, v.st, NOW(), NOW()
FROM (
    VALUES 
    ('WELCOME2026', 'Giảm 10% tối đa 100k cho khách hàng mới', 'PERCENT', 10, 100000, 300000, interval '30 days', interval '180 days', 100, 1, 1, 'ACTIVE'),
    ('GIAM50K', 'Giảm 50k trực tiếp đơn từ 500k', 'FIXED', 50000, 50000, 500000, interval '10 days', interval '90 days', 50, 1, 0, 'ACTIVE')
) AS v(code, v_desc, disc_type, disc_val, max_disc, min_ord, start_int, end_int, u_lim, pu_lim, u_cnt, st)
WHERE NOT EXISTS (
    SELECT 1 FROM vouchers vc WHERE vc.code = v.code
);

-- ------------------------------------------------------------------------------
-- 10. ĐƠN THUÊ XE (RENTAL_ORDERS)
-- Lưu ý: Đơn thuê cần khớp với slot của xe và thỏa mãn trigger trg_order_in_slot
-- ------------------------------------------------------------------------------
INSERT INTO rental_orders (
    order_code, customer_id, car_id, car_slot_id, voucher_id, rental_type, 
    start_time, end_time, actual_start_time, actual_end_time, 
    unit_price, quantity, rental_amount, discount_amount, total_amount, deposit_amount, 
    status, payment_status, commission_rate, version, created_at, updated_at
)
SELECT 
    'ORD-2026-001', 
    (SELECT id FROM customers WHERE email = 'khach@gmail.com' LIMIT 1), 
    c.id, 
    s.id, 
    (SELECT id FROM vouchers WHERE code = 'WELCOME2026' LIMIT 1), 
    'DAILY', 
    NOW() - interval '1 day', NOW() + interval '1 day', NOW() - interval '1 day', NULL, 
    600000, 2, 1200000, 100000, 1100000, 2000000, 
    'CONFIRMED', 'PAID', 10.00, 0, NOW(), NOW()
FROM cars c
JOIN car_slots s ON s.car_id = c.id AND s.status = 'OPEN'
WHERE c.license_plate = '51H-99999'
  AND NOT EXISTS (SELECT 1 FROM rental_orders WHERE order_code = 'ORD-2026-001')
LIMIT 1;

-- ------------------------------------------------------------------------------
-- 11. NHẬT KÝ THAO TÁC ĐƠN (ACTION_LOGS)
-- ------------------------------------------------------------------------------
INSERT INTO action_logs (order_id, actor_id, action, from_status, to_status, note, created_at)
SELECT 
    o.id, 
    o.customer_id, 
    'CREATE_ORDER', 
    NULL, 
    'PENDING', 
    'Khách đặt đơn thuê xe', 
    NOW() - interval '1 day'
FROM rental_orders o
WHERE o.order_code = 'ORD-2026-001'
  AND NOT EXISTS (
      SELECT 1 FROM action_logs WHERE order_id = o.id AND action = 'CREATE_ORDER'
  );

INSERT INTO action_logs (order_id, actor_id, action, from_status, to_status, note, created_at)
SELECT 
    o.id, 
    (SELECT id FROM customers WHERE email = 'chuxe@gmail.com' LIMIT 1), 
    'CONFIRM_ORDER', 
    'PENDING', 
    'CONFIRMED', 
    'Chủ xe xác nhận đơn đặt thuê', 
    NOW() - interval '23 hours'
FROM rental_orders o
WHERE o.order_code = 'ORD-2026-001'
  AND NOT EXISTS (
      SELECT 1 FROM action_logs WHERE order_id = o.id AND action = 'CONFIRM_ORDER'
  );

-- ------------------------------------------------------------------------------
-- 12. BÀN GIAO XE (ORDER_HANDOVERS: Giao nhận xe ban đầu)
-- ------------------------------------------------------------------------------
INSERT INTO order_handovers (order_id, handover_type, odometer_km, fuel_percent, condition_note, handed_at, renter_confirmed_at, owner_confirmed_at, created_at)
SELECT 
    o.id, 'PICKUP', 25300, 100, 'Xe nguyên vẹn, không trầy xước, đầy bình xăng.', NOW() - interval '22 hours', NOW() - interval '22 hours', NOW() - interval '22 hours', NOW()
FROM rental_orders o
WHERE o.order_code = 'ORD-2026-001'
  AND NOT EXISTS (
      SELECT 1 FROM order_handovers WHERE order_id = o.id AND handover_type = 'PICKUP'
  );

-- ------------------------------------------------------------------------------
-- 13. HÌNH ẢNH BÀN GIAO (HANDOVER_IMAGES)
-- ------------------------------------------------------------------------------
INSERT INTO handover_images (handover_id, image_url, caption)
SELECT 
    h.id, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341', 'Ảnh đồng hồ công tơ mét và vạch xăng khi nhận'
FROM order_handovers h
JOIN rental_orders o ON o.id = h.order_id
WHERE o.order_code = 'ORD-2026-001' AND h.handover_type = 'PICKUP'
  AND NOT EXISTS (SELECT 1 FROM handover_images WHERE handover_id = h.id);

-- ------------------------------------------------------------------------------
-- 14. PHÍ PHÁT SINH (EXTRA_FEES: Phí rửa xe dơ khi trả)
-- ------------------------------------------------------------------------------
INSERT INTO extra_fees (order_id, handover_id, created_by, fee_type, amount, description, status, created_at, updated_at)
SELECT 
    o.id, h.id, 
    (SELECT id FROM customers WHERE email = 'chuxe@gmail.com' LIMIT 1), 
    'CLEANING', 100000, 'Phí rửa bùn đất gầm xe', 'PAID', NOW(), NOW()
FROM rental_orders o
JOIN order_handovers h ON h.order_id = o.id AND h.handover_type = 'PICKUP'
WHERE o.order_code = 'ORD-2026-001'
  AND NOT EXISTS (
      SELECT 1 FROM extra_fees WHERE order_id = o.id AND fee_type = 'CLEANING'
  );

-- ------------------------------------------------------------------------------
-- 15. TRANH CHẤP / KHIẾU NẠI (DISPUTES: ví dụ mẫu trạng thái RESOLVED)
-- ------------------------------------------------------------------------------
INSERT INTO disputes (order_id, extra_fee_id, raised_by, reason, description, status, resolution_note, resolved_by, resolved_at, created_at, updated_at)
SELECT 
    o.id, ef.id, 
    o.customer_id, 
    'Phí vệ sinh cao', 'Tôi đã rửa sơ trước khi trả nhưng vẫn bị tính 100k', 
    'RESOLVED', 'Admin đồng ý thương lượng giảm 50% phí', 
    (SELECT id FROM customers WHERE email = 'admin@carrental.com' LIMIT 1), NOW(), NOW(), NOW()
FROM rental_orders o
JOIN extra_fees ef ON ef.order_id = o.id AND ef.fee_type = 'CLEANING'
WHERE o.order_code = 'ORD-2026-001'
  AND NOT EXISTS (SELECT 1 FROM disputes WHERE order_id = o.id);

-- ------------------------------------------------------------------------------
-- 16. BẰNG CHỨNG TRANH CHẤP (DISPUTE_EVIDENCES)
-- ------------------------------------------------------------------------------
INSERT INTO dispute_evidences (dispute_id, uploaded_by, file_url, file_type, description, created_at)
SELECT 
    d.id, d.raised_by, 'https://placehold.co/600x400/png?text=Evidence_Clean_Car', 'IMAGE', 'Ảnh xe đã tự xịt nước', NOW()
FROM disputes d
JOIN rental_orders o ON o.id = d.order_id
WHERE o.order_code = 'ORD-2026-001'
  AND NOT EXISTS (SELECT 1 FROM dispute_evidences WHERE dispute_id = d.id);

-- ------------------------------------------------------------------------------
-- 17. GIAO DỊCH (TRANSACTIONS: Đặt cọc, Thanh toán tiền thuê)
-- ------------------------------------------------------------------------------
INSERT INTO transactions (order_id, transaction_type, amount, method, status, provider_ref, paid_at, created_at, updated_at)
SELECT 
    o.id, 'DEPOSIT', o.deposit_amount, 'MOMO', 'SUCCESS', 'MOMO-DEP-001', NOW() - interval '23 hours', NOW() - interval '23 hours', NOW() - interval '23 hours'
FROM rental_orders o
WHERE o.order_code = 'ORD-2026-001'
  AND NOT EXISTS (
      SELECT 1 FROM transactions WHERE order_id = o.id AND transaction_type = 'DEPOSIT'
  );

INSERT INTO transactions (order_id, transaction_type, amount, method, status, provider_ref, paid_at, created_at, updated_at)
SELECT 
    o.id, 'RENTAL_PAYMENT', o.total_amount, 'MOMO', 'SUCCESS', 'MOMO-PAY-001', NOW() - interval '23 hours', NOW() - interval '23 hours', NOW() - interval '23 hours'
FROM rental_orders o
WHERE o.order_code = 'ORD-2026-001'
  AND NOT EXISTS (
      SELECT 1 FROM transactions WHERE order_id = o.id AND transaction_type = 'RENTAL_PAYMENT'
  );

-- ------------------------------------------------------------------------------
-- 18. CHI TRẢ CHO CHỦ XE (PAYOUTS)
-- Tiền thuê 1.100.000đ, phí sàn 10% (110.000đ), chủ xe thực nhận 990.000đ
-- ------------------------------------------------------------------------------
INSERT INTO payouts (
    order_id, recipient_id, bank_account_id, gross_amount, platform_fee, net_amount, status, note, version, created_at, updated_at
)
SELECT 
    o.id, 
    c.owner_id, 
    ba.id, 
    1100000, 110000, 990000, 
    'PENDING', 'Thanh toán tiền thuê sau khi hoàn thành đơn', 0, NOW(), NOW()
FROM rental_orders o
JOIN cars c ON c.id = o.car_id
JOIN bank_accounts ba ON ba.customer_id = c.owner_id AND ba.is_default = true
WHERE o.order_code = 'ORD-2026-001'
  AND NOT EXISTS (
      SELECT 1 FROM payouts WHERE order_id = o.id
  );

-- ------------------------------------------------------------------------------
-- 19. ĐÁNH GIÁ (REVIEWS)
-- ------------------------------------------------------------------------------
INSERT INTO reviews (order_id, reviewer_id, reviewee_id, rating, comment, created_at)
SELECT 
    o.id, 
    o.customer_id, 
    c.owner_id, 
    5, 
    'Chủ xe nhiệt tình, xe mới chạy rất êm và tiết kiệm xăng!', 
    NOW()
FROM rental_orders o
JOIN cars c ON c.id = o.car_id
WHERE o.order_code = 'ORD-2026-001'
  AND NOT EXISTS (
      SELECT 1 FROM reviews WHERE order_id = o.id AND reviewer_id = o.customer_id
  );

-- ------------------------------------------------------------------------------
-- 20. ĐỒNG BỘ CỐ ĐỊNH ID CHO POSTMAN TEST COLLECTION (Khách id=1, Chủ xe id=2)
-- ------------------------------------------------------------------------------
INSERT INTO bank_accounts (id, customer_id, bank_name, account_number, account_holder, is_default, created_at)
OVERRIDING SYSTEM VALUE
SELECT 1, 2, 'Vietcombank', '0071000888999', 'TRAN VAN CHUXE', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM bank_accounts WHERE id = 1);

UPDATE rental_orders SET customer_id = 1 WHERE id = 1;
UPDATE extra_fees SET created_by = 2, status = 'PENDING' WHERE id = 1;
UPDATE disputes SET raised_by = 1, status = 'OPEN' WHERE id = 1;
UPDATE payouts SET recipient_id = 2, bank_account_id = 1, status = 'PENDING' WHERE id = 1;
DELETE FROM reviews WHERE order_id = 1 AND reviewer_id = 1;

