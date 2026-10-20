-- ==============================================================================
-- SAQIB VISUALS HUB - SUPERADMIN MULTI-ADMIN & GRANULAR RBAC PERMISSIONS MIGRATION
-- Run this script in Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Upgrade public.admin_vault with RBAC columns (Safe & Non-Destructive)
ALTER TABLE IF EXISTS public.admin_vault
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'subadmin',
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{"manage_services":true,"manage_tools":true,"manage_orders":true,"manage_users":false,"view_telemetry":false,"manage_site_config":false,"manage_admins":false}'::jsonb,
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'superadmin';

-- 2. Ensure Primary Superadmin (saqib) has role = 'superadmin' and full unrestricted permissions
UPDATE public.admin_vault
SET 
  role = 'superadmin',
  permissions = '{"manage_services":true,"manage_tools":true,"manage_orders":true,"manage_users":true,"view_telemetry":true,"manage_site_config":true,"manage_admins":true}'::jsonb,
  is_active = true
WHERE lower(username) = 'saqib';

-- 3. If admin_vault is empty, insert default Superadmin record with PBKDF2 SHA-512 Hash
INSERT INTO public.admin_vault (
  username, 
  password_hash, 
  salt, 
  iterations, 
  algorithm, 
  role, 
  permissions, 
  token_version, 
  is_active, 
  created_by
)
SELECT 
  'saqib',
  'f195d908c20941fc855a591ebb1f51c35bfc901443149fe091cb7201c924dbf7c7e88e68c629b5dddc612e843e10a4d6dec320e0961c849699604be04c2074b7',
  'b9ab35f668716cb292036849d0d0b7a705e456f4d58a65c80f5c3f6459fc4ba2',
  100000,
  'sha512',
  'superadmin',
  '{"manage_services":true,"manage_tools":true,"manage_orders":true,"manage_users":true,"view_telemetry":true,"manage_site_config":true,"manage_admins":true}'::jsonb,
  1,
  true,
  'system'
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_vault WHERE lower(username) = 'saqib'
);

-- 4. Enable Row Level Security (RLS) on admin_vault (Strict Zero-Public Policy)
ALTER TABLE public.admin_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No Public Access to Admin Vault" ON public.admin_vault;
CREATE POLICY "No Public Access to Admin Vault" ON public.admin_vault 
  FOR ALL TO anon, authenticated 
  USING (false);

-- 5. Verification Query (Run this to verify your admin roles & permissions)
SELECT id, username, role, is_active, token_version, permissions, created_at 
FROM public.admin_vault 
ORDER BY created_at ASC;
