'use client';

import React, { useState, useEffect } from 'react';
import {
  FaXmark,
  FaBolt,
  FaClock,
  FaCopy,
  FaCheck,
  FaArrowRight,
  FaGift
} from 'react-icons/fa6';
import { SiWhatsapp } from 'react-icons/si';
import { SitePromoPopupConfig, SiteContactConfig } from '../types/siteConfig';

interface PromoAnnouncementModalProps {
  config?: SitePromoPopupConfig;
  contactConfig?: SiteContactConfig;
  onOpenAddFunds?: () => void;
  showToast: (msg: string) => void;
  playPopSound?: (freq?: number) => void;
  previewMode?: boolean; // When true, always displays regardless of session
  onClosePreview?: () => void;
}

export const PromoAnnouncementModal: React.FC<PromoAnnouncementModalProps> = ({
  config,
  contactConfig,
  onOpenAddFunds,
  showToast,
  playPopSound,
  previewMode = false,
  onClosePreview,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(() => (config?.countdownMinutes || 15) * 60);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Mount logic: check if enabled and if already dismissed in this session
  useEffect(() => {
    if (previewMode) {
      setIsOpen(true);
      return;
    }

    if (!config || !config.enabled) {
      setIsOpen(false);
      return;
    }

    // Check session storage
    if (typeof window !== 'undefined') {
      const alreadySeen = sessionStorage.getItem('saqib_promo_popup_seen');
      if (config.showOncePerSession && alreadySeen === 'true') {
        return;
      }

      // Small natural entrance delay for delightful smooth popup
      const timer = setTimeout(() => {
        setIsOpen(true);
        if (playPopSound) playPopSound(600);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [config?.enabled, config?.showOncePerSession, previewMode]);

  // Urgency Countdown Timer
  useEffect(() => {
    if (!isOpen || !config?.showCountdown) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, config?.showCountdown]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined' && !previewMode) {
      sessionStorage.setItem('saqib_promo_popup_seen', 'true');
    }
    if (onClosePreview) onClosePreview();
    if (playPopSound) playPopSound(300);
  };

  const handleCopyCoupon = () => {
    const code = config?.couponCode || 'SAQIB20';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setIsCopied(true);
        showToast(`🎉 Coupon "${code}" copied to clipboard!`);
        if (playPopSound) playPopSound(750);
        setTimeout(() => setIsCopied(false), 2500);
      });
    }
  };

  const handlePrimaryAction = () => {
    const action = config?.primaryBtnAction || 'whatsapp';

    if (action === 'whatsapp') {
      const phone = contactConfig?.whatsappNumberClean || '923478936242';
      const defaultMsg = `Assalam-o-Alaikum Muhammad Saqib! I saw your offer: "${config?.title || 'Special Discount'}". Please give me the special discount code: ${config?.couponCode || 'PROMO20'}.`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMsg)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      handleDismiss();
    } else if (action === 'addfunds') {
      handleDismiss();
      if (onOpenAddFunds) onOpenAddFunds();
    } else if (action === 'custom_url' && config?.primaryBtnUrl) {
      window.open(config.primaryBtnUrl, '_blank', 'noopener,noreferrer');
      handleDismiss();
    } else {
      handleDismiss();
    }
  };

  // Format MM:SS for countdown
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md sm:max-w-lg bg-gradient-to-b from-[#131a2e] via-[#0d1322] to-[#0a0e18] border border-pink-500/40 rounded-[32px] p-5 sm:p-7 shadow-2xl shadow-pink-500/20 text-white overflow-hidden animate-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Neon Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-pink-500/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header Strip: Close Button & Mode Badge */}
        <div className="flex items-center justify-between mb-3 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 text-white shadow-md shadow-pink-500/30">
            <FaBolt className="text-[11px] animate-pulse" />
            <span>{config?.badgeText || '🔥 SPECIAL 20% DISCOUNT'}</span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close Announcement Modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 shadow-sm"
          >
            <FaXmark className="text-sm" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20 space-y-3.5 z-10">
          {/* Optional Banner Photo */}
          {config?.showImage !== false && config?.imageUrl && (
            <div className="w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/15 relative shadow-md group">
              <img
                src={config.imageUrl}
                alt="Special Offer Banner"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback hide if broken URL
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>
            </div>
          )}

          {/* Heading Title */}
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
              {config?.title || 'Limited Time Flash Offer — Save 20% Today!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1.5 font-medium whitespace-pre-line">
              {config?.description ||
                'Order any AI Pro Tool, CapCut Pro, or TikTok Agency Account right now and enjoy an instant 20% discount on your first order. WhatsApp Saqib directly!'}
            </p>
          </div>

          {/* Optional Countdown Urgency Strip */}
          {config?.showCountdown !== false && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-950/90 to-rose-950/70 border border-rose-500/40 flex items-center justify-between text-xs shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="font-extrabold uppercase text-rose-300 text-[10px] sm:text-xs tracking-wider flex items-center gap-1.5">
                  <FaClock />
                  <span>Offer Ends In:</span>
                </span>
              </div>
              <div className="font-mono font-black text-sm sm:text-base text-rose-200 bg-rose-950/90 px-3 py-1 rounded-xl border border-rose-500/50 tracking-widest shadow-inner">
                {timeFormatted}
              </div>
            </div>
          )}

          {/* Optional 1-Click Coupon Code Box */}
          {config?.showCoupon !== false && config?.couponCode && (
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-indigo-500/40 flex items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <FaGift className="text-sm" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Discount Voucher Code
                  </div>
                  <div className="font-mono font-black text-sm sm:text-base text-emerald-300 tracking-wider truncate">
                    {config.couponCode}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCoupon}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-400 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 active:scale-95"
              >
                {isCopied ? (
                  <>
                    <FaCheck className="text-emerald-300" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <FaCopy />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-4 border-t border-white/10 space-y-2 z-10 mt-2">
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-pink-500 via-rose-600 to-indigo-600 hover:opacity-95 shadow-xl shadow-pink-500/30 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {config?.primaryBtnAction === 'whatsapp' ? (
              <SiWhatsapp className="text-base text-white" />
            ) : (
              <FaArrowRight className="text-xs" />
            )}
            <span>{config?.primaryBtnText || 'Claim 20% Off on WhatsApp'}</span>
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-[11px] font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              {config?.secondaryBtnText || 'Maybe Later / Skip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
