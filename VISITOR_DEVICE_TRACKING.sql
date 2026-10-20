-- =====================================================================
-- 🚀 MUHAMMAD SAQIB — SAQIB VISUALS HUB
-- 🕵️ VISITOR TELEMETRY & HARDWARE FINGERPRINT TRACKING SYSTEM
-- =====================================================================
-- Description: Advanced hardware & browser fingerprinting system.
-- Tracks visitor Device ID, IP, Country, Battery Level & Charging Status,
-- Device Type, Operating System, Browser, Screen Specs, and Last Active.
-- Compatible with: Supabase SQL Editor / PostgreSQL
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CREATE VISITOR FINGERPRINTS TABLE:
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visitor_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint TEXT NOT NULL UNIQUE,          -- Unique Browser Hardware & Canvas Hash (Device ID)
    ip_address TEXT DEFAULT '127.0.0.1',       -- Client IP address
    country TEXT DEFAULT 'Pakistan',           -- Detected Country
    city TEXT DEFAULT '',                      -- City (if available)
    device_type TEXT DEFAULT 'Desktop',        -- Mobile / Desktop / Tablet
    os TEXT DEFAULT 'Unknown',                 -- Windows, iOS, Android, macOS, Linux
    browser TEXT DEFAULT 'Unknown',            -- Chrome, Safari, Edge, Firefox, Opera
    battery_level TEXT DEFAULT 'N/A',          -- e.g. "85% (⚡ Charging)" or "42% (🔋 Battery)"
    battery_raw INTEGER DEFAULT -1,            -- Raw percentage (0 to 100)
    battery_charging BOOLEAN DEFAULT false,    -- Is charging currently?
    screen_resolution TEXT DEFAULT '',         -- e.g. "1920x1080 @ 24bit"
    hardware_specs TEXT DEFAULT '',            -- e.g. "8 Cores • 8GB RAM • WebGL"
    language TEXT DEFAULT 'en',                -- Browser language
    last_path TEXT DEFAULT '/',                -- Last page visited (e.g. /siminfo, /)
    total_visits INTEGER DEFAULT 1,            -- Total visits count
    first_seen TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    last_seen TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    user_agent TEXT DEFAULT ''
);

-- ---------------------------------------------------------------------
-- 2. CREATE PERFORMANCE INDEXES:
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_visitor_fp_fingerprint ON public.visitor_fingerprints (fingerprint);
CREATE INDEX IF NOT EXISTS idx_visitor_fp_ip ON public.visitor_fingerprints (ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_fp_last_seen ON public.visitor_fingerprints (last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_fp_country ON public.visitor_fingerprints (country);

-- ---------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES:
-- ---------------------------------------------------------------------
ALTER TABLE public.visitor_fingerprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Public Insert Visitor Telemetry" ON public.visitor_fingerprints;
CREATE POLICY "Allow Public Insert Visitor Telemetry" 
ON public.visitor_fingerprints FOR INSERT TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Public Update Visitor Telemetry" ON public.visitor_fingerprints;
CREATE POLICY "Allow Public Update Visitor Telemetry" 
ON public.visitor_fingerprints FOR UPDATE TO anon, authenticated 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Deny Public Select Direct Telemetry" ON public.visitor_fingerprints;
CREATE POLICY "Deny Public Select Direct Telemetry" 
ON public.visitor_fingerprints FOR SELECT TO anon, authenticated 
USING (false);

GRANT ALL ON public.visitor_fingerprints TO service_role;

-- =====================================================================
-- 📊 HANDY ADMIN QUERIES FOR SUPABASE SQL EDITOR:
-- =====================================================================

-- A. VIEW LATEST 50 LIVE VISITORS WITH FULL TELEMETRY:
SELECT 
  fingerprint AS device_id,
  ip_address,
  country,
  device_type,
  os,
  browser,
  battery_level,
  screen_resolution,
  total_visits,
  last_path,
  last_seen
FROM public.visitor_fingerprints
ORDER BY last_seen DESC
LIMIT 50;

-- B. VIEW ACTIVE VISITORS IN THE LAST 15 MINUTES:
SELECT 
  fingerprint,
  ip_address,
  country,
  device_type,
  battery_level,
  last_path,
  last_seen
FROM public.visitor_fingerprints
WHERE last_seen > timezone('utc'::text, now()) - INTERVAL '15 minutes'
ORDER BY last_seen DESC;

-- C. VIEW VISITORS WITH LOW BATTERY (< 20%):
SELECT 
  fingerprint,
  ip_address,
  device_type,
  os,
  battery_level
FROM public.visitor_fingerprints
WHERE battery_raw > 0 AND battery_raw <= 20 AND battery_charging = false
ORDER BY battery_raw ASC;

-- D. TOP VISITED COUNTRIES:
SELECT 
  country, 
  COUNT(*) AS total_visitors,
  SUM(total_visits) AS total_pageviews
FROM public.visitor_fingerprints
GROUP BY country
ORDER BY total_visitors DESC;

-- E. CLEAR TEST OR OLD TELEMETRY (OPTIONAL):
-- TRUNCATE TABLE public.visitor_fingerprints;
