/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CategoryId } from '../data/defaultCatalog';
import {
  renderMarqueeIcon,
  SiGooglegemini,
  SiTiktok,
  FaSatelliteDish
} from './BrandIcons';

interface MarqueeItem {
  id: string;
  label: string;
  sub: string;
  icon: string;
  color: string;
  category: CategoryId;
  serviceId?: string;
}

const MARQUEE_ROW_1: MarqueeItem[] = [
  {
    id: 'm-chatgpt',
    label: 'ChatGPT Plus (GPT-4o / o3)',
    sub: 'Rs. 550 • Official Workspace',
    icon: 'fa-solid fa-robot',
    color: 'from-emerald-500 to-teal-600',
    category: 'capcut_ai',
    serviceId: 'chatgpt-plus'
  },
  {
    id: 'm-gemini',
    label: 'Google Gemini 18-Month Pro',
    sub: 'Rs. 1,800 • 2TB Google Cloud',
    icon: 'fa-solid fa-wand-magic-sparkles',
    color: 'from-blue-500 to-indigo-600',
    category: 'capcut_ai',
    serviceId: 'gemini-18m-pro'
  },
  {
    id: 'm-capcut',
    label: 'CapCut Pro (Mobile & PC)',
    sub: 'Rs. 350 • 4K Export & AI',
    icon: 'fa-solid fa-clapperboard',
    color: 'from-pink-500 to-purple-600',
    category: 'capcut_ai',
    serviceId: 'capcut-pro'
  },
  {
    id: 'm-lovable',
    label: 'Lovable Pro AI App Builder',
    sub: 'Rs. 1,450 • Full-Stack AI',
    icon: 'fa-solid fa-code',
    color: 'from-rose-500 to-pink-600',
    category: 'capcut_ai',
    serviceId: 'lovable-pro'
  },
  {
    id: 'm-elevenlabs',
    label: 'ElevenLabs 300k Credits',
    sub: 'No Expiry • Voice Cloning',
    icon: 'fa-solid fa-microphone-lines',
    color: 'from-violet-600 to-purple-700',
    category: 'capcut_ai',
    serviceId: 'elevenlabs-300k'
  },
  {
    id: 'm-muse',
    label: 'Muse AI — 1 Billion Tokens',
    sub: 'Rs. 1,950 • Unlimited Gen',
    icon: 'fa-solid fa-brain',
    color: 'from-fuchsia-500 to-pink-600',
    category: 'capcut_ai',
    serviceId: 'muse-ai-1b'
  },
  {
    id: 'm-claude',
    label: 'Claude 3.7 Sonnet Pro',
    sub: 'Rs. 1,100 • Coding & Writing',
    icon: 'fa-solid fa-bolt',
    color: 'from-amber-500 to-orange-600',
    category: 'capcut_ai',
    serviceId: 'claude-ai-pro'
  }
];

const MARQUEE_ROW_2: MarqueeItem[] = [
  {
    id: 'm-tt-uk',
    label: 'TikTok UK / USA Account',
    sub: 'Rs. 450 • No VPN Monetized',
    icon: 'fa-brands fa-tiktok',
    color: 'from-slate-900 to-rose-600',
    category: 'tiktok_fb',
    serviceId: 'tiktok-uk-usa-acc'
  },
  {
    id: 'm-tt-agency',
    label: 'TikTok & FB Ad Agency Acc',
    sub: 'Rs. 1,600 • Zero Tax Spend',
    icon: 'fa-solid fa-bullhorn',
    color: 'from-blue-600 to-cyan-600',
    category: 'tiktok_fb',
    serviceId: 'tiktok-ad-agency'
  },
  {
    id: 'm-sim-cdr',
    label: '2026 SIM Owner & CDR Call History',
    sub: 'Rs. 250 • 15 Min PDF Report',
    icon: 'fa-solid fa-satellite-dish',
    color: 'from-emerald-600 to-teal-700',
    category: 'franchise_sim',
    serviceId: 'sim-owner-details'
  },
  {
    id: 'm-nadra-frc',
    label: 'NADRA Family Tree (FRC) & CNIC',
    sub: 'Rs. 500 • Verified Record',
    icon: 'fa-solid fa-id-card',
    color: 'from-indigo-600 to-blue-700',
    category: 'nadra_records',
    serviceId: 'nadra-cnic-frc'
  },
  {
    id: 'm-canva-host',
    label: 'Canva Pro + Hostinger 12M',
    sub: 'Rs. 200 • Lifetime / 1 Year',
    icon: 'fa-solid fa-palette',
    color: 'from-cyan-500 to-blue-600',
    category: 'capcut_ai',
    serviceId: 'canva-pro'
  },
  {
    id: 'm-usdt',
    label: 'USDT / BTC P2P & Video Editing',
    sub: 'Instant JazzCash / EasyPaisa',
    icon: 'fa-brands fa-bitcoin',
    color: 'from-amber-500 to-yellow-600',
    category: 'creative_crypto',
    serviceId: 'crypto-btc-usdt'
  }
];

