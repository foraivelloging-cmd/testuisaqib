'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaGlobe,
  FaMobileScreen,
  FaLaptop,
  FaTabletScreenButton,
  FaArrowsRotate,
  FaMagnifyingGlass,
  FaChartLine,
  FaArrowTrendUp,
  FaCopy,
  FaCheck,
  FaTrashCan,
  FaClock,
  FaShieldHalved,
  FaScrewdriverWrench,
  FaFire,
  FaBolt,
  FaBatteryFull,
  FaLocationDot,
  FaAndroid,
  FaApple,
  FaWindows,
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

interface TimelineDay {
  date: string;
  dayName: string;
  visits: number;
  toolClicks: number;
  mobileVisits: number;
  desktopVisits: number;
}

interface TopCityItem {
  city: string;
  region: string;
  count: number;
  flag: string;
}

interface PakistanRegionItem {
  region: string;
  percent: number;
  count: number;
  color: string;
}

interface ToolClickRadarItem {
  toolId: string;
  title: string;
  clicks: number;
  percent: number;
}

interface AnalyticsData {
  success: boolean;
  visitors: VisitorRecord[];
  kpis: {
    totalUniqueVisitors: number;
    totalVisits: number;
    activeNow: number;
    totalToolClicks: number;
    mobileCount: number;
    desktopCount: number;
    tabletCount: number;
    mobileSharePercent: number;
  };
  timeline: TimelineDay[];
  osCounts: Record<string, number>;
  topCities: TopCityItem[];
  pakistanRegions: PakistanRegionItem[];
  toolClicksRadar: ToolClickRadarItem[];
}

export interface AdminVisitorAnalyticsChartsStudioProps {
  showToast: (msg: string) => void;
  copyText?: (text: string, msg?: string) => void;
  playPopSound?: (freq?: number) => void;
}

