import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { verifyAdminRequest } from '@/src/lib/serverSecurity';
import { sanitizeString } from '@/src/lib/securitySanitizer';
import { invalidateServerStoreCache } from '@/src/lib/serverDataLoader';
import { DEFAULT_REVIEWS, ReviewItem } from '@/src/data/defaultReviews';
import { createAdminNotification } from '@/src/lib/adminNotifications';

function cleanReviewEncoding(text: string): string {
  if (!text) return '';
  return text
    .replace(/â€”/g, '—')
    .replace(/â€“/g, '–')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get('all') === 'true';
    const auth = verifyAdminRequest(req);

    let query = supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    // If not admin and not requesting all reviews, only return approved/live reviews
    if (!auth.authorized && !fetchAll) {
      query = query.or('status.eq.approved,status.is.null');
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        reviews: DEFAULT_REVIEWS,
      });
    }

    const sanitizedReviews: ReviewItem[] = data.map((r) => ({
      ...r,
      name: cleanReviewEncoding(r.name || ''),
      service: cleanReviewEncoding(r.service || ''),
      comment: cleanReviewEncoding(r.comment || ''),
      status: (r.status as 'pending' | 'approved' | 'rejected') || 'approved',
      verified: r.verified ?? true,
    }));

    return NextResponse.json({
      success: true,
      source: 'supabase',
      reviews: sanitizedReviews,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: true, source: 'fallback', reviews: DEFAULT_REVIEWS, warning: message },
      { status: 200 }
    );
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

    const auth = verifyAdminRequest(req);
    // Public reviews strictly default to 'pending' and verified: false until approved by Admin
    const status: 'pending' | 'approved' | 'rejected' = auth.authorized
      ? body.status || 'approved'
      : 'pending';
    const verified = auth.authorized
      ? Boolean(body.verified ?? true)
      : false;

    const reviewId = `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        id: reviewId,
        name,
        service,
        rating,
        comment,
        verified,
        status,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const sanitized: ReviewItem = {
      ...data,
      name: cleanReviewEncoding(data.name || ''),
      service: cleanReviewEncoding(data.service || ''),
      comment: cleanReviewEncoding(data.comment || ''),
      status,
      verified,
    };

    // Trigger Admin Notification for review submission
    try {
      await createAdminNotification({
        type: 'new_review',
        title: 'New Customer Review Submitted',
        message: `${name} rated 5★ on "${service}" (${status.toUpperCase()})`,
        reference_id: reviewId,
        data: { id: reviewId, name, service, rating, status },
      });
    } catch {}

    invalidateServerStoreCache();

    return NextResponse.json({
      success: true,
      review: sanitized,
      pendingApproval: status === 'pending',
    });
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
    if (body.status !== undefined) {
      const cleanStatus = sanitizeString(body.status).toLowerCase();
      if (['pending', 'approved', 'rejected'].includes(cleanStatus)) {
        updates.status = cleanStatus;
        if (cleanStatus === 'approved' && body.verified === undefined) {
          updates.verified = true;
        }
      }
    }
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

    const sanitized: ReviewItem = {
      ...data,
      name: cleanReviewEncoding(data.name || ''),
      service: cleanReviewEncoding(data.service || ''),
      comment: cleanReviewEncoding(data.comment || ''),
      status: data.status || 'approved',
      verified: data.verified ?? true,
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