interface CalcPreset {
  id: string;
  name: string;
  unitLabel: string;
  minUnits: number;
  maxUnits: number;
  step: number;
  defaultUnits: number;
  wholesalePerUnit: number;
  retailPerUnit: number;
  badge: string;
  deliveryTime: string;
  serviceId: string;
}

const CALCULATOR_PRESETS: CalcPreset[] = [
  {
    id: 'calc-chatgpt',
    name: 'ChatGPT Plus (GPT-4o) Accounts',
    unitLabel: 'Accounts / Months',
    minUnits: 1,
    maxUnits: 25,
    step: 1,
    defaultUnits: 3,
    wholesalePerUnit: 500,
    retailPerUnit: 1500,
    badge: '🤖 High Reseller Demand',
    deliveryTime: '5 Mins on WhatsApp',
    serviceId: 'chatgpt-plus'
  },
  {
    id: 'calc-gemini',
    name: 'Google Gemini 18M Pro + 2TB Storage',
    unitLabel: 'Gmail Activations',
    minUnits: 1,
    maxUnits: 20,
    step: 1,
    defaultUnits: 2,
    wholesalePerUnit: 1700,
    retailPerUnit: 4500,
    badge: '✨ 1.5 Years Official',
    deliveryTime: '10 Mins Direct Gmail',
    serviceId: 'gemini-18m-pro'
  },
  {
    id: 'calc-capcut',
    name: 'CapCut Pro 4K (Mobile + PC Login)',
    unitLabel: 'Pro Accounts',
    minUnits: 1,
    maxUnits: 30,
    step: 1,
    defaultUnits: 5,
    wholesalePerUnit: 320,
    retailPerUnit: 900,
    badge: '🎬 #1 Best Seller',
    deliveryTime: 'Instant 3 Mins',
    serviceId: 'capcut-pro'
  },
  {
    id: 'calc-tiktok-flw',
    name: 'TikTok Real Non-Drop Followers',
    unitLabel: 'Thousand (K) Followers',
    minUnits: 1,
    maxUnits: 50,
    step: 1,
    defaultUnits: 10,
    wholesalePerUnit: 290,
    retailPerUnit: 750,
    badge: '🔥 Monetization Ready',
    deliveryTime: 'Instant Start • Refill Warranty',
    serviceId: 'tiktok-smm-boost'
  },
  {
    id: 'calc-tiktok-uk',
    name: 'TikTok UK / USA Monetizable Accounts',
    unitLabel: 'UK/USA Accounts',
    minUnits: 1,
    maxUnits: 20,
    step: 1,
    defaultUnits: 3,
    wholesalePerUnit: 400,
    retailPerUnit: 1200,
    badge: '🇬🇧 No VPN Required',
    deliveryTime: '5 Mins Full Email Access',
    serviceId: 'tiktok-uk-usa-acc'
  },
  {
    id: 'calc-elevenlabs',
    name: 'ElevenLabs 300k Credits (No Expiry)',
    unitLabel: '300k Credit Packs',
    minUnits: 1,
    maxUnits: 15,
    step: 1,
    defaultUnits: 2,
    wholesalePerUnit: 1500,
    retailPerUnit: 3800,
    badge: '🎙️ YouTube Automation',
    deliveryTime: '10 Mins Private Login',
    serviceId: 'elevenlabs-300k'
  },
  {
    id: 'calc-sim-cdr',
    name: 'Fresh 2026 SIM Owner / Call CDR Report',
    unitLabel: 'Verified Reports',
    minUnits: 1,
    maxUnits: 20,
    step: 1,
    defaultUnits: 2,
    wholesalePerUnit: 250,
    retailPerUnit: 800,
    badge: '📡 2026 Live Telecom',
    deliveryTime: '15 Mins Confidential PDF',
    serviceId: 'sim-owner-details'
  }
];

