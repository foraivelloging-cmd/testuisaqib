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

  const isDefaultDemo = creds.isDefaultFallback || projectId === 'ratihfmqpiqervqpkaml';

  return NextResponse.json({
    status: rawUrl ? 'CONNECTED_OK' : 'MISSING_ENV_CONFIGURATION',
    database_url: rawUrl || 'NOT_CONFIGURED (Please add NEXT_PUBLIC_SUPABASE_URL in .env.local)',
    project_id: projectId,
    source_file: creds.source,
    detected_env_files: creds.detectedFiles,
    has_anon_key: Boolean(creds.anonKey),
    has_service_role_key: Boolean(creds.serviceRoleKey),
    is_default_demo_database: isDefaultDemo,
    notice: isDefaultDemo
      ? '⚠️ You are currently connected to the default demo Supabase database (ratihfmqpiqervqpkaml). Put your new Supabase URL & keys in .env.local to connect to your own database!'
      : `✅ Successfully connected to custom database: ${projectId}.supabase.co (loaded from ${creds.source})`,
    hint: 'If you just updated your .env.local, restart your dev server with: Ctrl+C then npm run dev.'
  });
}
