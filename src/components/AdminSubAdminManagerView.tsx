'use client';

import React, { useState, useEffect } from 'react';
import {
  FaUserShield,
  FaShieldAlt,
  FaCrown,
  FaPlus,
  FaTrashAlt,
  FaKey,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaSyncAlt,
  FaToggleOn,
  FaToggleOff,
  FaShoppingBag,
  FaTools,
  FaCreditCard,
  FaUsers,
  FaEye,
  FaSlidersH,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { AdminPermissions, AdminVaultRecord } from '@/src/lib/serverSecurity';

interface AdminSubAdminManagerViewProps {
  showToast: (msg: string) => void;
  copyText: (text: string) => void;
  playPopSound: (freq?: number) => void;
}

const PERMISSION_CONFIGS: {
  key: keyof AdminPermissions;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    key: 'manage_services',
    label: 'Products & Services Catalog',
    desc: 'Can add, edit, hide, and delete store services and categories.',
    icon: <FaShoppingBag className="w-4 h-4 text-emerald-400" />,
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  },
  {
    key: 'manage_tools',
    label: 'Web Tools Deck',
    desc: 'Can add, edit, reorder, and configure live web utilities.',
    icon: <FaTools className="w-4 h-4 text-cyan-400" />,
    color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  },
  {
    key: 'manage_orders',
    label: 'Orders & Financial Proofs',
    desc: 'Can approve or reject manual payment receipts and payment methods.',
    icon: <FaCreditCard className="w-4 h-4 text-purple-400" />,
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  },
  {
    key: 'manage_users',
    label: 'User Accounts & VIP Wallets',
    desc: 'Can view registered users, ban/unban accounts, and adjust balances.',
    icon: <FaUsers className="w-4 h-4 text-amber-400" />,
    color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  {
    key: 'view_telemetry',
    label: 'Live Visitors & Telemetry',
    desc: 'Can view visitor hardware fingerprints, battery levels, IP, and location.',
    icon: <FaEye className="w-4 h-4 text-pink-400" />,
    color: 'border-pink-500/30 bg-pink-500/10 text-pink-300',
  },
  {
    key: 'manage_site_config',
    label: 'Site Config, Banners & SEO',
    desc: 'Can edit ticker announcements, promo banners, theme, and 26-feature matrix.',
    icon: <FaSlidersH className="w-4 h-4 text-indigo-400" />,
    color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
  },
];

export const AdminSubAdminManagerView: React.FC<AdminSubAdminManagerViewProps> = ({
  showToast,
  copyText,
  playPopSound,
}) => {
  const [admins, setAdmins] = useState<AdminVaultRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State: Create Admin
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newPermissions, setNewPermissions] = useState<AdminPermissions>({
    manage_services: true,
    manage_tools: true,
    manage_orders: true,
    manage_users: false,
    view_telemetry: false,
    manage_site_config: false,
    manage_admins: false,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal State: Edit Permissions
  const [editingAdmin, setEditingAdmin] = useState<AdminVaultRecord | null>(null);
  const [editPermissions, setEditPermissions] = useState<AdminPermissions>({
    manage_services: true,
    manage_tools: true,
    manage_orders: true,
    manage_users: false,
    view_telemetry: false,
    manage_site_config: false,
    manage_admins: false,
  });

  // Modal State: Reset Password
  const [resetPwdAdmin, setResetPwdAdmin] = useState<AdminVaultRecord | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState<string>('');

  // Fetch Admins List
  const fetchAdmins = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const storedToken = localStorage.getItem('saqib_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }

      const res = await fetch('/api/admin/subadmins', { headers });
      const data = await res.json();

      if (res.ok && data.success) {
        setAdmins(data.admins || []);
      } else {
        setErrorMsg(data.error || 'Failed to fetch admin accounts');
      }
    } catch {
      setErrorMsg('Network error while connecting to Admin Vault API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Password Generator
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Saqib!${pwd.slice(0, 6)}`;
  };

  // Handle Create Sub-Admin
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      showToast('❌ Username must be at least 3 characters long');
      return;
    }
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      showToast('❌ Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const storedToken = localStorage.getItem('saqib_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch('/api/admin/subadmins', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword.trim(),
          permissions: newPermissions,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playPopSound(880);
        showToast(`🎉 Sub-admin "${newUsername.trim()}" created successfully!`);
        setIsCreateModalOpen(false);
        setNewUsername('');
        setNewPassword('');
        fetchAdmins();
      } else {
        showToast(`❌ ${data.error || 'Failed to create sub-admin'}`);
      }
    } catch {
      showToast('❌ Connection error while creating sub-admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Permissions
  const handleSavePermissions = async () => {
    if (!editingAdmin) return;
    setIsSubmitting(true);
    try {
      const storedToken = localStorage.getItem('saqib_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch('/api/admin/subadmins', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          username: editingAdmin.username,
          permissions: editPermissions,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playPopSound(720);
        showToast(`✅ Permissions updated for "${editingAdmin.username}".`);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        showToast(`❌ ${data.error || 'Failed to update permissions'}`);
      }
    } catch {
      showToast('❌ Network error while saving permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async () => {
    if (!resetPwdAdmin || !resetPasswordInput.trim()) return;
    if (resetPasswordInput.trim().length < 6) {
      showToast('❌ Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const storedToken = localStorage.getItem('saqib_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch('/api/admin/subadmins', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          username: resetPwdAdmin.username,
          newPassword: resetPasswordInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playPopSound(720);
        showToast(`🔑 Password reset for "${resetPwdAdmin.username}". Active sessions invalidated!`);
        setResetPwdAdmin(null);
        setResetPasswordInput('');
        fetchAdmins();
      } else {
        showToast(`❌ ${data.error || 'Failed to reset password'}`);
      }
    } catch {
      showToast('❌ Network error while resetting password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Instant Revoke / Delete
  const handleDeleteAdmin = async (targetUser: string) => {
    if (targetUser.toLowerCase() === 'saqib') {
      showToast('⛔ Primary Superadmin cannot be deleted.');
      return;
    }

    const confirmed = window.confirm(
      `🚨 INSTANT LOGOUT & DELETION WARNING:\n\nAre you sure you want to delete sub-admin "${targetUser}"?\n\nIf this user is currently logged in, their session will be INSTANTLY TERMINATED and they will be kicked back to login page within seconds.`
    );
    if (!confirmed) return;

    try {
      const storedToken = localStorage.getItem('saqib_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch(`/api/admin/subadmins?username=${encodeURIComponent(targetUser)}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playPopSound(420);
        showToast(`⚡ Sub-admin "${targetUser}" deleted & session instantly terminated!`);
        fetchAdmins();
      } else {
        showToast(`❌ ${data.error || 'Failed to delete sub-admin'}`);
      }
    } catch {
      showToast('❌ Network error during sub-admin deletion');
    }
  };

  const superadminsCount = admins.filter((a) => a.role === 'superadmin').length;
  const subadminsCount = admins.filter((a) => a.role !== 'superadmin').length;

  return (
    <div className="space-y-6">
      {/* ==================== 1. COMMAND HEADER ==================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg shadow-inner">
                <FaCrown />
              </span>
              <h2 className="text-lg sm:text-xl font-black font-display tracking-tight text-white flex items-center gap-2">
                Superadmin Multi-Admin Command
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  RBAC Matrix v2.0
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
              Create sub-admin credentials, grant granular permissions to specific panels, and execute
              one-click instant session terminations that forcibly log out staff in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchAdmins}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer flex items-center justify-center text-xs font-bold"
              title="Refresh Admins"
            >
              <FaSyncAlt className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => {
                playPopSound(660);
                setNewUsername('');
                setNewPassword(generateRandomPassword());
                setNewPermissions({
                  manage_services: true,
                  manage_tools: true,
                  manage_orders: true,
                  manage_users: false,
                  view_telemetry: false,
                  manage_site_config: false,
                  manage_admins: false,
                });
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span>Create New Admin</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-bold text-slate-400">Total Administrators</div>
            <div className="text-xl font-black text-white mt-0.5">{admins.length}</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <FaCrown className="w-3 h-3" /> Master Superadmin
            </div>
            <div className="text-xl font-black text-amber-200 mt-0.5">{superadminsCount} Account</div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
              <FaUserShield className="w-3 h-3" /> Sub-Admins Team
            </div>
            <div className="text-xl font-black text-indigo-200 mt-0.5">{subadminsCount} Accounts</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-[11px] font-bold text-emerald-300">Instant Killswitch</div>
            <div className="text-xs font-black text-emerald-300 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              0ms Session Cutoff
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. ADMIN LIST ==================== */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={fetchAdmins}
            className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-200 text-[11px] hover:bg-rose-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 space-y-3">
          <FaSyncAlt className="w-6 h-6 animate-spin mx-auto text-pink-500" />
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Loading Admin Security Vault...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {admins.map((admin) => {
            const isSuper = admin.role === 'superadmin' || admin.username.toLowerCase() === 'saqib';
            const perms = admin.permissions || {};

            return (
              <div
                key={admin.id || admin.username}
                className={`p-5 rounded-3xl border transition shadow-xs ${
                  isSuper
                    ? 'bg-gradient-to-r from-amber-500/5 via-slate-900/5 to-amber-500/5 border-amber-400/40'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: User Identity */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 font-black shadow-inner ${
                        isSuper
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 ring-4 ring-amber-400/20'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      }`}
                    >
                      {isSuper ? <FaCrown className="w-5 h-5" /> : admin.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-black text-slate-900 tracking-tight font-display">
                          {admin.username}
                        </span>
                        {isSuper ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider shadow-xs flex items-center gap-1">
                            <FaCrown className="w-2.5 h-2.5" /> Primary Superadmin
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 uppercase tracking-wider border border-indigo-200">
                            Sub-Admin
                          </span>
                        )}

                        {admin.is_active !== false ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Revoked
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span>Created: {new Date(admin.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Token Ver: #{admin.token_version || 1}</span>
                        {admin.created_by && (
                          <>
                            <span>•</span>
                            <span>By: {admin.created_by}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isSuper && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            playPopSound(500);
                            setEditingAdmin(admin);
                            setEditPermissions(
                              admin.permissions || {
                                manage_services: true,
                                manage_tools: true,
                                manage_orders: true,
                                manage_users: false,
                                view_telemetry: false,
                                manage_site_config: false,
                                manage_admins: false,
                              }
                            );
                          }}
                          className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs border border-indigo-200 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <FaShieldAlt className="w-3.5 h-3.5" />
                          <span>Edit Permissions</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playPopSound(500);
                            setResetPwdAdmin(admin);
                            setResetPasswordInput(generateRandomPassword());
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <FaKey className="w-3.5 h-3.5" />
                          <span>Reset Password</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(admin.username)}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                          title="Instant Logout & Delete"
                        >
                          <FaTrashAlt className="w-3.5 h-3.5" />
                          <span>Instant Delete</span>
                        </button>
                      </>
                    )}

                    {isSuper && (
                      <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold flex items-center gap-1.5">
                        <FaCrown className="w-3 h-3 text-amber-600" />
                        <span>Master Root (Unrestricted)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions Badges Grid */}
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    {isSuper ? 'Master System Privileges (All Enabled):' : 'Assigned Granular Permissions:'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PERMISSION_CONFIGS.map((p) => {
                      const isGranted = isSuper || Boolean(perms[p.key]);
                      return (
                        <span
                          key={p.key}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition ${
                            isGranted
                              ? 'bg-slate-900 text-white border-slate-800'
                              : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
                          }`}
                        >
                          {isGranted ? (
                            <FaCheckCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <FaTimesCircle className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{p.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== 3. CREATE ADMIN MODAL ==================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">
                  <FaUserShield />
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-display">
                  Create New Sub-Admin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Admin Username (min 3 chars)
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="e.g. staff_ali or manager_usman"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Password Input with Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Password (min 6 chars)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound(720);
                      setNewPassword(generateRandomPassword());
                    }}
                    className="text-[11px] font-black text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
                  >
                    🎲 Generate Strong Password
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter or generate secure password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPassword) {
                        copyText(newPassword);
                        showToast('📋 Password copied to clipboard!');
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                    title="Copy Password"
                  >
                    <FaCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Granular Access Permissions
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewPermissions({
                          manage_services: true,
                          manage_tools: true,
                          manage_orders: true,
                          manage_users: true,
                          view_telemetry: true,
                          manage_site_config: true,
                          manage_admins: false,
                        });
                      }}
                      className="text-[10px] font-extrabold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPermissions({
                          manage_services: true,
                          manage_tools: false,
                          manage_orders: false,
                          manage_users: false,
                          view_telemetry: false,
                          manage_site_config: false,
                          manage_admins: false,
                        });
                      }}
                      className="text-[10px] font-extrabold text-slate-500 hover:underline cursor-pointer"
                    >
                      Store Only
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PERMISSION_CONFIGS.map((p) => {
                    const isChecked = Boolean(newPermissions[p.key]);
                    return (
                      <div
                        key={p.key}
                        onClick={() => {
                          playPopSound(440);
                          setNewPermissions((prev) => ({ ...prev, [p.key]: !prev[p.key] }));
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition select-none flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-800 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="pt-0.5">
                          {isChecked ? (
                            <FaToggleOn className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <FaToggleOff className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate">{p.label}</div>
                          <div
                            className={`text-[10px] line-clamp-2 mt-0.5 ${
                              isChecked ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {p.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FaSyncAlt className="animate-spin w-3.5 h-3.5" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="w-3.5 h-3.5" />
                      <span>Create Sub-Admin Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 4. EDIT PERMISSIONS MODAL ==================== */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                  <FaShieldAlt />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-display">
                    Modify Permissions for &quot;{editingAdmin.username}&quot;
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Changes take effect on their very next API action or refresh.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PERMISSION_CONFIGS.map((p) => {
                const isChecked = Boolean(editPermissions[p.key]);
                return (
                  <div
                    key={p.key}
                    onClick={() => {
                      playPopSound(440);
                      setEditPermissions((prev) => ({ ...prev, [p.key]: !prev[p.key] }));
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition select-none flex items-start gap-2.5 ${
                      isChecked
                        ? 'bg-slate-900 text-white border-slate-800 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="pt-0.5">
                      {isChecked ? (
                        <FaToggleOn className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <FaToggleOff className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate">{p.label}</div>
                      <div
                        className={`text-[10px] line-clamp-2 mt-0.5 ${
                          isChecked ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {p.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSavePermissions}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. RESET PASSWORD MODAL ==================== */}
      {resetPwdAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
                  <FaKey />
                </span>
                <h3 className="text-base font-black text-slate-900 font-display">
                  Reset Password for &quot;{resetPwdAdmin.username}&quot;
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetPwdAdmin(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    playPopSound(720);
                    setResetPasswordInput(generateRandomPassword());
                  }}
                  className="text-[11px] font-black text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
                >
                  🎲 Generate
                </button>
              </div>
              <input
                type="text"
                value={resetPasswordInput}
                onChange={(e) => setResetPasswordInput(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-bold font-mono"
              />
              <div className="text-[11px] text-slate-500">
                ⚡ Updating the password will immediately bump the token version, forcibly invalidating all existing
                login sessions for this admin.
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetPwdAdmin(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleResetPassword}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update & Force Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
