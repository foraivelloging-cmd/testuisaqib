'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaWallet,
  FaMagnifyingGlass,
  FaArrowsRotate,
  FaBan,
  FaCircleCheck,
  FaPenToSquare,
  FaTrashCan,
  FaCopy,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaShieldHalved,
  FaPlus,
  FaMinus,
  FaWhatsapp,
  FaTriangleExclamation,
} from 'react-icons/fa6';

export interface UserAccountItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  balance: number;
  status: 'active' | 'banned';
  banReason?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalBalance: number;
}

interface AdminUserManagementViewProps {
  showToast: (msg: string) => void;
  copyText: (text: string, msg?: string) => void;
  playPopSound: (freq?: number) => void;
}

export const AdminUserManagementView: React.FC<AdminUserManagementViewProps> = ({
  showToast,
  copyText,
  playPopSound,
}) => {
  const [users, setUsers] = useState<UserAccountItem[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    totalBalance: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsMigration, setNeedsMigration] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'positive' | 'zero'>('all');

  // Modal States
  const [balanceModalUser, setBalanceModalUser] = useState<UserAccountItem | null>(null);
  const [balanceMode, setBalanceMode] = useState<'add' | 'deduct' | 'set'>('add');
  const [balanceAmount, setBalanceAmount] = useState<string>('500');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState<boolean>(false);

  const [banModalUser, setBanModalUser] = useState<UserAccountItem | null>(null);
  const [banReason, setBanReason] = useState<string>('Suspended by Administrator: Violation of website terms.');
  const [isBanning, setIsBanning] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const token = localStorage.getItem('saqib_admin_token') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/users', { headers });
      const data = await res.json();

      if (data.success) {
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
        if (data.needsMigration) setNeedsMigration(true);
        else setNeedsMigration(false);
      } else {
        setErrorMsg(data.error || 'Failed to load user list');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error loading users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Ban Submit
  const handleConfirmBan = async () => {
    if (!banModalUser) return;
    try {
      setIsBanning(true);
      const token = localStorage.getItem('saqib_admin_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          userId: banModalUser.id,
          action: 'ban',
          reason: banReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`User ${banModalUser.name} has been banned!`);
        playPopSound(300);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === banModalUser.id ? { ...u, status: 'banned', banReason } : u
          )
        );
        setStats((prev) => ({
          ...prev,
          activeUsers: Math.max(0, prev.activeUsers - 1),
          bannedUsers: prev.bannedUsers + 1,
        }));
        setBanModalUser(null);
      } else {
        alert(data.error || 'Ban operation failed');
      }
    } catch {
      alert('Error updating user status');
    } finally {
      setIsBanning(false);
    }
  };

  // Handle Unban Instant
  const handleUnbanUser = async (user: UserAccountItem) => {
    if (!confirm(`Restore ${user.name} (${user.id}) to Active status?`)) return;
    try {
      const token = localStorage.getItem('saqib_admin_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          userId: user.id,
          action: 'unban',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`User ${user.name} unbanned & restored!`);
        playPopSound(700);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: 'active', banReason: '' } : u))
        );
        setStats((prev) => ({
          ...prev,
          activeUsers: prev.activeUsers + 1,
          bannedUsers: Math.max(0, prev.bannedUsers - 1),
        }));
      } else {
        alert(data.error || 'Unban operation failed');
      }
    } catch {
      alert('Error restoring user status');
    }
  };

  // Handle Balance Adjustment
  const handleConfirmBalanceAdjust = async () => {
    if (!balanceModalUser) return;
    const num = Number(balanceAmount);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setIsUpdatingBalance(true);
      const token = localStorage.getItem('saqib_admin_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          userId: balanceModalUser.id,
          action: 'adjust_balance',
          mode: balanceMode,
          amount: num,
        }),
      });

      const data = await res.json();
      if (data.success && typeof data.newBalance === 'number') {
        showToast(`Balance updated: Rs ${data.newBalance.toLocaleString()}`);
        playPopSound(600);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === balanceModalUser.id ? { ...u, balance: data.newBalance } : u
          )
        );
        setBalanceModalUser(null);
      } else {
        alert(data.error || 'Balance update failed');
      }
    } catch {
      alert('Error adjusting user balance');
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user: UserAccountItem) => {
    if (!confirm(`Delete profile for ${user.name} (${user.id}) completely from database?`)) return;
    try {
      const token = localStorage.getItem('saqib_admin_token') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (data.success) {
        showToast(`User ${user.name} deleted`);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch {
      alert('Error deleting user');
    }
  };

  // Relative time helper
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Never';
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  };

  // Filtered List
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchBalance =
      balanceFilter === 'all' ||
      (balanceFilter === 'positive' && u.balance > 0) ||
      (balanceFilter === 'zero' && u.balance === 0);

    return matchSearch && matchStatus && matchBalance;
  });

  return (
    <div className="space-y-4">
      {/* ==================== TABLE MIGRATION NOTICE ==================== */}
      {needsMigration && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm sm:text-base">
            <FaTriangleExclamation className="text-amber-400" />
            <span>Supabase Migration Recommended: `status` &amp; `ban_reason` Columns</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            User ban/unban aur login tracking enable karne ke liye Supabase mein migration query run karein. File{' '}
            <strong className="text-white">USER_MANAGEMENT_ADMIN.sql</strong> already project mein saved hai.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => {
                const sqlSnippet = `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles (last_login_at DESC);`;
                copyText(sqlSnippet, 'SQL Migration Query Copied! Paste in Supabase SQL Editor.');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs shadow hover:bg-amber-400 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FaCopy />
              <span>Copy Supabase SQL Migration</span>
            </button>
            <button
              onClick={() => fetchUsers()}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
            >
              Check Again
            </button>
          </div>
        </div>
      )}

      {/* ==================== 4 TOP METRIC CARDS ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FaUsers className="text-cyan-500" />
            <span>Total Registered</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalUsers}</div>
          <div className="text-[10px] text-slate-400 font-medium">Verified member profiles</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FaUserCheck className="text-emerald-500" />
            <span>Active Accounts</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">{stats.activeUsers}</div>
          <div className="text-[10px] text-slate-400 font-medium">In good standing</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FaUserSlash className="text-rose-500" />
            <span>Banned Accounts</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">{stats.bannedUsers}</div>
          <div className="text-[10px] text-slate-400 font-medium">Access blocked 100%</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FaWallet className="text-indigo-500" />
            <span>Total Wallet Balance</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700">
            Rs {stats.totalBalance.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">All users wallet sum</div>
        </div>
      </div>

      {/* ==================== SEARCH, FILTER & ACTION BAR ==================== */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by Name, Email, Phone number, or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playPopSound(550);
                fetchUsers();
              }}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FaArrowsRotate className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh Users</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400">Status:</span>
          {(['all', 'active', 'banned'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                statusFilter === s
                  ? s === 'banned'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {s === 'all' ? 'All Status' : s === 'active' ? '🟢 Active' : '🔴 Banned'}
            </button>
          ))}

          <span className="text-[11px] font-bold text-slate-400 ml-2">Wallet:</span>
          {(
            [
              { id: 'all', label: 'All Balances' },
              { id: 'positive', label: '💰 Has Balance (&gt;0)' },
              { id: 'zero', label: '⚪ Zero Balance' },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              onClick={() => setBalanceFilter(b.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                balanceFilter === b.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== USERS DATA TABLE ==================== */}
      <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading && users.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <FaArrowsRotate className="animate-spin text-2xl mx-auto text-cyan-500" />
            <div className="text-xs font-bold">Loading User Database &amp; VIP Wallets...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <FaUsers className="text-3xl mx-auto text-slate-300" />
            <div className="text-xs font-bold text-slate-600">No matching user accounts found.</div>
            <p className="text-[11px] text-slate-400">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-3.5">User Profile &amp; ID</th>
                  <th className="py-3 px-3">Contact Details</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Wallet Balance</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-3">Last Active Login</th>
                  <th className="py-3 px-3">Registered On</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isBanned = u.status === 'banned';

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBanned ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* 1. Profile & ID */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase text-white shadow-xs ${
                              isBanned
                                ? 'bg-rose-500'
                                : 'bg-gradient-to-tr from-cyan-500 to-indigo-600'
                            }`}
                          >
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isBanned && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[9px] font-black uppercase">
                                  Banned
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                              <span>{u.id}</span>
                              <button
                                onClick={() => copyText(u.id, 'User ID Copied!')}
                                className="text-slate-300 hover:text-cyan-600"
                                title="Copy ID"
                              >
                                <FaCopy className="text-[9px]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact Details */}
                      <td className="py-3 px-3">
                        {u.phone ? (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                            <FaPhone className="text-emerald-500 text-[9px]" />
                            <span>{u.phone}</span>
                          </div>
                        ) : null}
                        {u.email ? (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                            <FaEnvelope className="text-indigo-400 text-[9px]" />
                            <span>{u.email}</span>
                          </div>
                        ) : null}
                        {!u.phone && !u.email && (
                          <span className="text-[10px] text-slate-400">ID: {u.id}</span>
                        )}
                      </td>

                      {/* 3. Role */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-extrabold capitalize border border-slate-200">
                          {u.role}
                        </span>
                      </td>

                      {/* 4. Wallet Balance */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-xs font-black ${
                              u.balance > 0 ? 'text-emerald-700 font-extrabold' : 'text-slate-500'
                            }`}
                          >
                            Rs {u.balance.toLocaleString()}
                          </span>
                          <button
                            onClick={() => {
                              setBalanceModalUser(u);
                              setBalanceMode('add');
                              setBalanceAmount('500');
                            }}
                            className="p-1 rounded-md text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition"
                            title="Adjust Wallet Balance"
                          >
                            <FaPenToSquare className="text-[11px]" />
                          </button>
                        </div>
                      </td>

                      {/* 5. Account Status */}
                      <td className="py-3 px-3">
                        {isBanned ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                              <FaUserSlash className="text-rose-600 text-[9px]" />
                              <span>Banned</span>
                            </span>
                            {u.banReason && (
                              <div className="text-[9px] text-rose-500 font-medium mt-0.5 max-w-[120px] truncate" title={u.banReason}>
                                {u.banReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <FaUserCheck className="text-emerald-600 text-[9px]" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Last Login Active */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{getRelativeTime(u.lastLoginAt)}</div>
                        {u.lastLoginAt && (
                          <div className="text-[9px] text-slate-400">
                            {new Date(u.lastLoginAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </td>

                      {/* 7. Registered On */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 text-[10px]">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString([], {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Early Member'}
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Ban / Unban Toggle */}
                          {isBanned ? (
                            <button
                              onClick={() => handleUnbanUser(u)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-[10px] transition flex items-center gap-1 cursor-pointer"
                              title="Unban this user"
                            >
                              <FaCircleCheck />
                              <span>Unban</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setBanModalUser(u);
                                setBanReason('Suspended by Administrator: Fraudulent activity or terms violation.');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[10px] transition flex items-center gap-1 cursor-pointer"
                              title="Ban this user account"
                            >
                              <FaBan />
                              <span>Ban</span>
                            </button>
                          )}

                          {/* Quick Edit Balance */}
                          <button
                            onClick={() => {
                              setBalanceModalUser(u);
                              setBalanceMode('add');
                              setBalanceAmount('1000');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Edit Wallet Balance"
                          >
                            <FaWallet className="text-xs" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete User"
                          >
                            <FaTrashCan className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== MODAL: WALLET BALANCE ADJUSTMENT ==================== */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <FaWallet className="text-indigo-600" />
                <span>Adjust User Wallet</span>
              </h3>
              <button
                onClick={() => setBalanceModalUser(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-800">{balanceModalUser.name}</div>
              <div className="text-[10px] font-mono text-slate-500">{balanceModalUser.id}</div>
              <div className="text-xs font-extrabold text-indigo-700 pt-1">
                Current Balance: Rs {balanceModalUser.balance.toLocaleString()}
              </div>
            </div>

            {/* Mode selection: Add, Deduct, Set */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setBalanceMode('add')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  balanceMode === 'add'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FaPlus className="text-[10px]" />
                <span>Add (+)</span>
              </button>
              <button
                onClick={() => setBalanceMode('deduct')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  balanceMode === 'deduct'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FaMinus className="text-[10px]" />
                <span>Deduct (-)</span>
              </button>
              <button
                onClick={() => setBalanceMode('set')}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  balanceMode === 'set'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Set Exact</span>
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Amount in PKR (Rs):</label>
              <input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="500"
                min="0"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-extrabold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              {['500', '1000', '2500', '5000'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBalanceAmount(preset)}
                  className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition"
                >
                  +{preset}
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setBalanceModalUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBalanceAdjust}
                disabled={isUpdatingBalance}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md transition disabled:opacity-50"
              >
                {isUpdatingBalance ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: BAN USER ACCOUNT ==================== */}
      {banModalUser && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-rose-200 p-6 shadow-2xl text-slate-900 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm sm:text-base text-rose-700 flex items-center gap-2">
                <FaBan className="text-rose-600" />
                <span>Ban User Account</span>
              </h3>
              <button
                onClick={() => setBanModalUser(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
              <div className="text-xs font-bold text-rose-900">{banModalUser.name}</div>
              <div className="text-[10px] font-mono text-rose-700">{banModalUser.id}</div>
              <p className="text-[11px] text-rose-600 pt-1">
                Banning this account will immediately block this user from logging in and spending balance.
              </p>
            </div>

            {/* Reason Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Ban Reason (Shown to user):</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white transition"
              />
            </div>

            {/* Quick Reason Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Quick Reasons:</span>
              <div className="flex flex-col gap-1">
                {[
                  'Fake Payment Proof submitted.',
                  'Abusive behavior / Spam orders.',
                  'Fraudulent activity & chargeback threat.',
                ].map((r) => (
                  <button
                    key={r}
                    onClick={() => setBanReason(r)}
                    className="text-left px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition"
                  >
                    • {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setBanModalUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBan}
                disabled={isBanning}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition disabled:opacity-50"
              >
                {isBanning ? 'Banning...' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementView;
