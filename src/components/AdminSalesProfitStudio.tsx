'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FaMoneyBillTrendUp,
  FaSackDollar,
  FaCoins,
  FaArrowTrendUp,
  FaArrowRotateRight,
  FaCopy,
  FaCheck,
  FaMagnifyingGlass,
  FaScrewdriverWrench,
  FaBagShopping,
  FaCalculator,
  FaCircleCheck,
  FaFire,
  FaPercent,
} from 'react-icons/fa6';

export interface AdminSalesProfitStudioProps {
  showToast: (msg: string) => void;
  playPopSound?: (freq?: number) => void;
  copyText?: (text: string, msg?: string) => void;
}

interface ProductProfitStat {
  serviceId: string;
  title: string;
  category: string;
  unitsSold: number;
  grossSales: number;
  wholesaleCost: number;
  netProfit: number;
  marginPercent: number;
}

interface ToolUsageStat {
  toolId: string;
  title: string;
  totalLaunches: number;
  uniqueUsers: number;
  revenueGenerated: number;
}

interface SalesProfitData {
  success: boolean;
  range: string;
  kpis: {
    totalGrossSales: number;
    totalWholesaleCost: number;
    netPureProfit: number;
    netMarginPercent: number;
    totalOrdersCount: number;
    currency: string;
  };
  productBreakdown: ProductProfitStat[];
  webToolsRadar: ToolUsageStat[];
}

