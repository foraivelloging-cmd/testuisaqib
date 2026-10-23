import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { verifyAdminRequest } from '@/src/lib/serverSecurity';
import { inMemoryNotifications, AdminNotification } from '@/src/lib/adminNotifications';

export async function GET(req: Request) {
  try {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required.' },
        { status: 401 }
      );
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        const unreadCount = data.filter((n) => !n.is_read).length;
        return NextResponse.json({
          success: true,
          source: 'supabase',
          notifications: data,
          unreadCount,
        });
      }
    } catch {}

    // In-memory fallback
    const unreadCount = inMemoryNotifications.filter((n) => !n.is_read).length;
    return NextResponse.json({
      success: true,
      source: 'memory',
      notifications: inMemoryNotifications,
      unreadCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { id, markAll } = body;

    // Update in-memory
    if (markAll) {
      inMemoryNotifications.forEach((n) => (n.is_read = true));
    } else if (id) {
      const found = inMemoryNotifications.find((n) => n.id === id);
      if (found) found.is_read = true;
    }

    // Update database
    try {
      if (markAll) {
        await supabaseAdmin
          .from('admin_notifications')
          .update({ is_read: true })
          .eq('is_read', false);
      } else if (id) {
        await supabaseAdmin
          .from('admin_notifications')
          .update({ is_read: true })
          .eq('id', id);
      }
    } catch {}

    return NextResponse.json({ success: true, marked: id || 'all' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clearRead = searchParams.get('clearRead') === 'true';

    if (clearRead) {
      // Clear read from memory
      for (let i = inMemoryNotifications.length - 1; i >= 0; i--) {
        if (inMemoryNotifications[i].is_read) {
          inMemoryNotifications.splice(i, 1);
        }
      }
      try {
        await supabaseAdmin.from('admin_notifications').delete().eq('is_read', true);
      } catch {}
      return NextResponse.json({ success: true, cleared: 'read' });
    }

    if (id) {
      const idx = inMemoryNotifications.findIndex((n) => n.id === id);
      if (idx !== -1) inMemoryNotifications.splice(idx, 1);
      try {
        await supabaseAdmin.from('admin_notifications').delete().eq('id', id);
      } catch {}
      return NextResponse.json({ success: true, deleted: id });
    }

    return NextResponse.json({ success: false, error: 'id or clearRead required' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
