import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { verifyAdminRequest } from '@/src/lib/serverSecurity';
import { sanitizeString } from '@/src/lib/securitySanitizer';

export const DEFAULT_REVIEWS: Array<{
  id: string;
  name: string;
  service: string;
  rating: number;
  comment: string;
  verified: boolean;
  created_at?: string;
}> = [];

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return NextResponse.json({ success: true, source: 'empty', reviews: [] });
    }

    return NextResponse.json({ success: true, source: 'supabase', reviews: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: true, source: 'fallback', reviews: [], warning: message });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = sanitizeString(body.name || '').slice(0, 80);
    const service = sanitizeString(body.service || 'Digital Service').slice(0, 100);
    const comment = sanitizeString(body.comment || '').slice(0, 1000);
    const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));

    if (!name || !comment) {
      return NextResponse.json(
        { success: false, error: 'Name and comment are required' },
        { status: 400 }
      );
    }

    // Only admin can create pre-verified reviews directly; public submissions default to false or checked
    const auth = verifyAdminRequest(req);
    const verified = auth.authorized ? Boolean(body.verified ?? true) : false;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        name,
        service,
        rating,
        comment,
        verified,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // Only verified admin can delete reviews
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Access Denied: Admin authorization required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = sanitizeString(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
