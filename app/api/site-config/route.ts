import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { DEFAULT_SITE_CONFIG, SiteSettingsConfig, deepMergeSiteConfig } from '@/src/types/siteConfig';
import { verifyAdminRequest } from '@/src/lib/serverSecurity';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select('config')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data || !data.config) {
      return NextResponse.json({
        success: true,
        source: 'default',
        config: DEFAULT_SITE_CONFIG,
      });
    }

    return NextResponse.json({
      success: true,
      source: 'supabase',
      config: deepMergeSiteConfig(data.config),
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
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const config: SiteSettingsConfig = body.config;

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'config payload is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('site_config')
      .upsert({
        id: 'default',
        config,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, config: data.config });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
