-- =====================================================================
-- 🚀 MUHAMMAD SAQIB — SAQIB VISUALS HUB
-- 👥 ADMIN USER MANAGEMENT, BAN/UNBAN & WALLET BALANCE CHEAT-SHEET
-- =====================================================================
-- Description: Complete SQL schema and helper queries to manage user accounts,
-- suspend/ban malicious accounts, track login timestamps, and edit wallet balances.
-- Compatible with: Supabase SQL Editor / PostgreSQL
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ADD BAN & LOGIN TRACKING COLUMNS TO PROFILES (SAFE MIGRATION):
-- (Agar columns pehle se nahi hain, to ye safely add kar dega)
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT '';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Add index for fast user status filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles (last_login_at DESC);

-- ---------------------------------------------------------------------
-- 2. VIEW ALL REGISTERED USERS WITH BALANCES & STATUS:
-- ---------------------------------------------------------------------
SELECT 
  id AS user_id,
  full_name,
  email,
  phone,
  balance,
  role,
  status,
  ban_reason,
  last_login_at,
  created_at
FROM public.profiles
ORDER BY last_login_at DESC NULLS LAST;

-- ---------------------------------------------------------------------
-- 3. BAN / SUSPEND A SPECIFIC USER ACCOUNT:
-- (Replace 'USER_PHONE_OR_EMAIL' with target user's Phone or Email)
-- ---------------------------------------------------------------------
UPDATE public.profiles
SET 
  status = 'banned',
  ban_reason = 'Suspended by Administrator: Violation of terms or fraudulent activity.',
  updated_at = timezone('utc'::text, now())
WHERE id = 'USER_PHONE_OR_EMAIL' OR phone = 'USER_PHONE_OR_EMAIL' OR email = 'USER_PHONE_OR_EMAIL';

-- ---------------------------------------------------------------------
-- 4. UNBAN / RESTORE A USER ACCOUNT:
-- ---------------------------------------------------------------------
UPDATE public.profiles
SET 
  status = 'active',
  ban_reason = '',
  updated_at = timezone('utc'::text, now())
WHERE id = 'USER_PHONE_OR_EMAIL' OR phone = 'USER_PHONE_OR_EMAIL' OR email = 'USER_PHONE_OR_EMAIL';

-- ---------------------------------------------------------------------
-- 5. CREDIT / ADD WALLET BALANCE TO A USER:
-- (Example: Adding +1,000 PKR to user's wallet)
-- ---------------------------------------------------------------------
UPDATE public.profiles
SET 
  balance = balance + 1000,
  updated_at = timezone('utc'::text, now())
WHERE id = 'USER_PHONE_OR_EMAIL';

-- ---------------------------------------------------------------------
-- 6. SET EXACT WALLET BALANCE:
-- ---------------------------------------------------------------------
UPDATE public.profiles
SET 
  balance = 5000,
  updated_at = timezone('utc'::text, now())
WHERE id = 'USER_PHONE_OR_EMAIL';

-- ---------------------------------------------------------------------
-- 7. VIEW CURRENTLY BANNED USERS LIST:
-- ---------------------------------------------------------------------
SELECT 
  id, 
  full_name, 
  email, 
  phone, 
  balance, 
  ban_reason, 
  updated_at AS banned_at
FROM public.profiles
WHERE status = 'banned'
ORDER BY updated_at DESC;

-- ---------------------------------------------------------------------
-- 8. TOTAL REGISTERED USERS & TOTAL WALLET LIABILITIES:
-- ---------------------------------------------------------------------
SELECT 
  COUNT(*) AS total_registered_users,
  COUNT(*) FILTER (WHERE status = 'active') AS active_users,
  COUNT(*) FILTER (WHERE status = 'banned') AS banned_users,
  COALESCE(SUM(balance), 0) AS total_user_wallet_balance_pkr
FROM public.profiles;
