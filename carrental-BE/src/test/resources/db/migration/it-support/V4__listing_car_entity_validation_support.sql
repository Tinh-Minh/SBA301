-- Isolated Testcontainers support only. Align the legacy test car table with the
-- current listing entity and sqlnew.md; never apply this fixture to a shared DB.
ALTER TABLE public.cars
    ADD COLUMN rental_price_per_day NUMERIC(14,0),
    ADD COLUMN rental_price_per_month NUMERIC(14,0),
    ADD COLUMN contact_name VARCHAR(150),
    ADD COLUMN contact_phone VARCHAR(20),
    ADD COLUMN contact_zalo VARCHAR(20),
    ADD COLUMN listing_status VARCHAR(20) NOT NULL DEFAULT 'UNLISTED'
        CHECK (listing_status IN ('UNLISTED', 'LISTED', 'EXPIRED')),
    ADD COLUMN current_subscription_id BIGINT;

ALTER TABLE public.cars
    ADD CONSTRAINT fk_cars_subscription
    FOREIGN KEY (current_subscription_id)
    REFERENCES public.car_subscriptions(id) ON DELETE SET NULL;

ALTER TABLE public.drivers
    ADD COLUMN experience_years INTEGER,
    ADD COLUMN bio TEXT;

ALTER TABLE public.reviews
    ADD COLUMN car_id BIGINT REFERENCES public.cars(id) ON DELETE CASCADE,
    ADD COLUMN customer_id BIGINT REFERENCES public.customers(id);

ALTER TABLE public.transactions
    ADD COLUMN subscription_id BIGINT NOT NULL
        REFERENCES public.car_subscriptions(id) ON DELETE CASCADE;
