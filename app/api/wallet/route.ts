import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { verifyAdminRequest } from '@/src/lib/serverSecurity';
import { sanitizeString } from '@/src/lib/securitySanitizer';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = sanitizeString(searchParams.get('userId') || '+92 347 8936242');

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('balance, full_name, role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({
        success: true,
        source: 'default',
        balance: 1800,
      });
    }

    return NextResponse.json({
      success: true,
      source: 'supabase',
      balance: Number(data.balance || 0),
      fullName: data.full_name,
      role: data.role,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: true, source: 'fallback', balance: 1800, warning: message },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Only verified admin can arbitrarily alter wallet balances
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required to adjust balance directly.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const userId = sanitizeString(body.userId || '');
    const balance = Number(body.balance);
    const fullName = sanitizeString(body.fullName || 'VIP Member').slice(0, 100);
    const role = sanitizeString(body.role || 'member').slice(0, 30);

    if (!userId || isNaN(balance)) {
      return NextResponse.json(
        { success: false, error: 'Valid userId and balance are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        balance,
        full_name: fullName,
        role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: data,
      balance: Number(data.balance),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
