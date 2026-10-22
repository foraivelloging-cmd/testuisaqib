import { NextResponse } from 'next/server';
import { getSupabaseAdminCredentials } from '@/src/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const creds = getSupabaseAdminCredentials();
  const rawUrl = creds.url;
  let projectId = 'none';

  if (rawUrl && creds.isConfigured) {
    try {
      const parsed = new URL(rawUrl);
      projectId = parsed.hostname.replace('.supabase.co', '');
    } catch {
      projectId = rawUrl.replace(/^https?:\/\//, '').split('.')[0] || 'custom';
    }
  }

  return NextResponse.json({
    status: creds.isConfigured ? 'CONNECTED_OK' : 'NOT_CONFIGURED',
    is_configured: creds.isConfigured,
    project_id: projectId,
    database_url: creds.isConfigured ? rawUrl : 'NOT_CONFIGURED (Please add NEXT_PUBLIC_SUPABASE_URL in .env.local)',
    source_file: creds.source,
    detected_env_files: creds.detectedFiles,
    has_anon_key: Boolean(creds.anonKey && !creds.anonKey.includes('unconfigured')),
    has_service_role_key: Boolean(creds.serviceRoleKey && !creds.serviceRoleKey.includes('unconfigured')),
    message: creds.isConfigured
      ? `✅ Successfully connected to Supabase project: ${projectId}.supabase.co (loaded from ${creds.source})`
      : '⚠️ Supabase database is not configured! Please create a .env.local file with your Supabase URL & Service Role key.',
    hint: 'If you just updated your .env.local, restart your dev server with: Ctrl+C then npm run dev.'
  });
}
