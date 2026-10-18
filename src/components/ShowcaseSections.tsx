/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreService } from '../data/defaultCatalog';
import {
  RiOpenaiFill,
  SiGooglegemini,
  FaScissors,
  SiWhatsapp
} from './BrandIcons';

interface ShowcaseSectionsProps {
  onSelectServiceById: (id: string) => void;
  onQuickFilter: (category: any, keyword?: string) => void;
  onPlayPop: (freq?: number) => void;
  servicesCatalog: StoreService[];
}

export const ShowcaseSections: React.FC<ShowcaseSectionsProps> = ({
  onSelectServiceById,
  onQuickFilter,
  onPlayPop
}) => {
  return (
    <div className="space-y-7 pt-2">
      {/* ==================== SECTION 1: FLAGSHIP AI PRO ACCOUNTS SPOTLIGHT (CHATGPT PRO, GEMINI 18M PRO, CAPCUT & LOVABLE) ==================== */}
      <section data-scroll="up" className="acrylic-frame rounded-[34px] p-3 sm:p-5 space-y-4">
        <div className="plush-pillow plush-about rounded-[26px] p-4 sm:p-6 space-y-5">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-pink-200/80 pb-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 border border-pink-200 text-[10px] font-extrabold text-purple-700 shadow-sm">
                <i className="fa-solid fa-crown text-amber-500"></i> OFFICIAL AI &amp; CREATOR PRO ACCOUNTS
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                ChatGPT Plus, Gemini 18M Pro &amp; AI Suite 🔥
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                100% Official Subscriptions activated on your own Gmail or private workspace with Full Replacement Warranty.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onQuickFilter('capcut_ai', '')}
              className="self-center md:self-auto px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-extrabold text-xs shadow-md hover:scale-105 transition whitespace-nowrap cursor-pointer"
            >
              <i className="fa-solid fa-wand-magic-sparkles mr-1.5"></i>View All 12+ AI Tools
            </button>
          </div>

          {/* 3 Flagship Spotlight Cards: ChatGPT Plus/Pro, Gemini 18M Pro, Lovable + CapCut + ElevenLabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Flagship 1: ChatGPT Plus / Pro */}
            <div
              data-scroll="zoom"
              onMouseEnter={() => onPlayPop(580)}
              className="acrylic-frame acrylic-interactive rounded-[28px] p-2.5 flex flex-col justify-between bg-white/70"
            >
              <div className="plush-pillow plush-ai rounded-[22px] p-4 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="fluffy-orb w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 text-white flex items-center justify-center border-2 border-white shadow-md">
                      <RiOpenaiFill className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-sm">
                      🤖 MOST POPULAR AI
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      ChatGPT Plus &amp; Pro (GPT-4o / o3)
                    </h3>
                    <p className="text-[11px] font-semibold text-emerald-900 mt-0.5">
                      Official OpenAI Plus access with image generation, voice &amp; coding.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600"></i>
                      <span>Unlimited GPT-4o, o3-mini &amp; Deep Research</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600"></i>
                      <span>DALL·E 3 HD Image &amp; File Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600"></i>
                      <span>Shared (Rs. 550) &amp; Private Mail (Rs. 2,200)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-900/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[9px] font-extrabold uppercase text-slate-600">Starting From</span>
                    <span className="font-display font-bold text-lg text-emerald-800">Rs. 550 / mo</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectServiceById('chatgpt-plus')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <SiWhatsapp className="w-3.5 h-3.5" />Get ChatGPT
                  </button>
                </div>
              </div>
            </div>

            {/* Flagship 2: Google Gemini 18-Month Pro */}
            <div
              data-scroll="zoom"
              onMouseEnter={() => onPlayPop(620)}
              className="scroll-delay-1 acrylic-frame acrylic-interactive rounded-[28px] p-2.5 flex flex-col justify-between bg-white/70"
            >
              <div className="plush-pillow plush-website rounded-[22px] p-4 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="fluffy-orb w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center border-2 border-white shadow-md">
                      <SiGooglegemini className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold shadow-sm">
                      ✨ 18 MONTHS + 2TB
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Google Gemini 18-Month Pro Plan
                    </h3>
                    <p className="text-[11px] font-semibold text-blue-900 mt-0.5">
                      Activated directly on your personal Gmail account with 2TB Cloud!
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-blue-600"></i>
                      <span>1.5 Years (18 Months) Official Validity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-blue-600"></i>
                      <span>2,000 GB (2TB) Google Drive &amp; Photos Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-blue-600"></i>
                      <span>Gemini Advanced in Docs, Gmail &amp; Veo Video</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-900/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[9px] font-extrabold uppercase text-slate-600">18-Month Deal</span>
                    <span className="font-display font-bold text-lg text-indigo-800">Rs. 1,800 Only</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectServiceById('gemini-18m-pro')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <SiWhatsapp className="w-3.5 h-3.5" />Get Gemini Pro
                  </button>
                </div>
              </div>
            </div>

            {/* Flagship 3: CapCut Pro, Lovable Pro & ElevenLabs */}
            <div
              data-scroll="zoom"
              onMouseEnter={() => onPlayPop(660)}
              className="scroll-delay-2 acrylic-frame acrylic-interactive rounded-[28px] p-2.5 flex flex-col justify-between bg-white/70"
            >
              <div className="plush-pillow plush-snap rounded-[22px] p-4 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="fluffy-orb w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-600 to-slate-900 text-white flex items-center justify-center border-2 border-white shadow-md">
                      <FaScissors className="w-5 h-5 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-pink-600 text-white text-[10px] font-extrabold shadow-sm">
                      🔥 CREATOR BUNDLE
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      CapCut Pro, Lovable &amp; ElevenLabs
                    </h3>
                    <p className="text-[11px] font-semibold text-purple-900 mt-0.5">
                      Complete toolkit for TikTok/YouTube creators &amp; AI developers.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-purple-600"></i>
                      <span>CapCut Pro (iOS/Android/PC) — Rs. 350</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-purple-600"></i>
                      <span>Lovable Pro AI Builder &amp; Claude 3.7 Pro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-purple-600"></i>
                      <span>ElevenLabs 300k Credits (No Expiry) &amp; Muse 1B</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-900/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[9px] font-extrabold uppercase text-slate-600">CapCut Pro</span>
                    <span className="font-display font-bold text-lg text-purple-900">Rs. 350 / mo</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectServiceById('capcut-pro')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <SiWhatsapp className="w-3.5 h-3.5" />Order Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 2: BLOG / EDITORIAL SPOTLIGHT #1 (LEFT IMAGE SHOWCASE + RIGHT STORY TEXT) ==================== */}
      <section data-scroll="up" className="acrylic-frame rounded-[34px] p-3 sm:p-4">
        <div className="plush-pillow plush-capcut rounded-[26px] p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Side (5 Cols): Featured Blog Image Card + Glass Overlay */}
            <div
              data-scroll="left"
              onMouseEnter={() => onPlayPop(560)}
              className="lg:col-span-5 relative rounded-[24px] overflow-hidden border-2 border-white shadow-xl bg-slate-950 group"
            >
              {/* High-Resolution Featured Blog Image */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=85"
                  alt="AI & Creator Pro Workstation"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent"></div>

                {/* Top Floating Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/30 text-[10px] font-extrabold tracking-wider uppercase text-pink-300 shadow">
                    ✨ CREATOR BLOG #01
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-mono-code font-extrabold shadow">
                    ● 85% OFF RETAIL
                  </span>
                </div>

                {/* Bottom Overlay Author & Workstation Card */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 space-y-2">
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 border border-white/25 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white flex-shrink-0 shadow">
                      <img
                        src="https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png"
                        alt="Muhammad Saqib"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-[center_15%]"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate">
                        Saqib Visuals AI Workstation
                      </div>
                      <div className="text-[10px] text-pink-200 font-semibold">
                        Gemini 18M • ChatGPT Plus • CapCut 4K
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-400/40 rounded-xl px-2.5 py-1.5">
                      <div className="text-[9px] font-extrabold uppercase text-emerald-300">Google One Cloud</div>
                      <div className="font-display font-bold text-xs text-white">2,000 GB + Gemini</div>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-md border border-pink-400/40 rounded-xl px-2.5 py-1.5">
                      <div className="text-[9px] font-extrabold uppercase text-pink-300">AI Voice &amp; Tokens</div>
                      <div className="font-display font-bold text-xs text-white">1B Muse + 300k</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side (7 Cols): Blog Article & Guide Content */}
            <div data-scroll="right" className="lg:col-span-7 space-y-3.5 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-bold text-indigo-700">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-[10px]">
                  FEATURED ARTICLE
                </span>
                <span>AI &amp; Creator Guide</span>
                <span aria-hidden="true">·</span>
                <span>3 Min Read</span>
                <span aria-hidden="true">·</span>
                <span>By Muhammad Saqib</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                How Pakistani Creators &amp; Freelancers Save 85% on Official ChatGPT Plus, Gemini 18M Pro &amp; CapCut Pro
              </h3>

              <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                Buying international subscriptions like <strong>ChatGPT Plus ($20/mo)</strong>, <strong>Lovable Pro</strong>, or <strong>CapCut Pro</strong> directly with a bank card costs over Rs. 6,000+ per month with heavy taxes. At <strong>Saqib Visuals</strong>, we provide 100% genuine, official workspace and personal email activations starting from just <strong>Rs. 350</strong>!
              </p>

              <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                Whether you are running a faceless YouTube automation channel using <strong>ElevenLabs 300k Credits (No Expiry)</strong> &amp; <strong>CapCut Pro 4K</strong>, building apps with <strong>Lovable Pro &amp; Claude 3.7 Sonnet</strong>, or upgrading your personal Gmail with <strong>Google Gemini 18-Month Pro + 2TB Storage</strong>, every subscription comes with our <strong>Full Period Replacement Warranty</strong>.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => onSelectServiceById('gemini-18m-pro')}
                  className="px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer"
                >
                  <i className="fa-solid fa-wand-magic-sparkles mr-1.5"></i>Activate Gemini 18M (Rs. 1,800)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectServiceById('chatgpt-plus')}
                  className="px-4 py-2.5 rounded-full bg-white hover:bg-pink-50 text-slate-900 border border-indigo-200 font-extrabold text-xs shadow-sm transition cursor-pointer"
                >
                  <i className="fa-solid fa-robot text-emerald-600 mr-1.5"></i>Get ChatGPT Plus (Rs. 550)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 3: BLOG / EDITORIAL SPOTLIGHT #2 (LEFT STORY TEXT + RIGHT IMAGE SHOWCASE) ==================== */}
      <section data-scroll="up" className="acrylic-frame rounded-[34px] p-3 sm:p-4">
        <div className="plush-pillow plush-sim-search rounded-[26px] p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Side (7 Cols): Blog Article & Guide Content */}
            <div data-scroll="left" className="lg:col-span-7 space-y-3.5 text-center lg:text-left order-2 lg:order-1">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-bold text-rose-700">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]">
                  INSIDER BLOG
                </span>
                <span>Monetization &amp; Telecom Insights</span>
                <span aria-hidden="true">·</span>
                <span>4 Min Read</span>
                <span aria-hidden="true">·</span>
                <span>Saqib Visuals VIP Desk</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                Unlock TikTok UK/USA Creator Rewards, Global Ad Agency Accounts &amp; 2026 Franchise Verification
              </h3>

              <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                Want to earn in Dollars/Pounds from Pakistan on TikTok? Our <strong>Fresh TikTok UK &amp; USA Monetizable Accounts</strong> work smoothly without any VPN so you can qualify for the Creator Rewards Program and TikTok Shop. Pair it with our <strong>Verified TikTok &amp; Facebook Ad Agency Accounts</strong> to run high-converting ads with zero ban risk.
              </p>

              <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                Need urgent telecom or official verification? Alongside our free public SIM tool, our <strong>24/7 VIP Franchise &amp; NADRA Desk</strong> provides 100% confidential <strong>2026 Fresh SIM Owner Details, Call History (CDR), Live Location Pinpoint, Family Tree (FRC), and Passport Travel History</strong> directly to your WhatsApp within 15–30 minutes.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => onSelectServiceById('tiktok-uk-usa-acc')}
                  className="px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer"
                >
                  <i className="fa-brands fa-tiktok mr-1.5"></i>Get TikTok UK/USA Account
                </button>
                <button
                  type="button"
                  onClick={() => onSelectServiceById('sim-owner-details')}
                  className="px-4 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs shadow-sm transition cursor-pointer"
                >
                  <i className="fa-solid fa-satellite-dish mr-1.5"></i>Order Fresh SIM / CDR Info
                </button>
              </div>
            </div>

            {/* Right Side (5 Cols): Featured Blog Image Card + Glass Overlay */}
            <div
              data-scroll="right"
              onMouseEnter={() => onPlayPop(610)}
              className="lg:col-span-5 order-1 lg:order-2 relative rounded-[24px] overflow-hidden border-2 border-white shadow-xl bg-slate-950 group"
            >
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=85"
                  alt="TikTok Monetization & Telecom Analytics"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

                {/* Top Floating Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/30 text-[10px] font-extrabold tracking-wider uppercase text-amber-300 shadow">
                    🚀 INSIDER GUIDE #02
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[10px] font-mono-code font-extrabold shadow">
                    UK • USA • PAK
                  </span>
                </div>

                {/* Bottom Overlay Cards */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 space-y-2">
                  <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 border border-white/25 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-base shadow">
                        <i className="fa-brands fa-tiktok"></i>
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">UK Creator Rewards</div>
                        <div className="text-[10px] text-emerald-300 font-bold">No VPN Needed • Tax-Free</div>
                      </div>
                    </div>
                    <span className="font-mono-code font-bold text-xs text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-lg border border-amber-300/30">
                      $1.20+ RPM
                    </span>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 border border-white/25 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-base shadow">
                        <i className="fa-solid fa-satellite-dish"></i>
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">2026 Franchise &amp; NADRA</div>
                        <div className="text-[10px] text-pink-200 font-bold">Live SIM • CDR • FRC • Passport</div>
                      </div>
                    </div>
                    <span className="font-mono-code font-bold text-[10px] text-emerald-300 bg-emerald-400/20 px-2 py-0.5 rounded-lg border border-emerald-300/30">
                      15 MIN PDF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 4: 1 - 2 - 3 HOW IT WORKS (EASY 3-STEP ORDER FLOW) ==================== */}
      <section data-scroll="up" className="space-y-3.5">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-white text-[10px] font-extrabold text-pink-600 shadow-sm">
            <i className="fa-solid fa-bolt text-amber-500"></i> SUPER EASY 3-STEP PROCESS
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How To Order Any Service in <span className="text-pink-600 font-display">1 – 2 – 3 Steps</span> 🚀
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 max-w-xl mx-auto">
            No complicated forms or credit cards needed—get your account, boost, or report on WhatsApp in 5 minutes!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* STEP 1 */}
          <div
            data-scroll="zoom"
            onMouseEnter={() => onPlayPop(540)}
            className="acrylic-frame acrylic-interactive rounded-[30px] p-2.5 relative"
          >
            <div className="plush-pillow plush-srv-1 rounded-[24px] p-5 h-full flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="fluffy-orb w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 text-white font-display font-bold text-xl flex items-center justify-center border-2 border-white shadow-lg">
                  1
                </div>
                <span className="px-3 py-1 rounded-full bg-white/85 border border-white text-[10px] font-extrabold text-rose-700 uppercase">
                  STEP 01 • CHOOSE
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  1. Select Your Package
                </h3>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  Browse our 31+ services (ChatGPT Plus, Gemini 18M, CapCut Pro, TikTok Likes, or SIM/NADRA Info), pick your package tier, and click <strong>Buy Now</strong>.
                </p>
              </div>
              <div className="pt-2 border-t border-rose-900/10 flex items-center gap-1.5 text-[11px] font-extrabold text-rose-700">
                <i className="fa-solid fa-hand-pointer"></i>
                <span>Takes only 10 seconds</span>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div
            data-scroll="zoom"
            onMouseEnter={() => onPlayPop(600)}
            className="scroll-delay-1 acrylic-frame acrylic-interactive rounded-[30px] p-2.5 relative"
          >
            <div className="plush-pillow plush-srv-4 rounded-[24px] p-5 h-full flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="fluffy-orb w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-display font-bold text-xl flex items-center justify-center border-2 border-white shadow-lg">
                  2
                </div>
                <span className="px-3 py-1 rounded-full bg-white/85 border border-white text-[10px] font-extrabold text-blue-700 uppercase">
                  STEP 02 • PAYMENT
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  2. Pay via EasyPaisa / JazzCash
                </h3>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  Your order opens directly in <strong>Muhammad Saqib&apos;s WhatsApp (+92 347 8936242)</strong>. Send payment via EasyPaisa, JazzCash, SadaPay, Bank, or USDT.
                </p>
              </div>
              <div className="pt-2 border-t border-blue-900/10 flex items-center gap-1.5 text-[11px] font-extrabold text-blue-700">
                <i className="fa-solid fa-shield-halved"></i>
                <span>100% Safe &amp; Verified Accounts</span>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div
            data-scroll="zoom"
            onMouseEnter={() => onPlayPop(660)}
            className="scroll-delay-2 acrylic-frame acrylic-interactive rounded-[30px] p-2.5 relative"
          >
            <div className="plush-pillow plush-srv-3 rounded-[24px] p-5 h-full flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="fluffy-orb w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-display font-bold text-xl flex items-center justify-center border-2 border-white shadow-lg">
                  3
                </div>
                <span className="px-3 py-1 rounded-full bg-white/85 border border-white text-[10px] font-extrabold text-emerald-700 uppercase">
                  STEP 03 • DELIVERY
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  3. Instant 5-Minute Delivery
                </h3>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  Within <strong>5 to 15 minutes</strong>, receive your Pro login credentials, Gmail activation, viral SMM boost, or confidential PDF report with full warranty!
                </p>
              </div>
              <div className="pt-2 border-t border-emerald-900/10 flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800">
                <i className="fa-solid fa-circle-check"></i>
                <span>Full Period Warranty Included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 5: 100% TRUSTED SELLER & VERIFIED REVIEWS PROOF ==================== */}
      <section data-scroll="up" className="acrylic-frame rounded-[34px] p-3 sm:p-5 space-y-4">
        <div className="plush-pillow plush-hero rounded-[26px] p-4 sm:p-6 space-y-5">
          {/* Top Trust Shield Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-pink-200/80 pb-4 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl shadow-lg border-2 border-white flex-shrink-0">
                <i className="fa-solid fa-shield-check"></i>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                  <i className="fa-solid fa-certificate"></i> 100% VERIFIED PAKISTANI DIGITAL STORE
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  Why 18,500+ Creators &amp; Clients Trust Muhammad Saqib
                </h2>
                <p className="text-xs font-semibold text-slate-700">
                  Real WhatsApp Deal History • Zero Scam Guarantee • Instant Replacement Warranty
                </p>
              </div>
            </div>

            {/* Rating Summary Box */}
            <div className="bg-white/85 px-4 py-2.5 rounded-2xl border border-white shadow-sm text-center flex-shrink-0">
              <div className="text-amber-500 text-sm tracking-wider">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <div className="text-xs font-extrabold text-slate-900 mt-0.5">4.98 / 5.0 Rating</div>
              <div className="text-[10px] font-bold text-emerald-700">Based on 3,400+ WA Reviews</div>
            </div>
          </div>

          {/* 4 Trust Pillars Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white/80 p-3 rounded-2xl border border-white text-center space-y-1 shadow-sm">
              <i className="fa-solid fa-award text-pink-600 text-lg"></i>
              <div className="text-xs font-extrabold text-slate-900">Full Warranty</div>
              <div className="text-[10px] font-semibold text-slate-600">Instant replacement if any issue</div>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-white text-center space-y-1 shadow-sm">
              <i className="fa-solid fa-lock text-emerald-600 text-lg"></i>
              <div className="text-xs font-extrabold text-slate-900">No Password Needed</div>
              <div className="text-[10px] font-semibold text-slate-600">Only link/username for SMM</div>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-white text-center space-y-1 shadow-sm">
              <i className="fa-solid fa-user-shield text-blue-600 text-lg"></i>
              <div className="text-xs font-extrabold text-slate-900">100% Privacy</div>
              <div className="text-[10px] font-semibold text-slate-600">Confidential SIM &amp; CDR reports</div>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-white text-center space-y-1 shadow-sm">
              <i className="fa-brands fa-whatsapp text-teal-600 text-lg"></i>
              <div className="text-xs font-extrabold text-slate-900">Live WA Support</div>
              <div className="text-[10px] font-semibold text-slate-600">Direct chat with Muhammad Saqib</div>
            </div>
          </div>

          {/* 3 Verified Client Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white/85 p-4 rounded-2xl border border-white shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 text-xs">★★★★★</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                    Verified Buyer ✓
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  &ldquo;Maine Saqib bhai se <strong>Google Gemini 18-Month Pro</strong> aur <strong>CapCut Pro</strong> liya. Sirf 5 minute mein mere apne Gmail par 2TB storage ke sath activate ho gaya. 100% trusted!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-pink-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center">
                  HA
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Hamza Ali — Lahore</div>
                  <div className="text-[10px] font-bold text-pink-600">Bought Gemini 18M &amp; CapCut Pro</div>
                </div>
              </div>
            </div>

            <div className="bg-white/85 p-4 rounded-2xl border border-white shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 text-xs">★★★★★</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                    Verified Buyer ✓
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  &ldquo;Bought <strong>TikTok UK Account + 10K Followers</strong> and <strong>ElevenLabs 300k Credits</strong> for my faceless automation channel. Best wholesale rates in Pakistan!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-pink-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  ZK
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Zainab Khan — Islamabad</div>
                  <div className="text-[10px] font-bold text-purple-600">Bought TikTok UK &amp; ElevenLabs</div>
                </div>
              </div>
            </div>

            <div className="bg-white/85 p-4 rounded-2xl border border-white shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 text-xs">★★★★★</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                    Verified Buyer ✓
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  &ldquo;Urgent <strong>Fresh 2026 SIM Owner &amp; CDR report</strong> chahiye thi aur sath <strong>ChatGPT Plus</strong>. EasyPaisa bhejte hi 10 mins mein WhatsApp par PDF report mil gayi. Highly recommended!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-pink-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center">
                  UT
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Usman Tariq — Karachi</div>
                  <div className="text-[10px] font-bold text-emerald-700">Bought Fresh SIM CDR &amp; ChatGPT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
