import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { verifyAdminRequest, verifyAdminRequestAsync } from '@/src/lib/serverSecurity';

// Helper to parse User Agent into Device, OS and Browser details
function parseUserAgentDetails(userAgent: string) {
  const ua = userAgent.toLowerCase();

  // 1. Device Type
  let deviceType = 'Desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // 2. Operating System
  let os = 'Unknown OS';
  if (/windows nt 10\.0/i.test(ua)) os = 'Windows 10/11';
  else if (/windows nt 6\.3/i.test(ua)) os = 'Windows 8.1';
  else if (/windows nt 6\.1/i.test(ua)) os = 'Windows 7';
  else if (/iphone|ipad|ipod/i.test(ua)) {
    const match = ua.match(/os (\d+[._]\d+)/);
    os = match ? `iOS ${match[1].replace('_', '.')}` : 'iOS';
  } else if (/android/i.test(ua)) {
    const match = ua.match(/android (\d+(\.\d+)?)/);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/mac os x/i.test(ua)) {
    const match = ua.match(/mac os x (\d+[._]\d+)/);
    os = match ? `macOS ${match[1].replace('_', '.')}` : 'macOS';
  } else if (/cros/i.test(ua)) {
    os = 'ChromeOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // 3. Browser
  let browser = 'Unknown Browser';
  if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';

  return { deviceType, os, browser };
}

// ==================== 1. POST: RECORD VISITOR TELEMETRY ====================
export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const rawCountry =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      req.headers.get('x-country-code') ||
      '';

    const city =
      req.headers.get('x-vercel-ip-city') ||
      req.headers.get('cf-ipcity') ||
      '';

    const userAgent = req.headers.get('user-agent') || '';
    const { deviceType: serverDevice, os: serverOs, browser: serverBrowser } = parseUserAgentDetails(userAgent);

    const body = await req.json().catch(() => ({}));
    const fingerprint = (body.fingerprint || '').trim();

    if (!fingerprint || fingerprint.length < 6) {
      return NextResponse.json({ success: false, error: 'Invalid device fingerprint' }, { status: 400 });
    }

    // Battery formatting
    const rawBattery = typeof body.batteryLevel === 'number' ? Math.round(body.batteryLevel) : -1;
    const isCharging = Boolean(body.batteryCharging);
    let batteryLevelFormatted = 'N/A';
    if (rawBattery >= 0) {
      batteryLevelFormatted = `${rawBattery}% (${isCharging ? '⚡ Charging' : '🔋 Battery'})`;
    }

    const country = rawCountry || (clientIp === '127.0.0.1' || clientIp === '::1' ? 'Localhost' : 'Pakistan');
    const deviceType = body.deviceType || serverDevice;
    const os = body.os || serverOs;
    const browser = body.browser || serverBrowser;
    const screenResolution = body.screenResolution || '';
    const hardwareSpecs = body.hardwareSpecs || '';
    const language = body.language || 'en';
    const lastPath = body.currentPath || '/';

    // 1. Check if record exists
    const { data: existing } = await supabaseAdmin
      .from('visitor_fingerprints')
      .select('id, total_visits')
      .eq('fingerprint', fingerprint)
      .maybeSingle();

    if (existing) {
      // Update existing record
      await supabaseAdmin
        .from('visitor_fingerprints')
        .update({
          ip_address: clientIp,
          country,
          city,
          device_type: deviceType,
          os,
          browser,
          battery_level: batteryLevelFormatted,
          battery_raw: rawBattery,
          battery_charging: isCharging,
          screen_resolution: screenResolution,
          hardware_specs: hardwareSpecs,
          language,
          last_path: lastPath,
          total_visits: (existing.total_visits || 1) + 1,
          last_seen: new Date().toISOString(),
          user_agent: userAgent,
        })
        .eq('fingerprint', fingerprint);
    } else {
      // Insert new record
      await supabaseAdmin.from('visitor_fingerprints').insert({
        fingerprint,
        ip_address: clientIp,
        country,
        city,
        device_type: deviceType,
        os,
        browser,
        battery_level: batteryLevelFormatted,
        battery_raw: rawBattery,
        battery_charging: isCharging,
        screen_resolution: screenResolution,
        hardware_specs: hardwareSpecs,
        language,
        last_path: lastPath,
        total_visits: 1,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        user_agent: userAgent,
      });
    }

    return NextResponse.json({
      success: true,
      fingerprint,
      ip: clientIp,
      country,
      device: deviceType,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Telemetry recording error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ==================== 2. GET: ADMIN VISITOR TELEMETRY DASHBOARD ====================
export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req, 'view_telemetry');
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          revoked: auth.revoked || false,
          error: auth.reason || 'Unauthorized: "view_telemetry" permission required',
        },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const { data: visitors, error } = await supabaseAdmin
      .from('visitor_fingerprints')
      .select('*')
      .order('last_seen', { ascending: false })
      .limit(100);

    if (error) {
      // If table not created yet, return helpful setup notice
      if (
        error.message?.includes('does not exist') ||
        error.message?.includes('schema cache') ||
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST205'
      ) {
        return NextResponse.json({
          success: true,
          needsTableSetup: true,
          error: 'Table public.visitor_fingerprints not found. Please run VISITOR_DEVICE_TRACKING.sql in Supabase SQL Editor.',
          visitors: [],
          stats: { total: 0, activeNow: 0, mobileCount: 0, desktopCount: 0 },
        });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const records = visitors || [];
    const now = Date.now();
    const fifteenMinsAgo = now - 15 * 60 * 1000;

    const activeNow = records.filter(
      (v) => v.last_seen && new Date(v.last_seen).getTime() > fifteenMinsAgo
    ).length;

    const mobileCount = records.filter((v) => v.device_type === 'Mobile').length;
    const desktopCount = records.filter((v) => v.device_type === 'Desktop').length;

    // Country frequency
    const countryCounts: Record<string, number> = {};
    for (const r of records) {
      const c = r.country || 'Unknown';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      visitors: records,
      stats: {
        total: records.length,
        activeNow,
        mobileCount,
        desktopCount,
        countryCounts,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Telemetry retrieval error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ==================== 3. DELETE: CLEAR / REMOVE VISITOR ====================
export async function DELETE(req: Request) {
  try {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fingerprint = searchParams.get('fingerprint');

    if (fingerprint) {
      await supabaseAdmin.from('visitor_fingerprints').delete().eq('fingerprint', fingerprint);
      return NextResponse.json({ success: true, message: `Visitor ${fingerprint} deleted` });
    } else {
      // Clear all
      await supabaseAdmin.from('visitor_fingerprints').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      return NextResponse.json({ success: true, message: 'All visitor telemetry cleared' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Telemetry delete error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
