'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminNotification } from '../lib/adminNotifications';

export interface AdminNotificationBellProps {
  onNavigate: (screenId: string) => void;
  adminToken?: string | null;
}

export function AdminNotificationBell({
  onNavigate,
  adminToken,
}: AdminNotificationBellProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const prevUnreadRef = useRef<number>(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  const playChime = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {}
  };

  const getHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token =
      adminToken ||
      (typeof window !== 'undefined' ? localStorage.getItem('saqib_admin_token') : null);
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        const count = data.unreadCount ?? data.notifications.filter((n: AdminNotification) => !n.is_read).length;
        if (count > prevUnreadRef.current) {
          playChime();
        }
        prevUnreadRef.current = count;
        setUnreadCount(count);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [adminToken]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      prevUnreadRef.current = 0;
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = async (notif: AdminNotification) => {
    // 1. Mark as read
    if (!notif.is_read) {
      try {
        fetch('/api/admin/notifications', {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ id: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    }

    setIsOpen(false);

    // 2. Jump to target studio screen
    if (notif.type === 'new_review') {
      onNavigate('reviews');
    } else if (notif.type === 'new_order') {
      onNavigate('sales_profit');
    } else if (notif.type === 'payment_proof') {
      onNavigate('payments');
    } else if (notif.type === 'contact_inquiry') {
      onNavigate('contact_footer');
    } else {
      onNavigate('dashboard');
    }
  };

  const handleClearRead = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/admin/notifications?clearRead=true', {
        method: 'DELETE',
        headers: getHeaders(),
      });
      setNotifications((prev) => prev.filter((n) => !n.is_read));
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'new_review':
        return {
          icon: 'fa-solid fa-star',
          bg: 'bg-amber-100 text-amber-600',
          border: 'border-amber-200',
        };
      case 'new_order':
        return {
          icon: 'fa-solid fa-bag-shopping',
          bg: 'bg-emerald-100 text-emerald-600',
          border: 'border-emerald-200',
        };
      case 'payment_proof':
        return {
          icon: 'fa-solid fa-wallet',
          bg: 'bg-cyan-100 text-cyan-600',
          border: 'border-cyan-200',
        };
      case 'contact_inquiry':
        return {
          icon: 'fa-solid fa-envelope',
          bg: 'bg-blue-100 text-blue-600',
          border: 'border-blue-200',
        };
      default:
        return {
          icon: 'fa-solid fa-bell',
          bg: 'bg-purple-100 text-purple-600',
          border: 'border-purple-200',
        };
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen && unreadCount > 0) {
            playChime();
          }
        }}
        title="Admin Notifications Center"
        className="relative px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 text-[10px] sm:text-xs font-extrabold cursor-pointer transition-all hover:scale-105 flex items-center justify-center gap-1.5 shadow-sm"
      >
        <i className={`fa-solid fa-bell text-sm ${unreadCount > 0 ? 'text-amber-300 animate-wiggle' : 'text-slate-300'}`}></i>
        <span className="hidden sm:inline">Alerts</span>

        {/* Pulsating Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-[0_0_10px_#f43f5e] border-2 border-slate-900 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl z-50 overflow-hidden text-left animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-bell text-amber-400 text-xs"></i>
              <span className="text-xs font-black text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isLoading}
                className="text-[10px] font-bold text-sky-400 hover:text-sky-300 transition cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List Container */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <i className="fa-regular fa-bell text-slate-500 text-2xl"></i>
                <div className="text-xs font-bold text-slate-300">No Notifications</div>
                <p className="text-[11px] text-slate-500">
                  You're all caught up! New reviews, orders, and payment proofs will chime here in real-time.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const style = getIconForType(notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-white/10 transition cursor-pointer ${
                      !notif.is_read ? 'bg-indigo-950/40' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs border ${style.bg} ${style.border}`}
                    >
                      <i className={style.icon}></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-white truncate">
                          {notif.title}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 flex-shrink-0">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-1 shadow-[0_0_6px_#f43f5e]" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.some((n) => n.is_read) && (
            <div className="p-2 border-t border-white/10 text-center bg-white/5">
              <button
                type="button"
                onClick={handleClearRead}
                disabled={isLoading}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Clear read notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminNotificationBell;
