-- =====================================================================
-- 🚀 MUHAMMAD SAQIB — SAQIB VISUALS HUB
-- 🔐 ADMIN PASSWORD & VAULT SECURITY CHEAT-SHEET (SAFE BACKEND QUERIES)
-- =====================================================================
-- Description: Safe SQL queries to view, reset, and manage admin credentials
-- with zero risk of duplicate key errors or locking issues.
-- Compatible with: Supabase SQL Editor / PostgreSQL
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. VIEW CURRENT ACTIVE ADMIN ACCOUNTS & LAST UPDATE TIME:
-- ---------------------------------------------------------------------
SELECT 
  id, 
  username, 
  algorithm, 
  iterations, 
  updated_at, 
  created_at 
FROM public.admin_vault
ORDER BY created_at ASC;

-- ---------------------------------------------------------------------
-- 2. SAFELY RESET PRIMARY ADMIN PASSWORD TO DEFAULT:
-- (Username: saqib | Password: saqibadmin)
-- ---------------------------------------------------------------------
UPDATE public.admin_vault
SET 
  password_hash = 'f195d908c20941fc855a591ebb1f51c35bfc901443149fe091cb7201c924dbf7c7e88e68c629b5dddc612e843e10a4d6dec320e0961c849699604be04c2074b7',
  salt = 'b9ab35f668716cb292036849d0d0b7a705e456f4d58a65c80f5c3f6459fc4ba2',
  iterations = 100000,
  algorithm = 'sha512',
  updated_at = timezone('utc'::text, now())
WHERE username = 'saqib';

-- ---------------------------------------------------------------------
-- 3. SAFELY RESET SECONDARY BACKUP ADMIN PASSWORD:
-- (Username: saqibadmin | Password: deleefue)
-- ---------------------------------------------------------------------
UPDATE public.admin_vault
SET 
  password_hash = '3642eaba715b6694284a57ad3cb1821772189998788f4691da77a4893a90a584c4f5c54922f66b8362e14590b9e1b24a61003185c23a3dd2c1bf22f800696e52',
  salt = '7d9d759b0d4f90db22f8e1431fd6a2f8108bee697ad551a386964df3e2ce789c',
  iterations = 100000,
  algorithm = 'sha512',
  updated_at = timezone('utc'::text, now())
WHERE username = 'saqibadmin';

-- ---------------------------------------------------------------------
-- 4. VERIFY THAT PASSWORD WAS UPDATED:
-- ---------------------------------------------------------------------
SELECT username, updated_at 
FROM public.admin_vault 
WHERE username IN ('saqib', 'saqibadmin');

-- =====================================================================
-- 🛡️ RATE LIMITING PROTECTION POLICY SUMMARY:
-- =====================================================================
-- 1. Max 3 consecutive failed password attempts are allowed.
-- 2. If 3 failed attempts occur, IP & username are locked out for 15 minutes.
-- 3. Both Login (POST) and Password Change (PATCH) are protected by this lock.
-- 4. After a successful password entry, the failed counter is reset to 0.
-- =====================================================================
