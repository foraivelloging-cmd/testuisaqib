import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';

interface InMemoryToolClick {
  toolId: string;
  toolTitle: string;
  userIp: string;
  timestamp: string;
}

export const inMemoryToolClicks: InMemoryToolClick[] = [
  { toolId: 'tool-sim-tracker', toolTitle: 'Live Pakistan SIM Database 2026', userIp: '127.0.0.1', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
  { toolId: 'tool-video-downloader', toolTitle: 'Universal 4K Video Downloader', userIp: '127.0.0.1', timestamp: new Date(Date.now() - 90 * 60000).toISOString() },
  { toolId: 'tool-temp-mail', toolTitle: 'Instant Disposable Temp Mail Generator', userIp: '127.0.0.1', timestamp: new Date(Date.now() - 140 * 60000).toISOString() },
  { toolId: 'tool-qr-pro', toolTitle: 'Cyber 3D QR Code Studio', userIp: '127.0.0.1', timestamp: new Date(Date.now() - 210 * 60000).toISOString() },
];

export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const body = await req.json().catch(() => ({}));
    const toolId = (body.toolId || '').trim();
    const toolTitle = (body.toolTitle || 'Web Tool').trim();

    if (!toolId) {
      return NextResponse.json({ success: false, error: 'toolId is required' }, { status: 400 });
    }

    const clickId = `run-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Keep in-memory buffer
    inMemoryToolClicks.unshift({
      toolId,
      toolTitle,
      userIp: clientIp,
      timestamp: new Date().toISOString(),
    });
    if (inMemoryToolClicks.length > 200) inMemoryToolClicks.pop();

    // Async attempt to persist to database
    try {
      await supabaseAdmin.from('tool_usage_analytics').insert({
        id: clickId,
        tool_id: toolId,
        tool_title: toolTitle,
        user_ip: clientIp,
        revenue: 0,
        created_at: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({ success: true, clickId, toolId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error logging tool click';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
