# WhatsApp & TikTok-Style Step-by-Step Admin Settings Studio (`/saqibadmb`)

Redesign the `/saqibadmb` Admin Command Center into an intuitive **WhatsApp & TikTok Settings Menu** experience featuring clean grouped setting rows, iOS/TikTok-style toggle switches, chevron drill-down panels, and **4-Step Guided Wizards** so the store owner can manage products, plans, web tools, hero banners, payment methods, WhatsApp numbers, and footer links step by step.

## User Review & Critical Decisions

> [!IMPORTANT]
> All choices confirmed during Phase 1 are incorporated below and sync live across the entire storefront across all 4 UI themes and 6 font packs.

- **Confirmed Decision 1 (Admin Layout Architecture)**: Organized as a **WhatsApp & TikTok-style Settings Hub** with grouped category rows, search bar, live status sub-labels, toggle switches, and clean drill-down screens with a persistent "Back to Settings Menu" header.
- **Confirmed Decision 2 (Step-by-Step Product & Tool Creation)**: Adding or editing both **Store Services/Products** and **Live Web Tools** uses a **4-Step Guided Wizard** (`Step 1: Basic Info` → `Step 2: Pricing Plans / Action Config` → `Step 3: Icon, Badge & Visual Style` → `Step 4: Live 3D Card Preview & Publish`) alongside a searchable catalog manager.
- **Confirmed Decision 3 (Global Site Settings Coverage)**: Full live editing from the Admin Panel for:
  1. **Hero Banner & Top Strip**: Show/Hide main hero banner toggle, top strip title, hero status badge, main headline, subtitle/description, and portrait image URL.
  2. **Payment Methods & Deposit Accounts**: Edit Account Title, Account Number/ID, Short Tag, Instructions, and Enabled status for **EasyPaisa**, **JazzCash**, **SadaPay / Bank**, and **Binance / USDT**, dynamically updating the Wallet Deposit drawer and Order Checkout modal.
  3. **WhatsApp, Contact & Footer Links**: Change primary WhatsApp number (`wa.me` links, floating WhatsApp orb, order routing, and hero button), support email, website URL, footer brand text, and social media URLs/handles (Instagram, TikTok, Facebook, Snapchat).

---

## 1. Overview & Core Concept

- **What It Does**: Replaces the crowded multi-form admin view with a sleek, mobile-first and desktop-optimized **Settings & Studio Hub** modeled after TikTok and WhatsApp Settings. Admins tap any setting row to open its dedicated step-by-step wizard or toggle site features directly from the list.
- **Target Audience / Persona**: Muhammad Saqib (Store Owner / Administrator) managing services, pricing tiers, web tools, payment accounts, and storefront branding on mobile or desktop.
- **Key Value**: Eliminates long scrolling forms by breaking product/tool creation into clear, foolproof steps while making every hardcoded phone number, payment account, banner text, and social link editable in real time.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Settings Home Menu (WhatsApp / TikTok Style)**:
     - Features an admin profile card at the top, a quick search bar (`Search settings, products, payment methods...`), and grouped settings cards with crisp vector icons (`react-icons`), current status summaries, quick toggle switches (e.g., *Show Hero Banner*, *UI Sound Effects*), and right-arrow chevrons.
  2. **Step-by-Step Product / Service Wizard (4 Steps)**:
     - **Step 1 (Basic Info)**: Service Title, Store Category, and Short Description.
     - **Step 2 (Pricing Plans & Customer Input)**: Interactive **Plan / Price Builder** where the admin can add, edit, or remove individual package rows (`Plan Name` + `Price Rs.`) one by one with a `+ Add Plan` button (or bulk edit), plus customize the customer checkout prompt label.
     - **Step 3 (Media, Icon & Card Style)**: Custom Icon URL, Fallback 3D Vector Icon, Top Badge text, Direct Tool URL, and Card Theme.
     - **Step 4 (Review & Publish)**: Live interactive 3D Service Card preview with 1-click publish to storefront.
  3. **Step-by-Step Web Tool Wizard (4 Steps)**:
     - **Step 1 (Tool Identity)**: Tool Name & Description.
     - **Step 2 (Link & Launch Mode)**: Website/Tool URL, Button Label, and Launch Behavior (New Tab, In-App 3D Popup, or SIM Tracker).
     - **Step 3 (Icon & Visual Badge)**: Custom Icon URL, Fallback 3D Icon, Badge text, and Card Style.
     - **Step 4 (Preview & Publish)**: Live 3D Tool Card preview and instant publishing.
  4. **Hero Banner & Storefront Header Studio**:
     - Instant iOS-style toggle to **Show or Hide** the Hero Banner section, plus step-by-step fields for Top Header Title, Hero Promo Badge, Main Title, Highlighted Subtitle, Bio Description, and Portrait Image Link.
  5. **Payment Methods & Wallet Accounts Manager**:
     - Step-by-step cards for **EasyPaisa**, **JazzCash**, **SadaPay / Bank**, and **Binance / USDT** to update Account Holder Name, Account Number / IBAN / UID, Badge Tag, and Transfer Instructions—syncing immediately with user wallet top-ups and order modals.
  6. **WhatsApp, Socials & Footer Links Editor**:
     - Edit Primary WhatsApp Number (auto-formats display number and `wa.me` number across the entire site), Support Email, Official Website Link, Social Handles/URLs (Instagram, TikTok, Facebook, Snapchat), and Footer Brand Line.

