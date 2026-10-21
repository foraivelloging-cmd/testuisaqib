import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let cachedKey = '';

function cleanEnv(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
}

export function getSupabaseAdminCredentials() {
  // Support all common naming conventions for Supabase URL
  const url =
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    cleanEnv(process.env.SUPABASE_URL) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL) ||
    cleanEnv(process.env.SUPABASE_PROJECT_URL) ||
    'https://ratihfmqpiqervqpkaml.supabase.co';

  // Support all common naming conventions for Supabase Anon Key
  const anonKey =
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_KEY) ||
    cleanEnv(process.env.SUPABASE_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    'sb_publishable_MDzFyMLQ-tUHJHZQ8TWx_w_yNO9QZFn';

  // Support all common naming conventions for Supabase Service Role Key
  const isDefaultProject = url.includes('ratihfmqpiqervqpkaml');
  let serviceRoleKey =
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    cleanEnv(process.env.SUPABASE_SERVICE_KEY) ||
    cleanEnv(process.env.SERVICE_ROLE_KEY) ||
    cleanEnv(process.env.SUPABASE_SECRET_KEY);

  if (!serviceRoleKey) {
    if (isDefaultProject) {
      serviceRoleKey =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdGloZm1xcGlxZXJ2cXBrYW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjM5OTI5NywiZXhwIjoyMTA3OTc1Mjk3fQ.XoGA9RKbxvNMkOoysds6d7gz9SDR7cz5m920mdqOrVk';
    } else {
      // If user supplied a new project URL but forgot service role key, fallback to anon key to prevent JWT mismatch crash
      serviceRoleKey = anonKey;
    }
  }

  return { url, anonKey, serviceRoleKey };
}

export function getSupabaseAdmin(): SupabaseClient {
  const { url, serviceRoleKey } = getSupabaseAdminCredentials();
  const cacheKey = `${url}::${serviceRoleKey}`;

  if (!cachedClient || cachedKey !== cacheKey) {
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
