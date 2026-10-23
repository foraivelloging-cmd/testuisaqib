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

// In-memory fallback cache with realistic seed notifications so notification UI displays immediately
export const inMemoryNotifications: AdminNotification[] = [
  {
    id: 'notif-rev-1',
    type: 'new_review',
    title: '⭐ New Customer Review (Pending Approval)',
    message: 'Hamza Malik: "CapCut Pro 1-Year instant activation hogya! Amazing service." (5 Stars)',
    reference_id: 'rev-capcut-1',
    data: { service: 'CapCut Pro', rating: 5, author: 'Hamza Malik' },
    is_read: false,
    created_at: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: 'notif-ord-1',
    type: 'new_order',
    title: '🛍️ New Order: TikTok UK Monetized',
    message: 'Order #ORD-9842 (Rs. 2,499) received for TikTok UK Account. Package: 10K Followers.',
    reference_id: 'ORD-9842',
    data: { orderId: 'ORD-9842', serviceTitle: 'TikTok UK Monetized', price: 2499 },
    is_read: false,
    created_at: new Date(Date.now() - 14 * 60000).toISOString(),
  },
  {
    id: 'notif-pay-1',
    type: 'payment_proof',
    title: '💳 Payment Proof: EasyPaisa Rs. 1,800',
    message: 'Bilal Khan uploaded payment screenshot for Wallet Deposit (Trx #EP-829104).',
    reference_id: 'DEP-8291',
    data: { method: 'EasyPaisa', amount: 1800, sender: 'Bilal Khan' },
    is_read: false,
    created_at: new Date(Date.now() - 32 * 60000).toISOString(),
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
