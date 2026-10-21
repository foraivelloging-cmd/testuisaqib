# 🚀 MUHAMMAD SAQIB — SAQIB VISUALS HUB
## 👑 MASTER SYSTEM PROMPT & ARCHITECTURE SPECIFICATION (OFFICIAL VAULT)

> **Last Updated:** October 21, 2026  
> **Official Live Domain:** [https://testuisaqib.vercel.app](https://testuisaqib.vercel.app)  
> **Admin Portal:** [https://testuisaqib.vercel.app/saqibadmin](https://testuisaqib.vercel.app/saqibadmin)  
> **GitHub Repository:** [https://github.com/foraivelloging-cmd/testuisaqib](https://github.com/foraivelloging-cmd/testuisaqib)  
> **Owner & Founder:** Muhammad Saqib (`+92 347 8936242` / `foraivelloging@gmail.com`)

---

## 📌 1. EXECUTIVE PROJECT OVERVIEW
**Saqib Visuals Hub** is an elite, high-performance web platform and digital store offering:
- **Premium AI Accounts & Subscriptions**: CapCut Pro, Lovable Pro, Gemini 18M Pro, ChatGPT Plus, Claude 3.5 Sonnet, ElevenLabs.
- **Social Media Marketing (SMM) Services**: TikTok UK/USA Monetized Accounts, Ad Agency Boost, Followers, Likes, Views.
- **Telecom & Data Utilities**: Live SIM Database, CDR/IMEI Tracking, NADRA Verification, FRC, Family Tree lookup.
- **E-Commerce & Digital Wallet**: Instant wallet top-up (EasyPaisa, JazzCash, Nayapay, Sadapay, Binance USDT TRC20), promo coupon codes, order management, and live receipt upload via Supabase storage.

---

## 🛠️ 2. TECH STACK & ARCHITECTURE
- **Framework**: Modern Next.js 16.4.2 (App Router with Turbopack).
- **Core Library**: React 19.0.1, TypeScript 7.0.2.
- **Styling**: Tailwind CSS v4, Motion (Framer Motion v12), FontAwesome 6, Lucide React.
- **Database & Storage**: Supabase Cloud PostgreSQL with Row Level Security (RLS) & Storage Buckets (`payment-proofs`, `site-assets`).
- **Security & Cryptography**: PBKDF2 hash encryption with salt for admin passwords, Anti-Scrape protection, Anti-Clone DRM Killswitch.
- **Deployment Platform**: Vercel (Production zero-config edge deployment).

---

## 🔐 3. ACCESS CONTROL & ROLES (RBAC)

### A. Super Admin (Full Unrestricted Access)
- **Email**: `admin@gmail.com`
- **Password**: `password123` (or hashed vault in Supabase)
- **Privileges**: Full access to all 11+ Admin Settings Screens, sub-admin delegation, user wallet balances, pricing, database export, promo popups, and coupon management.

### B. Sub-Admins (Delegated Role-Based Access)
- **Role**: `subadmin` with customizable permissions (`allowed_tabs`).
- **Protection & Enforcement**:
  - Cards on unauthorized settings tabs display high-visibility `🔒 LOCKED` badges.
  - Direct clicks on locked features play warning sounds and trigger alert toasts.
  - URL route guards intercept direct deep-links and display full-screen access restricted shields.

---

## 🎁 4. PROMO POPUP & ANNOUNCEMENT MODAL SYSTEM
- **Trigger**: Automatically pops up upon landing on the storefront if enabled.
- **Presets**:
  1. `20% Off Storewide Discount` (Coupon code, countdown timer, discount highlight).
  2. `Welcome Bonus / Free Coins` (New user reward).
  3. `Urgent Notice / Maintenance Alert` (System announcement).
  4. `VIP Reseller / Bulk Partner Discount` (Wholesale packages).
- **Admin Control**: Managed in **Admin Settings Hub ➡️ Screen 11 (Promo Popup Studio)** with live toggles for auto-open, timer, custom image banner, coupon copy button, and WhatsApp CTA.
- **Database Sync**: Saved in `site_config` table under `config->'promoPopup'`.

---

## 🛡️ 5. ANTI-CLONE DRM KILLSWITCH & SECURITY
- **Component**: `src/components/AntiCloneSecurityKillswitch.tsx`
- **Whitelisted Domains**:
  - `testuisaqib.vercel.app` (Primary Official Hub)
  - `mrsaqib242.vercel.app` (Legacy Alias)
  - `localhost` & `127.0.0.1` (Local Development)
  - Any domain matching `*.vercel.app`
  - Custom domains configured in `NEXT_PUBLIC_ALLOWED_DOMAINS`
- **Killswitch Action**:
  - If hosted on an unauthorized domain or loaded via `file://`, the client network functions (`fetch`, `XMLHttpRequest`) are disabled.
  - Screen is replaced with a locked red alert: `🛑 UNLICENSED CLONE / MIRROR DETECTED`.
  - Automatically redirects visitors to the genuine website `https://testuisaqib.vercel.app` within 3 seconds.

---

## 📂 6. DATABASE SCHEMA & SQL REFERENCE
All production database queries, schema definitions, RLS policies, and triggers are stored in:
1. `master_query.sql` — Instant executable SQL script for Supabase SQL Editor.
2. `MASTER_DATABASE_COMPLETE.sql` — Full migration script with all seed data, storage buckets, and performance indexes.

### Core Tables (All 12 Production Tables):
- `site_config` (Key-value and master JSON configuration for all storefront settings, banners, WhatsApp widget, SEO, and promo popups).
- `services` (Catalog of all 32+ digital accounts, SMM packages, tools, and pricing tiers).
- `web_tools` (SIM tracker, IMEI finder, Nadra portal, and AI web studio tools).
- `profiles` (User management, wallet balance, active/banned status, ban reasons, and login timestamps).
- `orders` (Live customer purchase orders, real-time database status tracking, server node telemetry).
- `payment_proofs` (Manual deposit requests, payment receipts, screenshot verification — strictly real database records with zero mock proofs or fake balances).
- `reviews` (Verified customer ratings and testimonials stored directly in database, zero fake seed reviews).
- `admin_vault` (PBKDF2 SHA-512 admin passwords, Superadmin & Sub-admin RBAC granular permissions).
- `coupons` (Discount coupon codes, percentage/fixed amounts, usage limits, and category restrictions).
- `contact_inquiries` (Customer support inbox, contact form messages, and priority ticketing).
- `visitor_fingerprints` (Hardware & device telemetry, battery level, charging status, OS, browser, screen resolution).
- `security_lockouts` (Anti brute-force rate limiter and IP lockout tracking).

---

## 📱 7. MOBILE UX & ULTRA-SMOOTH 60-120 FPS PERFORMANCE ENGINE

### A. Full-Screen Step-by-Step Vertical Navigation Drawer
- **Component**: `src/components/MobileStepByStepDrawer.tsx`
- **Features**:
  - Full-screen slide-over drawer with backdrop blur overlay and body scroll-lock.
  - Step-by-step numbered vertical progression (Steps 01 to 06):
    - **Step 01**: Storefront Services Catalog (Interactive Category Filter Grid)
    - **Step 02**: Live Web Tools Hub (SIM, NADRA, Tracker)
    - **Step 03**: Digital Wallet Balance & 1-Click "Add Funds" Modal Trigger
    - **Step 04**: About Muhammad Saqib & Verified Credentials
    - **Step 05**: FAQs & Quick Help Desk
    - **Step 06**: 24/7 Direct WhatsApp VIP Support
  - Quick action bar: 6 Dynamic UI Theme Presets, Sound Toggle (Chimes/Muted), and Dual Language Switcher (🇬🇧 English / 🇵🇰 Urdu).
  - Mobile Navigation Trigger: Single prominent animated 3-line hamburger menu button on the LEFT side (exact side from which the drawer glides open), eliminating dual-button confusion.

### B. Mobile 60-120 FPS Performance Optimizations
- **File**: `src/index.css` (`@media (max-width: 768px)`), `src/App.tsx`, `src/components/ShowcaseSections.tsx`
- **Key Enhancements**:
  - **Zero React Re-render on Scroll**: Replaced state setter with direct DOM `ref` class manipulation (`scrollTopBtnRef`), completely eliminating component re-renders while scrolling.
  - **Comprehensive Backdrop-Filter Neutralization**: Target `[class*="backdrop-blur"]` across all cards, badges, and header elements on mobile.
  - **Single-Layer GPU Shadows**: Replaced multi-layer box shadows across `.acrylic-frame`, `.plush-pillow`, `.neu-card`, `.space-navy-box`, and `.fluffy-orb` with a featherweight `0 3px 10px rgba(0,0,0,0.08)`.
  - **Continuous Repaint Termination**: Disabled `btnShine`, rotating RGB halos, radar rings, and floating keyframes on mobile.
  - **Full DOM Virtualization**: Applied `content-visibility-auto` across all service cards and editorial showcase banners.
  - **120Hz Native Momentum Touch Physics**: Set `scroll-behavior: auto; overscroll-behavior-y: contain;` for instantaneous, drag-free touch responsiveness on 90Hz/120Hz mobile screens.
  - **Marquee Paint Containment**: Added `contain: paint; transform: translateZ(0);` to brand marquees.

---

## 💻 8. COMMANDS CHEAT SHEET
```bash
# Run local development server
npm run dev

# Run production build & verify TypeScript
npm run build

# Git push updates to GitHub
git push origin main
```

---

> 💡 **AI Instruction**: When editing this codebase, maintain high code quality, preserve existing comments, never remove security protections without explicit instruction, and always keep `master_query.sql` and `MASTER_DATABASE_COMPLETE.sql` synchronized with any new database fields.
