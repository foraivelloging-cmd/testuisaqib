import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { verifyAdminRequest } from '@/src/lib/serverSecurity';
import { sanitizeString } from '@/src/lib/securitySanitizer';

export const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Hamza Ali — Lahore',
    service: 'Google Gemini 18M & CapCut Pro',
    rating: 5,
    comment: 'Maine Saqib bhai se Google Gemini 18-Month Pro aur CapCut Pro liya. Sirf 5 minute mein mere apne Gmail par 2TB storage ke sath activate ho gaya. 100% trusted!',
    verified: true,
  },
  {
    id: 'rev-2',
    name: 'Zainab Khan — Islamabad',
    service: 'TikTok UK & ElevenLabs 300k',
    rating: 5,
    comment: 'Bought TikTok UK Account + 10K Followers and ElevenLabs 300k Credits for my faceless automation channel. Best wholesale rates in Pakistan!',
    verified: true,
  },
  {
    id: 'rev-3',
    name: 'Usman Tariq — Karachi',
    service: 'Fresh SIM CDR & ChatGPT Plus',
    rating: 5,
    comment: 'Urgent Fresh 2026 SIM Owner & CDR report chahiye thi aur sath ChatGPT Plus. EasyPaisa bhejte hi 10 mins mein WhatsApp par PDF report mil gayi. Highly recommended!',
    verified: true,
  },
  {
    id: 'rev-4',
    name: 'Bilal Ahmad — Rawalpindi',
    service: 'Remini AI Pro & Lovable Pro',
    rating: 5,
    comment: 'Remini Pro 1-year activation and Lovable AI builder subscription instant receive hui. Full replacement warranty support best hai!',
    verified: true,
  }
];

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, source: 'default', reviews: DEFAULT_REVIEWS });
    }

    return NextResponse.json({ success: true, source: 'supabase', reviews: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: true, source: 'fallback', reviews: DEFAULT_REVIEWS, warning: message });
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
