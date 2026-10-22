import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { verifyAdminRequest } from '@/src/lib/serverSecurity';
import { sanitizeString } from '@/src/lib/securitySanitizer';
import { invalidateServerStoreCache } from '@/src/lib/serverDataLoader';

export const DEFAULT_REVIEWS: Array<{
  id: string;
  name: string;
  service: string;
  rating: number;
  comment: string;
  verified: boolean;
  created_at?: string;
}> = [];

function cleanReviewEncoding(text: string): string {
  if (!text) return '';
  return text
    .replace(/â€”/g, '—')
    .replace(/â€“/g, '–')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"');
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return NextResponse.json({ success: true, source: 'empty', reviews: [] });
    }

    const sanitizedReviews = data.map((r) => ({
      ...r,
      name: cleanReviewEncoding(r.name || ''),
      service: cleanReviewEncoding(r.service || ''),
      comment: cleanReviewEncoding(r.comment || ''),
    }));

    return NextResponse.json({ success: true, source: 'supabase', reviews: sanitizedReviews });
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

    // Default to verified: true unless explicitly set to false
    const auth = verifyAdminRequest(req);
    const verified = body.verified !== undefined ? Boolean(body.verified) : true;

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

    const sanitized = {
      ...data,
      name: cleanReviewEncoding(data.name || ''),
      service: cleanReviewEncoding(data.service || ''),
      comment: cleanReviewEncoding(data.comment || ''),
    };

    invalidateServerStoreCache();
    return NextResponse.json({ success: true, review: sanitized });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    // Only verified admin can modify review moderation status
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Access Denied: Admin authorization required.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const id = sanitizeString(body.id || '');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (body.verified !== undefined) updates.verified = Boolean(body.verified);
    if (body.name) updates.name = sanitizeString(body.name).slice(0, 80);
    if (body.service) updates.service = sanitizeString(body.service).slice(0, 100);
    if (body.comment) updates.comment = sanitizeString(body.comment).slice(0, 1000);
    if (body.rating) updates.rating = Math.max(1, Math.min(5, Number(body.rating) || 5));

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const sanitized = {
      ...data,
      name: cleanReviewEncoding(data.name || ''),
      service: cleanReviewEncoding(data.service || ''),
      comment: cleanReviewEncoding(data.comment || ''),
    };

    invalidateServerStoreCache();
    return NextResponse.json({ success: true, review: sanitized });
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

    invalidateServerStoreCache();
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
