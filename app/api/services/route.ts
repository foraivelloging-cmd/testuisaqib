import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { DEFAULT_STORE_SERVICES, StoreService } from '@/src/data/defaultCatalog';
import { verifyAdminRequestAsync } from '@/src/lib/serverSecurity';
import { invalidateServerStoreCache } from '@/src/lib/serverDataLoader';

function normalizeTiers(rawTiers: unknown): string[] {
  let arr: unknown[] = [];
  if (Array.isArray(rawTiers)) {
    arr = rawTiers;
  } else if (typeof rawTiers === 'string') {
    try {
      const parsed = JSON.parse(rawTiers);
      if (Array.isArray(parsed)) arr = parsed;
      else arr = [rawTiers];
    } catch {
      arr = rawTiers.split('\n').map((s) => s.trim()).filter(Boolean);
    }
  }

  return arr
    .map((t) => {
      if (!t) return '';
      if (typeof t === 'string') return t;
      if (typeof t === 'object' && t !== null) {
        const obj = t as { name?: string; title?: string; label?: string; price?: number | string };
        const name = obj.name || obj.title || obj.label || '';
        const price = obj.price !== undefined ? ` — Rs. ${Number(obj.price).toLocaleString()}` : '';
        return (name + price).trim() || JSON.stringify(t);
      }
      return String(t);
    })
    .filter(Boolean);
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        success: true,
        source: 'default',
        services: DEFAULT_STORE_SERVICES,
      });
    }

    // Map DB column names to StoreService interface
    const services: StoreService[] = data.map((row) => ({
      id: row.id,
      category: row.category,
      badge: row.badge,
      title: row.title,
      desc: row.desc || '',
      plush: row.plush || 'plush-srv-1',
      orbGrad: row.orb_grad || 'from-pink-500 to-rose-600',
      iconType: row.icon_type,
      customIconUrl: row.custom_icon_url,
      directToolUrl: row.direct_tool_url,
      inputLabel: row.input_label || 'Your Requirement',
      placeholder: row.placeholder || 'Enter details...',
      tiers: normalizeTiers(row.tiers),
      hidden: row.hidden ?? false,
    }));

    return NextResponse.json({
      success: true,
      source: 'supabase',
      services,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: true, source: 'fallback', services: DEFAULT_STORE_SERVICES, warning: message },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req, 'manage_services');
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          revoked: auth.revoked || false,
          error: auth.reason || 'Unauthorized: "manage_services" permission required.',
        },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const body = await req.json();
    const service: StoreService = body.service;

    if (!service || !service.id || !service.title) {
      return NextResponse.json(
        { success: false, error: 'Service id and title are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('services')
      .upsert({
        id: service.id,
        category: service.category,
        badge: service.badge,
        title: service.title,
        desc: service.desc,
        plush: service.plush,
        orb_grad: service.orbGrad,
        icon_type: service.iconType,
        custom_icon_url: service.customIconUrl || null,
        direct_tool_url: service.directToolUrl || null,
        input_label: service.inputLabel,
        placeholder: service.placeholder,
        tiers: normalizeTiers(service.tiers),
        hidden: service.hidden ?? false,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    invalidateServerStoreCache();
    return NextResponse.json({ success: true, service: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req, 'manage_services');
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          revoked: auth.revoked || false,
          error: auth.reason || 'Unauthorized: "manage_services" permission required.',
        },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id param required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('services').delete().eq('id', id);

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
