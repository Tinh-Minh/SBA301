-- Isolated Testcontainers support only. This is not a production migration and must never be
-- applied to Supabase/shared databases. It supplies the F1new contract fields omitted by V1.
ALTER TABLE public.customers
    ADD COLUMN zalo_phone VARCHAR(20),
    ADD COLUMN contact_note VARCHAR(255);

CREATE TABLE public.listing_packages (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(50) NOT NULL UNIQUE,
    price           NUMERIC(14,0) NOT NULL CHECK (price >= 0),
    duration_days   INT NOT NULL CHECK (duration_days > 0),
    priority_level  INT NOT NULL DEFAULT 1 CHECK (priority_level IN (1, 2, 3)),
    badge_label     VARCHAR(50) NOT NULL DEFAULT 'THƯỜNG',
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT public.vn_now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT public.vn_now()
);

CREATE TABLE public.car_subscriptions (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subscription_code   VARCHAR(50) NOT NULL UNIQUE,
    customer_id         BIGINT NOT NULL REFERENCES public.customers(id),
    car_id              BIGINT NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
    package_id          BIGINT NOT NULL REFERENCES public.listing_packages(id),
    voucher_id          BIGINT REFERENCES public.vouchers(id),
    package_price       NUMERIC(14,0) NOT NULL,
    discount_amount     NUMERIC(14,0) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(14,0) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT'
                        CHECK (status IN ('PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED')),
    payment_status      VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
                        CHECK (payment_status IN ('UNPAID', 'PAID', 'REFUNDED')),
    start_date          TIMESTAMP,
    end_date            TIMESTAMP,
    activated_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT public.vn_now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT public.vn_now()
);
