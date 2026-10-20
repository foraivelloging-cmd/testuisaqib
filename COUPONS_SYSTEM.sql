-- ==============================================================================
-- SAQIB VISUALS HUB - COUPON CODES & PROMO DISCOUNT MANAGEMENT MIGRATION
-- Run this script in Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Create public.coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  max_discount_amount NUMERIC,
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  applicable_category TEXT DEFAULT 'all',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Seed Default Promotional Coupons (Safe - Ignored if already exist)
INSERT INTO public.coupons (
  code, 
  discount_type, 
  discount_value, 
  min_order_amount, 
  max_discount_amount, 
  max_uses, 
  description
)
VALUES 
  ('WELCOME10', 'percentage', 10, 200, 300, 500, 'Welcome Special: 10% OFF on all orders over Rs. 200 (Max Rs. 300 discount)'),
  ('SAQIB50', 'fixed', 50, 300, NULL, 200, 'VIP Flat Discount: Rs. 50 OFF on orders over Rs. 300'),
  ('EID20', 'percentage', 20, 500, 500, 1000, 'Festive Special: 20% OFF on orders over Rs. 500 (Max Rs. 500 discount)')
ON CONFLICT (code) DO NOTHING;

-- 3. Enable Row Level Security (RLS) on coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active coupons for validation
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Public can view active coupons" ON public.coupons 
  FOR SELECT TO anon, authenticated 
  USING (is_active = true);

-- Allow service_role full control
DROP POLICY IF EXISTS "Service role full access to coupons" ON public.coupons;
CREATE POLICY "Service role full access to coupons" ON public.coupons 
  FOR ALL TO service_role 
  USING (true)
  WITH CHECK (true);

-- 4. Verification Query
SELECT id, code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active, created_at 
FROM public.coupons 
ORDER BY created_at ASC;
