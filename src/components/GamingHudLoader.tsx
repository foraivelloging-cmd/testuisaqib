'use client';

import React, { useEffect, useState } from 'react';

export interface GamingHudLoaderProps {
  brandOwnerName?: string;
  brandAccentName?: string;
  portraitUrl?: string;
  tagline?: string;
}

export function GamingHudLoader({
  brandOwnerName = 'Muhammad Saqib',
  brandAccentName = 'Saqib Visuals',
  portraitUrl = 'https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png?tr=w-720,f-auto,q-80',
  tagline = 'SMM STORE • CAPCUT • AI TOOLS',
}: GamingHudLoaderProps) {
  const [percent, setPercent] = useState(18);
  const [statusText, setStatusText] = useState('BOOTING QUANTUM ENGINE...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isGone, setIsGone] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPercent(52);
      setStatusText('OPTIMIZING HIGH-SPEED ASSETS...');
    }, 180);

    const timer2 = setTimeout(() => {
      setPercent(88);
      setStatusText('CONNECTING SECURE DATABASE...');
    }, 380);

    const timer3 = setTimeout(() => {
      setPercent(100);
      setStatusText('SYSTEM ONLINE // READY!');
    }, 580);

    // Auto fade-out after smooth loading animation
    const timerFade = setTimeout(() => {
      setIsFadingOut(true);
    }, 850);

    // Completely unmount from DOM to free memory
    const timerGone = setTimeout(() => {
      setIsGone(true);
    }, 1250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerFade);
      clearTimeout(timerGone);
    };
  }, []);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => setIsGone(true), 350);
  };

  if (isGone) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#05070e] text-white overflow-hidden select-none font-sans transition-all duration-400 ease-out cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Cyber Grid & Ambient Neon Orbs */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-pink-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Futuristic Corner Brackets (HUD Reticles) */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex flex-col gap-1 pointer-events-none">
        <div className="w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-lg" />
        <span className="text-[9px] font-mono tracking-widest text-cyan-400/70 uppercase">
          SYS.VER // 2026.4
        </span>
      </div>

      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex flex-col items-end gap-1 pointer-events-none">
        <div className="w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-r-2 border-pink-500/80 rounded-tr-lg" />
        <span className="text-[9px] font-mono tracking-widest text-pink-400/70 uppercase">
          FPS // 120 ULTRA
        </span>
      </div>

      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 flex flex-col gap-1 pointer-events-none">
        <span className="text-[9px] font-mono tracking-widest text-cyan-400/70 uppercase">
          LATENCY // 0.04MS
        </span>
        <div className="w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-lg" />
      </div>

      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 flex flex-col items-end gap-1 pointer-events-none">
        <span className="text-[9px] font-mono tracking-widest text-emerald-400/70 uppercase">
          STATUS // READY
        </span>
        <div className="w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-pink-500/80 rounded-br-lg" />
      </div>

      {/* Center Gaming HUD Core Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-[360px] sm:max-w-[440px] mx-4 p-6 sm:p-8 rounded-[28px] bg-slate-950/85 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.18)] flex flex-col items-center text-center transition-transform duration-300"
      >
        {/* Holographic Glowing Ring with Avatar */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Outer Rotating Cyber Dashes */}
          <div
            className="absolute -inset-3.5 rounded-full border border-dashed border-cyan-400/60 animate-spin"
            style={{ animationDuration: '6s' }}
          />
          {/* Inner Counter-Rotating Hex Ring */}
          <div
            className="absolute -inset-1.5 rounded-full border-2 border-pink-500/50 animate-spin"
            style={{ animationDuration: '4s', animationDirection: 'reverse' }}
          />

          {/* Central Portrait / Core Orb */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/90 shadow-[0_0_24px_rgba(236,72,153,0.65)] bg-slate-900 flex items-center justify-center">
            <img
              src={portraitUrl || 'https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png?tr=w-720,f-auto,q-80'}
              alt={brandOwnerName}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Fallback Initials */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 to-pink-900 text-cyan-300 -z-10 text-2xl font-black">
              {brandOwnerName.slice(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Glowing Ping Dot */}
          <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_10px_#10b981] animate-ping" />
          <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950" />
        </div>

        {/* Brand Titles in Cyber Specimen Style */}
        <div className="space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-[9.5px] font-mono tracking-widest text-cyan-300 uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {brandAccentName.toUpperCase()} ENGINE
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-pink-300 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]">
            {brandOwnerName.toUpperCase()}
          </h1>
          <p className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
            {tagline}
          </p>
        </div>

        {/* Cyber Neon Ink / Energy Progress Bar */}
        <div className="w-full space-y-2">
          {/* Status Label + Percentage Counter */}
          <div className="flex items-center justify-between text-[10.5px] font-mono font-bold text-slate-300 px-0.5">
            <span className="flex items-center gap-1.5 text-cyan-400 truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              {statusText}
            </span>
            <span className="text-pink-400 font-extrabold tracking-wider ml-2">
              {percent}%
            </span>
          </div>

          {/* High-Tech Slanted Cyber Track */}
          <div className="relative w-full h-3 sm:h-3.5 rounded-full bg-slate-900/90 border border-cyan-500/40 p-0.5 overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
            {/* The Animated Energy Ink Fill */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 shadow-[0_0_14px_rgba(236,72,153,0.85)] relative overflow-hidden transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            >
              {/* Laser Beam Shine Animation */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent"
                style={{
                  animation: 'laserSweep 1s linear infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Hardware Spec Pills & Click to Enter */}
        <div className="mt-5 pt-3.5 border-t border-white/10 w-full flex items-center justify-between text-[9px] font-mono text-slate-400">
          <span className="text-cyan-400">● TURBOPACK 16</span>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-pink-300 hover:text-white font-bold tracking-wider hover:underline transition cursor-pointer flex items-center gap-1"
          >
            ENTER NOW ➔
          </button>
          <span className="text-emerald-400">● 100% SECURE</span>
        </div>
      </div>

      {/* Global Embedded Keyframe Style for Laser Sweep */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes laserSweep {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `,
        }}
      />
    </div>
  );
}

export default GamingHudLoader;
