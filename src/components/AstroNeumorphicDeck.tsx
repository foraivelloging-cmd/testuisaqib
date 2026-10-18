import React from 'react';
import {
  FaBolt,
  FaCheck,
  FaCrown,
  FaDroplet,
  FaFont,
  FaHeart,
  FaShuttleSpace,
  FaWandMagicSparkles
} from 'react-icons/fa6';

export type WebsiteUiThemeMode =
  | 'astro-neu'
  | 'pink-acrylic'
  | 'liquid-champagne'
  | 'pastel-jelly';

export type WebsiteFontMode =
  | 'tech-modern'
  | 'cute-plush'
  | 'luxury-serif'
  | 'bold-syne'
  | 'cyber-orbitron'
  | 'clean-poppins';

export interface StoreFontPackItem {
  id: WebsiteFontMode;
  num: number;
  shortLabel: string;
  title: string;
  badge: string;
  displayFontName: string;
  bodyFontName: string;
  monoFontName: string;
  displayCss: string;
  bodyCss: string;
  monoCss: string;
  desc: string;
  sampleHeadline: string;
  sampleBody: string;
  sampleMono: string;
  activeCardClass: string;
  activeBtnClass: string;
  pillColorClass: string;
}

export const STORE_FONT_PACKS: StoreFontPackItem[] = [
  {
    id: 'tech-modern',
    num: 1,
    shortLabel: '1. Space Grotesk + Jakarta',
    title: 'Tech Modern (Space Grotesk & Plus Jakarta Sans)',
    badge: 'FONT PACK 1 • TECH MODERN',
    displayFontName: 'Space Grotesk',
    bodyFontName: 'Plus Jakarta Sans',
    monoFontName: 'JetBrains Mono',
    displayCss: "'Space Grotesk', sans-serif",
    bodyCss: "'Plus Jakarta Sans', sans-serif",
    monoCss: "'JetBrains Mono', monospace",
    desc: 'Sharp geometric tech headlines paired with ultra-crisp Plus Jakarta Sans body text and tabular JetBrains Mono pricing.',
    sampleHeadline: 'MUHAMMAD SAQIB • SAQIB VISUALS',
    sampleBody: 'Instant AI Subscriptions, CapCut Pro, SMM Agency & Live SIM Info Hub.',
    sampleMono: 'Rs. 450 • INSTANT DELIVERY',
    activeCardClass: 'space-navy-box text-white border-sky-400 shadow-2xl scale-[1.01]',
    activeBtnClass: 'bg-sky-400 text-slate-950 shadow-md',
    pillColorClass: 'bg-sky-500/20 text-sky-400 border-sky-400/40'
  },
  {
    id: 'cute-plush',
    num: 2,
    shortLabel: '2. Fredoka + Quicksand',
    title: 'Cute Rounded Plush (Fredoka & Quicksand)',
    badge: 'FONT PACK 2 • CUTE 3D PLUSH',
    displayFontName: 'Fredoka',
    bodyFontName: 'Quicksand',
    monoFontName: 'JetBrains Mono',
    displayCss: "'Fredoka', sans-serif",
    bodyCss: "'Quicksand', sans-serif",
    monoCss: "'JetBrains Mono', monospace",
    desc: 'Soft 3D rounded plush display letters with friendly Quicksand body copy for a playful, tactile 3D store vibe.',
    sampleHeadline: 'MUHAMMAD SAQIB • SAQIB VISUALS',
    sampleBody: 'Instant AI Subscriptions, CapCut Pro, SMM Agency & Live SIM Info Hub.',
    sampleMono: 'Rs. 450 • INSTANT DELIVERY',
    activeCardClass: 'bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white border-white shadow-2xl scale-[1.01]',
    activeBtnClass: 'bg-white text-pink-600 shadow-md',
    pillColorClass: 'bg-pink-100 text-pink-700 border-pink-200'
  },
  {
    id: 'luxury-serif',
    num: 3,
    shortLabel: '3. Playfair Luxury Serif',
    title: 'Luxury Editorial (Playfair Display & Jakarta Sans)',
    badge: 'FONT PACK 3 • ROYAL LUXURY',
    displayFontName: 'Playfair Display',
    bodyFontName: 'Plus Jakarta Sans',
    monoFontName: 'JetBrains Mono',
    displayCss: "'Playfair Display', Georgia, serif",
    bodyCss: "'Plus Jakarta Sans', sans-serif",
    monoCss: "'JetBrains Mono', monospace",
    desc: 'High-contrast couture editorial serif headlines paired with clean modern sans-serif UI controls for a VIP boutique look.',
    sampleHeadline: 'MUHAMMAD SAQIB • SAQIB VISUALS',
    sampleBody: 'Instant AI Subscriptions, CapCut Pro, SMM Agency & Live SIM Info Hub.',
    sampleMono: 'Rs. 450 • INSTANT DELIVERY',
    activeCardClass: 'bg-gradient-to-br from-amber-600 via-amber-500 to-emerald-600 text-white border-white shadow-2xl scale-[1.01]',
    activeBtnClass: 'bg-white text-amber-800 shadow-md',
    pillColorClass: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'bold-syne',
    num: 4,
    shortLabel: '4. Syne + Outfit Bold',
    title: 'Bold Geometric Art (Syne & Outfit)',
    badge: 'FONT PACK 4 • BOLD STUDIO',
    displayFontName: 'Syne',
    bodyFontName: 'Outfit',
    monoFontName: 'Space Mono',
    displayCss: "'Syne', sans-serif",
    bodyCss: "'Outfit', sans-serif",
    monoCss: "'Space Mono', monospace",
    desc: 'Wide architectural agency display typography paired with balanced geometric Outfit body text and Space Mono badges.',
    sampleHeadline: 'MUHAMMAD SAQIB • SAQIB VISUALS',
    sampleBody: 'Instant AI Subscriptions, CapCut Pro, SMM Agency & Live SIM Info Hub.',
    sampleMono: 'Rs. 450 • INSTANT DELIVERY',
    activeCardClass: 'bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white border-white shadow-2xl scale-[1.01]',
    activeBtnClass: 'bg-white text-indigo-700 shadow-md',
    pillColorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  {
    id: 'cyber-orbitron',
    num: 5,
    shortLabel: '5. Orbitron + Rajdhani Cyber',
    title: 'Cyber Futuristic Gaming (Orbitron & Rajdhani)',
    badge: 'FONT PACK 5 • CYBER SCI-FI',
    displayFontName: 'Orbitron',
    bodyFontName: 'Rajdhani',
    monoFontName: 'Share Tech Mono',
    displayCss: "'Orbitron', sans-serif",
    bodyCss: "'Rajdhani', sans-serif",
    monoCss: "'Share Tech Mono', monospace",
    desc: 'Sci-fi command deck Orbitron headers with tactical squared Rajdhani UI typography and Share Tech Mono telemetry.',
    sampleHeadline: 'MUHAMMAD SAQIB • SAQIB VISUALS',
    sampleBody: 'Instant AI Subscriptions, CapCut Pro, SMM Agency & Live SIM Info Hub.',
    sampleMono: 'Rs. 450 • INSTANT DELIVERY',
    activeCardClass: 'bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 text-white border-white shadow-2xl scale-[1.01]',
    activeBtnClass: 'bg-white text-sky-700 shadow-md',
    pillColorClass: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  {
    id: 'clean-poppins',
    num: 6,
    shortLabel: '6. Poppins + DM Sans',
    title: 'Clean SaaS Pro (Poppins & DM Sans)',
    badge: 'FONT PACK 6 • CLEAN SAAS',
    displayFontName: 'Poppins',
    bodyFontName: 'DM Sans',
    monoFontName: 'JetBrains Mono',
    displayCss: "'Poppins', sans-serif",
    bodyCss: "'DM Sans', sans-serif",
    monoCss: "'JetBrains Mono', monospace",
    desc: 'Ultra-clean international SaaS geometric Poppins headings with high-legibility DM Sans descriptions for effortless reading.',
    sampleHeadline: 'MUHAMMAD SAQIB • SAQIB VISUALS',
    sampleBody: 'Instant AI Subscriptions, CapCut Pro, SMM Agency & Live SIM Info Hub.',
    sampleMono: 'Rs. 450 • INSTANT DELIVERY',
    activeCardClass: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white border-white shadow-2xl scale-[1.01]',
    activeBtnClass: 'bg-white text-emerald-700 shadow-md',
    pillColorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
];

export const AdminUiThemeSwitcherStudio: React.FC<{
  uiMode: WebsiteUiThemeMode;
  onChangeUiMode: (mode: WebsiteUiThemeMode) => void;
  fontMode: WebsiteFontMode;
  onChangeFontMode: (font: WebsiteFontMode) => void;
  playClick: (freq?: number) => void;
  showToast: (msg: string) => void;
}> = ({ uiMode, onChangeUiMode, fontMode, onChangeFontMode, playClick, showToast }) => {
  const activeFontObj =
    STORE_FONT_PACKS.find((f) => f.id === fontMode) || STORE_FONT_PACKS[0];

  return (
    <div className="space-y-6">
      {/* ==================== SECTION 1: 4-THEME STORE ENGINE ==================== */}
      <div className="acrylic-frame rounded-[34px] p-3 sm:p-4">
        <div className="plush-pillow plush-capcut rounded-[26px] p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-300/60 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-sky-400 text-[10px] font-extrabold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                <span>4-THEME STORE ENGINE • 100% SAME FEATURES &amp; SERVICES</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1.5">
                🎨 Store UI Theme Switcher (4 Instant Store Themes)
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                Switch your Store between <strong>1. Astro-Neumorphic (No Pink)</strong>,{' '}
                <strong>2. Classic Pink 3D Acrylic</strong>,{' '}
                <strong>3. 3D Liquid Glass Champagne &amp; Gold</strong>, and{' '}
                <strong>4. 3D Pastel Jelly Droplet OS (JELLY-OS v6.0)</strong> in 1 click. All 31+ Services, Web Tools, Wallet Balance, and Store sections stay <strong>100% identical</strong>!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playClick(760);
                  onChangeUiMode('astro-neu');
                  showToast('🚀 Theme 1: Astro-Neumorphic Store Theme Applied!');
                }}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  uiMode === 'astro-neu'
                    ? 'space-navy-box text-sky-300 border border-sky-400 shadow-lg scale-[1.02]'
                    : 'bg-slate-900/90 text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FaShuttleSpace className="text-sky-400 w-3.5 h-3.5" />
                <span>1. Astro-Neumorphic</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick(640);
                  onChangeUiMode('pink-acrylic');
                  showToast('🌸 Theme 2: Classic Pink 3D Acrylic Store Theme Applied!');
                }}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  uiMode === 'pink-acrylic'
                    ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white border border-white shadow-lg scale-[1.02]'
                    : 'bg-pink-500/90 text-white hover:bg-pink-600'
                }`}
              >
                <FaHeart className="w-3.5 h-3.5" />
                <span>2. Classic Pink</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick(820);
                  onChangeUiMode('liquid-champagne');
                  showToast('✨ Theme 3: 3D Liquid Glass Champagne & Gold Theme Applied!');
                }}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  uiMode === 'liquid-champagne'
                    ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-600 text-white border border-white shadow-lg scale-[1.02]'
                    : 'bg-amber-500/90 text-white hover:bg-amber-600'
                }`}
              >
                <FaCrown className="w-3.5 h-3.5" />
                <span>3. Liquid Glass Gold</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick(700);
                  onChangeUiMode('pastel-jelly');
                  showToast('🫧 Theme 4: 3D Pastel Jelly Droplet OS Theme Applied!');
                }}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  uiMode === 'pastel-jelly'
                    ? 'bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400 text-white border border-white shadow-lg scale-[1.02]'
                    : 'bg-sky-500/90 text-white hover:bg-sky-600'
                }`}
              >
                <FaDroplet className="w-3.5 h-3.5" />
                <span>4. 3D Pastel Jelly Droplet</span>
              </button>
            </div>
          </div>

          {/* 4 Theme Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Astro-Neumorphic OS Store Theme (No Pink) */}
            <div
              onClick={() => {
                playClick(740);
                onChangeUiMode('astro-neu');
                showToast('🚀 Store Theme Switched to Astro-Neumorphic (No Pink)!');
              }}
              className={`rounded-[26px] p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                uiMode === 'astro-neu'
                  ? 'space-navy-box text-white border-sky-400 shadow-2xl scale-[1.01]'
                  : 'bg-white/90 hover:bg-white text-slate-900 border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-sky-500/20 text-sky-400 border border-sky-400/40">
                    THEME 1 • NO PINK
                  </span>
                  {uiMode === 'astro-neu' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                      ● ACTIVE ON STORE
                    </span>
                  )}
                </div>

                <h4
                  className={`text-base sm:text-lg font-extrabold ${
                    uiMode === 'astro-neu' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Astro-Neumorphic Slate &amp; Deep-Space Navy
                </h4>
                <p
                  className={`text-xs mt-1.5 leading-relaxed ${
                    uiMode === 'astro-neu' ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Removes all pink colors and applies the tactile{' '}
                  <strong>Matte Neumorphic (#e4e7ec) + Deep-Space Navy (#0e1220) + Sky Cyan (#38bdf8)</strong> theme across your Store.
                </p>

                {/* Color Swatches */}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#e4e7ec' }}
                    title="Matte Neumorphic #e4e7ec"
                  ></span>
                  <span
                    className="w-7 h-7 rounded-full border-2 border-sky-400 shadow-sm"
                    style={{ background: '#0e1220' }}
                    title="Deep-Space Navy #0e1220"
                  ></span>
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#38bdf8' }}
                    title="Neon Cyan #38bdf8"
                  ></span>
                  <span className="text-[11px] font-mono-code font-bold ml-1 opacity-80">
                    Matte Slate + Cyan
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={`mt-5 w-full py-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                  uiMode === 'astro-neu'
                    ? 'bg-sky-400 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-sky-400 hover:bg-slate-800'
                }`}
              >
                <FaBolt className="w-3.5 h-3.5" />
                <span>
                  {uiMode === 'astro-neu'
                    ? 'Active Store Theme ✓'
                    : 'Apply Astro-Neumorphic Theme'}
                </span>
              </button>
            </div>

            {/* Card 2: Classic Pink 3D Acrylic Store Theme */}
            <div
              onClick={() => {
                playClick(640);
                onChangeUiMode('pink-acrylic');
                showToast('🌸 Store Theme Switched to Classic Pink 3D Acrylic!');
              }}
              className={`rounded-[26px] p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                uiMode === 'pink-acrylic'
                  ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white border-white shadow-2xl scale-[1.01]'
                  : 'bg-white/90 hover:bg-white text-slate-900 border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      uiMode === 'pink-acrylic'
                        ? 'bg-white/25 text-white border border-white/40'
                        : 'bg-pink-100 text-pink-700 border border-pink-200'
                    }`}
                  >
                    THEME 2 • CLASSIC PINK
                  </span>
                  {uiMode === 'pink-acrylic' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-pink-600">
                      ● ACTIVE ON STORE
                    </span>
                  )}
                </div>

                <h4
                  className={`text-base sm:text-lg font-extrabold ${
                    uiMode === 'pink-acrylic' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Classic Pink 3D Acrylic &amp; Plush Theme
                </h4>
                <p
                  className={`text-xs mt-1.5 leading-relaxed ${
                    uiMode === 'pink-acrylic' ? 'text-pink-100' : 'text-slate-600'
                  }`}
                >
                  Restores the signature{' '}
                  <strong>Pastel Pink, Rose &amp; Lavender 3D Acrylic Glass</strong> theme across the entire Store, Hero Portrait, Service Cards, and Modals.
                </p>

                {/* Color Swatches */}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#ffdde9' }}
                    title="Pastel Pink #ffdde9"
                  ></span>
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#ec4899' }}
                    title="Rose Pink #ec4899"
                  ></span>
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#9333ea' }}
                    title="Royal Purple #9333ea"
                  ></span>
                  <span className="text-[11px] font-mono-code font-bold ml-1 opacity-80">
                    Original Pink 3D
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={`mt-5 w-full py-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                  uiMode === 'pink-acrylic'
                    ? 'bg-white text-pink-600 shadow-md'
                    : 'bg-pink-500 text-white hover:bg-pink-600'
                }`}
              >
                <FaHeart className="w-3.5 h-3.5" />
                <span>
                  {uiMode === 'pink-acrylic'
                    ? 'Active Pink Theme ✓'
                    : 'Apply Classic Pink Theme'}
                </span>
              </button>
            </div>

            {/* Card 3: 3D Liquid Glass Champagne, Pearl & Royal Gold Control Center Theme */}
            <div
              onClick={() => {
                playClick(820);
                onChangeUiMode('liquid-champagne');
                showToast('✨ Store Theme Switched to 3D Liquid Glass Champagne & Royal Gold!');
              }}
              className={`rounded-[26px] p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                uiMode === 'liquid-champagne'
                  ? 'bg-gradient-to-br from-amber-600 via-amber-500 to-emerald-600 text-white border-white shadow-2xl scale-[1.01]'
                  : 'bg-white/90 hover:bg-white text-slate-900 border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      uiMode === 'liquid-champagne'
                        ? 'bg-white/25 text-white border border-white/40'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    THEME 3 • 3D LIQUID GLASS
                  </span>
                  {uiMode === 'liquid-champagne' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-amber-700">
                      ● ACTIVE ON STORE
                    </span>
                  )}
                </div>

                <h4
                  className={`text-base sm:text-lg font-extrabold ${
                    uiMode === 'liquid-champagne' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  3D Liquid Glass Champagne &amp; Royal Gold
                </h4>
                <p
                  className={`text-xs mt-1.5 leading-relaxed ${
                    uiMode === 'liquid-champagne' ? 'text-amber-50' : 'text-slate-600'
                  }`}
                >
                  Applies the luxury{' '}
                  <strong>3D Liquid Glass Pearl (#faf6f0), Warm Champagne Gold (#f59e0b) &amp; Crystal Emerald (#10b981)</strong> Control Center theme to the entire Store.
                </p>

                {/* Color Swatches */}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#fef3c7' }}
                    title="Warm Champagne Pearl #fef3c7"
                  ></span>
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#d97706' }}
                    title="Liquid Royal Gold #d97706"
                  ></span>
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#059669' }}
                    title="Crystal Emerald #059669"
                  ></span>
                  <span className="text-[11px] font-mono-code font-bold ml-1 opacity-80">
                    Liquid Glass + Gold
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={`mt-5 w-full py-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                  uiMode === 'liquid-champagne'
                    ? 'bg-white text-amber-700 shadow-md'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-600 text-white hover:opacity-95'
                }`}
              >
                <FaCrown className="w-3.5 h-3.5" />
                <span>
                  {uiMode === 'liquid-champagne'
                    ? 'Active 3D Liquid Glass ✓'
                    : 'Apply 3D Liquid Glass Theme'}
                </span>
              </button>
            </div>

            {/* Card 4: 3D Pastel Jelly Droplet OS Theme (JELLY-OS v6.0) */}
            <div
              onClick={() => {
                playClick(700);
                onChangeUiMode('pastel-jelly');
                showToast('🫧 Store Theme Switched to 3D Pastel Jelly Droplet OS (JELLY-OS v6.0)!');
              }}
              className={`rounded-[26px] p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                uiMode === 'pastel-jelly'
                  ? 'bg-gradient-to-br from-sky-400 via-indigo-400 to-pink-400 text-white border-white shadow-2xl scale-[1.01]'
                  : 'bg-white/90 hover:bg-white text-slate-900 border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      uiMode === 'pastel-jelly'
                        ? 'bg-white/25 text-white border border-white/40'
                        : 'bg-sky-100 text-sky-700 border border-sky-200'
                    }`}
                  >
                    THEME 4 • JELLY-OS v6.0
                  </span>
                  {uiMode === 'pastel-jelly' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-sky-600">
                      ● ACTIVE ON STORE
                    </span>
                  )}
                </div>

                <h4
                  className={`text-base sm:text-lg font-extrabold ${
                    uiMode === 'pastel-jelly' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  3D Pastel Jelly Droplet OS Theme
                </h4>
                <p
                  className={`text-xs mt-1.5 leading-relaxed ${
                    uiMode === 'pastel-jelly' ? 'text-sky-50' : 'text-slate-600'
                  }`}
                >
                  Applies the glossy{' '}
                  <strong>3D Water-Droplet Jelly Blobs, Specular Shine Dots, Sky Blue (#6190e8), Mint (#68d391), Peach (#f6ad85) &amp; Kawaii Pink (#f48fb1)</strong> theme to the entire Store.
                </p>

                {/* Color Swatches */}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#6190e8' }}
                    title="Jelly Blue #6190e8"
                  ></span>
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#68d391' }}
                    title="Jelly Mint #68d391"
                  ></span>
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#f6ad85' }}
                    title="Jelly Peach #f6ad85"
                  ></span>
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: '#f48fb1' }}
                    title="Jelly Pink #f48fb1"
                  ></span>
                  <span className="text-[11px] font-mono-code font-bold ml-1 opacity-80">
                    Water-Droplet Jelly
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={`mt-5 w-full py-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                  uiMode === 'pastel-jelly'
                    ? 'bg-white text-sky-600 shadow-md'
                    : 'bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400 text-white hover:opacity-95'
                }`}
              >
                <FaDroplet className="w-3.5 h-3.5" />
                <span>
                  {uiMode === 'pastel-jelly'
                    ? 'Active 3D Jelly Droplet ✓'
                    : 'Apply 3D Pastel Jelly Theme'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 2: 6-FONT TYPOGRAPHY SWITCHER STUDIO ==================== */}
      <div className="acrylic-frame rounded-[34px] p-3 sm:p-4">
        <div className="plush-pillow plush-login rounded-[26px] p-4 sm:p-6 space-y-6">
          {/* Typography Studio Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-300/60 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                <FaFont className="w-3 h-3 text-amber-300" />
                <span>6 CURATED GOOGLE FONT PACKS • WORKS ON ALL 4 THEMES</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1.5 flex items-center gap-2">
                <span>🔤 Website Multi-Font &amp; Typography Studio</span>
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                Switch your entire website&apos;s <strong>3D Headlines, Service Cards, Buttons, SIM Tracker &amp; Pricing Badges</strong> between 6 curated font styles in 1 click. Currently Active:{' '}
                <strong className="text-indigo-700 underline">
                  {activeFontObj.title}
                </strong>
                .
              </p>
            </div>

            {/* Quick 6-Font Pill Bar */}
            <div className="flex flex-wrap items-center gap-1.5">
              {STORE_FONT_PACKS.map((pack) => {
                const isSelected = fontMode === pack.id;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => {
                      playClick(780);
                      onChangeFontMode(pack.id);
                      showToast(`🔤 Font Pack Switched to ${pack.title}!`);
                    }}
                    style={{ fontFamily: pack.displayCss }}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'space-navy-box text-sky-300 border border-sky-400 shadow-lg scale-[1.03]'
                        : 'bg-white/90 hover:bg-white text-slate-900 border border-slate-300 shadow-xs'
                    }`}
                  >
                    <FaFont className={isSelected ? 'text-sky-400 w-3 h-3' : 'text-indigo-600 w-3 h-3'} />
                    <span>{pack.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6 Live Specimen Font Pack Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STORE_FONT_PACKS.map((pack) => {
              const isSelected = fontMode === pack.id;
              return (
                <div
                  key={pack.id}
                  onClick={() => {
                    playClick(800);
                    onChangeFontMode(pack.id);
                    showToast(`🔤 Website Font Applied: ${pack.title}!`);
                  }}
                  className={`rounded-[26px] p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? pack.activeCardClass
                      : 'bg-white/92 hover:bg-white text-slate-900 border-slate-200/90 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Badge & Active Indicator */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          isSelected
                            ? 'bg-white/20 text-white border-white/40'
                            : pack.pillColorClass
                        }`}
                      >
                        {pack.badge}
                      </span>
                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-950 flex items-center gap-1">
                          <FaCheck className="w-2.5 h-2.5" />
                          <span>ACTIVE FONT</span>
                        </span>
                      )}
                    </div>

                    {/* Live Aa Specimen Showcase Box */}
                    <div
                      className={`rounded-2xl p-3.5 mb-3.5 border ${
                        isSelected
                          ? 'bg-slate-950/35 border-white/25 text-white'
                          : 'bg-slate-50/95 border-slate-200/90 text-slate-900'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2 border-b border-current/10 pb-2 mb-2">
                        <span
                          className="font-specimen-custom text-2xl sm:text-3xl font-extrabold tracking-tight"
                          style={{ fontFamily: pack.displayCss }}
                        >
                          Aa Bb Cc
                        </span>
                        <span
                          className="font-specimen-custom text-xs font-bold opacity-85"
                          style={{ fontFamily: pack.monoCss }}
                        >
                          0123 • Rs.450
                        </span>
                      </div>
                      <div
                        className="font-specimen-custom text-xs sm:text-sm font-extrabold truncate"
                        style={{ fontFamily: pack.displayCss }}
                      >
                        {pack.sampleHeadline}
                      </div>
                      <p
                        className="font-specimen-custom text-[11px] mt-1 leading-snug opacity-90"
                        style={{ fontFamily: pack.bodyCss }}
                      >
                        {pack.sampleBody}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className={`font-specimen-custom text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-100 text-indigo-900'
                          }`}
                          style={{ fontFamily: pack.monoCss }}
                        >
                          {pack.sampleMono}
                        </span>
                      </div>
                    </div>

                    {/* Pack Title & Description */}
                    <h4
                      className={`font-specimen-custom text-sm sm:text-base font-extrabold ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                      style={{ fontFamily: pack.displayCss }}
                    >
                      {pack.num}. {pack.title}
                    </h4>
                    <p
                      className={`font-specimen-custom text-xs mt-1 leading-relaxed ${
                        isSelected ? 'text-white/90' : 'text-slate-600'
                      }`}
                      style={{ fontFamily: pack.bodyCss }}
                    >
                      {pack.desc}
                    </p>

                    {/* Font Family Trio Chips */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-md border ${
                          isSelected
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        Display: {pack.displayFontName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md border ${
                          isSelected
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        Body: {pack.bodyFontName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md border ${
                          isSelected
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        Mono: {pack.monoFontName}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`mt-4 w-full py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                      isSelected
                        ? pack.activeBtnClass
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <FaWandMagicSparkles className="w-3.5 h-3.5" />
                    <span>
                      {isSelected
                        ? `Active: ${pack.displayFontName} ✓`
                        : `Apply ${pack.displayFontName} Font Pack`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
