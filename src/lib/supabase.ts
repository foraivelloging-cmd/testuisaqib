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
      for (const fileName of candidateFiles) {
        const fullPath = path.join(cwd, fileName);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
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
        }
      }
    } catch {
      // Ignore
    }
  }

  const url =
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    cleanEnv(process.env.SUPABASE_URL) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL) ||
    cleanEnv(process.env.SUPABASE_PROJECT_URL) ||
    diskUrl ||
    '';

  const anonKey =
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_KEY) ||
    cleanEnv(process.env.SUPABASE_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    diskAnon ||
    '';

  return { url, anonKey };
}

const DEFAULT_SUPABASE_URL = 'https://ratihfmqpiqervqpkaml.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_MDzFyMLQ-tUHJHZQ8TWx_w_yNO9QZFn';

export function getSupabase(): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();
  const effectiveUrl = url || DEFAULT_SUPABASE_URL;
  const effectiveKey = anonKey || DEFAULT_ANON_KEY;
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
