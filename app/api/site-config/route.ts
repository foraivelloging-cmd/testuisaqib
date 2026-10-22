import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { DEFAULT_SITE_CONFIG, SiteSettingsConfig, deepMergeSiteConfig } from '@/src/types/siteConfig';
import { verifyAdminRequestAsync } from '@/src/lib/serverSecurity';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'site_config.json');
const TMP_BACKUP_FILE = path.join('/tmp', 'site_config.json');

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

  // Fallback check /tmp on serverless environments (e.g. Vercel)
  try {
    if (fs.existsSync(TMP_BACKUP_FILE)) {
      const raw = fs.readFileSync(TMP_BACKUP_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return deepMergeSiteConfig(parsed);
      }
    }
  } catch {}

  return null;
}

function writeBackupConfig(config: SiteSettingsConfig): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch {
    // In serverless environments (like Vercel read-only Lambda), write to /tmp
    try {
      fs.writeFileSync(TMP_BACKUP_FILE, JSON.stringify(config, null, 2), 'utf8');
    } catch {}
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
    // 1. Check if authorized via Origin (localhost, same host, verified deployment domains)
    const host = req.headers.get('host') || '';
    const origin = req.headers.get('origin') || '';
    const referer = req.headers.get('referer') || '';
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';

    const isAuthorizedOrigin =
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      host.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      referer.includes('localhost') ||
      referer.includes('127.0.0.1') ||
      referer.includes('.vercel.app') ||
      clientIp.includes('127.0.0.1') ||
      clientIp.includes('::1') ||
      clientIp.startsWith('192.168.') ||
      clientIp.startsWith('10.') ||
      process.env.NODE_ENV !== 'production';

    let isAuthorized = isAuthorizedOrigin;
    let authError = 'Unauthorized: "manage_site_config" permission required.';
    let isRevoked = false;

    // If not implicitly authorized by origin, verify via Admin JWT Token
    if (!isAuthorized) {
      const auth = await verifyAdminRequestAsync(req, 'manage_site_config');
      if (auth.authorized) {
        isAuthorized = true;
      } else if (auth.revoked) {
        isRevoked = true;
        authError = auth.reason || 'Admin session revoked.';
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          revoked: isRevoked,
          error: authError,
        },
        { status: isRevoked ? 401 : 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawConfig: Partial<SiteSettingsConfig> = body.config;

    if (!rawConfig || typeof rawConfig !== 'object') {
      return NextResponse.json(
        { success: false, error: 'config payload is required and must be an object' },
        { status: 400 }
      );
    }

    // Merge with defaults to ensure complete structure
    const config = deepMergeSiteConfig(rawConfig);

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
    } catch (err: unknown) {
      const e = err as Error;
      supabaseError = e.message || 'Supabase unreachable';
      console.warn('[API site-config] Supabase connection notice:', supabaseError);
    }

    // 3. Invalidate SSR cache on Next.js so refreshing the page immediately shows the new config
    try {
      revalidatePath('/');
      revalidatePath('/saqibadmin');
    } catch {}

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
