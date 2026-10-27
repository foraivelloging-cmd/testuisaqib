import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

let cachedClient: SupabaseClient | null = null;
let cachedKey = '';

function cleanEnv(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
}

interface DiskEnvInfo {
  env: Record<string, string>;
  sourceFile: string;
  detectedFiles: string[];
}

// Server-side direct disk reader so even if Next.js dev server hasn't restarted or env wasn't loaded, it finds the keys
export function readEnvFromDisk(): DiskEnvInfo {
  const result: Record<string, string> = {};
  const detectedFiles: string[] = [];
  let sourceFile = 'none';

  if (typeof window !== 'undefined') {
    return { env: result, sourceFile: 'browser', detectedFiles: [] };
  }

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

    // Collect all existing candidate files and sort by most recently modified first
    const existingCandidates: { name: string; fullPath: string; mtime: number }[] = [];
    for (const fileName of candidateFiles) {
      const fullPath = path.join(/*turbopackIgnore: true*/ cwd, fileName);
      if (fs.existsSync(fullPath)) {
        try {
          const stats = fs.statSync(fullPath);
          existingCandidates.push({ name: fileName, fullPath, mtime: stats.mtimeMs });
          detectedFiles.push(fileName);
        } catch {}
      }
    }

    // Sort: most recently modified file takes top priority
    existingCandidates.sort((a, b) => b.mtime - a.mtime);

    for (const cand of existingCandidates) {
      const content = fs.readFileSync(cand.fullPath, 'utf8');
      const lines = content.split('\n');
      let fileProvidedKeys = false;

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
            fileProvidedKeys = true;
          }
        }
      }

      if (fileProvidedKeys && sourceFile === 'none') {
        sourceFile = cand.name;
      }
    }
  } catch {
    // Ignore error
  }

  return { env: result, sourceFile, detectedFiles };
}

const DEFAULT_URL = 'https://ratihfmqpiqervqpkaml.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_MDzFyMLQ-tUHJHZQ8TWx_w_yNO9QZFn';
const DEFAULT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdGloZm1xcGlxZXJ2cXBrYW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjM5OTI5NywiZXhwIjoyMTA3OTc1Mjk3fQ.XoGA9RKbxvNMkOoysds6d7gz9SDR7cz5m920mdqOrVk';


export function getSupabaseAdminCredentials() {
  const diskInfo = readEnvFromDisk();
  const diskEnv = diskInfo.env;
  let activeSource = diskInfo.sourceFile !== 'none' ? diskInfo.sourceFile : 'process.env';

  // In development, prefer fresh disk file edits over stale process.env in-memory cache
  const getVal = (...keys: string[]): string => {
    for (const k of keys) {
      const dVal = cleanEnv(diskEnv[k]);
      if (dVal) return dVal;
      const pVal = cleanEnv(process.env[k]);
      if (pVal) return pVal;
    }
    return '';
  };

  let url = getVal(
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PROJECT_URL',
    'SUPABASE_PROJECT_URL',
    'SUPABASE_ENDPOINT'
  );

  // Auto-detect if user pasted a Supabase project ID instead of full URL
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.supabase.co')) {
      url = `https://${url}`;
    } else if (/^[a-z0-9_-]{15,30}$/i.test(url)) {
      url = `https://${url}.supabase.co`;
    }
  }

  // Auto-detect if user provided DATABASE_URL postgres connection string
  if (!url) {
    const dbUrl = getVal('DATABASE_URL', 'SUPABASE_DB_URL');
    if (dbUrl) {
      const projMatch = dbUrl.match(/postgres(?:ql)?:\/\/[^:]+:[^@]+@([a-z0-9_-]+)\.supabase\.co/i) ||
                        dbUrl.match(/postgres\.([a-z0-9_-]{15,30}):/i);
      if (projMatch && projMatch[1]) {
        url = `https://${projMatch[1]}.supabase.co`;
      }
    }
  }

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

  const effectiveUrl = url || DEFAULT_URL;
  const effectiveAnonKey = anonKey || DEFAULT_ANON_KEY;
  const effectiveServiceRoleKey = serviceRoleKey || anonKey || DEFAULT_SERVICE_ROLE_KEY;
  const isConfigured = Boolean(effectiveUrl && (effectiveServiceRoleKey || effectiveAnonKey));

  return {
    url: effectiveUrl,
    anonKey: effectiveAnonKey,
    serviceRoleKey: effectiveServiceRoleKey,
    source: isConfigured ? activeSource : 'default-production-config',
    isConfigured,
    detectedFiles: diskInfo.detectedFiles,
  };
}

export function getSupabaseAdmin(): SupabaseClient {
  const creds = getSupabaseAdminCredentials();
  const effectiveUrl = creds.url;
  const effectiveKey = creds.serviceRoleKey;
  const cacheKey = `${effectiveUrl}::${effectiveKey}`;

  if (!cachedClient || cachedKey !== cacheKey) {
    if (!creds.isConfigured) {
      console.warn('[SupabaseAdmin] ⚠️ No Supabase credentials found in .env.local! Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to connect to your database.');
    } else {
      const masked = effectiveUrl.replace(/^https?:\/\//, '');
      console.log(`[SupabaseAdmin] 🔌 Connected to database: ${masked} (source: ${creds.source})`);
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
