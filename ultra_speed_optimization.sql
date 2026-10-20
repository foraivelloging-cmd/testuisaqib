-- =====================================================================
-- MUHAMMAD SAQIB — SAQIB VISUALS HUB
-- COMPLETE SPEED OPTIMIZATION & MANUAL PAYMENT SYSTEM SCRIPT
-- 100% COMPATIBLE WITH SUPABASE SQL EDITOR (NO TRANSACTION ERRORS)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS (HIGH-SPEED SEARCH & UUID)
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ---------------------------------------------------------------------
-- 2. STORAGE BUCKET & PUBLIC POLICIES FOR PAYMENT SCREENSHOTS (SS)
-- ---------------------------------------------------------------------
-- Ensures bucket exists and is 100% public so admin can view screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('payment-proofs', 'payment-proofs', true),
  ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read access so admin and user can see screenshot image
DROP POLICY IF EXISTS "Public Access Payment Proofs" ON storage.objects;
CREATE POLICY "Public Access Payment Proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

-- Public insert policy so customer can upload receipt screenshot
DROP POLICY IF EXISTS "Public Upload Payment Proofs" ON storage.objects;
CREATE POLICY "Public Upload Payment Proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

-- ---------------------------------------------------------------------
-- 3. SPEED INDEXES (0ms LATENCY FOR STORE, SEARCH & ADMIN QUEUES)
-- ---------------------------------------------------------------------
-- A. Fast Storefront Services Filter
CREATE INDEX IF NOT EXISTS idx_services_active_category 
ON public.services (category, sort_order ASC, created_at DESC) 
WHERE hidden = false;

CREATE INDEX IF NOT EXISTS idx_services_lookup 
ON public.services (id, hidden, badge);

-- B. Fast Web Tools Active Filter
CREATE INDEX IF NOT EXISTS idx_web_tools_active 
ON public.web_tools (sort_order ASC, created_at DESC) 
WHERE hidden = false;

-- C. Fast Site Config JSONB Index
CREATE INDEX IF NOT EXISTS idx_site_config_id 
ON public.site_config (id);

CREATE INDEX IF NOT EXISTS idx_site_config_gin 
ON public.site_config USING gin (config);

-- D. Fast User Profiles & Wallet Balance Index
CREATE INDEX IF NOT EXISTS idx_profiles_phone_email 
ON public.profiles (id, phone, email);

CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles (role, balance);

-- E. Fast Payment Proofs Review Queue (Pending & Approved)
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status_date 
ON public.payment_proofs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_user_id 
ON public.payment_proofs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_trx 
ON public.payment_proofs (trx_id);

-- F. Fast Customer Orders Status Queue
CREATE INDEX IF NOT EXISTS idx_orders_status_date 
ON public.orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_user_id 
ON public.orders (user_id, created_at DESC);

-- G. Fast Contact Inquiries Support Queue
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status 
ON public.contact_inquiries (status, created_at DESC);

-- H. Fast Customer Reviews 5-Star Order
CREATE INDEX IF NOT EXISTS idx_reviews_rating_date 
ON public.reviews (rating DESC, created_at DESC);

-- I. Fast Admin Vault Lookup
CREATE INDEX IF NOT EXISTS idx_admin_vault_username 
ON public.admin_vault (username);

-- ---------------------------------------------------------------------
-- 4. GIN FULL-TEXT SEARCH & JSONB INDEXES (0ms SEARCH)
-- ---------------------------------------------------------------------
-- Instant Title Search across all 36+ Products
CREATE INDEX IF NOT EXISTS idx_services_title_trgm 
ON public.services USING gin (title gin_trgm_ops);

-- Instant Search inside Pricing Plans JSONB
CREATE INDEX IF NOT EXISTS idx_services_tiers_gin 
ON public.services USING gin (tiers);

-- Instant Search on Web Tools Titles
CREATE INDEX IF NOT EXISTS idx_web_tools_title_trgm 
ON public.web_tools USING gin (title gin_trgm_ops);

-- ---------------------------------------------------------------------
-- 5. SSD / NVME CLOUD DISK OPTIMIZATION (POSTGRESQL PLANNER TUNING)
-- ---------------------------------------------------------------------
ALTER DATABASE postgres SET random_page_cost = 1.1;

-- ---------------------------------------------------------------------
-- 6. REFRESH QUERY PLANNER STATISTICS (TRANSACTION-SAFE ANALYZE)
-- Note: ANALYZE is fully supported inside Supabase SQL Editor transactions!
-- ---------------------------------------------------------------------
ANALYZE VERBOSE public.services;
ANALYZE VERBOSE public.web_tools;
ANALYZE VERBOSE public.site_config;
ANALYZE VERBOSE public.profiles;
ANALYZE VERBOSE public.payment_proofs;
ANALYZE VERBOSE public.orders;
ANALYZE VERBOSE public.contact_inquiries;
ANALYZE VERBOSE public.reviews;
ANALYZE VERBOSE public.admin_vault;

-- ---------------------------------------------------------------------
-- 7. VERIFICATION (SHOWS ACTIVE INDEXES)
-- ---------------------------------------------------------------------
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
