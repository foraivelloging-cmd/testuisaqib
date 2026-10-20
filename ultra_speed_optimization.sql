-- =====================================================================
-- MUHAMMAD SAQIB — SAQIB VISUALS HUB
-- COMPLETE SPEED OPTIMIZATION & MANUAL PAYMENT SYSTEM SCRIPT
-- 100% COMPATIBLE WITH SUPABASE SQL EDITOR (NO TRANSACTION / TABLE ERRORS)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS (HIGH-SPEED SEARCH & UUID)
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ---------------------------------------------------------------------
-- 2. ENSURE ALL TABLES EXIST (PREVENTS ANY 42P01 MISSING TABLE ERRORS)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    badge TEXT NOT NULL DEFAULT 'FEATURED',
    title TEXT NOT NULL,
    "desc" TEXT NOT NULL DEFAULT '',
    plush TEXT NOT NULL DEFAULT 'plush-srv-1',
    orb_grad TEXT NOT NULL DEFAULT 'from-pink-500 to-rose-600',
    icon_type TEXT NOT NULL DEFAULT 'wand',
    custom_icon_url TEXT,
    direct_tool_url TEXT,
    input_label TEXT NOT NULL DEFAULT 'Your Requirement',
    placeholder TEXT NOT NULL DEFAULT 'Enter details...',
    tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
    hidden BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.web_tools (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "desc" TEXT NOT NULL DEFAULT '',
    tool_url TEXT NOT NULL,
    icon_url TEXT,
    badge TEXT NOT NULL DEFAULT 'ONLINE',
    icon_type TEXT NOT NULL DEFAULT 'wand',
    orb_grad TEXT NOT NULL DEFAULT 'from-indigo-600 to-purple-600',
    plush TEXT NOT NULL DEFAULT 'plush-website',
    hidden BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.site_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL DEFAULT 'VIP Member',
    email TEXT,
    phone TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.payment_proofs (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'guest_user',
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    method TEXT NOT NULL DEFAULT 'EasyPaisa',
    sender_account_name TEXT DEFAULT '',
    sender_account_number TEXT DEFAULT '',
    trx_id TEXT DEFAULT '',
    screenshot_url TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    user_note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'guest_user',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'EasyPaisa',
    status TEXT NOT NULL DEFAULT 'pending',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    service_title TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    badge TEXT NOT NULL DEFAULT 'VERIFIED BUYER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_vault (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    iterations INTEGER NOT NULL DEFAULT 100000,
    role TEXT NOT NULL DEFAULT 'admin',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- 3. STORAGE BUCKET & PUBLIC POLICIES FOR PAYMENT SCREENSHOTS (SS)
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('payment-proofs', 'payment-proofs', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('site-assets', 'site-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Storage Policies for 'payment-proofs'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access Payment Proofs') THEN
    CREATE POLICY "Public Access Payment Proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Upload Payment Proofs') THEN
    CREATE POLICY "Public Upload Payment Proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access Site Assets') THEN
    CREATE POLICY "Public Access Site Assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Upload Site Assets') THEN
    CREATE POLICY "Public Upload Site Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets');
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 4. SPEED INDEXES (0ms LATENCY FOR STORE, SEARCH & ADMIN QUEUES)
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_services_active_category ON public.services (category, sort_order ASC, created_at DESC) WHERE hidden = false;
CREATE INDEX IF NOT EXISTS idx_services_lookup ON public.services (id, hidden, badge);
CREATE INDEX IF NOT EXISTS idx_services_title_trgm ON public.services USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_tiers_gin ON public.services USING gin (tiers);

CREATE INDEX IF NOT EXISTS idx_web_tools_active ON public.web_tools (sort_order ASC, created_at DESC) WHERE hidden = false;
CREATE INDEX IF NOT EXISTS idx_web_tools_title_trgm ON public.web_tools USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_site_config_id ON public.site_config (id);
CREATE INDEX IF NOT EXISTS idx_site_config_gin ON public.site_config USING gin (config);

CREATE INDEX IF NOT EXISTS idx_profiles_phone_email ON public.profiles (id, phone, email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role, balance);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_status_date ON public.payment_proofs (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_user_id ON public.payment_proofs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_trx ON public.payment_proofs (trx_id);

CREATE INDEX IF NOT EXISTS idx_orders_status_date ON public.orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating_date ON public.reviews (rating DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_vault_username ON public.admin_vault (username);

-- ---------------------------------------------------------------------
-- 5. SSD / NVME CLOUD DISK OPTIMIZATION (SAFE PLANNER TUNING)
-- ---------------------------------------------------------------------
DO $$ 
BEGIN
  EXECUTE 'ALTER DATABASE ' || quote_ident(current_database()) || ' SET random_page_cost = 1.1';
EXCEPTION WHEN OTHERS THEN 
  NULL; -- Gracefully ignore if role lacks database-level ALTER permission
END $$;

-- ---------------------------------------------------------------------
-- 6. REFRESH QUERY PLANNER STATISTICS (FAIL-SAFE DYNAMIC ANALYZE)
-- Transaction-safe and skips missing tables so 42P01 error NEVER occurs!
-- ---------------------------------------------------------------------
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('services', 'web_tools', 'site_config', 'profiles', 'payment_proofs', 'orders', 'contact_inquiries', 'reviews', 'admin_vault')
  LOOP
    EXECUTE 'ANALYZE VERBOSE public.' || quote_ident(tbl.tablename);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 7. VERIFICATION (SHOWS ACTIVE INDEXES)
-- ---------------------------------------------------------------------
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
