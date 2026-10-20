-- Testcontainers support tables from the leader schema. This validates all 19 mapped entities.
-- This migration is for isolated local/test databases only; do not apply it to the shared database.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE cars (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id        BIGINT       NOT NULL REFERENCES customers(id),
    driver_id       BIGINT       UNIQUE REFERENCES drivers(id) ON DELETE SET NULL, -- driver 0..1 - 0..1 car
    license_plate   VARCHAR(20)  NOT NULL UNIQUE,
    brand           VARCHAR(50)  NOT NULL,
    model           VARCHAR(50)  NOT NULL,
    manufacture_year INT         NOT NULL CHECK (manufacture_year BETWEEN 1990 AND 2100),
    car_type        VARCHAR(20)  NOT NULL
                    CHECK (car_type IN ('SEDAN', 'HATCHBACK', 'SUV', 'MPV', 'PICKUP', 'LUXURY', 'OTHER')),
    seats           INT          NOT NULL CHECK (seats > 0),
    transmission    VARCHAR(20)  NOT NULL CHECK (transmission IN ('MANUAL', 'AUTOMATIC')),
    fuel_type       VARCHAR(20)  NOT NULL CHECK (fuel_type IN ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID')),
    color           VARCHAR(30),
    description     TEXT,
    features        JSONB        NOT NULL DEFAULT '[]'::jsonb,    -- ["GPS","Camera hành trình","Bluetooth"...]
    city            VARCHAR(100) NOT NULL,                        -- để lọc/tìm kiếm
    district        VARCHAR(100),
    pickup_address  VARCHAR(300) NOT NULL,
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    price_per_hour  NUMERIC(14,0) NOT NULL CHECK (price_per_hour >= 0),   -- giá mặc định, slot sẽ chụp lại
    price_per_day   NUMERIC(14,0) NOT NULL CHECK (price_per_day  >= 0),
    deposit_amount  NUMERIC(14,0) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
    km_limit_per_day INT         CHECK (km_limit_per_day > 0),            -- NULL = không giới hạn
    extra_km_fee    NUMERIC(14,0) CHECK (extra_km_fee >= 0),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING_APPROVAL'
                    CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED')),
    created_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT vn_now()
);

CREATE TABLE car_images (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    car_id          BIGINT       NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    is_primary      BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order      INT          NOT NULL DEFAULT 0
);

CREATE TABLE car_documents (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    car_id          BIGINT       NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    doc_type        VARCHAR(30)  NOT NULL
                    CHECK (doc_type IN ('REGISTRATION', 'INSPECTION', 'INSURANCE')),
    file_url        VARCHAR(500) NOT NULL,
    expires_at      DATE,
    verify_status   VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                    CHECK (verify_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reject_reason   VARCHAR(500),
    verified_by     BIGINT       REFERENCES customers(id),
    verified_at     TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT vn_now()
);

CREATE TABLE car_slots (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    car_id          BIGINT       NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    start_time      TIMESTAMP    NOT NULL,
    end_time        TIMESTAMP    NOT NULL,
    price_per_hour  NUMERIC(14,0) NOT NULL CHECK (price_per_hour >= 0),
    price_per_day   NUMERIC(14,0) NOT NULL CHECK (price_per_day  >= 0),
    rental_option   VARCHAR(10)  NOT NULL DEFAULT 'BOTH'    -- slot cho thuê theo giờ, theo ngày hay cả hai
                    CHECK (rental_option IN ('HOURLY', 'DAILY', 'BOTH')),
    min_rental_hours INT         NOT NULL DEFAULT 1 CHECK (min_rental_hours >= 1),
    status          VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
    version         BIGINT       NOT NULL DEFAULT 0,       -- optimistic locking (@Version)
    created_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    CHECK (end_time > start_time),
    UNIQUE (id, car_id),  -- để rental_orders tham chiếu cặp (slot, xe)
    -- Hai slot đang mở của cùng một xe không được chồng thời gian
    CONSTRAINT car_slots_no_overlap
        EXCLUDE USING gist (car_id WITH =, tsrange(start_time, end_time) WITH &&)
        WHERE (status <> 'CANCELLED')
);

CREATE TABLE rental_orders (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_code      VARCHAR(30)  NOT NULL UNIQUE,
    customer_id     BIGINT       NOT NULL REFERENCES customers(id),   -- người thuê
    car_id          BIGINT       NOT NULL,
    car_slot_id     BIGINT       NOT NULL,
    voucher_id      BIGINT       REFERENCES vouchers(id),
    rental_type     VARCHAR(10)  NOT NULL CHECK (rental_type IN ('HOURLY', 'DAILY')),
    start_time      TIMESTAMP    NOT NULL,                              -- giờ đặt
    end_time        TIMESTAMP    NOT NULL,
    actual_start_time TIMESTAMP,                                        -- giờ nhận xe thực tế
    actual_end_time   TIMESTAMP,                                        -- giờ trả xe thực tế (tính phí trễ)
    unit_price      NUMERIC(14,0) NOT NULL CHECK (unit_price >= 0),     -- giá/giờ hoặc giá/ngày đã chụp
    quantity        INT          NOT NULL CHECK (quantity > 0),         -- số giờ hoặc số ngày (làm tròn lên)
    rental_amount   NUMERIC(14,0) NOT NULL CHECK (rental_amount >= 0),
    discount_amount NUMERIC(14,0) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount    NUMERIC(14,0) NOT NULL CHECK (total_amount >= 0),
    deposit_amount  NUMERIC(14,0) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED',
                                      'ONGOING', 'COMPLETED', 'CANCELLED')),
    payment_status  VARCHAR(20)  NOT NULL DEFAULT 'UNPAID'
                    CHECK (payment_status IN ('UNPAID', 'PAID', 'REFUNDED')),
    expires_at      TIMESTAMP,                      -- hạn chủ xe xác nhận / khách thanh toán (đơn PENDING)
    confirmed_at    TIMESTAMP,
    cancelled_at    TIMESTAMP,
    cancelled_by    BIGINT       REFERENCES customers(id),
    cancel_reason   VARCHAR(500),
    note            VARCHAR(500),
    commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00     -- % hoa hồng nền tảng, chụp lúc tạo đơn (nhóm chốt số)
                    CHECK (commission_rate BETWEEN 0 AND 100),
    version         BIGINT       NOT NULL DEFAULT 0,        -- optimistic locking (@Version)
    created_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    CHECK (end_time > start_time),
    CHECK (actual_end_time IS NULL OR actual_start_time IS NULL OR actual_end_time >= actual_start_time),
    CHECK (discount_amount <= rental_amount),
    CHECK (total_amount = rental_amount - discount_amount),
    -- slot và xe phải khớp nhau (đơn không thể trỏ slot của xe khác)
    FOREIGN KEY (car_slot_id, car_id) REFERENCES car_slots (id, car_id),
    -- Một xe không có hai đơn đang hiệu lực chồng thời gian
    CONSTRAINT rental_orders_no_overlap
        EXCLUDE USING gist (car_id WITH =, tsrange(start_time, end_time) WITH &&)
        WHERE (status IN ('PENDING', 'CONFIRMED', 'ONGOING'))
);

