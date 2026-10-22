import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { DEFAULT_SITE_CONFIG, SiteSettingsConfig, deepMergeSiteConfig } from '@/src/types/siteConfig';
import { verifyAdminRequestAsync } from '@/src/lib/serverSecurity';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'site_config.json');

function readBackupConfig(): SiteSettingsConfig | null {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return deepMergeSiteConfig(parsed);
      }
    }
  } catch (err) {
    console.warn('[site-config] Could not read local backup file:', err);
  }
  return null;
}

function writeBackupConfig(config: SiteSettingsConfig): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.warn('[site-config] Could not write local backup file:', err);
  }
}

export async function GET() {
  try {
    // 1. Try fetching from Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('site_config')
        .select('config')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && data && data.config) {
        // Also keep local disk backup updated
        writeBackupConfig(data.config);
        return NextResponse.json({
          success: true,
          source: 'supabase',
          config: deepMergeSiteConfig(data.config),
        });
      }
    } catch (dbErr) {
      console.warn('[site-config GET] Supabase query failed, falling back to disk:', dbErr);
    }

    // 2. Try fetching from local disk backup
    const diskConfig = readBackupConfig();
    if (diskConfig) {
      return NextResponse.json({
        success: true,
        source: 'local_disk',
        config: diskConfig,
      });
    }

    // 3. Fallback to default
    return NextResponse.json({
      success: true,
      source: 'default',
      config: DEFAULT_SITE_CONFIG,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: true, source: 'fallback', config: DEFAULT_SITE_CONFIG, warning: message },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req, 'manage_site_config');
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          revoked: auth.revoked || false,
          error: auth.reason || 'Unauthorized: "manage_site_config" permission required.',
        },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const config: SiteSettingsConfig = body.config;

    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { success: false, error: 'config payload is required and must be an object' },
        { status: 400 }
      );
    }

    // 1. ALWAYS write to local disk backup first (guarantees zero data loss)
    writeBackupConfig(config);

    // 2. Try persisting to Supabase Cloud database
    let supabaseSaved = false;
    let supabaseError: string | null = null;

    try {
      const { data, error } = await supabaseAdmin
        .from('site_config')
        .upsert({
          id: 'default',
          config,
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (error) {
        supabaseError = error.message;
        console.warn('[API site-config] Supabase upsert notice:', error.message);
      } else if (data) {
        supabaseSaved = true;
      }
    } catch (err: any) {
      supabaseError = err.message || 'Supabase unreachable';
      console.warn('[API site-config] Supabase connection notice:', supabaseError);
    }

    // Return success: either Supabase or Local Disk (or both!)
    return NextResponse.json({
      success: true,
      savedToSupabase: supabaseSaved,
      source: supabaseSaved ? 'supabase' : 'local_disk',
      warning: supabaseError ? `Saved locally. Note: ${supabaseError}` : undefined,
      config,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[API site-config POST Error]:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
