'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaMagnifyingGlass,
  FaArrowsRotate,
  FaTrashCan,
  FaCopy,
  FaGlobe,
  FaMobileScreen,
  FaLaptop,
  FaTabletScreenButton,
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBolt,
  FaCircleCheck,
  FaClock,
  FaShieldHalved,
  FaTriangleExclamation,
  FaCode,
} from 'react-icons/fa6';

export interface VisitorRecord {
  id: string;
  fingerprint: string;
  ip_address: string;
  country: string;
  city?: string;
  device_type: string;
  os: string;
  browser: string;
  battery_level: string;
  battery_raw?: number;
  battery_charging?: boolean;
  screen_resolution?: string;
  hardware_specs?: string;
  language?: string;
  last_path: string;
  total_visits: number;
  first_seen: string;
  last_seen: string;
  user_agent?: string;
}

interface TelemetryStats {
  total: number;
  activeNow: number;
  mobileCount: number;
  desktopCount: number;
  countryCounts?: Record<string, number>;
}

interface AdminVisitorTelemetryViewProps {
  showToast: (msg: string) => void;
  copyText: (text: string, msg?: string) => void;
  playPopSound: (freq?: number) => void;
}

export const AdminVisitorTelemetryView: React.FC<AdminVisitorTelemetryViewProps> = ({
  showToast,
  copyText,
  playPopSound,
}) => {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [stats, setStats] = useState<TelemetryStats>({
    total: 0,
    activeNow: 0,
    mobileCount: 0,
    desktopCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'Mobile' | 'Desktop' | 'Tablet'>('all');
  const [batteryFilter, setBatteryFilter] = useState<'all' | 'charging' | 'battery' | 'low'>('all');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const token = localStorage.getItem('saqib_admin_token') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/analytics/visitor-telemetry', { headers });
      const data = await res.json();

      if (data.needsTableSetup) {
        setNeedsSetup(true);
        setErrorMsg(data.error);
        setIsLoading(false);
        return;
      }

      if (data.success) {
        setVisitors(data.visitors || []);
        if (data.stats) setStats(data.stats);
        setNeedsSetup(false);
      } else {
        setErrorMsg(data.error || 'Failed to load telemetry');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error loading telemetry');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Auto-refresh timer every 25 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 25000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTelemetry]);

  const handleDeleteVisitor = async (fingerprint: string) => {
    if (!confirm(`Delete visitor device ${fingerprint}?`)) return;
    try {
      setIsDeleting(fingerprint);
      const token = localStorage.getItem('saqib_admin_token') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/analytics/visitor-telemetry?fingerprint=${encodeURIComponent(fingerprint)}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        showToast('Visitor deleted');
        setVisitors((prev) => prev.filter((v) => v.fingerprint !== fingerprint));
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch {
      alert('Delete request failed');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete ALL visitor telemetry records?')) return;
    try {
      const token = localStorage.getItem('saqib_admin_token') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/analytics/visitor-telemetry', {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        showToast('All telemetry cleared');
        setVisitors([]);
        setStats({ total: 0, activeNow: 0, mobileCount: 0, desktopCount: 0 });
      }
    } catch {
      alert('Clear all failed');
    }
  };

  // Filter visitors
  const filteredVisitors = visitors.filter((v) => {
    // Search
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.fingerprint?.toLowerCase().includes(q) ||
      v.ip_address?.toLowerCase().includes(q) ||
      v.country?.toLowerCase().includes(q) ||
      v.os?.toLowerCase().includes(q) ||
      v.browser?.toLowerCase().includes(q) ||
      v.last_path?.toLowerCase().includes(q);

    // Device
    const matchDevice = deviceFilter === 'all' || v.device_type === deviceFilter;

    // Battery
    let matchBattery = true;
    if (batteryFilter === 'charging') matchBattery = Boolean(v.battery_charging);
    else if (batteryFilter === 'battery') matchBattery = v.battery_raw !== undefined && v.battery_raw >= 0 && !v.battery_charging;
    else if (batteryFilter === 'low') matchBattery = v.battery_raw !== undefined && v.battery_raw >= 0 && v.battery_raw <= 20;

    return matchSearch && matchDevice && matchBattery;
  });

  // Relative time helper
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* ==================== TABLE SETUP BANNER (IF TABLE NOT YET CREATED) ==================== */}
      {needsSetup && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm sm:text-base">
            <FaTriangleExclamation className="text-amber-400" />
            <span>Supabase Setup Required: `visitor_fingerprints` Table Missing</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Visitor telemetry track karne ke liye Supabase mein 1 query run karni hogi. File{' '}
            <strong className="text-white">VISITOR_DEVICE_TRACKING.sql</strong> already project mein saved hai.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => {
                const sqlSnippet = `CREATE TABLE IF NOT EXISTS public.visitor_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint TEXT NOT NULL UNIQUE,
    ip_address TEXT DEFAULT '127.0.0.1',
    country TEXT DEFAULT 'Pakistan',
    city TEXT DEFAULT '',
    device_type TEXT DEFAULT 'Desktop',
    os TEXT DEFAULT 'Unknown',
    browser TEXT DEFAULT 'Unknown',
    battery_level TEXT DEFAULT 'N/A',
    battery_raw INTEGER DEFAULT -1,
    battery_charging BOOLEAN DEFAULT false,
    screen_resolution TEXT DEFAULT '',
    hardware_specs TEXT DEFAULT '',
    language TEXT DEFAULT 'en',
    last_path TEXT DEFAULT '/',
    total_visits INTEGER DEFAULT 1,
    first_seen TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    last_seen TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    user_agent TEXT DEFAULT ''
);
ALTER TABLE public.visitor_fingerprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Public Insert Visitor Telemetry" ON public.visitor_fingerprints FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow Public Update Visitor Telemetry" ON public.visitor_fingerprints FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.visitor_fingerprints TO service_role;`;
                copyText(sqlSnippet, 'SQL Query Copied! Paste in Supabase SQL Editor.');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs shadow hover:bg-amber-400 active:scale-95 transition flex items-center gap-1.5"
            >
              <FaCopy />
              <span>Copy Supabase SQL Query</span>
            </button>
            <button
              onClick={() => fetchTelemetry()}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
            >
              Check Again
            </button>
          </div>
        </div>
      )}

      {/* ==================== 4 TOP TELEMETRY STAT CARDS ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FaShieldHalved className="text-cyan-500" />
            <span>Unique Devices</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[10px] text-slate-400 font-medium">Distinct browser hashes</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FaClock className="text-emerald-500" />
            <span>Active (&lt;15m)</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <span>{stats.activeNow}</span>
            {stats.activeNow > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Live active visitors</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FaMobileScreen className="text-pink-500" />
            <span>Mobile vs Desktop</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {stats.mobileCount} <span className="text-xs font-bold text-slate-400">/</span> {stats.desktopCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {stats.total > 0 ? `${Math.round((stats.mobileCount / stats.total) * 100)}% Mobile` : '0% Mobile'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FaGlobe className="text-indigo-500" />
            <span>Top Country</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-indigo-700 truncate">
            {stats.countryCounts && Object.keys(stats.countryCounts).length > 0
              ? Object.entries(stats.countryCounts).sort((a, b) => b[1] - a[1])[0][0]
              : 'Pakistan'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Primary visitor region</div>
        </div>
      </div>

      {/* ==================== CONTROLS: SEARCH + FILTERS + ACTIONS ==================== */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by IP, Device ID, Country, Browser, Path..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playPopSound(600);
                fetchTelemetry();
              }}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FaArrowsRotate className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{autoRefresh ? 'Live ON' : 'Live OFF'}</span>
            </button>

            {visitors.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Clear all records"
              >
                <FaTrashCan />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400">Device:</span>
          {(['all', 'Mobile', 'Desktop', 'Tablet'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDeviceFilter(d)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                deviceFilter === d
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {d === 'all' ? 'All Devices' : d}
            </button>
          ))}

          <span className="text-[11px] font-bold text-slate-400 ml-2">Battery:</span>
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'charging', label: '⚡ Charging' },
              { id: 'battery', label: '🔋 On Battery' },
              { id: 'low', label: '⚠️ Low (&lt;20%)' },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              onClick={() => setBatteryFilter(b.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                batteryFilter === b.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== VISITORS TELEMETRY DATA TABLE ==================== */}
      <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading && visitors.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <FaArrowsRotate className="animate-spin text-2xl mx-auto text-cyan-500" />
            <div className="text-xs font-bold">Scanning Live Device Telemetry...</div>
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <FaMobileScreen className="text-3xl mx-auto text-slate-300" />
            <div className="text-xs font-bold text-slate-600">No visitor telemetry records found.</div>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Jab bhi koi user website par aayega, uski Device ID, IP, Country, Battery Level aur Browser details yahan live update honge!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-3.5">Device Fingerprint ID</th>
                  <th className="py-3 px-3">IP &amp; Country</th>
                  <th className="py-3 px-3">Device &amp; OS</th>
                  <th className="py-3 px-3">Browser</th>
                  <th className="py-3 px-3">Battery Status</th>
                  <th className="py-3 px-3">Hardware / Screen</th>
                  <th className="py-3 px-3">Visits &amp; Path</th>
                  <th className="py-3 px-3">Last Active</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisitors.map((v) => {
                  const isMobile = v.device_type === 'Mobile';
                  const isTablet = v.device_type === 'Tablet';
                  const isLowBattery = v.battery_raw !== undefined && v.battery_raw >= 0 && v.battery_raw <= 20;

                  return (
                    <tr key={v.id || v.fingerprint} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Device ID */}
                      <td className="py-3 px-3.5 font-mono text-[11px] font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {v.fingerprint}
                          </span>
                          <button
                            onClick={() => copyText(v.fingerprint, 'Device ID Copied!')}
                            className="text-slate-400 hover:text-cyan-600 p-1"
                            title="Copy Device ID"
                          >
                            <FaCopy className="text-[10px]" />
                          </button>
                        </div>
                      </td>

                      {/* 2. IP & Country */}
                      <td className="py-3 px-3 font-medium">
                        <div className="font-mono text-slate-900 font-bold text-[11px]">{v.ip_address}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span>{v.country === 'Pakistan' ? '🇵🇰' : v.country === 'Localhost' ? '🏠' : '🌐'}</span>
                          <span>{v.country || 'Unknown'}</span>
                          {v.city && <span className="text-slate-400">• {v.city}</span>}
                        </div>
                      </td>

                      {/* 3. Device & OS */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          {isMobile ? (
                            <FaMobileScreen className="text-pink-500 text-xs" />
                          ) : isTablet ? (
                            <FaTabletScreenButton className="text-purple-500 text-xs" />
                          ) : (
                            <FaLaptop className="text-indigo-500 text-xs" />
                          )}
                          <span>{v.device_type}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{v.os}</div>
                      </td>

                      {/* 4. Browser */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700">{v.browser}</span>
                        {v.language && <div className="text-[9px] text-slate-400 font-mono">Lang: {v.language}</div>}
                      </td>

                      {/* 5. Battery Status */}
                      <td className="py-3 px-3">
                        {v.battery_raw !== undefined && v.battery_raw >= 0 ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                v.battery_charging
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isLowBattery
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                                  : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                              }`}
                            >
                              {v.battery_charging ? (
                                <FaBolt className="text-amber-500 text-[10px]" />
                              ) : v.battery_raw > 75 ? (
                                <FaBatteryFull className="text-emerald-600" />
                              ) : v.battery_raw > 45 ? (
                                <FaBatteryThreeQuarters className="text-cyan-600" />
                              ) : (
                                <FaBatteryQuarter className="text-rose-600" />
                              )}
                              <span>{v.battery_level}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            N/A (Desktop)
                          </span>
                        )}
                      </td>

                      {/* 6. Hardware / Screen */}
                      <td className="py-3 px-3 text-[10px] text-slate-600 max-w-[160px] truncate" title={v.hardware_specs || v.screen_resolution}>
                        <div className="font-bold text-slate-700">{v.screen_resolution || 'Unknown Screen'}</div>
                        <div className="text-[9px] text-slate-400 truncate">{v.hardware_specs || 'Standard Device'}</div>
                      </td>

                      {/* 7. Visits & Path */}
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold text-[10px]">
                          {v.total_visits} {v.total_visits === 1 ? 'visit' : 'visits'}
                        </span>
                        <div className="font-mono text-[10px] text-slate-500 truncate max-w-[100px] mt-0.5" title={v.last_path}>
                          {v.last_path}
                        </div>
                      </td>

                      {/* 8. Last Active */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{getRelativeTime(v.last_seen)}</div>
                        <div className="text-[9px] text-slate-400">
                          {new Date(v.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* 9. Actions */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteVisitor(v.fingerprint)}
                          disabled={isDeleting === v.fingerprint}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete visitor"
                        >
                          <FaTrashCan className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVisitorTelemetryView;
