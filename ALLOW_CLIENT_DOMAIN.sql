-- =====================================================================
-- 🚀 MUHAMMAD SAQIB — SAQIB VISUALS HUB
-- 🌐 1-CLICK CLIENT DOMAIN AUTHORIZATION QUERY (FOR CLONES & CLIENT RESALES)
-- =====================================================================
-- Usage: Jab bhi aap kisi client ke liye website clone karein ya sale karein,
-- sirf neeche 'myclientdomain.com' ki jagah client ka domain likhein,
-- Supabase SQL Editor mein paste karein aur RUN dabayein!
-- Yeh query us naye domain ko instantly whitelist kar degi!
-- =====================================================================

-- 1. ADD NEW CLIENT DOMAIN TO DATABASE WHITELIST:
-- (Example: 'clientstore.com' ya 'mybrand.vercel.app')
UPDATE public.site_config
SET config = jsonb_set(
  config,
  '{authorizedDomains}',
  COALESCE(config->'authorizedDomains', '["localhost", "127.0.0.1", "mrsaqib242.vercel.app"]'::jsonb) || '["myclientdomain.com", "clientbrand.vercel.app"]'::jsonb
)
WHERE id = 'default';

-- ---------------------------------------------------------------------
-- 2. VERIFY CURRENT WHITELISTED DOMAINS:
-- ---------------------------------------------------------------------
SELECT 
  id, 
  config->'authorizedDomains' AS authorized_domains,
  updated_at
FROM public.site_config 
WHERE id = 'default';

-- =====================================================================
-- 💡 ALTERNATIVE ZERO-SQL METHOD (VIA .ENV FILE):
-- Agar aap SQL query bhi run nahi karna chahte, to client ki hosting /
-- Vercel environment variables mein sirf yeh 1 line add kar dein:
--
-- ALLOWED_DOMAINS="myclientdomain.com,clientbrand.vercel.app"
--
-- Ya agar client ko 100% unlocked version dena ho (without any domain restrictions):
-- DISABLE_KILLSWITCH="true"
-- =====================================================================
