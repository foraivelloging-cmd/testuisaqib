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

// All project credentials must come from deployment environment variables.


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
      const match = dbUrl.match(/postgres(?:ql)?:\/\/[^:]+:[^@]+@([a-z0-9_-]+)\.supabase\.co/i) ||
                    dbUrl.match(/@aws-[0-9]-[a-z0-9-]+\.pooler\.supabase\.co.*\/postgres/i);
      const projMatch = dbUrl.match(/postgres\.([a-z0-9_-]{15,30}):/i);
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

  const isDefaultFallback = !url || !serviceRoleKey;

  return {
    url,
    anonKey,
    serviceRoleKey,
    source: isDefaultFallback ? 'missing_environment' : activeSource,
    isDefaultFallback,
    detectedFiles: diskInfo.detectedFiles,
  };
}

export function getSupabaseAdmin(): SupabaseClient {
  const { url, serviceRoleKey } = getSupabaseAdminCredentials();
  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase admin configuration missing. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in the server environment.'
    );
  }
  const cacheKey = `${url}::${serviceRoleKey}`;

  if (!cachedClient || cachedKey !== cacheKey) {
    const masked = url.replace(/^https?:\/\//, '');
    console.log(`[SupabaseAdmin] 🔌 Connected to database: ${masked}`);

    cachedClient = createClient(url, serviceRoleKey, {
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
