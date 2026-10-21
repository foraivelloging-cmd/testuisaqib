import { NextResponse } from 'next/server';
import { getSupabaseAdminCredentials } from '@/src/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const creds = getSupabaseAdminCredentials();
  const rawUrl = creds.url;
  let projectId = 'none';

  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      projectId = parsed.hostname.replace('.supabase.co', '');
    } catch {
      projectId = rawUrl.replace(/^https?:\/\//, '').split('.')[0] || 'custom';
    }
  }

  return NextResponse.json({
    status: rawUrl ? 'CONNECTED_OK' : 'MISSING_ENV_CONFIGURATION',
    database_url: rawUrl || 'NOT_CONFIGURED (Please add NEXT_PUBLIC_SUPABASE_URL in .env.local)',
    project_id: projectId,
    has_anon_key: Boolean(creds.anonKey),
    has_service_role_key: Boolean(creds.serviceRoleKey),
    hint: 'If you just changed your .env.local, make sure to restart your dev server (Ctrl+C then npm run dev).'
  });
}
