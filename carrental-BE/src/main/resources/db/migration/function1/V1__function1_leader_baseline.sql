-- Isolated Function 1 baseline copied from docs/reference/schema.sql.
-- This is for a new local/test database only; it is not a shared-database baseline.

CREATE OR REPLACE FUNCTION public.vn_now() RETURNS timestamp
LANGUAGE sql STABLE AS $$ SELECT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh') $$;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := public.vn_now();
    RETURN NEW;
END $$;

CREATE TABLE public.customers (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    phone           VARCHAR(20)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    date_of_birth   DATE,
    address         VARCHAR(300),
    avatar_url      VARCHAR(500),
    email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    kyc_status      VARCHAR(20)  NOT NULL DEFAULT 'NONE'
                    CHECK (kyc_status IN ('NONE', 'PENDING', 'VERIFIED', 'REJECTED')),
    role            VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER'
                    CHECK (role IN ('CUSTOMER', 'ADMIN')),
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'LOCKED')),
    created_at      TIMESTAMP    NOT NULL DEFAULT public.vn_now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT public.vn_now()
);
CREATE UNIQUE INDEX uq_customers_email_lower ON public.customers (lower(email));

CREATE TABLE public.user_documents (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id          BIGINT       NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    doc_type             VARCHAR(30)  NOT NULL
                         CHECK (doc_type IN ('CITIZEN_ID', 'DRIVER_LICENSE', 'PASSPORT')),
    doc_number           VARCHAR(50)  NOT NULL,
    full_name_on_doc     VARCHAR(150),
    date_of_birth_on_doc DATE,
    issue_place          VARCHAR(200),
    issue_date           DATE,
    expires_at           DATE,
    license_class        VARCHAR(10),
    front_image_url      VARCHAR(500) NOT NULL,
    back_image_url       VARCHAR(500),
    verify_status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                         CHECK (verify_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reject_reason        VARCHAR(500),
    verified_by          BIGINT       REFERENCES public.customers(id),
    verified_at          TIMESTAMP,
    created_at           TIMESTAMP    NOT NULL DEFAULT public.vn_now(),
    updated_at           TIMESTAMP    NOT NULL DEFAULT public.vn_now(),
    CHECK (issue_date IS NULL OR expires_at IS NULL OR issue_date <= expires_at),
    CHECK (doc_type <> 'DRIVER_LICENSE' OR license_class IS NOT NULL)
);
CREATE UNIQUE INDEX uq_user_doc_approved
    ON public.user_documents (doc_type, doc_number) WHERE verify_status = 'APPROVED';

CREATE TABLE public.drivers (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id     BIGINT       NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
    created_at      TIMESTAMP    NOT NULL DEFAULT public.vn_now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT public.vn_now()
);

CREATE TABLE public.bank_accounts (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id     BIGINT       NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    bank_name       VARCHAR(100) NOT NULL,
    account_number  VARCHAR(30)  NOT NULL,
    account_holder  VARCHAR(150) NOT NULL,
    is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT public.vn_now(),
    UNIQUE (customer_id, bank_name, account_number),
    UNIQUE (id, customer_id)
);
CREATE UNIQUE INDEX uq_bank_default_per_customer ON public.bank_accounts (customer_id) WHERE is_default;

CREATE TABLE public.vouchers (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code             VARCHAR(50)  NOT NULL UNIQUE,
    description      VARCHAR(300),
    discount_type    VARCHAR(10)  NOT NULL CHECK (discount_type IN ('PERCENT', 'FIXED')),
    discount_value   NUMERIC(14,0) NOT NULL CHECK (discount_value > 0),
    max_discount     NUMERIC(14,0) CHECK (max_discount >= 0),
    min_order_amount NUMERIC(14,0) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
    start_at         TIMESTAMP    NOT NULL,
    end_at           TIMESTAMP    NOT NULL,
    usage_limit      INT          CHECK (usage_limit > 0),
    per_user_limit   INT          NOT NULL DEFAULT 1 CHECK (per_user_limit > 0),
    used_count       INT          NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at       TIMESTAMP    NOT NULL DEFAULT public.vn_now(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT public.vn_now(),
    CHECK (end_at > start_at),
    CHECK (discount_type <> 'PERCENT' OR discount_value <= 100),
    CHECK (usage_limit IS NULL OR used_count <= usage_limit)
);

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_user_documents_updated_at
    BEFORE UPDATE ON public.user_documents
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_drivers_updated_at
    BEFORE UPDATE ON public.drivers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_vouchers_updated_at
    BEFORE UPDATE ON public.vouchers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_user_documents_customer ON public.user_documents (customer_id);
CREATE INDEX idx_bank_accounts_customer ON public.bank_accounts (customer_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