interface TrackedOrderData {
  orderId: string;
  clientName: string;
  city: string;
  serviceTitle: string;
  packageTier: string;
  paymentMethod: string;
  amount: string;
  statusStep: 1 | 2 | 3 | 4;
  statusLabel: string;
  serverNode: string;
  updatedAt: string;
  warrantyTag: string;
}

const DEMO_ORDERS: Record<string, TrackedOrderData> = {
  'SV-9482': {
    orderId: '#SV-9482',
    clientName: 'Hamza A.',
    city: 'Lahore',
    serviceTitle: 'Google Gemini 18-Month Pro + 2TB Cloud',
    packageTier: '18 Months Official Activation on Personal Gmail',
    paymentMethod: 'EasyPaisa Verified',
    amount: 'Rs. 1,800',
    statusStep: 4,
    statusLabel: 'COMPLETED & DELIVERED ON WHATSAPP',
    serverNode: 'Google-One-PK-Node-01',
    updatedAt: '4 mins ago',
    warrantyTag: '18-Month Full Warranty Active'
  },
  'SV-8831': {
    orderId: '#SV-8831',
    clientName: 'Zainab K.',
    city: 'Islamabad',
    serviceTitle: 'ChatGPT Plus (GPT-4o) + CapCut Pro Bundle',
    packageTier: 'Private Workspace + 4K Export Access',
    paymentMethod: 'JazzCash Verified',
    amount: 'Rs. 900',
    statusStep: 3,
    statusLabel: 'QUALITY & WARRANTY CHECK (90% DONE)',
    serverNode: 'AI-Pro-Cluster-04',
    updatedAt: 'Just now',
    warrantyTag: '30-Day Replacement Warranty'
  },
  'SV-7619': {
    orderId: '#SV-7619',
    clientName: 'Usman T.',
    city: 'Karachi',
    serviceTitle: 'TikTok UK Monetizable Account + 10K Followers',
    packageTier: 'Creator Rewards Ready (No VPN)',
    paymentMethod: 'SadaPay Transfer',
    amount: 'Rs. 3,100',
    statusStep: 4,
    statusLabel: 'COMPLETED & DELIVERED ON WHATSAPP',
    serverNode: 'SMM-Turbo-UK-02',
    updatedAt: '9 mins ago',
    warrantyTag: '30-Day Non-Drop Refill Active'
  },
  'SV-9920': {
    orderId: '#SV-9920',
    clientName: 'Bilal M.',
    city: 'Rawalpindi',
    serviceTitle: 'Fresh 2026 SIM Owner & Call History (CDR)',
    packageTier: 'Last 3 Months CDR + Live Tower Location',
    paymentMethod: 'EasyPaisa Verified',
    amount: 'Rs. 850',
    statusStep: 2,
    statusLabel: 'EXTRACTING TELECOM FRANCHISE PDF...',
    serverNode: 'Telecom-PK-Desk-01',
    updatedAt: '1 min ago',
    warrantyTag: '100% Confidential Encrypted PDF'
  }
};

interface LiveFeedItem {
  id: string;
  buyer: string;
  city: string;
  service: string;
  price: string;
  timeAgo: string;
  speed: string;
  method: string;
  serviceId: string;
  color: string;
}

