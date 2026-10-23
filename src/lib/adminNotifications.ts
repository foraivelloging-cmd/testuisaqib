import { supabaseAdmin } from './supabaseAdmin';

export interface AdminNotification {
  id: string;
  type: 'new_review' | 'new_order' | 'payment_proof' | 'contact_inquiry' | 'system_alert';
  title: string;
  message: string;
  reference_id?: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// In-memory fallback cache so notification UI works even before SQL migration
export const inMemoryNotifications: AdminNotification[] = [
  {
    id: 'notif-init-1',
    type: 'system_alert',
    title: 'Notification Engine Active',
    message: 'Real-time alert chime and counter initialized.',
    reference_id: 'sys',
    data: {},
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

export async function createAdminNotification(params: {
  type: 'new_review' | 'new_order' | 'payment_proof' | 'contact_inquiry' | 'system_alert';
  title: string;
  message: string;
  reference_id?: string;
  data?: Record<string, any>;
}): Promise<AdminNotification> {
  const notifId = `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const notif: AdminNotification = {
    id: notifId,
    type: params.type,
    title: params.title,
    message: params.message,
    reference_id: params.reference_id || '',
    data: params.data || {},
    is_read: false,
    created_at: new Date().toISOString(),
  };

  // Keep in memory buffer
  inMemoryNotifications.unshift(notif);
  if (inMemoryNotifications.length > 100) {
    inMemoryNotifications.pop();
  }

  // Attempt database persistence
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_notifications')
      .insert({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        reference_id: notif.reference_id,
        data: notif.data,
        is_read: false,
        created_at: notif.created_at,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[AdminNotifications] DB Notice (using in-memory):', error.message);
    }
    return data || notif;
  } catch (err) {
    console.warn('[AdminNotifications] Fallback to in-memory:', err);
    return notif;
  }
}