export function AdminSalesProfitStudio({
  showToast,
  playPopSound,
  copyText,
}: AdminSalesProfitStudioProps) {
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('all');
  const [data, setData] = useState<SalesProfitData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Quick Margin Simulator State
  const [simSellPrice, setSimSellPrice] = useState<number>(2499);
  const [simCostPrice, setSimCostPrice] = useState<number>(1100);

  const getAdminHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = typeof window !== 'undefined' ? localStorage.getItem('saqib_admin_token') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchSalesProfitData = async (selectedRange = range) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/sales-profit?range=${selectedRange}`, {
        headers: getAdminHeaders(),
      });
      const json = await res.json();
      if (json && json.success) {
        setData(json);
      } else {
        showToast(json.error || 'Failed to load sales analytics');
      }
    } catch {
      showToast('Network error loading P&L analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesProfitData(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const filteredProducts = useMemo(() => {
    if (!data?.productBreakdown) return [];
    if (!searchQuery.trim()) return data.productBreakdown;
    const q = searchQuery.toLowerCase();
    return data.productBreakdown.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [data?.productBreakdown, searchQuery]);

  const copyPnLReport = () => {
    if (!data) return;
    const { kpis } = data;
    const rangeLabel =
      range === 'today'
        ? "Today's Ledger"
        : range === '7d'
        ? 'Last 7 Days'
        : range === '30d'
        ? 'Last 30 Days'
        : 'All-Time Lifetime';

    const topProducts = (data.productBreakdown || [])
      .slice(0, 5)
      .map(
        (p, idx) =>
          `${idx + 1}. ${p.title} (${p.unitsSold} sold) -> Gross: ₨${p.grossSales.toLocaleString()} | Profit: ₨${p.netProfit.toLocaleString()} (${p.marginPercent}%)`
      )
      .join('\n');

    const topTools = (data.webToolsRadar || [])
      .slice(0, 4)
      .map(
        (t, idx) =>
          `${idx + 1}. ${t.title} -> ${t.totalLaunches.toLocaleString()} Clicks / Runs`
      )
      .join('\n');

    const report = `📊 *SAQIB VISUALS HUB — P&L FINANCIAL REPORT*
🗓️ Period: ${rangeLabel}
━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Gross Sales*: ₨ ${kpis.totalGrossSales.toLocaleString()}
📦 *Wholesale Cost (COGS)*: ₨ ${kpis.totalWholesaleCost.toLocaleString()}
✨ *NET PURE PROFIT*: ₨ ${kpis.netPureProfit.toLocaleString()}
📈 *Net Margin*: ${kpis.netMarginPercent}%
🛍️ *Total Orders*: ${kpis.totalOrdersCount}

🔥 *TOP 5 REVENUE GENERATORS*:
${topProducts || 'No sales recorded'}

🛠️ *TOP WEB TOOLS TRAFFIC*:
${topTools || 'No tools data'}

━━━━━━━━━━━━━━━━━━━━━━━━━
Generated securely via Saqib Visuals Hub P&L Engine.`;

    if (copyText) {
      copyText(report, 'P&L Report copied to clipboard!');
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(report);
      showToast('P&L Report copied to clipboard!');
    }
    setCopiedReport(true);
    if (playPopSound) playPopSound(600);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  const simProfit = Math.max(0, simSellPrice - simCostPrice);
  const simMargin = simSellPrice > 0 ? Math.round((simProfit / simSellPrice) * 100) : 0;

  return (
    <div className="space-y-6 text-white pb-12 animate-fadeIn">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-neutral-900/90 via-emerald-950/20 to-neutral-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <FaMoneyBillTrendUp className="text-sm" />
              <span>Financial Analytics & Profit Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
              P&L Engine & Revenue Radar
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Track Real-Time Gross Revenue, Wholesale Fulfillment Costs, Net Cash Profits, and Web Tools Launch Traffic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Range Selector */}
            <div className="flex items-center bg-black/50 border border-neutral-800 rounded-xl p-1 shadow-inner">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: 'all', label: 'All Time' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    range === tab.id
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchSalesProfitData()}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <FaArrowRotateRight className={`text-xs ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Copy Report Button */}
            <button
              onClick={copyPnLReport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all transform active:scale-95"
            >
              {copiedReport ? <FaCheck className="text-xs" /> : <FaCopy className="text-xs" />}
              <span>{copiedReport ? 'Copied!' : 'Copy P&L Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Glowing KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-neutral-900/70 p-5 backdrop-blur-xl shadow-lg hover:border-purple-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span>Gross Sales (Revenue)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FaCoins />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ₨ {data?.kpis.totalGrossSales.toLocaleString() || '0'}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-purple-300 font-medium">
              <FaBagShopping className="text-[10px]" />
              <span>{data?.kpis.totalOrdersCount || 0} Total Completed Orders</span>
            </div>
          </div>
        </div>

        {/* Wholesale Cost */}
        <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-neutral-900/70 p-5 backdrop-blur-xl shadow-lg hover:border-amber-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span>Wholesale Cost (COGS)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FaSackDollar />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-200 tracking-tight">
              ₨ {data?.kpis.totalWholesaleCost.toLocaleString() || '0'}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-amber-400 font-medium">
              <span>Direct Vendor & Activation Cost</span>
            </div>
          </div>
        </div>

        {/* Net Pure Profit (Glowing Emerald) */}
        <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 to-neutral-900/90 p-5 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 hover:border-emerald-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-125 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <span>Net Pure Profit</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              <FaArrowTrendUp />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight flex items-baseline gap-1">
              <span>₨</span>
              <span className="text-white drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                {data?.kpis.netPureProfit.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-400 font-bold">
              <FaCircleCheck className="text-[10px]" />
              <span>Real Take-Home Cash Flow</span>
            </div>
          </div>
        </div>

        {/* Net Profit Margin % */}
        <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-neutral-900/70 p-5 backdrop-blur-xl shadow-lg hover:border-cyan-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:scale-125 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span>Profit Margin</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FaPercent />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-cyan-300 tracking-tight">
              {data?.kpis.netMarginPercent || 0}%
            </div>
            <div className="mt-2 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, data?.kpis.netMarginPercent || 0))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Products Table + Web Tools & Margin Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Products Profit Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FaBagShopping className="text-emerald-400 text-sm" />
                  <span>Product Sales & Profit Breakdown</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Performance sorted by net profit generated per product subscription.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold text-center">Sold</th>
                    <th className="pb-3 font-semibold text-right">Gross</th>
                    <th className="pb-3 font-semibold text-right">Cost</th>
                    <th className="pb-3 font-semibold text-right">Net Profit</th>
                    <th className="pb-3 font-semibold text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {filteredProducts.map((p) => {
                    const isProfitable = p.netProfit > 0;
                    return (
                      <tr key={p.serviceId} className="hover:bg-neutral-800/30 transition-colors group">
                        <td className="py-3 pr-2">
                          <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                            {p.title}
                          </div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                            {p.category}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono text-[11px] font-semibold">
                            {p.unitsSold}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-neutral-300">
                          ₨ {p.grossSales.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-neutral-400">
                          ₨ {p.wholesaleCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-emerald-400">
                          ₨ {p.netProfit.toLocaleString()}
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-semibold font-mono ${
                                isProfitable ? 'text-emerald-400' : 'text-neutral-400'
                              }`}
                            >
                              {p.marginPercent}%
                            </span>
                            <div className="w-14 bg-neutral-800 rounded-full h-1 mt-1 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-1 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, p.marginPercent))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-500 text-xs">
                        No products match your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Web Tools Radar & Margin Simulator */}
        <div className="space-y-4">
          {/* Web Tools Usage Radar */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FaScrewdriverWrench className="text-cyan-400 text-xs" />
                  <span>Web Tools Usage Radar</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Viral launch clicks & direct ad revenue.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-semibold flex items-center gap-1">
                <FaFire className="text-[9px]" /> Live
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              {(data?.webToolsRadar || []).slice(0, 6).map((tool) => (
                <div
                  key={tool.toolId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-neutral-800/70 hover:border-cyan-500/30 transition-all"
                >
                  <div className="truncate mr-2">
                    <div className="text-xs font-semibold text-neutral-200 truncate">
                      {tool.title}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      ₨ {tool.revenueGenerated.toLocaleString()} Ad Revenue
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-cyan-300 font-mono">
                      {tool.totalLaunches.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-500 ml-1">runs</span>
                  </div>
                </div>
              ))}

              {(!data?.webToolsRadar || data.webToolsRadar.length === 0) && (
                <div className="text-center py-6 text-neutral-500 text-xs">
                  No tool launch events recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Pricing & Profit Margin Simulator */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <FaCalculator className="text-emerald-400 text-xs" />
              <span>Instant Margin Simulator</span>
            </h3>
            <p className="text-[11px] text-neutral-400 mb-3">
              Model your pricing and take-home cash per item.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider block mb-1">
                  Retail Selling Price (PKR)
                </label>
                <input
                  type="number"
                  value={simSellPrice}
                  onChange={(e) => setSimSellPrice(Number(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider block mb-1">
                  Wholesale Cost / COGS (PKR)
                </label>
                <input
                  type="number"
                  value={simCostPrice}
                  onChange={(e) => setSimCostPrice(Number(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Simulation Result */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
                    Pure Profit per Sale
                  </div>
                  <div className="text-base font-black text-white font-mono">
                    ₨ {simProfit.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
                    Margin
                  </div>
                  <div className="text-base font-black text-emerald-300 font-mono">
                    {simMargin}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