CREATE TABLE action_logs (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id        BIGINT       NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    actor_id        BIGINT       REFERENCES customers(id),  -- NULL = hệ thống
    action          VARCHAR(50)  NOT NULL,
    from_status     VARCHAR(20),
    to_status       VARCHAR(20),
    note            VARCHAR(500),
    created_at      TIMESTAMP    NOT NULL DEFAULT vn_now()
);

CREATE TABLE order_handovers (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id        BIGINT       NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    handover_type   VARCHAR(10)  NOT NULL CHECK (handover_type IN ('PICKUP', 'RETURN')),
    odometer_km     INT          CHECK (odometer_km >= 0),
    fuel_percent    INT          CHECK (fuel_percent BETWEEN 0 AND 100),
    condition_note  TEXT,
    handed_at       TIMESTAMP    NOT NULL DEFAULT vn_now(),
    renter_confirmed_at TIMESTAMP,                       -- người thuê xác nhận biên bản
    owner_confirmed_at  TIMESTAMP,                       -- chủ xe xác nhận biên bản
    created_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    UNIQUE (id, order_id)
);

CREATE TABLE handover_images (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    handover_id     BIGINT       NOT NULL REFERENCES order_handovers(id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    caption         VARCHAR(200)
);

CREATE TABLE extra_fees (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id        BIGINT       NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    handover_id     BIGINT,                                       -- phí phát sinh từ lần bàn giao nào
    created_by      BIGINT       REFERENCES customers(id),
    fee_type        VARCHAR(30)  NOT NULL
                    CHECK (fee_type IN ('LATE_RETURN', 'FUEL', 'CLEANING', 'DAMAGE', 'TRAFFIC_FINE', 'EXTRA_KM', 'OTHER')),
    amount          NUMERIC(14,0) NOT NULL CHECK (amount > 0),
    description     VARCHAR(500),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'PAID', 'DISPUTED', 'WAIVED')),
    created_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    UNIQUE (id, order_id),
    FOREIGN KEY (handover_id, order_id) REFERENCES order_handovers (id, order_id)
);

