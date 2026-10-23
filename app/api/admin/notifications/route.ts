import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { inMemoryNotifications, AdminNotification } from '@/src/lib/adminNotifications';

export async function GET(req: Request) {
  try {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data) && data.length > 0) {
        const unreadCount = data.filter((n) => !n.is_read).length;
        return NextResponse.json({
          success: true,
          source: 'supabase',
          notifications: data,
          unreadCount,
        });
      }
    } catch {}

    // In-memory fallback (seeded with 3 realistic alerts)
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
    const body = await req.json().catch(() => ({}));
    const { id, markAll } = body;

    // In-memory update
    if (markAll) {
      inMemoryNotifications.forEach((n) => {
        n.is_read = true;
      });
    } else if (id) {
      const found = inMemoryNotifications.find((n) => n.id === id);
      if (found) found.is_read = true;
    }

    // Supabase update if table exists
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

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // In-memory clear
    for (let i = inMemoryNotifications.length - 1; i >= 0; i--) {
      if (inMemoryNotifications[i].is_read) {
        inMemoryNotifications.splice(i, 1);
      }
    }

    // Supabase clear if table exists
    try {
      await supabaseAdmin
        .from('admin_notifications')
        .delete()
        .eq('is_read', true);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
