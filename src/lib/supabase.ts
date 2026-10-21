import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let cachedKey = '';

function cleanEnv(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
}

export function getSupabaseCredentials() {
  const url =
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    cleanEnv(process.env.SUPABASE_URL) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL) ||
    cleanEnv(process.env.SUPABASE_PROJECT_URL) ||
    'https://ratihfmqpiqervqpkaml.supabase.co';

  const anonKey =
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_KEY) ||
    cleanEnv(process.env.SUPABASE_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    'sb_publishable_MDzFyMLQ-tUHJHZQ8TWx_w_yNO9QZFn';

  return { url, anonKey };
}

export function getSupabase(): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();
  const cacheKey = `${url}::${anonKey}`;

  if (!cachedClient || cachedKey !== cacheKey) {
    cachedClient = createClient(url, anonKey, {
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
