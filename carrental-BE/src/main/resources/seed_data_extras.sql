-- =====================================================================
-- Dữ liệu mẫu cho các bảng mới (hồ sơ an toàn, đơn thuê, biên bản).
-- Chỉ chạy NGAY SAU khi nạp seed_data.sql (database trống hoặc DB_RESET_ON_STARTUP=true).
-- =====================================================================

-- Hồ sơ an toàn
INSERT INTO car_safety_records (car_id, record_type, performed_at, expires_at, provider, reference_number, odometer_km, result, note, verify_status, verified_by, verified_at) VALUES
(1, 'INSPECTION',  CURRENT_DATE - 160, CURRENT_DATE + 570, 'Trung tâm đăng kiểm 50-05V', 'KD-5005-118233', 28500, 'PASSED', 'Đạt, không có lỗi', 'APPROVED', 1, vn_now()),
(1, 'INSURANCE',   CURRENT_DATE - 300, CURRENT_DATE + 65,  'Bảo hiểm Bảo Việt', 'BV-VC-2026-00981', NULL, 'NOT_APPLICABLE', 'Bảo hiểm vật chất 2 chiều', 'APPROVED', 1, vn_now()),
(1, 'MAINTENANCE', CURRENT_DATE - 45,  CURRENT_DATE + 135, 'Honda Ôtô Quận 7', 'PDV-77120', 31200, 'NOT_APPLICABLE', 'Bảo dưỡng cấp 30.000 km, thay dầu, lọc gió', 'APPROVED', 1, vn_now()),
(2, 'INSPECTION',  CURRENT_DATE - 340, CURRENT_DATE + 20,  'Trung tâm đăng kiểm 51-03V', 'KD-5103-552190', 45200, 'PASSED', NULL, 'APPROVED', 1, vn_now()),
(2, 'MAINTENANCE', CURRENT_DATE - 420, NULL, 'Toyota Lý Thường Kiệt', 'TLTK-22019', 41000, 'NOT_APPLICABLE', 'Bảo dưỡng 40.000 km', 'APPROVED', 1, vn_now()),
(2, 'REPAIR',      CURRENT_DATE - 200, NULL, 'Gara Minh Phát', 'MP-0921', 43800, 'NOT_APPLICABLE', 'Thay cản sau do va quệt nhẹ', 'PENDING', NULL, NULL),
(3, 'INSPECTION',  CURRENT_DATE - 30,  CURRENT_DATE + 700, 'Trung tâm đăng kiểm 50-07D', 'KD-5007-889012', 12000, 'PASSED', NULL, 'PENDING', NULL, NULL),
(6, 'INSURANCE',   CURRENT_DATE - 400, CURRENT_DATE - 35,  'PVI', 'PVI-2025-7781', NULL, 'NOT_APPLICABLE', 'Đã hết hạn, chủ xe đang gia hạn', 'APPROVED', 1, vn_now());

-- Đơn thuê mẫu (giá chốt theo bảng giá xe)
INSERT INTO bookings (booking_code, car_id, customer_id, owner_id, pickup_at, return_at, status, rental_days, rental_hours, price_per_day, price_per_hour, day_amount, hour_amount, rental_amount, deposit_amount, km_limit_per_day, extra_km_fee, late_fee_per_hour, customer_note, contact_phone, owner_contacted_at, contact_note, confirmed_at, picked_up_at, returned_at, pickup_odometer_km, return_odometer_km, final_amount, completed_at) VALUES
('BK-DEMO-0001', 3, 9, 3, date_trunc('hour', vn_now()) - INTERVAL '20 days', date_trunc('hour', vn_now()) - INTERVAL '17 days', 'COMPLETED', 3, 0, 1000000, 100000, 3000000, 0, 3000000, 5000000, 300, 5000, 100000, 'Đi Vũng Tàu', '0978901234', vn_now() - INTERVAL '21 days', 'Đã gọi, giao xe tại nhà khách', vn_now() - INTERVAL '21 days', vn_now() - INTERVAL '20 days', vn_now() - INTERVAL '17 days', 12000, 12650, 3000000, vn_now() - INTERVAL '17 days'),
('BK-DEMO-0002', 1, 10, 3, date_trunc('hour', vn_now()) + INTERVAL '2 days', date_trunc('hour', vn_now()) + INTERVAL '3 days 6 hours', 'REQUESTED', 1, 6, 700000, 70000, 700000, 420000, 1120000, 3000000, 300, 5000, 100000, 'Cần ghế trẻ em', '0989012345', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('BK-DEMO-0003', 4, 8, 4, date_trunc('hour', vn_now()) + INTERVAL '5 days', date_trunc('hour', vn_now()) + INTERVAL '7 days', 'CONFIRMED', 2, 0, 550000, 55000, 1100000, 0, 1100000, 2000000, 300, 5000, 100000, NULL, '0967890123', vn_now() - INTERVAL '1 hour', 'Đã gọi xác nhận giờ nhận xe', vn_now() - INTERVAL '1 hour', NULL, NULL, NULL, NULL, NULL, NULL);

-- Tài khoản ngân hàng mẫu (tên chủ tài khoản = họ tên không dấu, viết hoa)
UPDATE customers SET bank_account_number = v.num, bank_name = v.bank, bank_branch = v.branch, bank_account_holder = v.holder
FROM (VALUES
    (3,  '0071000123456', 'Vietcombank', 'Chi nhánh Tân Định - PGD Võ Thị Sáu', 'TRAN THI BINH'),
    (4,  '19034567890011', 'Techcombank', 'Chi nhánh Hà Nội - PGD Láng Hạ', 'NGUYEN VAN AN'),
    (5,  '0101234567', 'BIDV', 'Chi nhánh Thanh Xuân - PGD Nguyễn Trãi', 'PHAM HUY HOANG'),
    (6,  '1027654321', 'VietinBank', 'Chi nhánh Đà Nẵng - PGD Hải Châu', 'VO TUYET MAI'),
    (7,  '0451000987654', 'Vietcombank', 'Chi nhánh Cần Thơ - PGD Ninh Kiều', 'LE MINH CUONG'),
    (8,  '9704221122334', 'MB Bank', 'Chi nhánh Hoàn Kiếm - PGD Hàng Bài', 'DANG QUOC DUNG'),
    (9,  '0331000556677', 'Vietcombank', 'Chi nhánh Sài Gòn - PGD Bến Thành', 'NGUYEN VAN KHACH'),
    (10, '1903998877665', 'Techcombank', 'Chi nhánh Đà Nẵng - PGD Sơn Trà', 'DO THUY LINH')
) AS v(id, num, bank, branch, holder)
WHERE customers.id = v.id;

-- Đơn mẫu theo dòng tiền mới: cọc 40% thanh toán lúc đặt, phần còn lại trả trước khi nhận xe.
UPDATE bookings SET deposit_amount = CEIL(rental_amount * 0.4 / 1000) * 1000,
                    deposit_status = 'PAID', deposit_paid_at = created_at
WHERE booking_code LIKE 'BK-DEMO-%';
UPDATE bookings SET rental_payment_status = 'PAID', rental_paid_at = confirmed_at
WHERE booking_code IN ('BK-DEMO-0001');
UPDATE bookings SET final_amount = 0 WHERE booking_code = 'BK-DEMO-0001';
