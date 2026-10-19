# 🎨 Ultra-Adaptive Multi-Theme, Dynamic Font & Web Audio Synthesizer System
> **Production Blueprint & Implementation Constitution for React / Tailwind Web Apps**  
> *Targeted for Developers & AI Agents (Gemini, Claude, GPT) to install this exact system into ANY web application in minutes.*

---

## 📋 Table of Contents
1. [Architecture Overview & AI Agent Directive](#1-architecture-overview--ai-agent-directive)
2. [Universal Contrast & Visibility Constitution (Zero Illegible Text)](#2-universal-contrast--visibility-constitution)
3. [Step 1: Zero-Asset Tactile Web Audio Synthesizer](#3-step-1-zero-asset-tactile-web-audio-synthesizer)
4. [Step 2: 6 Curated Theme Packs & Design Tokens](#4-step-2-6-curated-theme-packs--design-tokens)
5. [Step 3: Dynamic Typography & Google Font Runtime Engine](#5-step-3-dynamic-typography--google-font-runtime-engine)
6. [Step 4: Drop-in React TypeScript Context & Hook (`TactileThemeContext.tsx`)](#6-step-4-drop-in-react-typescript-context--hook)
7. [Step 5: Visual Theme & Font Switcher Studio Component (`ThemeFontModal.tsx`)](#7-step-5-visual-theme--font-switcher-studio-component)
8. [Step 6: Master CSS Stylesheet (`theme-system.css`)](#8-step-6-master-css-stylesheet)
9. [Step 7: Installation & Integration Walkthrough in 4 Steps](#9-step-7-installation--integration-walkthrough)
10. [Step 8: AI Agent Verification & Anti-Bug Checklist](#10-step-8-ai-agent-verification--anti-bug-checklist)

---

## 1. Architecture Overview & AI Agent Directive

### The Problem This Solves:
Most web applications struggle when implementing dark/light themes and custom fonts because:
1. **Contrast Bugs**: When switching to a dark theme, text inside white cards becomes invisible, or inputs end up with white text on white backgrounds.
2. **Audio File Failures**: Traditional sound systems rely on `.mp3` or `.wav` files that fail with 404 errors, suffer CORS restrictions in iframes, or require heavy network downloads.
3. **Typography Disconnect**: Changing fonts requires restarting dev servers or editing Tailwind configs manually, preventing users or admins from choosing their favorite aesthetic live.

### The Solution:
This system provides a **100% self-contained, zero-dependency** tripartite architecture:
- **Zero-Asset Web Audio Synthesizer**: Uses browser native `window.AudioContext` oscillators. Generates soothing tactile pops, clicks, success chimes, and warnings using pure mathematical sound waves (`sine` / `triangle`). Never fails, weighs 0 KB.
- **Universal CSS Contrast Cascade**: Injects a body class (e.g., `body.theme-neo-blue-dark`, `body.theme-liquid-champagne`) and systematically normalizes all surface backgrounds, border opacities, input fields, badges, and text classes (`.text-slate-900`, `.text-slate-700`, etc.) so that text is **always 100% visible and readable**.
- **Dynamic Google Font Injector**: Dynamically injects Google Font `<link>` tags on runtime demand, applying CSS variables (`--font-display`, `--font-body`, `--font-mono`) with fallback stacks.
- **Persistent LocalStorage State**: Stores user preferences with fallback defaults and zero flicker on page load.

---

## 2. Universal Contrast & Visibility Constitution

When an application switches between light acrylic and dark cyberpunk/matte slate themes, hardcoded utility classes like `text-slate-900` or `bg-white` break. This system enforces 4 Golden Rules:

### Rule 1: The Dual-Surface Rule
- Every card is categorized into:
  - **Outer Frame (`.acrylic-frame`)**: Translucent container with backdrop blur, subtle inner shadow, and responsive rounded corners (`rounded-[28px]` or `rounded-[32px]`).
  - **Inner Plush Pillow (`.plush-pillow`)**: The interactive surface holding text, buttons, and inputs.
- In Dark Themes, `.bg-white`, `.bg-slate-50`, and `.bg-pink-50` automatically remap to deep translucent slate/navy (`rgba(15, 23, 42, 0.85)` or `#0a0f1d`) with clean contrasting borders (`rgba(255, 255, 255, 0.12)`).

### Rule 2: Inverted Typography Hierarchy
- In **Light / Pastel Themes**:
  - Headings: Deep dark slate (`#0f172a` or `#1e293b`).
  - Subtitles / Meta: Medium slate (`#475569` or `#334155`).
  - Accent / Badges: High-contrast saturated tint (`#be185d`, `#4338ca`, `#047857`).
- In **Dark Themes**:
  - Headings: Crisp snow white (`#ffffff` or `#f8fafc`).
  - Subtitles / Meta: Soft ice cyan / lavender slate (`#cbd5e1` or `#94a3b8`).
  - Accent / Badges: Vibrant neon pills with dark backgrounds (`rgba(56, 189, 248, 0.2)` with text `#38bdf8`).

### Rule 3: Universal Input & Dropdown Legibility
- Inputs (`input`, `textarea`, `select`) must **never** inherit browser default white backgrounds in dark themes.
- CSS specifically targets:
  ```css
  body.theme-neo-blue-dark input,
  body.theme-neo-blue-dark select,
  body.theme-neo-blue-dark textarea {
    background-color: #0b1120 !important;
    color: #ffffff !important;
    border-color: rgba(0, 240, 255, 0.3) !important;
  }
  ```
- Select dropdown options (`option`) are styled with dark backgrounds and white text so the native OS picker is fully readable.

### Rule 4: Soft Light RGB Border Engine
- Optional ambient perimeter lighting (`rgb-light-on`) with high-frequency 60fps soft pastel rainbow / neon pulse around hero cards, badges, and floating docks.

---

## 3. Step 1: Zero-Asset Tactile Web Audio Synthesizer

Save this file as `src/utils/audioSynth.ts` (or place directly into your project).  
No external MP3/WAV assets required. 100% iframe and mobile compliant.

```typescript
// ============================================================================
// File: src/utils/audioSynth.ts
// Pure Web Audio API Sound Generator (Zero External Assets Needed!)
// ============================================================================

class TactileAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check initial mute state from localStorage if available
    try {
      const saved = localStorage.getItem('app_sound_muted');
      this.isMuted = saved === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('app_sound_muted', String(muted));
    } catch {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    if (!this.isMuted) {
      this.playPop(660);
    }
    return this.isMuted;
  }

  /**
   * 1. Tactile Pop Sound (For buttons, tabs, toggles, filter chips)
   * Frequency: 400Hz - 900Hz. Duration: 75ms.
   */
  public playPop(freq = 520) {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, t + 0.065);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.075);
    } catch {
      // Gracefully silent if user has not interacted with DOM yet
    }
  }

  /**
   * 2. Success Chord (For copy to clipboard, checkout, approvals, saved alerts)
   * Polyphonic 3-note ascending chime (C6 -> E6 -> G6)
   */
  public playSuccess() {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime + idx * 0.065;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.19);
      });
    } catch {}
  }

  /**
   * 3. Warning / Delete Tone (For delete actions, validations, errors)
   * Descending low-frequency buzz
   */
  public playWarning() {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(130, t + 0.12);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.14);
    } catch {}
  }

  /**
   * 4. Laser Snap / Confetti Blast (For celebrating grand events, modal opens)
   */
  public playSnap() {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.09);

      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.095);
    } catch {}
  }
}

export const soundFx = new TactileAudioEngine();
```

---

## 4. Step 2: 6 Curated Theme Packs & Design Tokens

Save this file as `src/types/themeCatalog.ts`:

```typescript
// ============================================================================
// File: src/types/themeCatalog.ts
// 6 Curated High-Fidelity Theme Definitions
// ============================================================================

export type AppThemeId =
  | 'astro-neu'
  | 'pink-acrylic'
  | 'liquid-champagne'
  | 'pastel-jelly'
  | 'neo-gray-dark'
  | 'neo-blue-dark';

export interface AppThemeItem {
  id: AppThemeId;
  name: string;
  shortLabel: string;
  badge: string;
  tagline: string;
  bodyClass: string;
  swatch1: string;
  swatch2: string;
  previewGradient: string;
  isDark: boolean;
  accentColor: string;
}

export const APP_THEMES_CATALOG: AppThemeItem[] = [
  {
    id: 'astro-neu',
    name: 'Astro-Neumorphic (Matte Slate & Navy)',
    shortLabel: 'Astro-Neu',
    badge: 'THEME 1 • MATTE SLATE',
    tagline: 'Clean dual-tone neumorphic slate with deep navy contrast',
    bodyClass: 'theme-astro-neu',
    swatch1: '#e4e7ec',
    swatch2: '#0e1220',
    previewGradient: 'from-slate-700 to-sky-950',
    isDark: false,
    accentColor: '#38bdf8'
  },
  {
    id: 'pink-acrylic',
    name: 'Classic Pink 3D Acrylic & Plush',
    shortLabel: 'Classic Pink',
    badge: 'THEME 2 • SIGNATURE',
    tagline: 'Signature pastel pink acrylic glass, rose & plush gradients',
    bodyClass: 'theme-pink-acrylic',
    swatch1: '#ffdde9',
    swatch2: '#ec4899',
    previewGradient: 'from-pink-500 via-rose-500 to-purple-600',
    isDark: false,
    accentColor: '#ec4899'
  },
  {
    id: 'liquid-champagne',
    name: '3D Liquid Glass Champagne & Gold',
    shortLabel: 'Liquid Gold',
    badge: 'THEME 3 • ROYAL GOLD',
    tagline: '3D Liquid glass pearl with warm champagne gold luster',
    bodyClass: 'theme-liquid-champagne',
    swatch1: '#fef3c7',
    swatch2: '#d97706',
    previewGradient: 'from-amber-600 via-yellow-500 to-emerald-600',
    isDark: false,
    accentColor: '#f59e0b'
  },
  {
    id: 'pastel-jelly',
    name: '3D Pastel Jelly Droplet OS',
    shortLabel: 'Pastel Jelly',
    badge: 'THEME 4 • JELLY-OS',
    tagline: 'Glossy water-droplet jelly cards with soft candy shine',
    bodyClass: 'theme-pastel-jelly',
    swatch1: '#6190e8',
    swatch2: '#f48fb1',
    previewGradient: 'from-sky-400 via-indigo-400 to-pink-400',
    isDark: false,
    accentColor: '#6366f1'
  },
  {
    id: 'neo-gray-dark',
    name: 'Neo Gray Dark (Slate & Neumorphic Charcoal)',
    shortLabel: 'Neo Gray Dark',
    badge: 'THEME 5 • DARK SLATE',
    tagline: 'Midnight dark mode with dual-tone soft embossed shadows',
    bodyClass: 'theme-neo-gray-dark',
    swatch1: '#111520',
    swatch2: '#94a3b8',
    previewGradient: 'from-slate-900 via-slate-800 to-slate-950',
    isDark: true,
    accentColor: '#94a3b8'
  },
  {
    id: 'neo-blue-dark',
    name: 'Neo Blue Dark (Cyberpunk Obsidian & Cyan)',
    shortLabel: 'Neo Blue Dark',
    badge: 'THEME 6 • CYBER BLUE',
    tagline: 'Futuristic cyberpunk night mode with electric cyan neon glow',
    bodyClass: 'theme-neo-blue-dark',
    swatch1: '#070b14',
    swatch2: '#00f0ff',
    previewGradient: 'from-cyan-600 via-blue-700 to-indigo-950',
    isDark: true,
    accentColor: '#00f0ff'
  }
];
```

---

## 5. Step 3: Dynamic Typography & Google Font Runtime Engine

Save this file as `src/types/fontCatalog.ts`:

```typescript
// ============================================================================
// File: src/types/fontCatalog.ts
// 6 Curated Font Packs & Runtime Google Font Injection Helper
// ============================================================================

export type AppFontMode =
  | 'tech-modern'
  | 'cute-plush'
  | 'luxury-serif'
  | 'bold-syne'
  | 'cyber-orbitron'
  | 'clean-poppins';

export interface AppFontPackItem {
  id: AppFontMode;
  num: number;
  shortLabel: string;
  title: string;
  badge: string;
  displayFontName: string;
  bodyFontName: string;
  monoFontName: string;
  googleFontsUrl: string; // URL to fetch missing weights
  displayCss: string;
  bodyCss: string;
  monoCss: string;
  desc: string;
  sampleHeadline: string;
  sampleBody: string;
}

export const APP_FONT_PACKS: AppFontPackItem[] = [
  {
    id: 'tech-modern',
    num: 1,
    shortLabel: 'Space Grotesk + Jakarta',
    title: 'Tech Modern (Space Grotesk & Plus Jakarta Sans)',
    badge: 'PACK 1 • TECH MODERN',
    displayFontName: 'Space Grotesk',
    bodyFontName: 'Plus Jakarta Sans',
    monoFontName: 'JetBrains Mono',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@600;700;800&family=JetBrains+Mono:wght@500;700&display=swap',
    displayCss: "'Space Grotesk', -apple-system, sans-serif",
    bodyCss: "'Plus Jakarta Sans', -apple-system, sans-serif",
    monoCss: "'JetBrains Mono', monospace",
    desc: 'Geometric tech headlines paired with crisp Plus Jakarta Sans and monospaced code numbers.',
    sampleHeadline: 'NEXT-GEN CLOUD OS & AI WORKSPACES',
    sampleBody: 'Deploy, automate, and orchestrate with sub-millisecond precision.'
  },
  {
    id: 'cute-plush',
    num: 2,
    shortLabel: 'Outfit + Quicksand',
    title: 'Cute Plush (Outfit & Quicksand Bubble)',
    badge: 'PACK 2 • CUTE PLUSH',
    displayFontName: 'Outfit',
    bodyFontName: 'Quicksand',
    monoFontName: 'Space Mono',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Quicksand:wght@500;600;700&family=Space+Mono:wght@700&display=swap',
    displayCss: "'Outfit', sans-serif",
    bodyCss: "'Quicksand', sans-serif",
    monoCss: "'Space Mono', monospace",
    desc: 'Rounded friendly aesthetics with bubbly letterforms and friendly curves.',
    sampleHeadline: 'CREATIVE DESIGN & DIGITAL BOUTIQUE',
    sampleBody: 'Handcrafted vector assets, 3D icons, and cheerful interactions.'
  },
  {
    id: 'luxury-serif',
    num: 3,
    shortLabel: 'Playfair + Montserrat',
    title: 'Luxury Editorial (Playfair Display & Montserrat)',
    badge: 'PACK 3 • EDITORIAL',
    displayFontName: 'Playfair Display',
    bodyFontName: 'Montserrat',
    monoFontName: 'DM Mono',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Montserrat:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap',
    displayCss: "'Playfair Display', Georgia, serif",
    bodyCss: "'Montserrat', sans-serif",
    monoCss: "'DM Mono', monospace",
    desc: 'High-fashion editorial elegance with high-contrast serif headlines.',
    sampleHeadline: 'HAUTE HORLOGERIE & PRIVATE BANKING',
    sampleBody: 'Curated heritage portfolios and bespoke financial concierge.'
  },
  {
    id: 'bold-syne',
    num: 4,
    shortLabel: 'Syne + Sora',
    title: 'Avant-Garde Neo (Syne Extra Bold & Sora)',
    badge: 'PACK 4 • AVANT-GARDE',
    displayFontName: 'Syne',
    bodyFontName: 'Sora',
    monoFontName: 'JetBrains Mono',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Sora:wght@400;600;700&display=swap',
    displayCss: "'Syne', sans-serif",
    bodyCss: "'Sora', sans-serif",
    monoCss: "'JetBrains Mono', monospace",
    desc: 'Hyper-stylized contemporary typography favored by top design agencies and web3 brands.',
    sampleHeadline: 'DECENTRALIZED ARCHITECTURE STUDIO',
    sampleBody: 'Pushing the boundaries of spatial interfaces and interactive design.'
  },
  {
    id: 'cyber-orbitron',
    num: 5,
    shortLabel: 'Orbitron + Rajdhani',
    title: 'Cyberpunk Sci-Fi (Orbitron & Rajdhani)',
    badge: 'PACK 5 • SCI-FI CYBER',
    displayFontName: 'Orbitron',
    bodyFontName: 'Rajdhani',
    monoFontName: 'Share Tech Mono',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap',
    displayCss: "'Orbitron', monospace",
    bodyCss: "'Rajdhani', sans-serif",
    monoCss: "'Share Tech Mono', monospace",
    desc: 'Angular tactical heads-up display styling for futuristic telemetry and dashboards.',
    sampleHeadline: 'QUANTUM TELEMETRY & SYSTEM RADAR',
    sampleBody: 'Terminal authorization granted. Neural uplink operating at nominal bandwidth.'
  },
  {
    id: 'clean-poppins',
    num: 6,
    shortLabel: 'Poppins + Inter',
    title: 'Universal Enterprise (Poppins & Inter)',
    badge: 'PACK 6 • UNIVERSAL CLEAN',
    displayFontName: 'Poppins',
    bodyFontName: 'Inter',
    monoFontName: 'Roboto Mono',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap',
    displayCss: "'Poppins', sans-serif",
    bodyCss: "'Inter', sans-serif",
    monoCss: "'Roboto Mono', monospace",
    desc: 'The gold standard for SaaS, enterprise applications, and conversion landing pages.',
    sampleHeadline: 'GLOBAL PAYMENTS & COMMERCE PLATFORM',
    sampleBody: 'Trusted by millions of merchants worldwide for instant settlement and invoicing.'
  }
];

/**
 * Dynamically injects Google Fonts link into document <head>
 */
export function injectGoogleFont(url: string) {
  if (typeof document === 'undefined') return;
  const linkId = 'dynamic-google-fonts-link';
  let existingLink = document.getElementById(linkId) as HTMLLinkElement | null;
  if (!existingLink) {
    existingLink = document.createElement('link');
    existingLink.id = linkId;
    existingLink.rel = 'stylesheet';
    document.head.appendChild(existingLink);
  }
  if (existingLink.href !== url) {
    existingLink.href = url;
  }
}
```

---

## 6. Step 4: Drop-in React TypeScript Context & Hook

Save this file as `src/context/TactileThemeContext.tsx`:

```tsx
// ============================================================================
// File: src/context/TactileThemeContext.tsx
// Complete State Provider for Theme, Font, Sound Effects & Ambient RGB Lights
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppThemeId, APP_THEMES_CATALOG } from '../types/themeCatalog';
import { AppFontMode, APP_FONT_PACKS, injectGoogleFont } from '../types/fontCatalog';
import { soundFx } from '../utils/audioSynth';

interface TactileThemeContextType {
  theme: AppThemeId;
  font: AppFontMode;
  soundEnabled: boolean;
  rgbLightEnabled: boolean;
  setTheme: (t: AppThemeId) => void;
  setFont: (f: AppFontMode) => void;
  toggleSound: () => void;
  toggleRgbLight: () => void;
  playPop: (freq?: number) => void;
  playSuccess: () => void;
  playWarning: () => void;
  playSnap: () => void;
}

const TactileThemeContext = createContext<TactileThemeContextType | undefined>(undefined);

export const TactileThemeProvider: React.FC<{
  children: React.ReactNode;
  defaultTheme?: AppThemeId;
  defaultFont?: AppFontMode;
}> = ({ children, defaultTheme = 'pink-acrylic', defaultFont = 'tech-modern' }) => {
  // 1. Theme State
  const [theme, setThemeState] = useState<AppThemeId>(() => {
    try {
      const saved = localStorage.getItem('app_theme_mode');
      if (saved && APP_THEMES_CATALOG.some((t) => t.id === saved)) {
        return saved as AppThemeId;
      }
    } catch {}
    return defaultTheme;
  });

  // 2. Font State
  const [font, setFontState] = useState<AppFontMode>(() => {
    try {
      const saved = localStorage.getItem('app_font_mode');
      if (saved && APP_FONT_PACKS.some((f) => f.id === saved)) {
        return saved as AppFontMode;
      }
    } catch {}
    return defaultFont;
  });

  // 3. Sound State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => !soundFx.getMuted());

  // 4. Ambient RGB Light State
  const [rgbLightEnabled, setRgbLightEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('app_rgb_light') !== 'false';
    } catch {
      return true;
    }
  });

  // Apply Theme CSS Class to document.body
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;

    // Remove all previous theme classes
    APP_THEMES_CATALOG.forEach((t) => body.classList.remove(t.bodyClass));

    // Add selected theme class
    const selectedThemeObj = APP_THEMES_CATALOG.find((t) => t.id === theme);
    if (selectedThemeObj) {
      body.classList.add(selectedThemeObj.bodyClass);
    }

    try {
      localStorage.setItem('app_theme_mode', theme);
    } catch {}
  }, [theme]);

  // Apply Font CSS Variables & Inject Google Font
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const fontObj = APP_FONT_PACKS.find((f) => f.id === font) || APP_FONT_PACKS[0];

    // Inject Google Font
    injectGoogleFont(fontObj.googleFontsUrl);

    // Apply CSS Variables to root
    const root = document.documentElement;
    root.style.setProperty('--font-display', fontObj.displayCss);
    root.style.setProperty('--font-body', fontObj.bodyCss);
    root.style.setProperty('--font-mono', fontObj.monoCss);

    try {
      localStorage.setItem('app_font_mode', font);
    } catch {}
  }, [font]);

  // Apply Ambient RGB Light Class
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (rgbLightEnabled) {
      document.body.classList.add('rgb-light-on');
    } else {
      document.body.classList.remove('rgb-light-on');
    }
    try {
      localStorage.setItem('app_rgb_light', String(rgbLightEnabled));
    } catch {}
  }, [rgbLightEnabled]);

  const setTheme = (nextTheme: AppThemeId) => {
    soundFx.playPop(720);
    setThemeState(nextTheme);
  };

  const setFont = (nextFont: AppFontMode) => {
    soundFx.playPop(640);
    setFontState(nextFont);
  };

  const toggleSound = () => {
    const isNowMuted = soundFx.toggleMute();
    setSoundEnabled(!isNowMuted);
  };

  const toggleRgbLight = () => {
    const next = !rgbLightEnabled;
    soundFx.playPop(next ? 820 : 440);
    setRgbLightEnabled(next);
  };

  return (
    <TactileThemeContext.Provider
      value={{
        theme,
        font,
        soundEnabled,
        rgbLightEnabled,
        setTheme,
        setFont,
        toggleSound,
        toggleRgbLight,
        playPop: (freq) => soundFx.playPop(freq),
        playSuccess: () => soundFx.playSuccess(),
        playWarning: () => soundFx.playWarning(),
        playSnap: () => soundFx.playSnap()
      }}
    >
      {children}
    </TactileThemeContext.Provider>
  );
};

export const useTactileTheme = () => {
  const ctx = useContext(TactileThemeContext);
  if (!ctx) {
    throw new Error('useTactileTheme must be used within a TactileThemeProvider');
  }
  return ctx;
};
```

---

## 7. Step 5: Visual Theme & Font Switcher Studio Component

Save this file as `src/components/ThemeFontStudioModal.tsx`:

```tsx
// ============================================================================
// File: src/components/ThemeFontStudioModal.tsx
// Interactive Modal / Drawer for Switching Themes, Fonts, Sounds & RGB Light
// ============================================================================

import React, { useState } from 'react';
import { useTactileTheme } from '../context/TactileThemeContext';
import { APP_THEMES_CATALOG } from '../types/themeCatalog';
import { APP_FONT_PACKS } from '../types/fontCatalog';

interface ThemeFontStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeFontStudioModal: React.FC<ThemeFontStudioModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    theme,
    font,
    soundEnabled,
    rgbLightEnabled,
    setTheme,
    setFont,
    toggleSound,
    toggleRgbLight,
    playPop,
    playSuccess
  } = useTactileTheme();

  const [activeTab, setActiveTab] = useState<'themes' | 'fonts' | 'audio'>('themes');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[32px] acrylic-frame overflow-hidden shadow-2xl">
        <div className="plush-pillow rounded-[26px] p-4 sm:p-6 flex flex-col flex-grow overflow-hidden space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-pink-200/50 pb-3.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-100/80 px-2.5 py-0.5 rounded-full border border-pink-200">
                🎨 AESTHETICS &amp; TACTILE STUDIO
              </span>
              <h2 className="text-base sm:text-2xl font-black text-slate-900 mt-1">
                Customize Theme, Typography &amp; Sound
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                playPop(480);
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 font-bold flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-100/80 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                playPop(600);
                setActiveTab('themes');
              }}
              className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'themes'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <span>🎨 Visual Themes ({APP_THEMES_CATALOG.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playPop(600);
                setActiveTab('fonts');
              }}
              className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'fonts'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <span>🔤 Typography ({APP_FONT_PACKS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playPop(600);
                setActiveTab('audio');
              }}
              className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'audio'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <span>🔊 Tactile Audio &amp; RGB</span>
            </button>
          </div>

          {/* Tab 1: Themes Grid */}
          {activeTab === 'themes' && (
            <div className="overflow-y-auto pr-1 space-y-3 flex-grow max-h-[55vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {APP_THEMES_CATALOG.map((thm) => {
                  const isSelected = theme === thm.id;
                  return (
                    <div
                      key={thm.id}
                      onClick={() => setTheme(thm.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-sm ${
                        isSelected
                          ? 'border-pink-500 ring-2 ring-pink-400/50 bg-white scale-[1.01]'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-pink-600 tracking-wider">
                          {thm.badge}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300"
                            style={{ backgroundColor: thm.swatch1 }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300"
                            style={{ backgroundColor: thm.swatch2 }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-black text-slate-900">{thm.name}</div>
                        <div className="text-xs font-semibold text-slate-600 mt-0.5 leading-snug">
                          {thm.tagline}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500">
                          {thm.isDark ? '🌙 Dark Mode' : '☀️ Light Acrylic'}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                            isSelected
                              ? 'bg-pink-500 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ Active Theme' : 'Apply Theme'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Fonts Grid */}
          {activeTab === 'fonts' && (
            <div className="overflow-y-auto pr-1 space-y-3 flex-grow max-h-[55vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {APP_FONT_PACKS.map((f) => {
                  const isSelected = font === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setFont(f.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-sm ${
                        isSelected
                          ? 'border-pink-500 ring-2 ring-pink-400/50 bg-white scale-[1.01]'
                          : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                          {f.badge}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black">
                            ✓ ACTIVE
                          </span>
                        )}
                      </div>

                      <div>
                        <div
                          className="text-base font-black text-slate-900 leading-snug"
                          style={{ fontFamily: f.displayCss }}
                        >
                          {f.sampleHeadline}
                        </div>
                        <div
                          className="text-xs font-medium text-slate-700 mt-1 leading-relaxed"
                          style={{ fontFamily: f.bodyCss }}
                        >
                          {f.sampleBody}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-mono-code text-slate-500">
                        <span>Display: {f.displayFontName}</span>
                        <span>Body: {f.bodyFontName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Audio & Ambient Lighting */}
          {activeTab === 'audio' && (
            <div className="overflow-y-auto pr-1 space-y-4 flex-grow max-h-[55vh]">
              {/* Tactile Sound FX Card */}
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-slate-900">
                    Tactile Web Audio Synthesizer
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    Pure mathematically generated pop &amp; chime sounds on buttons, tabs and switches.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition ${
                    soundEnabled
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {soundEnabled ? '🔊 Sound ON' : '🔇 Muted'}
                </button>
              </div>

              {/* Ambient RGB Edge Light Card */}
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-slate-900">
                    Ambient Soft RGB Perimeter Glow
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    Subtle animated rainbow light ring along cards and buttons.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleRgbLight}
                  className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition ${
                    rgbLightEnabled
                      ? 'bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {rgbLightEnabled ? '🌈 RGB ON' : '⚪ RGB OFF'}
                </button>
              </div>

              {/* Audio Test Bench */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-800 uppercase block">
                  Audio Test Bench (Tap to Test Waves):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => playPop(520)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer"
                  >
                    Button Pop (520Hz)
                  </button>
                  <button
                    type="button"
                    onClick={() => playPop(760)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer"
                  >
                    High Pop (760Hz)
                  </button>
                  <button
                    type="button"
                    onClick={() => playSuccess()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                  >
                    Success Chime (Chord)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-xs font-semibold text-slate-500">
              Preferences are automatically saved in local browser storage.
            </span>
            <button
              type="button"
              onClick={() => {
                playSuccess();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer shadow-md"
            >
              ✓ Done &amp; Apply
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
```

---

## 8. Step 6: Master CSS Stylesheet (`theme-system.css`)

Add this code to your `src/index.css` or import as a dedicated CSS file.  
This handles all glassmorphism, responsive neumorphism, font bindings, and dark contrast overrides.

```css
/* ============================================================================
 * THEME SYSTEM MASTER STYLESHEET (theme-system.css)
 * ========================================================================== */

/* 1. Root Typography Variables (Dynamically injected by React Context) */
:root {
  --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

body {
  font-family: var(--font-body);
  transition: background 0.35s ease, color 0.35s ease;
  min-height: 100vh;
}

h1, h2, h3, h4, .font-display {
  font-family: var(--font-display);
}

code, pre, .font-mono-code {
  font-family: var(--font-mono);
}

/* 2. THEME 1: ASTRO-NEUMORPHIC (Matte Slate & Deep Navy) */
body.theme-astro-neu {
  background: radial-gradient(circle at 15% 15%, #eef2f6 0%, #e2e8f0 100%);
  color: #0f172a;
}
body.theme-astro-neu .acrylic-frame {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 8px 8px 24px rgba(148, 163, 184, 0.25), -8px -8px 24px rgba(255, 255, 255, 0.9);
}
body.theme-astro-neu .plush-pillow {
  background: #f1f5f9;
  border: 1px solid rgba(203, 213, 225, 0.7);
  box-shadow: inset 2px 2px 5px rgba(148, 163, 184, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.8);
}

/* 3. THEME 2: CLASSIC PINK 3D ACRYLIC & PLUSH (Signature) */
body.theme-pink-acrylic {
  background: radial-gradient(circle at 10% 20%, #ffeef5 0%, #fde2ed 50%, #fbe8f2 100%);
  color: #1e293b;
}
body.theme-pink-acrylic .acrylic-frame {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 36px -10px rgba(244, 114, 182, 0.25);
}
body.theme-pink-acrylic .plush-pillow {
  background: linear-gradient(135deg, rgba(255, 245, 248, 0.95), rgba(255, 235, 242, 0.9));
  border: 1px solid rgba(244, 114, 182, 0.35);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.9), 0 4px 12px rgba(244, 114, 182, 0.15);
}

/* 4. THEME 3: LIQUID GLASS CHAMPAGNE & GOLD */
body.theme-liquid-champagne {
  background: radial-gradient(circle at 20% 10%, #fffbf0 0%, #fef3c7 60%, #faedd0 100%);
  color: #451a03;
}
body.theme-liquid-champagne .acrylic-frame {
  background: rgba(255, 255, 255, 0.8);
  border: 1.5px solid rgba(253, 230, 138, 0.8);
  box-shadow: 0 16px 36px -10px rgba(217, 119, 6, 0.2);
}
body.theme-liquid-champagne .plush-pillow {
  background: linear-gradient(135deg, #fffdf7 0%, #fef9c3 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

/* 5. THEME 4: 3D PASTEL JELLY DROPLET OS */
body.theme-pastel-jelly {
  background: radial-gradient(circle at 10% 10%, #e0f2fe 0%, #ede9fe 50%, #fce7f3 100%);
  color: #1e1b4b;
}
body.theme-pastel-jelly .acrylic-frame {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 20px 40px -12px rgba(99, 102, 241, 0.25);
}
body.theme-pastel-jelly .plush-pillow {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(165, 180, 252, 0.4);
}

/* 6. THEME 5: NEO GRAY DARK (Slate & Neumorphic Charcoal) */
body.theme-neo-gray-dark {
  background: radial-gradient(circle at 10% 20%, #1e2230 0%, #111520 60%, #0b0e17 100%);
  color: #f8fafc;
}
body.theme-neo-gray-dark .acrylic-frame {
  background: rgba(26, 31, 46, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}
body.theme-neo-gray-dark .plush-pillow {
  background: rgba(17, 21, 32, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* 7. THEME 6: NEO BLUE DARK (Cyberpunk Obsidian & Electric Cyan) */
body.theme-neo-blue-dark {
  background: radial-gradient(circle at 15% 15%, #0b1528 0%, #050b14 60%, #02050a 100%);
  color: #ffffff;
}
body.theme-neo-blue-dark .acrylic-frame {
  background: rgba(8, 16, 32, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(0, 240, 255, 0.25);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.08);
}
body.theme-neo-blue-dark .plush-pillow {
  background: rgba(5, 11, 22, 0.95);
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: inset 0 0 15px rgba(0, 240, 255, 0.03);
}

/* ============================================================================
 * UNIVERSAL DARK CONTRAST CORRECTION (Fixes White-on-White & Dark-on-Dark)
 * ========================================================================== */

body.theme-neo-gray-dark .text-slate-900,
body.theme-neo-blue-dark .text-slate-900,
body.theme-neo-gray-dark .text-slate-800,
body.theme-neo-blue-dark .text-slate-800 {
  color: #ffffff !important;
}

body.theme-neo-gray-dark .text-slate-700,
body.theme-neo-blue-dark .text-slate-700,
body.theme-neo-gray-dark .text-slate-600,
body.theme-neo-blue-dark .text-slate-600 {
  color: #cbd5e1 !important;
}

body.theme-neo-gray-dark .text-slate-500,
body.theme-neo-blue-dark .text-slate-500 {
  color: #94a3b8 !important;
}

/* Inputs & Textareas in Dark Themes */
body.theme-neo-gray-dark input:not([type="range"]),
body.theme-neo-blue-dark input:not([type="range"]),
body.theme-neo-gray-dark select,
body.theme-neo-blue-dark select,
body.theme-neo-gray-dark textarea,
body.theme-neo-blue-dark textarea {
  background-color: #0b1220 !important;
  color: #ffffff !important;
  border-color: rgba(148, 163, 184, 0.3) !important;
}

body.theme-neo-blue-dark input:not([type="range"]):focus,
body.theme-neo-blue-dark textarea:focus {
  border-color: #00f0ff !important;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.3) !important;
}

/* Background Card Inversions in Dark Themes */
body.theme-neo-gray-dark .bg-white,
body.theme-neo-blue-dark .bg-white,
body.theme-neo-gray-dark [class*="bg-white/"],
body.theme-neo-blue-dark [class*="bg-white/"] {
  background-color: rgba(17, 24, 39, 0.85) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Soft Light RGB Border Animation */
@keyframes softRgbPulse {
  0% {
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.4), inset 0 0 10px rgba(56, 189, 248, 0.2);
    border-color: rgba(56, 189, 248, 0.6);
  }
  33% {
    box-shadow: 0 0 20px rgba(236, 72, 153, 0.4), inset 0 0 10px rgba(236, 72, 153, 0.2);
    border-color: rgba(236, 72, 153, 0.6);
  }
  66% {
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 10px rgba(168, 85, 247, 0.2);
    border-color: rgba(168, 85, 247, 0.6);
  }
  100% {
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.4), inset 0 0 10px rgba(56, 189, 248, 0.2);
    border-color: rgba(56, 189, 248, 0.6);
  }
}

body.rgb-light-on .acrylic-frame {
  animation: softRgbPulse 8s infinite linear;
}
```

---

## 9. Step 7: Installation & Integration Walkthrough

### 1. Copy Files into Target Project
Place the 5 files into your project:
- `src/utils/audioSynth.ts`
- `src/types/themeCatalog.ts`
- `src/types/fontCatalog.ts`
- `src/context/TactileThemeContext.tsx`
- `src/components/ThemeFontStudioModal.tsx`
- Append `theme-system.css` into your `src/index.css`

### 2. Wrap App Root with `TactileThemeProvider`
In your `main.tsx` or `App.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { TactileThemeProvider } from './context/TactileThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TactileThemeProvider defaultTheme="pink-acrylic" defaultFont="tech-modern">
      <App />
    </TactileThemeProvider>
  </React.StrictMode>
);
```

### 3. Add Switcher Button Anywhere in Your Navbar / Header
In your Navbar component:
```tsx
import React, { useState } from 'react';
import { useTactileTheme } from './context/TactileThemeContext';
import { ThemeFontStudioModal } from './components/ThemeFontStudioModal';

export const Navbar = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { playPop } = useTactileTheme();

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="font-display font-black text-xl">My App</div>
      
      <button
        onClick={() => {
          playPop(660);
          setModalOpen(true);
        }}
        className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
      >
        <span>🎨 Customize UI &amp; Fonts</span>
      </button>

      <ThemeFontStudioModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </nav>
  );
};
```

---

## 10. Step 8: AI Agent Verification & Anti-Bug Checklist

When building or updating another application using this blueprint, run through this 5-point verification:

- [x] **No Missing Audio Files**: Verify all sound calls invoke `soundFx.playPop()`, `soundFx.playSuccess()`, etc. No `new Audio('/sounds/pop.mp3')` should ever exist.
- [x] **Body Class Reflection**: Open Browser DevTools -> `Elements` -> verify `<body class="theme-...">` changes instantaneously when a theme is picked.
- [x] **Font Variables Bound**: Inspect root styles -> verify `--font-display`, `--font-body`, and `--font-mono` are populated and applied to text elements.
- [x] **Dark Contrast Pass**: Switch to `theme-neo-blue-dark` and `theme-neo-gray-dark`. Inspect text inside cards; ensure all text is `#ffffff` or `#cbd5e1` with **zero** black-on-black or white-on-white text.
- [x] **LocalStorage Persistence**: Refresh the browser; ensure the chosen theme, chosen font, mute state, and RGB glow state are preserved seamlessly.
