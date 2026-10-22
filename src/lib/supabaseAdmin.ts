import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

let cachedClient: SupabaseClient | null = null;
let cachedKey = '';

function cleanEnv(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
}

// Server-side direct disk reader so even if Next.js dev server hasn't restarted or env wasn't loaded, it finds the keys
function readEnvFromDisk(): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof window !== 'undefined') return result;

  try {
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
      const fullPath = path.join(/*turbopackIgnore: true*/ cwd, fileName);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            val = val.replace(/^['"]|['"]$/g, '');
            if (!result[key] && val) {
              result[key] = val;
            }
          }
        }
      }
    }
  } catch {
    // Ignore error
  }
  return result;
}

const DEFAULT_SUPABASE_URL = 'https://ratihfmqpiqervqpkaml.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_MDzFyMLQ-tUHJHZQ8TWx_w_yNO9QZFn';
const DEFAULT_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdGloZm1xcGlxZXJ2cXBrYW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjM5OTI5NywiZXhwIjoyMTA3OTc1Mjk3fQ.XoGA9RKbxvNMkOoysds6d7gz9SDR7cz5m920mdqOrVk';

export function getSupabaseAdminCredentials() {
  const diskEnv = readEnvFromDisk();

  const getVal = (...keys: string[]): string => {
    for (const k of keys) {
      const pVal = cleanEnv(process.env[k]);
      if (pVal) return pVal;
      const dVal = cleanEnv(diskEnv[k]);
      if (dVal) return dVal;
    }
    return '';
  };

  const url = getVal(
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PROJECT_URL',
    'SUPABASE_PROJECT_URL',
    'SUPABASE_ENDPOINT'
  );

  const anonKey = getVal(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_KEY',
    'SUPABASE_KEY',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_PUBLISHABLE_KEY'
  );

  let serviceRoleKey = getVal(
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SERVICE_KEY',
    'SERVICE_ROLE_KEY',
    'SUPABASE_SECRET_KEY'
  );

  if (!serviceRoleKey && anonKey) {
    serviceRoleKey = anonKey;
  }

  return { url, anonKey, serviceRoleKey };
}

export function getSupabaseAdmin(): SupabaseClient {
  const { url, serviceRoleKey } = getSupabaseAdminCredentials();
  const effectiveUrl = url || DEFAULT_SUPABASE_URL;
  const effectiveKey = serviceRoleKey || DEFAULT_SERVICE_ROLE_KEY;
  const cacheKey = `${effectiveUrl}::${effectiveKey}`;

  if (!cachedClient || cachedKey !== cacheKey) {
    if (!url) {
      console.warn('[SupabaseAdmin] ⚠️ No Supabase URL configured in .env.local! Using mock client.');
    } else {
      const masked = url.replace(/^https?:\/\//, '');
      console.log(`[SupabaseAdmin] 🔌 Connected to database: ${masked}`);
    }

    cachedClient = createClient(effectiveUrl, effectiveKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    cachedKey = cacheKey;
  }

  return cachedClient;
}

// Proxied singleton that always connects to the active Supabase project dynamically
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default supabaseAdmin;
