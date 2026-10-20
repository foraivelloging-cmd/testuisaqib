import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const body = await req.json().catch(() => ({}));
    const rogueHost = body.rogueHost || req.headers.get('host') || 'Unknown Host';
    const referrer = body.referrer || req.headers.get('referer') || 'Unknown Referrer';

    console.warn(
      `🚨 [TAMPER ALARM] Unauthorized Cloned Mirror Execution Detected!`,
      `\n- Rogue Host: ${rogueHost}`,
      `\n- Client IP: ${clientIp}`,
      `\n- Referrer: ${referrer}`,
      `\n- User-Agent: ${userAgent}`,
      `\n- Timestamp: ${new Date().toISOString()}`
    );

    return NextResponse.json({
      success: true,
      recorded: true,
      message: 'Tamper report logged. Security killswitch enforced.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