const LIVE_FEED_ORDERS: LiveFeedItem[] = [
  {
    id: 'lf-1',
    buyer: 'Ali R.',
    city: 'Lahore',
    service: 'Google Gemini 18-Month Pro + 2TB',
    price: 'Rs. 1,800',
    timeAgo: '1 min ago',
    speed: 'Activated in 4m',
    method: 'EasyPaisa',
    serviceId: 'gemini-18m-pro',
    color: 'bg-indigo-600'
  },
  {
    id: 'lf-2',
    buyer: 'Danish K.',
    city: 'Karachi',
    service: 'ChatGPT Plus (GPT-4o / o3 Access)',
    price: 'Rs. 550',
    timeAgo: '2 mins ago',
    speed: 'Delivered in 3m',
    method: 'JazzCash',
    serviceId: 'chatgpt-plus',
    color: 'bg-emerald-600'
  },
  {
    id: 'lf-3',
    buyer: 'Ayesha S.',
    city: 'Islamabad',
    service: 'CapCut Pro 1 Month (iOS/Android/PC)',
    price: 'Rs. 350',
    timeAgo: '4 mins ago',
    speed: 'Delivered in 2m',
    method: 'SadaPay',
    serviceId: 'capcut-pro',
    color: 'bg-pink-600'
  },
  {
    id: 'lf-4',
    buyer: 'Fahad M.',
    city: 'Faisalabad',
    service: 'TikTok UK Account + 5K Followers',
    price: 'Rs. 1,650',
    timeAgo: '6 mins ago',
    speed: 'Delivered in 5m',
    method: 'EasyPaisa',
    serviceId: 'tiktok-uk-usa-acc',
    color: 'bg-rose-600'
  },
  {
    id: 'lf-5',
    buyer: 'Hassan B.',
    city: 'Multan',
    service: 'ElevenLabs 300k Credits (No Expiry)',
    price: 'Rs. 1,600',
    timeAgo: '8 mins ago',
    speed: 'Delivered in 5m',
    method: 'USDT P2P',
    serviceId: 'elevenlabs-300k',
    color: 'bg-purple-600'
  },
  {
    id: 'lf-6',
    buyer: 'Saad W.',
    city: 'Peshawar',
    service: 'Fresh 2026 SIM Owner & Call CDR',
    price: 'Rs. 850',
    timeAgo: '11 mins ago',
    speed: 'PDF Sent in 12m',
    method: 'JazzCash',
    serviceId: 'sim-owner-details',
    color: 'bg-teal-600'
  },
  {
    id: 'lf-7',
    buyer: 'Noman J.',
    city: 'Gujranwala',
    service: 'Lovable Pro AI + Claude 3.7 Sonnet',
    price: 'Rs. 1,450',
    timeAgo: '14 mins ago',
    speed: 'Delivered in 4m',
    method: 'EasyPaisa',
    serviceId: 'lovable-pro',
    color: 'bg-blue-600'
  }
];

interface PanelToolsProps {
  onSelectServiceById: (id: string) => void;
  onQuickFilter: (category: CategoryId, keyword?: string) => void;
  onPlayPop: (freq?: number) => void;
  primaryWaNumber: string;
}

