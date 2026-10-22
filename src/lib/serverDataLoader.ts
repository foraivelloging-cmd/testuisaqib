import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { supabaseAdmin } from './supabaseAdmin';
import {
  DEFAULT_STORE_SERVICES,
  DEFAULT_WEB_TOOLS,
  StoreService,
  WebToolItem
} from '../data/defaultCatalog';
import { DEFAULT_SITE_CONFIG, SiteSettingsConfig, deepMergeSiteConfig } from '../types/siteConfig';
import { DEFAULT_REVIEWS } from '@/app/api/reviews/route';

export interface ServerStoreData {
  services: StoreService[];
  webTools: WebToolItem[];
  siteConfig: SiteSettingsConfig;
  reviews: typeof DEFAULT_REVIEWS;
}

// In-Memory Stale-While-Revalidate Server Cache (60 seconds TTL)
let cachedStoreData: ServerStoreData | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Manually invalidate the in-memory server cache.
 * Call this from API routes whenever an admin updates services, tools, or site config.
 */
export function invalidateServerStoreCache(): void {
  cachedStoreData = null;
  lastCacheTime = 0;
}

function normalizeTiers(rawTiers: unknown): string[] {
  let arr: unknown[] = [];
  if (Array.isArray(rawTiers)) {
    arr = rawTiers;
  } else if (typeof rawTiers === 'string') {
    try {
      const parsed = JSON.parse(rawTiers);
      if (Array.isArray(parsed)) arr = parsed;
      else arr = [rawTiers];
    } catch {
      arr = rawTiers.split('\n').map((s) => s.trim()).filter(Boolean);
    }
  }

  return arr
    .map((t) => {
      if (!t) return '';
      if (typeof t === 'string') return t;
      if (typeof t === 'object' && t !== null) {
        const obj = t as { name?: string; title?: string; label?: string; price?: number | string };
        const name = obj.name || obj.title || obj.label || '';
        const price = obj.price !== undefined ? ` — Rs. ${Number(obj.price).toLocaleString()}` : '';
        return (name + price).trim() || JSON.stringify(t);
      }
      return String(t);
    })
    .filter(Boolean);
}

function getLocalDiskBackupConfig(): SiteSettingsConfig | null {
  try {
    const backupFile = path.join(process.cwd(), 'data', 'site_config.json');
    if (fs.existsSync(backupFile)) {
      const raw = fs.readFileSync(backupFile, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return deepMergeSiteConfig(parsed);
      }
    }
  } catch {}
  return null;
}

/**
 * High-performance SSR data loader.
 * Uses Promise.allSettled to execute all Supabase queries in parallel (1 roundtrip instead of 4),
 * caches results in server memory for 60 seconds, and deduplicates within the same request using React cache().
 */
export const getServerStoreData = cache(async (): Promise<ServerStoreData> => {
  // Check if active in-memory cache is still warm
  const now = Date.now();
  if (cachedStoreData && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedStoreData;
  }

  // 1. Parallel execution across all 4 database endpoints
  const [srvResult, toolResult, cfgResult, revResult] = await Promise.allSettled([
    supabaseAdmin
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabaseAdmin
      .from('web_tools')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabaseAdmin
      .from('site_config')
      .select('config')
      .eq('id', 'default')
      .maybeSingle(),
    supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  // Process Services
  let services = DEFAULT_STORE_SERVICES;
  if (srvResult.status === 'fulfilled' && srvResult.value?.data && srvResult.value.data.length > 0) {
    services = srvResult.value.data.map((row) => ({
      id: row.id,
      category: row.category,
      badge: row.badge,
      title: row.title,
      desc: row.desc || '',
      plush: row.plush || 'plush-srv-1',
      orbGrad: row.orb_grad || 'from-pink-500 to-rose-600',
      iconType: row.icon_type,
      customIconUrl: row.custom_icon_url,
      directToolUrl: row.direct_tool_url,
      inputLabel: row.input_label || 'Your Requirement',
      placeholder: row.placeholder || 'Enter details...',
      tiers: normalizeTiers(row.tiers),
      hidden: row.hidden ?? false,
    }));
  }

  // Process Web Tools
  let webTools = DEFAULT_WEB_TOOLS;
  if (toolResult.status === 'fulfilled' && toolResult.value?.data && toolResult.value.data.length > 0) {
    webTools = toolResult.value.data.map((row) => ({
      id: row.id,
      title: row.title,
      desc: row.desc || '',
      toolUrl: row.tool_url,
      iconUrl: row.icon_url || '',
      badge: row.badge || 'ONLINE',
      buttonLabel: row.button_label || 'Open Live Tool',
      iconType: row.icon_type || 'wand',
      orbGrad: row.orb_grad || 'from-indigo-600 to-purple-600',
      plush: row.plush || 'plush-website',
      openMode: (row.open_mode as 'new_tab' | 'embed_modal' | 'sim_tab') || 'new_tab',
      hidden: row.hidden ?? false,
    }));
  }

  // Process Site Config
  let siteConfig = DEFAULT_SITE_CONFIG;
  if (cfgResult.status === 'fulfilled' && cfgResult.value?.data?.config) {
    siteConfig = deepMergeSiteConfig(cfgResult.value.data.config);
  } else {
    const backup = getLocalDiskBackupConfig();
    if (backup) {
      siteConfig = backup;
    }
  }

  // Process Reviews
  let reviews = DEFAULT_REVIEWS;
  if (revResult.status === 'fulfilled' && revResult.value?.data && revResult.value.data.length > 0) {
    reviews = revResult.value.data;
  }

  const loadedData: ServerStoreData = {
    services,
    webTools,
    siteConfig,
    reviews,
  };

  // Cache in server memory
  cachedStoreData = loadedData;
  lastCacheTime = Date.now();

  return loadedData;
});
