'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { StoreService, WebToolItem } from '@/src/data/defaultCatalog';
import { SiteSettingsConfig } from '@/src/components/AdminStepByStepSettingsHub';

// Dynamically import the main App ONLY when authenticated.
// This guarantees that zero admin code or components are downloaded before valid login!
const AuthenticatedAdminApp = dynamic(() => import('@/src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center text-white px-4">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 blur-xl opacity-60 animate-pulse"></div>
        <div className="w-14 h-14 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <i className="fa-solid fa-shield-halved text-pink-400 text-xl absolute"></i>
      </div>
      <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-indigo-400 font-extrabold text-sm sm:text-base tracking-widest uppercase">
        Loading Admin Command Center...
      </p>
      <span className="text-slate-400 text-xs mt-2 font-mono">Session Verified • Initializing Dashboard</span>
    </div>
  ),
});

interface AdminPortalClientProps {
  initialServices?: StoreService[];
  initialTools?: WebToolItem[];
  initialConfig?: SiteSettingsConfig;
}

export default function AdminPortalClient({
  initialServices,
  initialTools,
  initialConfig,
}: AdminPortalClientProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Active Lockout Countdown Timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Session verification on mount
  useEffect(() => {
    let active = true;
    async function verifyCurrentSession() {
      try {
        const storedToken = localStorage.getItem('saqib_admin_token');
        const headers: Record<string, string> = {};
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
        }
        const res = await fetch('/api/admin/auth', { headers });
        const data = await res.json();
        if (active) {
          if (data.authenticated) {
            setIsAuthenticated(true);
          } else if (data.revoked) {
            localStorage.removeItem('saqib_admin_token');
            setIsAuthenticated(false);
            setErrorMessage(data.reason || 'Admin session revoked by Superadmin.');
          }
          setIsCheckingAuth(false);
        }
      } catch {
        if (active) {
          setIsCheckingAuth(false);
        }
      }
    }
    verifyCurrentSession();
    return () => {
      active = false;
    };
  }, []);

  // Active Session Heartbeat: checks every 6 seconds for instant revocation
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkHeartbeat = async () => {
      try {
        const storedToken = localStorage.getItem('saqib_admin_token');
        if (!storedToken) return;

        const res = await fetch('/api/admin/auth', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const data = await res.json();

        if (res.status === 401 || data.revoked || !data.authenticated) {
          localStorage.removeItem('saqib_admin_token');
          setIsAuthenticated(false);
          setErrorMessage(
            data.reason || '🚨 Your admin session was revoked by Superadmin. You have been forcibly logged out.'
          );
        }
      } catch {
        // Ignore transient offline errors
      }
    };

    const interval = setInterval(checkHeartbeat, 6000);
    window.addEventListener('focus', checkHeartbeat);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkHeartbeat);
    };
  }, [isAuthenticated]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both admin username and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        try {
          localStorage.setItem('saqib_admin_token', data.token);
          if (data.role) localStorage.setItem('saqib_admin_role', data.role);
          if (data.username) localStorage.setItem('saqib_admin_username', data.username);
        } catch {
          // Ignore local storage quota limits
        }
        setIsAuthenticated(true);
      } else {
        if (data.locked && data.remainingSeconds) {
          setLockoutSeconds(Number(data.remainingSeconds));
          setErrorMessage(data.error);
        } else {
          setErrorMessage(data.error || 'Access Denied: Invalid Credentials.');
        }
      }
    } catch {
      setErrorMessage('Connection error during authentication verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already authenticated, mount the full admin command center
  if (isAuthenticated) {
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('saqib_admin_token') : null;
    return (
      <AuthenticatedAdminApp
        initialServices={initialServices}
        initialTools={initialTools}
        initialConfig={initialConfig}
        initialTab="saqibadmb"
        initialAdminToken={currentToken}
      />
    );
  }

  // Initial session verification loader
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center text-white px-4">
        <div className="w-12 h-12 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-mono text-xs tracking-wider uppercase">
          Verifying Secure Session...
        </p>
      </div>
    );
  }

  // Unauthenticated: Clean, sleek dark glass login portal
  return (
    <div className="min-h-screen bg-[#050711] text-white flex flex-col justify-between items-center relative overflow-hidden px-4 py-8 select-none">
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Bar Header */}
      <div className="w-full max-w-md flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all backdrop-blur-md"
        >
          <i className="fa-solid fa-arrow-left text-pink-400 text-xs"></i>
          <span>Public Storefront</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[11px] font-semibold text-pink-400">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
          Restricted Portal
        </span>
      </div>

      {/* Main Glass Neon Card */}
      <div className="w-full max-w-md z-10 my-auto">
        <div className="relative rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.3)]">
          {/* Header & Logo */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 p-0.5 shadow-lg shadow-pink-500/30 mb-4">
              <div className="w-full h-full bg-[#0b0f19] rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-shield-halved text-2xl text-pink-400"></i>
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Admin Security Vault
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Muhammad Saqib Visuals Hub • Command Center
            </p>
          </div>

          {/* Active 3-Attempt Lockout Countdown Banner */}
          {lockoutSeconds > 0 ? (
            <div className="mb-5 p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-3 shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0 text-rose-400 border border-rose-500/30">
                <i className="fa-solid fa-user-lock text-lg"></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-rose-100 text-sm">Security Lockout Active (3 Failed Attempts)</p>
                <p className="text-[11px] text-rose-300 mt-0.5">
                  Access blocked. Try again in{' '}
                  <span className="font-mono font-bold text-white text-xs bg-rose-500/40 px-2 py-0.5 rounded border border-rose-400/30">
                    {Math.floor(lockoutSeconds / 60)}:{(lockoutSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
                <i className="fa-solid fa-triangle-exclamation text-rose-400 text-sm flex-shrink-0"></i>
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Admin Username
              </label>
              <div className="relative flex items-center">
                <i className="fa-solid fa-user-shield absolute left-3.5 text-pink-400 text-sm pointer-events-none z-10"></i>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                  disabled={lockoutSeconds > 0}
                  style={{
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                    caretColor: '#ec4899',
                    backgroundColor: '#0b0f19',
                  }}
                  className="admin-vault-input w-full bg-[#0b0f19] border border-slate-700/80 focus:border-pink-500 rounded-xl py-3 pl-11 pr-3.5 text-sm sm:text-base font-semibold text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-pink-500/30 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <div className="relative flex items-center">
                <i className="fa-solid fa-lock absolute left-3.5 text-pink-400 text-sm pointer-events-none z-10"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  disabled={lockoutSeconds > 0}
                  style={{
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                    caretColor: '#ec4899',
                    backgroundColor: '#0b0f19',
                  }}
                  className="admin-vault-input w-full bg-[#0b0f19] border border-slate-700/80 focus:border-pink-500 rounded-xl py-3 pl-11 pr-11 text-sm sm:text-base font-semibold text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-pink-500/30 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={lockoutSeconds > 0}
                  className="absolute right-3.5 text-slate-400 hover:text-pink-400 text-sm p-1 transition-colors cursor-pointer z-10 disabled:opacity-50"
                  aria-label="Toggle password visibility"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || lockoutSeconds > 0}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:opacity-95 active:scale-[0.98] transition-all text-white shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {lockoutSeconds > 0 ? (
                <>
                  <i className="fa-solid fa-user-lock text-sm"></i>
                  <span>Locked ({Math.floor(lockoutSeconds / 60)}:{(lockoutSeconds % 60).toString().padStart(2, '0')})</span>
                </>
              ) : isSubmitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-key text-sm"></i>
                  <span>Authenticate & Unlock Admin Portal</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-md text-center z-10 text-[11px] text-slate-500 font-mono">
        © 2026 Muhammad Saqib • All Rights Reserved
      </div>
    </div>
  );
}
