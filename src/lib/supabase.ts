import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let cachedKey = '';

function cleanEnv(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
}

export function getSupabaseCredentials() {
  let diskUrl = '';
  let diskAnon = '';

  // Server-side fallback disk check
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      const cwd = process.cwd();
      const candidateFiles = [
        '.env.local',
        '.env',
        'env.local',
        'env',
        '.env.txt',
        '.env.local.txt',
        '.env.development',
        '.env.production',
      ];

      const existingCandidates: { name: string; fullPath: string; mtime: number }[] = [];
      for (const fileName of candidateFiles) {
        const fullPath = path.join(cwd, fileName);
        if (fs.existsSync(fullPath)) {
          try {
            const stats = fs.statSync(fullPath);
            existingCandidates.push({ name: fileName, fullPath, mtime: stats.mtimeMs });
          } catch {}
        }
      }

      // Sort: most recently modified file takes top priority
      existingCandidates.sort((a, b) => b.mtime - a.mtime);

      for (const cand of existingCandidates) {
        const content = fs.readFileSync(cand.fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const k = trimmed.slice(0, eqIdx).trim();
            const v = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!diskUrl && (k === 'NEXT_PUBLIC_SUPABASE_URL' || k === 'SUPABASE_URL' || k === 'NEXT_PUBLIC_SUPABASE_PROJECT_URL' || k === 'SUPABASE_PROJECT_URL')) {
              diskUrl = v;
            }
            if (!diskAnon && (k === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' || k === 'SUPABASE_ANON_KEY' || k === 'NEXT_PUBLIC_SUPABASE_KEY' || k === 'SUPABASE_KEY' || k === 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')) {
              diskAnon = v;
            }
          }
        }
        if (diskUrl && diskAnon) break;
      }
    } catch {
      // Ignore
    }
  }

  let url =
    diskUrl ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    cleanEnv(process.env.SUPABASE_URL) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL) ||
    cleanEnv(process.env.SUPABASE_PROJECT_URL) ||
    '';

  // Normalize project ID to full URL
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.supabase.co')) {
      url = `https://${url}`;
    } else if (/^[a-z0-9_-]{15,30}$/i.test(url)) {
      url = `https://${url}.supabase.co`;
    }
  }

  const anonKey =
    diskAnon ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_KEY) ||
    cleanEnv(process.env.SUPABASE_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    '';

  return { url, anonKey };
}

const PLACEHOLDER_URL = 'https://unconfigured-project.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.unconfigured';

export function getSupabase(): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();
  const effectiveUrl = url || PLACEHOLDER_URL;
  const effectiveKey = anonKey || PLACEHOLDER_KEY;
  const cacheKey = `${effectiveUrl}::${effectiveKey}`;

  if (!cachedClient || cachedKey !== cacheKey) {
    cachedClient = createClient(effectiveUrl, effectiveKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedKey = cacheKey;
  }

  return cachedClient;
}

// Proxied singleton that always connects to the active Supabase project dynamically
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default supabase;