- **Visual Identity & Theme**:
  - **Aesthetic Direction**: Tactile mobile-OS settings hierarchy inspired by WhatsApp & TikTok Settings—clean grouped containers, hairline dividers, high-contrast typography, and zero-clutter step indicators.
  - **Color Palette & Mood**: Adapts seamlessly to all 4 active store themes (*Astro-OS Dark Neumorphic*, *Classic 3D Pink Acrylic*, *Liquid Glass Champagne & Gold*, and *3D Pastel Jelly Droplet OS*) using high-contrast surfaces, emerald active toggles (`#10B981`), and sky/pink step progress bars.
  - **Typography & Hierarchy**: Respects the active store font pack (`--store-font-display`, `--store-font-body`, `--store-font-mono`) with `tabular-nums` on all prices, wallet balances, phone numbers, and step counters.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Interactive Step-by-Step Plan Builder vs. Raw Textarea**
  - *Chosen Approach*: Provide a visual row-by-row **Plan & Price Builder** in Step 2 of the Product Wizard (where each plan has a Plan Name input, Price input, and Add/Remove buttons) while keeping a "Quick Multi-Line Edit" toggle for power users.
  - *Why*: Adding or changing package prices step-by-step on mobile is much faster and less error-prone than formatting raw multi-line strings manually.
- **Decision 2: Unified Global Site Config State (`SiteSettingsConfig`)**
  - *Chosen Approach*: Centralize Hero Banner settings, WhatsApp & Contact details, Social/Footer links, and Payment Methods into a single persistent `localStorage` store (`saqib_visuals_site_config_v1`) with instant 1-click "Reset to Defaults" protection.
  - *Why*: Ensures every change in the Admin Settings menu immediately reflects on the public Storefront, Contact page, Wallet Deposit flow, Checkout modal, and Footer without page reloads.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         App State & Persistence                           │
│  • servicesCatalog (localStorage)    • paymentProofs & walletBalance      │
│  • webToolsCatalog (localStorage)    • siteConfig (Banner, WA, Pay, Foot) │
│  • websiteUiMode (4 Themes)          • websiteFontMode (6 Font Packs)     │
└───────────────────┬───────────────────────────────────────┬───────────────┘
                    │                                       │
                    ▼                                       ▼
┌───────────────────────────────────────┐ ┌─────────────────────────────────┐
│   Public Storefront & Customer Views  │ │ /saqibadmb Settings Studio Hub  │
│  • Dynamic Hero Banner (Show/Hide,    │ │  (WhatsApp / TikTok Style UI)   │
│    Custom Title, Badge, Bio, Photo)   │ ├─────────────────────────────────┤
│  • Store Catalog & Order Checkout     │ │ 1. Settings Home Menu (Grouped) │
│    (Dynamic WA Number & Payment List) │ │ 2. Product Wizard (4 Steps)     │
│  • User Add Funds Drawer              │ │ 3. Web Tool Wizard (4 Steps)    │
│    (Dynamic EasyPaisa/JazzCash/Bank)  │ │ 4. Hero Banner & Visibility     │
│  • Contact Page & Dynamic Footer      │ │ 5. Payment Methods & Wallet     │
│    (Dynamic WA, Email, Social Links)  │ │ 6. WhatsApp, Socials & Footer   │
│                                       │ │ 7. Theme & Font Studio (4+6)    │
└───────────────────────────────────────┘ └─────────────────────────────────┘
```

### Data Model & State

- **`SiteSettingsConfig` Interface**:
  - `banner`: `{ showHeroBanner: boolean; showTopStrip: boolean; topStripTitle: string; badgeText: string; mainTitle: string; highlightTitle: string; description: string; portraitUrl: string; }`
  - `contact`: `{ whatsappNumberClean: string; whatsappNumberDisplay: string; whatsappDefaultMessage: string; supportEmail: string; officialWebsiteUrl: string; officialWebsiteLabel: string; }`
  - `socials`: `{ instagramUrl: string; instagramHandle: string; tiktokUrl: string; tiktokHandle: string; facebookUrl: string; facebookName: string; snapchatUrl: string; snapchatHandle: string; }`
  - `footer`: `{ brandName: string; copyrightTagline: string; showQuickLinks: boolean; }`
  - `paymentMethods`: `DepositMethodMeta[]` (EasyPaisa, JazzCash, SadaPay / Bank, Binance / USDT — each with editable `label`, `shortTag`, `accountTitle`, `accountNumber`, `extraInfo`, and `enabled` flag).

### Interactive Component & State Mapping

- **Settings Home Menu**: Renders 7 categorized setting groups (*Store & Catalog*, *Banner & Appearance*, *Payments & Wallet*, *Contact & Footer*, *Quick Toggles*). Clicking any row transitions smoothly into that section's step-by-step editor; clicking the top breadcrumb returns to the main settings list.
- **4-Step Product & Tool Wizards**: Maintain step state (`1 | 2 | 3 | 4`), validate required fields per step before advancing, support jumping directly to any step when editing an existing item, and render a live 3D card preview on Step 4 (and in a side panel on desktop).
- **Dynamic Storefront Binding**:
  - All `PRIMARY_WA_NUMBER` references in `App.tsx` (Hero pill, Order checkout WhatsApp URL, Shopping Cart checkout URL, Contact cards, VIP OTP, and Floating WhatsApp Orb) bind dynamically to `siteConfig.contact.whatsappNumberClean`.
  - `UserAddFundsExperience` and the Order Checkout Modal read `siteConfig.paymentMethods` so updated EasyPaisa/JazzCash/Bank numbers and account holder names appear immediately to customers.
