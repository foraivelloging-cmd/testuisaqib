'use client';

import React, { useState, useEffect } from 'react';
import {
  FaTag,
  FaPlus,
  FaTrashAlt,
  FaCopy,
  FaSyncAlt,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaPercent,
  FaMoneyBillWave,
  FaShoppingBag,
} from 'react-icons/fa';
import { CouponItem } from '@/app/api/coupons/validate/route';

interface AdminCouponManagerViewProps {
  showToast: (msg: string) => void;
  copyText: (text: string) => void;
  playPopSound: (freq?: number) => void;
}

export const AdminCouponManagerView: React.FC<AdminCouponManagerViewProps> = ({
  showToast,
  copyText,
  playPopSound,
}) => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [needsMigration, setNeedsMigration] = useState<boolean>(false);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('15');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('300');
  const [minOrderAmount, setMinOrderAmount] = useState<string>('200');
  const [maxUses, setMaxUses] = useState<string>('100');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [applicableCategory, setApplicableCategory] = useState<string>('all');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch Coupons
  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('saqib_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch('/api/coupons', { headers });
      const data = await res.json();

      if (res.ok && data.success) {
        setCoupons(data.coupons || []);
        if (data.source === 'default_seed') {
          setNeedsMigration(true);
        } else {
          setNeedsMigration(false);
        }
      } else {
        showToast(`❌ ${data.error || 'Failed to fetch coupons'}`);
      }
    } catch {
      showToast('❌ Network error loading coupons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Generate Random Promo Code
  const generateRandomCode = () => {
    const prefixes = ['SAQIB', 'VIP', 'MEGA', 'SAVE', 'PROMO', 'OFFER'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const n = Math.floor(Math.random() * 5 + 1) * 10;
    return `${p}${n}`;
  };

  // Create Coupon Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCode.trim().toUpperCase().replace(/\s+/g, '');

    if (!cleanCode || cleanCode.length < 3) {
      showToast('❌ Coupon code must be at least 3 characters');
      return;
    }
    const numVal = Number(discountValue);
    if (isNaN(numVal) || numVal <= 0) {
      showToast('❌ Enter a valid discount value');
      return;
    }

    setIsSubmitting(true);
    try {
      const storedToken = localStorage.getItem('saqib_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: cleanCode,
          discount_type: discountType,
          discount_value: numVal,
          max_discount_amount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
          min_order_amount: minOrderAmount ? Number(minOrderAmount) : 0,
          max_uses: maxUses ? Number(maxUses) : null,
          expires_at: expiresAt || null,
          applicable_category: applicableCategory,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playPopSound(880);
        showToast(`🎉 Coupon "${cleanCode}" created successfully!`);
        setIsModalOpen(false);
        setNewCode('');
        setDescription('');
        fetchCoupons();
      } else {
        showToast(`❌ ${data.error || 'Failed to create coupon'}`);
        if (data.needsMigration) setNeedsMigration(true);
      }
    } catch {
      showToast('❌ Connection error creating coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (code: string, currentStatus: boolean) => {
    try {
      playPopSound(520);
      const storedToken = localStorage.getItem('saqib_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      // Optimistic local update
      setCoupons((prev) =>
        prev.map((c) => (c.code === code ? { ...c, is_active: !currentStatus } : c))
      );

      const res = await fetch('/api/coupons', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ code, is_active: !currentStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Coupon "${code}" ${!currentStatus ? 'activated' : 'deactivated'}.`);
      } else {
        showToast(`❌ ${data.error || 'Failed to update status'}`);
        fetchCoupons();
      }
    } catch {
      showToast('❌ Network error updating status');
      fetchCoupons();
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (code: string) => {
    const ok = window.confirm(`Delete coupon "${code}"? Customers will no longer be able to use it.`);
    if (!ok) return;

    try {
      playPopSound(420);
      const storedToken = localStorage.getItem('saqib_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      setCoupons((prev) => prev.filter((c) => c.code !== code));

      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`🗑️ Coupon "${code}" deleted.`);
      } else {
        showToast(`❌ ${data.error || 'Failed to delete'}`);
        fetchCoupons();
      }
    } catch {
      showToast('❌ Network error deleting coupon');
      fetchCoupons();
    }
  };

  // Filtered List
  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const activeCount = coupons.filter((c) => c.is_active).length;
  const totalUsages = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* ==================== 1. COMMAND HEADER & STATS ==================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border border-purple-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-lg shadow-inner">
                <FaTag />
              </span>
              <h2 className="text-lg sm:text-xl font-black font-display tracking-tight text-white flex items-center gap-2">
                Coupons &amp; Promo Discounts Matrix
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Deals
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
              Create discount promo codes (Percentage % or Flat Rs.), configure minimum spend &amp; usage
              limits, and track real-time customer redemptions during checkout.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchCoupons}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer flex items-center justify-center text-xs font-bold"
              title="Refresh Coupons"
            >
              <FaSyncAlt className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => {
                playPopSound(660);
                setNewCode(generateRandomCode());
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-bold text-slate-400">Total Coupons</div>
            <div className="text-xl font-black text-white mt-0.5">{coupons.length} Deals</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
              <FaCheckCircle className="w-3 h-3" /> Active Campaigns
            </div>
            <div className="text-xl font-black text-emerald-200 mt-0.5">{activeCount} Active</div>
          </div>
          <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20">
            <div className="text-[11px] font-bold text-pink-300 flex items-center gap-1">
              <FaShoppingBag className="w-3 h-3" /> Total Redemptions
            </div>
            <div className="text-xl font-black text-pink-200 mt-0.5">{totalUsages} Used</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <div className="text-[11px] font-bold text-purple-300">Discount Engine</div>
            <div className="text-xs font-black text-purple-200 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Auto-Calculated
            </div>
          </div>
        </div>
      </div>

      {/* Migration Alert Banner (if table not created yet) */}
      {needsMigration && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Coupons are currently running on default system presets. Run{' '}
              <span className="underline font-mono">COUPONS_SYSTEM.sql</span> in Supabase SQL Editor to enable full
              cloud database sync!
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              copyText(
                `ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY; -- See COUPONS_SYSTEM.sql in project root`
              );
              showToast('📋 SQL snippet copied! Open Supabase SQL Editor.');
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-extrabold whitespace-nowrap cursor-pointer"
          >
            Copy SQL Info
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by coupon code (e.g. WELCOME10, SAQIB50, EID20)..."
          className="w-full px-3 py-1 bg-transparent text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* ==================== 2. COUPONS CARDS GRID ==================== */}
      {isLoading ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 space-y-3">
          <FaSyncAlt className="w-6 h-6 animate-spin mx-auto text-purple-500" />
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Loading Promotional Coupons...
          </div>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 space-y-3">
          <FaTag className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-extrabold text-slate-700">No coupons found</div>
          <p className="text-xs text-slate-400">Create your first promo code to boost customer sales!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => {
            const isPct = coupon.discount_type === 'percentage';
            const isExpired = coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now();

            return (
              <div
                key={coupon.id || coupon.code}
                className={`p-5 rounded-3xl border transition shadow-xs flex flex-col justify-between gap-4 ${
                  coupon.is_active && !isExpired
                    ? 'bg-white border-slate-200 hover:border-purple-300'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-mono font-black text-sm tracking-wider flex items-center gap-1.5 shadow-xs">
                        <span>{coupon.code}</span>
                        <button
                          type="button"
                          onClick={() => {
                            copyText(coupon.code);
                            showToast(`📋 Copied code "${coupon.code}"`);
                          }}
                          className="text-purple-400 hover:text-purple-600 cursor-pointer ml-1"
                          title="Copy Code"
                        >
                          <FaCopy className="w-3 h-3" />
                        </button>
                      </div>

                      {coupon.is_active && !isExpired ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          Paused
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(coupon.code, coupon.is_active)}
                      className="cursor-pointer"
                      title={coupon.is_active ? 'Click to Pause' : 'Click to Activate'}
                    >
                      {coupon.is_active ? (
                        <FaToggleOn className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <FaToggleOff className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Discount Value Badge */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 font-display">
                      {isPct ? `${coupon.discount_value}% OFF` : `Rs. ${coupon.discount_value} OFF`}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {isPct ? '(Percentage)' : '(Flat Discount)'}
                    </span>
                  </div>

                  {coupon.description && (
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">{coupon.description}</p>
                  )}

                  {/* Conditions List */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Min Order Spend:</span>
                      <span className="font-extrabold text-slate-900">
                        {coupon.min_order_amount ? `Rs. ${coupon.min_order_amount.toLocaleString()}` : 'No Minimum'}
                      </span>
                    </div>

                    {isPct && coupon.max_discount_amount && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Max Discount Cap:</span>
                        <span className="font-extrabold text-slate-900">
                          Rs. {coupon.max_discount_amount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Usage Count:</span>
                      <span className="font-extrabold text-purple-700">
                        {coupon.used_count || 0} {coupon.max_uses ? `/ ${coupon.max_uses}` : 'times (Unlimited)'}
                      </span>
                    </div>

                    {coupon.expires_at && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Expires:</span>
                        <span className="font-bold text-slate-800">
                          {new Date(coupon.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Delete */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    Category: {coupon.applicable_category || 'All'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(coupon.code)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer text-xs"
                    title="Delete Coupon"
                  >
                    <FaTrashAlt className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== 3. CREATE COUPON MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                  <FaTag />
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-display">
                  Create Promotional Coupon
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Code Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Coupon Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound(720);
                      setNewCode(generateRandomCode());
                    }}
                    className="text-[11px] font-black text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    🎲 Suggest Code
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="e.g. SAQIB20, WELCOME10, EID50"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-black tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Discount Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Discount Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`p-3 rounded-2xl border font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                      discountType === 'percentage'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <FaPercent className="w-3.5 h-3.5 text-pink-400" />
                    <span>Percentage (% OFF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`p-3 rounded-2xl border font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                      discountType === 'fixed'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <FaMoneyBillWave className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Flat Amount (Rs. OFF)</span>
                  </button>
                </div>
              </div>

              {/* Value & Cap Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    {discountType === 'percentage' ? 'Discount % (e.g. 15)' : 'Flat Discount Rs. (e.g. 100)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={discountType === 'percentage' ? '100' : '100000'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {discountType === 'percentage' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Max Discount Cap (Rs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      placeholder="e.g. 300 (Optional)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Min Order Spend (Rs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                      placeholder="e.g. 300"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>

              {discountType === 'percentage' && (
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Min Order Spend (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="e.g. 200"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Limits & Expiration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Total Uses Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="e.g. 100 (Blank = Unlimited)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Description / Public Label
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Special 15% discount for Nadra &amp; franchise orders"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <FaCheckCircle className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Creating...' : 'Publish Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