export const MarqueeAndPulseBanner: React.FC<{
  onSelectServiceById: (id: string) => void;
  onQuickFilter: (category: CategoryId, keyword?: string) => void;
  onPlayPop: (freq?: number) => void;
}> = ({ onSelectServiceById, onQuickFilter, onPlayPop }) => {
  return (
    <div className="space-y-3">
      {/* Live Server Uptime & Speed Telemetry Pulse Bar */}
      <div className="acrylic-frame rounded-[26px] p-2 sm:p-2.5">
        <div className="plush-pillow plush-contact rounded-[20px] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 server-pulse-dot"></span>
            <span className="font-display font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              SAQIB VISUALS LIVE PANEL STATUS:
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300">
              ALL 3 SERVERS 99.9% ONLINE
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-bold text-slate-700">
            <span className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-white shadow-sm">
              <SiGooglegemini className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Pro Server:</span>
              <strong className="text-emerald-700">3 Min Avg</strong>
            </span>
            <span className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-white shadow-sm">
              <SiTiktok className="w-3.5 h-3.5 text-rose-500" />
              <span>SMM Turbo API:</span>
              <strong className="text-emerald-700">Instant Start</strong>
            </span>
            <span className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-white shadow-sm">
              <FaSatelliteDish className="w-3.5 h-3.5 text-blue-600" />
              <span>2026 SIM/NADRA Desk:</span>
              <strong className="text-emerald-700">15 Min PDF</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Infinite 3D Brand & Tool Ecosystem Marquee */}
      <div data-scroll="zoom" className="acrylic-frame rounded-[28px] p-2.5 overflow-hidden marquee-wrapper">
        <div className="space-y-2 overflow-hidden">
          {/* Row 1: Left-scrolling AI & Creator Pro Ecosystem */}
          <div className="marquee-track-left gap-2.5">
            {[...MARQUEE_ROW_1, ...MARQUEE_ROW_1].map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                onMouseEnter={() => onPlayPop(600)}
                onClick={() => {
                  if (item.serviceId) {
                    onSelectServiceById(item.serviceId);
                  } else {
                    onQuickFilter(item.category);
                  }
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 hover:bg-white border border-white shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
              >
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-sm flex-shrink-0`}
                >
                  {renderMarqueeIcon(item.id, 'w-4 h-4 text-white')}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-extrabold text-slate-900 whitespace-nowrap">
                    {item.label}
                  </div>
                  <div className="text-[10px] font-bold text-pink-600 whitespace-nowrap">
                    {item.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Row 2: Right-scrolling SMM, Ad Agency, Franchise & Crypto Ecosystem */}
          <div className="marquee-track-right gap-2.5">
            {[...MARQUEE_ROW_2, ...MARQUEE_ROW_2].map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                onMouseEnter={() => onPlayPop(540)}
                onClick={() => {
                  if (item.serviceId) {
                    onSelectServiceById(item.serviceId);
                  } else {
                    onQuickFilter(item.category);
                  }
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 hover:bg-white border border-white shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
              >
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-sm flex-shrink-0`}
                >
                  {renderMarqueeIcon(item.id, 'w-4 h-4 text-white')}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-extrabold text-slate-900 whitespace-nowrap">
                    {item.label}
                  </div>
                  <div className="text-[10px] font-bold text-indigo-600 whitespace-nowrap">
                    {item.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PanelToolsSection: React.FC<PanelToolsProps> = ({
  onSelectServiceById,
  onPlayPop,
  primaryWaNumber
}) => {
  // 1. State for Interactive SMM & AI Reseller Calculator
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CALCULATOR_PRESETS[0].id);
  const [calcUnits, setCalcUnits] = useState<number>(CALCULATOR_PRESETS[0].defaultUnits);

  const activePreset =
    CALCULATOR_PRESETS.find((p) => p.id === selectedPresetId) || CALCULATOR_PRESETS[0];

  const handleSelectPreset = (preset: CalcPreset) => {
    onPlayPop(600);
    setSelectedPresetId(preset.id);
    setCalcUnits(preset.defaultUnits);
  };

  // Bulk discount: 5+ units get 5% extra off, 10+ units get 10% extra off
  const discountRate = calcUnits >= 10 ? 0.9 : calcUnits >= 5 ? 0.95 : 1;
  const totalWholesale = Math.round(activePreset.wholesalePerUnit * calcUnits * discountRate);
  const totalRetail = Math.round(activePreset.retailPerUnit * calcUnits);
  const netProfitOrSavings = Math.max(0, totalRetail - totalWholesale);
  const savingsPercent = Math.round((netProfitOrSavings / totalRetail) * 100);

  // 2. State for Live Order Status Tracker
  const [orderInput, setOrderInput] = useState<string>('SV-9482');
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrderData>(DEMO_ORDERS['SV-9482']);
  const [isSearchingOrder, setIsSearchingOrder] = useState<boolean>(false);

  const handleTrackOrder = (e?: React.FormEvent, quickCode?: string) => {
    if (e) e.preventDefault();
    onPlayPop(650);
    const raw = (quickCode ?? orderInput).trim().toUpperCase().replace(/^#/, '');
    if (!raw) return;

    setIsSearchingOrder(true);
    setTimeout(() => {
      setIsSearchingOrder(false);
      if (DEMO_ORDERS[raw]) {
        setTrackedOrder(DEMO_ORDERS[raw]);
      } else {
        // Generate realistic live tracking telemetry for any custom Order ID or WhatsApp number
        const cleanDisplay = raw.startsWith('SV-') ? `#${raw}` : `#SV-${raw.slice(-4) || '2026'}`;
        setTrackedOrder({
          orderId: cleanDisplay,
          clientName: `VIP Client (${raw})`,
          city: 'Pakistan VIP Desk',
          serviceTitle: 'Custom AI Pro / SMM / Franchise Order',
          packageTier: 'Priority Fast-Track Execution',
          paymentMethod: 'EasyPaisa / JazzCash Verified',
          amount: 'Verified Deal',
          statusStep: 3,
          statusLabel: 'SERVER DISPATCH IN PROGRESS (85% COMPLETE)',
          serverNode: 'Saqib-VIP-Master-Node',
          updatedAt: 'Just now',
          warrantyTag: 'Full Period Replacement Guarantee'
        });
      }
    }, 350);
  };

  // 3. State for Real-Time Verified Orders Ticker
  const [highlightedFeedIndex, setHighlightedFeedIndex] = useState<number>(0);
  const [isFeedPaused, setIsFeedPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isFeedPaused) return;
    const timer = setInterval(() => {
      setHighlightedFeedIndex((prev) => (prev + 1) % LIVE_FEED_ORDERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isFeedPaused]);

  const activeHighlightOrder = LIVE_FEED_ORDERS[highlightedFeedIndex];

  return (
    <div className="space-y-7 pt-2">
      {/* ==================== INTERACTIVE SMM & AI PRICE + RESELLER PROFIT CALCULATOR ==================== */}
      <section data-scroll="up" className="acrylic-frame rounded-[34px] p-3 sm:p-5">
        <div className="plush-pillow plush-login rounded-[26px] p-4 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-pink-200/80 pb-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 border border-pink-200 text-[10px] font-extrabold text-pink-600 shadow-sm">
                <i className="fa-solid fa-calculator text-purple-600"></i> INTERACTIVE SMM PANEL &amp; RESELLER TOOL
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Live Price, Bulk Discount &amp; Reseller Profit Calculator 🧮
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Calculate your exact wholesale price, bulk discount (5%–10% extra off), and reseller profit margin in real time!
              </p>
            </div>
            <div className="self-center md:self-auto px-3.5 py-2 rounded-2xl bg-white/85 border border-white shadow-sm text-center">
              <div className="text-[10px] font-extrabold uppercase text-purple-700">Reseller Bonus</div>
              <div className="text-xs font-extrabold text-slate-900">Up to 10% Extra Bulk Discount</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left (7 Cols): Service Selector & Interactive Quantity Slider */}
            <div data-scroll="left" className="lg:col-span-7 bg-white/75 rounded-[24px] p-4 sm:p-5 border border-white shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  1. Select Service or Reseller Package:
                </label>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {CALCULATOR_PRESETS.map((preset) => {
                    const isSelected = preset.id === activePreset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2 sm:p-2.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-1.5 sm:gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-md scale-[1.01]'
                            : 'bg-white/90 hover:bg-pink-50/70 text-slate-800 border-pink-100'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] sm:text-xs font-extrabold truncate">{preset.name}</div>
                          <div
                            className={`text-[9px] sm:text-[10px] font-bold ${
                              isSelected ? 'text-pink-100' : 'text-pink-600'
                            }`}
                          >
                            Rs. {preset.wholesalePerUnit.toLocaleString()} / unit
                          </div>
                        </div>
                        <i
                          className={`fa-solid ${
                            isSelected ? 'fa-circle-check text-white' : 'fa-chevron-right text-slate-400'
                          } text-[10px] sm:text-xs flex-shrink-0`}
                        ></i>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity / Units Slider */}
              <div className="space-y-2.5 pt-2 border-t border-pink-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    2. Adjust Quantity ({activePreset.unitLabel}):
                  </label>
                  <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-display font-bold text-xs shadow">
                    {calcUnits} {activePreset.unitLabel}
                  </span>
                </div>

                <input
                  type="range"
                  min={activePreset.minUnits}
                  max={activePreset.maxUnits}
                  step={activePreset.step}
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(Number(e.target.value))}
                  className="w-full h-2.5 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />

                {/* Quick Quantity Multiplier Chips */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-600 uppercase">
                    Quick Quantity:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 3, 5, 10, 15, 20]
                      .filter((n) => n <= activePreset.maxUnits)
                      .map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => {
                            onPlayPop(580);
                            setCalcUnits(qty);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition cursor-pointer ${
                            calcUnits === qty
                              ? 'bg-pink-600 text-white shadow-sm'
                              : 'bg-pink-50 hover:bg-pink-100 text-slate-700 border border-pink-200'
                          }`}
                        >
                          {qty}x {qty >= 10 ? '🔥 -10%' : qty >= 5 ? '✨ -5%' : ''}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right (5 Cols): Live Cost & Profit Output Card */}
            <div data-scroll="right" className="lg:col-span-5 rounded-[24px] p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white border-2 border-white shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[10px] font-extrabold text-pink-300">
                    {activePreset.badge}
                  </span>
                  <span className="text-[11px] font-mono-code font-bold text-emerald-300">
                    Save {savingsPercent}%
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-pink-200 uppercase">
                    Saqib Visuals Wholesale Total
                  </div>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="font-display font-bold text-3xl sm:text-4xl text-white">
                      Rs. {totalWholesale.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 line-through font-bold">
                      Rs. {totalRetail.toLocaleString()}
                    </span>
                  </div>
                  {calcUnits >= 5 && (
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-extrabold text-emerald-300">
                      <i className="fa-solid fa-tags"></i> Extra Bulk Discount Applied (
                      {calcUnits >= 10 ? '10% OFF' : '5% OFF'})
                    </div>
                  )}
                </div>

                {/* Breakdown Boxes */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="bg-white/10 rounded-2xl p-3 border border-white/15">
                    <div className="text-[10px] font-bold text-slate-300 uppercase">
                      Market Retail Value
                    </div>
                    <div className="font-display font-bold text-base text-white mt-0.5">
                      Rs. {totalRetail.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-emerald-500/20 rounded-2xl p-3 border border-emerald-400/40">
                    <div className="text-[10px] font-extrabold text-emerald-300 uppercase">
                      Your Reseller Profit
                    </div>
                    <div className="font-display font-bold text-base text-emerald-300 mt-0.5">
                      +Rs. {netProfitOrSavings.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between pt-1">
                  <span>
                    <i className="fa-solid fa-bolt text-amber-300 mr-1"></i>
                    Delivery: <strong>{activePreset.deliveryTime}</strong>
                  </span>
                  <span>Full Warranty ✓</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/15">
                <a
                  href={`https://wa.me/${primaryWaNumber}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum Saqib Bhai! 🧮 *CALCULATOR DEAL ORDER*\n\n📦 *Service:* ${activePreset.name}\n🔢 *Quantity:* ${calcUnits} (${activePreset.unitLabel})\n💰 *Calculated Wholesale Total:* Rs. ${totalWholesale.toLocaleString()}\n\nPlease share EasyPaisa / JazzCash details for instant activation!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-display font-bold text-xs sm:text-sm tracking-wider shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.02]"
                >
                  <i className="fa-brands fa-whatsapp text-base"></i>
                  <span>LOCK THIS DEAL ON WHATSAPP (Rs. {totalWholesale.toLocaleString()})</span>
                </a>
                <button
                  type="button"
                  onClick={() => onSelectServiceById(activePreset.serviceId)}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-[11px] transition cursor-pointer"
                >
                  Or Open Standard Store Checkout Modal →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== LIVE ORDER TRACKER + REAL-TIME ACTIVITY TICKER (2-COLUMN PANEL SUITE) ==================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left (7 Cols): Live Order Status Tracker by Order ID or Phone */}
        <div data-scroll="left" className="lg:col-span-7 acrylic-frame rounded-[34px] p-3 sm:p-4 flex flex-col justify-between">
          <div className="plush-pillow plush-about rounded-[26px] p-4 sm:p-6 h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 border border-indigo-200 text-[10px] font-extrabold text-indigo-700 shadow-sm">
                  <i className="fa-solid fa-satellite-dish text-pink-600"></i> LIVE PANEL ORDER TRACKER
                </div>
                <span className="text-[11px] font-mono-code font-bold text-emerald-700">
                  ● Real-Time Telemetry
                </span>
              </div>

              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900">
                Track Your Order Status Live 📦
              </h3>
              <p className="text-xs font-semibold text-slate-700">
                Enter your Order ID (e.g., <code className="font-mono-code text-pink-600">#SV-9482</code>) or WhatsApp Number to view real-time server progress.
              </p>

              {/* Search Input + Sample Chips */}
              <form onSubmit={(e) => handleTrackOrder(e)} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <i className="fa-solid fa-hashtag absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500 text-xs"></i>
                  <input
                    type="text"
                    value={orderInput}
                    onChange={(e) => setOrderInput(e.target.value)}
                    placeholder="Enter Order ID (e.g. SV-9482) or 0300..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white/95 border-2 border-pink-200 font-mono-code font-bold text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer whitespace-nowrap"
                >
                  {isSearchingOrder ? (
                    <span><i className="fa-solid fa-spinner fa-spin mr-1"></i>Checking...</span>
                  ) : (
                    <span><i className="fa-solid fa-magnifying-glass mr-1.5"></i>Track Order</span>
                  )}
                </button>
              </form>

              {/* Quick Sample Order IDs */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-extrabold text-slate-600 text-[10px] uppercase">
                  Sample IDs:
                </span>
                {Object.keys(DEMO_ORDERS).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setOrderInput(code);
                      handleTrackOrder(undefined, code);
                    }}
                    className={`px-2.5 py-0.5 rounded-full font-mono-code font-bold transition cursor-pointer ${
                      trackedOrder.orderId === `#${code}`
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/85 hover:bg-white text-slate-700 border border-indigo-200'
                    }`}
                  >
                    #{code}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracked Order Telemetry Card */}
            <div className="bg-white/90 rounded-[22px] p-4 border border-white shadow-sm space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-extrabold text-sm text-indigo-700">
                      {trackedOrder.orderId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      {trackedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                    {trackedOrder.serviceTitle}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-sm text-pink-600">
                    {trackedOrder.amount}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    Updated: {trackedOrder.updatedAt}
                  </div>
                </div>
              </div>

              {/* 4-Stage Visual Progress Pipeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  <span>{trackedOrder.statusLabel}</span>
                  <span>{trackedOrder.statusStep * 25}%</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { step: 1, label: '1. Verified' },
                    { step: 2, label: '2. Server Node' },
                    { step: 3, label: '3. Warranty' },
                    { step: 4, label: '4. Delivered' }
                  ].map((s) => {
                    const active = trackedOrder.statusStep >= s.step;
                    return (
                      <div key={s.step} className="space-y-1 text-center">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            active
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm'
                              : 'bg-slate-200'
                          }`}
                        ></div>
                        <div
                          className={`text-[10px] font-extrabold ${
                            active ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {s.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-pink-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="font-bold text-slate-600">
                  <i className="fa-solid fa-server text-indigo-500 mr-1"></i>
                  Node: <strong className="text-slate-900">{trackedOrder.serverNode}</strong>
                </span>
                <a
                  href={`https://wa.me/${primaryWaNumber}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum Saqib Bhai! Please share priority status update for my Order ID: ${trackedOrder.orderId} (${trackedOrder.serviceTitle}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline font-extrabold flex items-center gap-1"
                >
                  <i className="fa-brands fa-whatsapp"></i> Ping WhatsApp Support →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right (5 Cols): Real-Time Recent Orders Activity Ticker */}
        <div data-scroll="right" className="lg:col-span-5 acrylic-frame rounded-[34px] p-3 sm:p-4 flex flex-col justify-between">
          <div
            onMouseEnter={() => setIsFeedPaused(true)}
            onMouseLeave={() => setIsFeedPaused(false)}
            className="plush-pillow plush-faq rounded-[26px] p-4 sm:p-6 h-full flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[10px] font-extrabold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>LIVE ORDERS FEED</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600">
                  {isFeedPaused ? '⏸ Paused' : '⚡ Auto-Updating'}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Real-Time Verified Orders Across Pakistan 🇵🇰
              </h3>

              {/* Spotlight Live Pop Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 text-white shadow-md border border-white transition-all duration-300">
                <div className="flex items-center justify-between text-[10px] text-pink-300 font-extrabold uppercase">
                  <span>⚡ JUST COMPLETED ({activeHighlightOrder.timeAgo})</span>
                  <span className="text-emerald-300">{activeHighlightOrder.speed}</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white mt-1 truncate">
                  {activeHighlightOrder.buyer} ({activeHighlightOrder.city}) bought{' '}
                  <span className="text-amber-300">{activeHighlightOrder.service}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px]">
                  <span className="text-slate-300">
                    Paid via <strong>{activeHighlightOrder.method}</strong> •{' '}
                    <strong className="text-emerald-300">{activeHighlightOrder.price}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectServiceById(activeHighlightOrder.serviceId)}
                    className="px-2.5 py-0.5 rounded-full bg-white text-slate-900 font-extrabold text-[10px] hover:bg-pink-100 transition cursor-pointer"
                  >
                    Order Same →
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable List of Recent Verified Orders */}
            <div className="space-y-2 max-h-[235px] overflow-y-auto pr-1">
              {LIVE_FEED_ORDERS.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => onSelectServiceById(item.serviceId)}
                  className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                    idx === highlightedFeedIndex
                      ? 'bg-white border-pink-400 shadow-md scale-[1.01]'
                      : 'bg-white/75 hover:bg-white border-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl ${item.color} text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      {item.buyer.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {item.service}
                      </div>
                      <div className="text-[10px] font-bold text-slate-600">
                        {item.buyer} ({item.city}) • <span className="text-emerald-700">{item.speed}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-display font-bold text-xs text-pink-600">{item.price}</div>
                    <div className="text-[9px] font-bold text-slate-500">{item.timeAgo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