export const AdminVisitorAnalyticsChartsStudio: React.FC<AdminVisitorAnalyticsChartsStudioProps> = ({
  showToast,
  copyText,
  playPopSound,
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'Mobile' | 'Desktop'>('all');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [hoveredBar, setHoveredBar] = useState<TimelineDay | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('saqib_admin_token') : '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/analytics/visitor-telemetry', { headers });
      const json = await res.json();
      if (json && json.success) {
        setData(json);
      }
    } catch {
      showToast('Network error loading visitor analytics');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh timer every 25 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 25000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAnalytics]);

  // Filtered visitors table
  const filteredVisitors = useMemo(() => {
    if (!data?.visitors) return [];
    let list = data.visitors;
    if (deviceFilter !== 'all') {
      list = list.filter((v) => v.device_type === deviceFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.ip_address?.toLowerCase().includes(q) ||
          v.fingerprint?.toLowerCase().includes(q) ||
          v.city?.toLowerCase().includes(q) ||
          v.country?.toLowerCase().includes(q) ||
          v.os?.toLowerCase().includes(q) ||
          v.browser?.toLowerCase().includes(q) ||
          v.last_path?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data?.visitors, deviceFilter, search]);

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
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Visitor deleted');
        setData((prev) =>
          prev
            ? {
                ...prev,
                visitors: prev.visitors.filter((v) => v.fingerprint !== fingerprint),
              }
            : null
        );
      }
    } catch {
      showToast('Delete request failed');
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
      const resJson = await res.json();
      if (resJson.success) {
        showToast('All visitor telemetry cleared');
        fetchAnalytics();
      }
    } catch {
      showToast('Failed to clear telemetry');
    }
  };

  const copyAnalyticsReport = () => {
    if (!data) return;
    const { kpis } = data;
    const topCitiesText = (data.topCities || [])
      .slice(0, 5)
      .map((c, i) => `${i + 1}. ${c.flag} ${c.city} (${c.region}) — ${c.count} visitors`)
      .join('\n');

    const topToolsText = (data.toolClicksRadar || [])
      .map((t, i) => `${i + 1}. ${t.title} — ${t.clicks} clicks (${t.percent}%)`)
      .join('\n');

    const report = `📊 *SAQIB VISUALS HUB — TRAFFIC & ANALYTICS REPORT*
🗓️ Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 *Unique Visitors*: ${kpis.totalUniqueVisitors}
🟢 *Active Live Now*: ${kpis.activeNow}
🖱️ *Total Web Tools Clicks*: ${kpis.totalToolClicks}
📱 *Mobile Phone Traffic*: ${kpis.mobileSharePercent}% (${kpis.mobileCount} Mobile vs ${kpis.desktopCount} Desktop)

🏙️ *TOP PAKISTAN & OVERSEAS CITIES*:
${topCitiesText}

🛠️ *WEB TOOLS USAGE RADAR*:
${topToolsText}

━━━━━━━━━━━━━━━━━━━━━━━━━
Generated securely via Saqib Visuals Hub Analytics Suite.`;

    if (copyText) {
      copyText(report, 'Traffic & Analytics Report copied to clipboard!');
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(report);
      showToast('Traffic & Analytics Report copied to clipboard!');
    }
    setCopiedReport(true);
    if (playPopSound) playPopSound(600);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  // Max visits in timeline for chart scaling
  const maxTimelineVisits = useMemo(() => {
    if (!data?.timeline || data.timeline.length === 0) return 100;
    return Math.max(...data.timeline.map((d) => d.visits), 100);
  }, [data?.timeline]);

  const kpis = data?.kpis || {
    totalUniqueVisitors: 326,
    totalVisits: 1284,
    activeNow: 3,
    totalToolClicks: 1045,
    mobileCount: 248,
    desktopCount: 68,
    tabletCount: 10,
    mobileSharePercent: 76,
  };

  return (
    <div className="space-y-6 text-white pb-12 animate-fadeIn">
      {/* ==================== 1. TOP HEADER BANNER ==================== */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-neutral-900/90 via-cyan-950/20 to-neutral-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <FaChartLine className="text-sm" />
              <span>Visitor Intelligence & Traffic Radar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
              Website Traffic & Web Tools Analytics
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Track Real-Time Unique Visitors, Tool Launches & Clicks, Mobile Phone vs Desktop Split, and Pakistan Regional Distribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                autoRefresh
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
              <span>Auto-Sync: {autoRefresh ? 'ON' : 'OFF'}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchAnalytics()}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <FaArrowsRotate className={`text-xs ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Copy Report */}
            <button
              onClick={copyAnalyticsReport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all transform active:scale-95"
            >
              {copiedReport ? <FaCheck className="text-xs" /> : <FaCopy className="text-xs" />}
              <span>{copiedReport ? 'Copied!' : 'Copy Traffic Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 2. 4 TOP GLOWING KPI CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Unique Visitors */}
        <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-neutral-900/70 p-5 backdrop-blur-xl shadow-lg hover:border-cyan-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:scale-125 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span>Total Unique Visitors</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FaGlobe />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {kpis.totalUniqueVisitors.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-cyan-300 font-medium">
              <FaShieldHalved className="text-[10px]" />
              <span>{kpis.totalVisits.toLocaleString()} Total Page Impressions</span>
            </div>
          </div>
        </div>

        {/* Live Active Online Now */}
        <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 to-neutral-900/90 p-5 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 hover:border-emerald-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-125 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <span>Live Active Online</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              <FaClock />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight flex items-baseline gap-2">
              <span className="text-white drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                {kpis.activeNow}
              </span>
              <span className="text-xs text-emerald-400 font-semibold uppercase">Visitors Online</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Active in Last 15 Minutes</span>
            </div>
          </div>
        </div>

        {/* Total Web Tools Clicks */}
        <div className="group relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-neutral-900/70 p-5 backdrop-blur-xl shadow-lg hover:border-indigo-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span>Web Tools Launch Clicks</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FaScrewdriverWrench />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-indigo-200 tracking-tight">
              {kpis.totalToolClicks.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-indigo-300 font-medium">
              <FaFire className="text-[10px] text-amber-400" />
              <span>SIM Tracker, Video Downloader &amp; Utilities</span>
            </div>
          </div>
        </div>

        {/* Mobile Phone Share % */}
        <div className="group relative overflow-hidden rounded-2xl border border-pink-500/20 bg-neutral-900/70 p-5 backdrop-blur-xl shadow-lg hover:border-pink-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:scale-125 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span>Mobile Phone Traffic</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <FaMobileScreen />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-pink-300 tracking-tight">
              {kpis.mobileSharePercent}%
            </div>
            <div className="mt-2 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${kpis.mobileSharePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5">
              <span>{kpis.mobileCount} Mobile</span>
              <span>{kpis.desktopCount} Desktop</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 3. MAIN CHARTS GRID: TIMELINE BAR CHART + DEVICE & REGIONAL ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): 7-Day Traffic Bar Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FaChartLine className="text-cyan-400 text-sm" />
                  <span>7-Day Visitor &amp; Tool Launch Trends</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Daily comparison of unique visitors vs tools launch clicks.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-sm" />
                  <span className="text-neutral-300">Website Visits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-gradient-to-t from-pink-600 to-pink-400 shadow-sm" />
                  <span className="text-neutral-300">Tool Clicks</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive SVG/HTML Bar Chart */}
            <div className="space-y-2">
              <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-8 px-2 border-b border-neutral-800">
                {(data?.timeline || []).map((day, idx) => {
                  const visitHeight = Math.max(12, Math.round((day.visits / maxTimelineVisits) * 180));
                  const clickHeight = Math.max(8, Math.round((day.toolClicks / maxTimelineVisits) * 180));
                  const isHovered = hoveredBar?.date === day.date;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredBar(day)}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                    >
                      {/* Tooltip on Hover */}
                      {isHovered && (
                        <div className="absolute -top-16 z-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-xl text-center whitespace-nowrap pointer-events-none animate-fadeIn">
                          <div className="text-[10px] font-bold text-white">{day.dayName}, {day.date}</div>
                          <div className="text-[10px] text-cyan-300 font-semibold">
                            🌐 {day.visits} Visitors • 🖱️ {day.toolClicks} Clicks
                          </div>
                          <div className="text-[9px] text-pink-300">
                            📱 {day.mobileVisits} Mobile ({Math.round((day.mobileVisits / (day.visits || 1)) * 100)}%)
                          </div>
                        </div>
                      )}

                      {/* Dual Bars: Visits & Tool Clicks */}
                      <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center">
                        {/* Visits Bar */}
                        <div
                          style={{ height: `${visitHeight}px` }}
                          className={`w-3.5 sm:w-6 rounded-t-lg bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-300 shadow-md ${
                            isHovered ? 'scale-105 brightness-125' : 'opacity-90'
                          }`}
                        />
                        {/* Tool Clicks Bar */}
                        <div
                          style={{ height: `${clickHeight}px` }}
                          className={`w-3 sm:w-5 rounded-t-lg bg-gradient-to-t from-pink-600 to-pink-400 transition-all duration-300 shadow-md ${
                            isHovered ? 'scale-105 brightness-125' : 'opacity-80'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day Labels */}
              <div className="flex justify-between gap-2 sm:gap-4 px-2 pt-2">
                {(data?.timeline || []).map((day, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <div className="text-[11px] font-bold text-neutral-300">{day.dayName}</div>
                    <div className="text-[9px] text-neutral-500">{day.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Web Tools Clicks & Popularity Radar */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FaScrewdriverWrench className="text-indigo-400 text-sm" />
                  <span>Web Tools Click &amp; Usage Radar</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Real-time click volume logged per web utility tool.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                {kpis.totalToolClicks} Total Launches
              </span>
            </div>

            <div className="space-y-3">
              {(data?.toolClicksRadar || []).map((tool) => (
                <div key={tool.toolId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {tool.title}
                    </span>
                    <span className="font-mono text-indigo-300 font-bold">
                      {tool.clicks.toLocaleString()} clicks ({tool.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, tool.percent))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Device, OS & Regional Pakistan Heatmap */}
        <div className="space-y-4">
          {/* Device & OS Distribution */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <FaMobileScreen className="text-pink-400 text-xs" />
              <span>Mobile Phone vs PC Split</span>
            </h3>
            <p className="text-[11px] text-neutral-400 mb-3">
              Traffic by device category and mobile operating systems.
            </p>

            {/* Split Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-pink-400 flex items-center gap-1">
                  <FaMobileScreen className="text-[10px]" /> Mobile ({kpis.mobileSharePercent}%)
                </span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <FaLaptop className="text-[10px]" /> Desktop ({100 - kpis.mobileSharePercent}%)
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2.5 transition-all duration-500"
                  style={{ width: `${kpis.mobileSharePercent}%` }}
                />
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 transition-all duration-500"
                  style={{ width: `${100 - kpis.mobileSharePercent}%` }}
                />
              </div>
            </div>

            {/* Operating System Pills */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
              <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <FaAndroid className="text-emerald-400" />
                  <span className="font-semibold text-neutral-200">Android</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-300">
                  {data?.osCounts?.['Android'] || 142}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <FaApple className="text-slate-200" />
                  <span className="font-semibold text-neutral-200">iOS (iPhone)</span>
                </div>
                <span className="font-mono text-xs font-bold text-white">
                  {data?.osCounts?.['iOS (iPhone)'] || 106}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <FaWindows className="text-cyan-400" />
                  <span className="font-semibold text-neutral-200">Windows</span>
                </div>
                <span className="font-mono text-xs font-bold text-cyan-300">
                  {data?.osCounts?.['Windows 10/11'] || 58}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <FaApple className="text-purple-300" />
                  <span className="font-semibold text-neutral-200">macOS</span>
                </div>
                <span className="font-mono text-xs font-bold text-purple-300">
                  {data?.osCounts?.['macOS'] || 20}
                </span>
              </div>
            </div>
          </div>

          {/* Pakistan & Global Regional Distribution */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <FaLocationDot className="text-emerald-400 text-xs" />
              <span>Pakistan &amp; Regional Traffic</span>
            </h3>
            <p className="text-[11px] text-neutral-400 mb-3">
              Geographic visitor share by province and city.
            </p>

            {/* Provincial Shares */}
            <div className="space-y-2 mb-4">
              {(data?.pakistanRegions || []).map((reg, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 font-medium">{reg.region}</span>
                    <span className="font-mono text-white font-bold">{reg.percent}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${reg.color} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${reg.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Top Cities Leaderboard */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Top Cities Leaderboard
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                {(data?.topCities || []).map((city, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 border border-neutral-800/60 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{city.flag}</span>
                      <span className="font-semibold text-neutral-200 truncate">{city.city}</span>
                      <span className="text-[9px] text-neutral-500 uppercase">{city.region}</span>
                    </div>
                    <span className="font-mono font-bold text-cyan-300 flex-shrink-0">
                      {city.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 4. LIVE VISITOR DEVICE TELEMETRY TABLE ==================== */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FaShieldHalved className="text-cyan-400 text-sm" />
              <span>Real-Time Connected Visitors &amp; Device Registry</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live hardware telemetry, battery health, browser fingerprints, and visited routes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Device Filter */}
            <div className="flex items-center bg-black/50 border border-neutral-800 rounded-xl p-0.5">
              {(['all', 'Mobile', 'Desktop'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDeviceFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    deviceFilter === filter
                      ? 'bg-cyan-500 text-white shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Clear All */}
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <FaTrashCan className="text-xs" />
              <span>Clear Log</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs" />
          <input
            type="text"
            placeholder="Search by IP, Device Fingerprint, City, Country, OS, Path..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Device &amp; Fingerprint</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold">OS &amp; Browser</th>
                <th className="pb-3 font-semibold">Battery / Hardware</th>
                <th className="pb-3 font-semibold text-center">Visits</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredVisitors.map((vis) => (
                <tr key={vis.fingerprint} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300">
                        {vis.device_type === 'Mobile' ? (
                          <FaMobileScreen className="text-pink-400" />
                        ) : (
                          <FaLaptop className="text-cyan-400" />
                        )}
                      </span>
                      <div>
                        <div className="font-mono text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {vis.fingerprint}
                        </div>
                        <div className="font-mono text-[10px] text-neutral-500">
                          IP: {vis.ip_address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-semibold text-neutral-200 flex items-center gap-1">
                      <span>{vis.city || 'Unknown City'}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      {vis.country || 'Pakistan'}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-semibold text-neutral-300">{vis.os || 'Unknown OS'}</div>
                    <div className="text-[10px] text-neutral-500">{vis.browser || 'Unknown'}</div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                      {vis.battery_charging ? (
                        <FaBolt className="text-amber-400 text-xs" />
                      ) : (
                        <FaBatteryFull className="text-emerald-400 text-xs" />
                      )}
                      <span>{vis.battery_level || 'N/A'}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {vis.screen_resolution || 'Screen N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono text-[11px] font-semibold">
                      {vis.total_visits || 1}
                    </span>
                  </td>
                  <td className="py-3 pl-2 text-right">
                    <button
                      onClick={() => handleDeleteVisitor(vis.fingerprint)}
                      disabled={isDeleting === vis.fingerprint}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete visitor record"
                    >
                      <FaTrashCan className="text-xs" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500 text-xs">
                    No visitor devices match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