CREATE TABLE disputes (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id        BIGINT       NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    extra_fee_id    BIGINT,
    raised_by       BIGINT       NOT NULL REFERENCES customers(id),
    reason          VARCHAR(100) NOT NULL,
    description     TEXT,
    status          VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED')),
    resolution_note TEXT,
    resolved_by     BIGINT       REFERENCES customers(id),
    resolved_at     TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    UNIQUE (id, order_id),
    FOREIGN KEY (extra_fee_id, order_id) REFERENCES extra_fees (id, order_id)
);

CREATE TABLE dispute_evidences (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dispute_id      BIGINT       NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    uploaded_by     BIGINT       NOT NULL REFERENCES customers(id),
    file_url        VARCHAR(500) NOT NULL,
    file_type       VARCHAR(20)  NOT NULL CHECK (file_type IN ('IMAGE', 'VIDEO', 'DOCUMENT')),
    description     VARCHAR(300),
    created_at      TIMESTAMP    NOT NULL DEFAULT vn_now()
);

CREATE TABLE transactions (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id         BIGINT       NOT NULL REFERENCES rental_orders(id),
    refund_of_id     BIGINT,                      -- "refund of": giao dịch hoàn tiền trỏ về giao dịch gốc
    dispute_id       BIGINT,                      -- "refund": hoàn tiền phát sinh từ tranh chấp
    extra_fee_id     BIGINT,                      -- giao dịch thu phí phát sinh nào
    transaction_type VARCHAR(20)  NOT NULL
                     CHECK (transaction_type IN ('DEPOSIT', 'RENTAL_PAYMENT', 'EXTRA_FEE', 'REFUND')),
    amount           NUMERIC(14,0) NOT NULL CHECK (amount > 0),
    method           VARCHAR(20)  NOT NULL CHECK (method IN ('BANK_TRANSFER', 'MOMO', 'VNPAY', 'CASH')),
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    provider_ref     VARCHAR(100),
    paid_at          TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT vn_now(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT vn_now(),
    UNIQUE (id, order_id),
    FOREIGN KEY (refund_of_id, order_id) REFERENCES transactions (id, order_id),
    FOREIGN KEY (dispute_id,   order_id) REFERENCES disputes     (id, order_id),
    FOREIGN KEY (extra_fee_id, order_id) REFERENCES extra_fees   (id, order_id),
    CHECK (refund_of_id IS NULL OR transaction_type = 'REFUND'),
    CHECK (refund_of_id IS NULL OR refund_of_id <> id),
    CHECK (extra_fee_id IS NULL OR transaction_type IN ('EXTRA_FEE', 'REFUND'))
);

CREATE TABLE payouts (
    id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id                  BIGINT       NOT NULL REFERENCES rental_orders(id),
    recipient_id              BIGINT       NOT NULL REFERENCES customers(id),
    bank_account_id           BIGINT,
    adjustment_transaction_id BIGINT       REFERENCES transactions(id),  -- "adjustment": khoản điều chỉnh (vd trừ do hoàn tiền)
    gross_amount              NUMERIC(14,0) NOT NULL CHECK (gross_amount >= 0),
    platform_fee              NUMERIC(14,0) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
    net_amount                NUMERIC(14,0) NOT NULL CHECK (net_amount >= 0),
    status                    VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                              CHECK (status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED')),
    note                      VARCHAR(500),
    paid_at                   TIMESTAMP,
    version                   BIGINT       NOT NULL DEFAULT 0,   -- optimistic locking (@Version)
    created_at                TIMESTAMP    NOT NULL DEFAULT vn_now(),
    updated_at                TIMESTAMP    NOT NULL DEFAULT vn_now(),
    -- tài khoản ngân hàng phải thuộc đúng người nhận
    FOREIGN KEY (bank_account_id, recipient_id) REFERENCES bank_accounts (id, customer_id),
    -- khoản chi trả đã PAID thì bắt buộc có tài khoản nhận tiền
    CHECK (status <> 'PAID' OR bank_account_id IS NOT NULL)
);

CREATE TABLE reviews (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id        BIGINT       NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    reviewer_id     BIGINT       NOT NULL REFERENCES customers(id),
    reviewee_id     BIGINT       NOT NULL REFERENCES customers(id),
    rating          INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT vn_now(),
    UNIQUE (order_id, reviewer_id),     -- mỗi người đánh giá một đơn một lần
    CHECK (reviewer_id <> reviewee_id)
);
