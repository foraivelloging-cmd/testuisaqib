import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { verifyAdminRequest } from '@/src/lib/serverSecurity';
import { sanitizeString } from '@/src/lib/securitySanitizer';

export async function GET(req: Request) {
  try {
    // Only verified admin can read all contact tickets/messages
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required to read contact inquiries.' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: true, inquiries: [] });
    }

    return NextResponse.json({ success: true, inquiries: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: true, inquiries: [], warning: message });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = sanitizeString(body.name || 'Guest Client').slice(0, 100);
    const phone = sanitizeString(body.phone || '').slice(0, 30);
    const department = sanitizeString(body.department || 'General Support').slice(0, 50);
    const priority = sanitizeString(body.priority || 'Normal').slice(0, 20);
    const message = sanitizeString(body.message || '').slice(0, 2000);

    if (!message && !phone) {
      return NextResponse.json(
        { success: false, error: 'Message or phone number is required.' },
        { status: 400 }
      );
    }

    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabaseAdmin
      .from('contact_inquiries')
      .insert({
        id: ticketId,
        name,
        phone,
        department,
        priority,
        message,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, ticket: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
