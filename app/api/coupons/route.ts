import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { verifyAdminRequestAsync } from '@/src/lib/serverSecurity';
import { CouponItem, inMemoryCouponsStore } from './validate/route';

// ==================== 1. GET: LIST ALL COUPONS (ADMIN) ====================
export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, revoked: auth.revoked || false, error: 'Admin authorization required' },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'supabase',
          coupons: data,
        });
      }
    } catch {
      // Table query error
    }

    return NextResponse.json({
      success: true,
      source: 'default_seed',
      coupons: inMemoryCouponsStore,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ==================== 2. POST: CREATE NEW COUPON (ADMIN) ====================
export async function POST(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, revoked: auth.revoked || false, error: 'Admin authorization required' },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const code = (body.code || '').trim().toUpperCase().replace(/\s+/g, '');
    const discountType = body.discount_type === 'fixed' ? 'fixed' : 'percentage';
    const discountValue = Number(body.discount_value);
    const minOrderAmount = Number(body.min_order_amount || 0);
    const maxDiscountAmount = body.max_discount_amount ? Number(body.max_discount_amount) : null;
    const maxUses = body.max_uses ? Number(body.max_uses) : null;
    const expiresAt = body.expires_at || null;
    const applicableCategory = (body.applicable_category || 'all').trim();
    const description = (body.description || '').trim();

    if (!code || code.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Coupon code must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    if (isNaN(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        { success: false, error: 'Discount value must be greater than zero.' },
        { status: 400 }
      );
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return NextResponse.json(
        { success: false, error: 'Percentage discount cannot exceed 100%.' },
        { status: 400 }
      );
    }

    const newCouponRecord: CouponItem = {
      id: 'coupon-' + Date.now(),
      code,
      discount_type: discountType,
      discount_value: discountValue,
      max_discount_amount: maxDiscountAmount,
      min_order_amount: minOrderAmount,
      max_uses: maxUses,
      used_count: 0,
      expires_at: expiresAt,
      is_active: true,
      applicable_category: applicableCategory,
      description,
    };

    // Save to in-memory store first
    const existingIdx = inMemoryCouponsStore.findIndex((c) => c.code === code);
    if (existingIdx >= 0) {
      inMemoryCouponsStore[existingIdx] = newCouponRecord;
    } else {
      inMemoryCouponsStore.unshift(newCouponRecord);
    }

    // Try saving to Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .upsert(
          {
            ...newCouponRecord,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'code' }
        )
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          source: 'supabase',
          coupon: data,
          message: `Coupon "${code}" saved successfully!`,
        });
      }
    } catch {
      // Supabase table missing fallback
    }

    return NextResponse.json({
      success: true,
      source: 'local_store',
      coupon: newCouponRecord,
      needsMigration: true,
      message: `Coupon "${code}" saved locally! Run COUPONS_SYSTEM.sql in Supabase to sync to cloud.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ==================== 3. PATCH: TOGGLE STATUS OR UPDATE (ADMIN) ====================
export async function PATCH(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, revoked: auth.revoked || false, error: 'Admin authorization required' },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const code = (body.code || '').trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required.' }, { status: 400 });
    }

    // Update in-memory store
    const memItem = inMemoryCouponsStore.find((c) => c.code === code);
    if (memItem && typeof body.is_active === 'boolean') {
      memItem.is_active = body.is_active;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.is_active === 'boolean') {
      updates.is_active = body.is_active;
    }
    if (body.discount_value !== undefined) {
      updates.discount_value = Number(body.discount_value);
    }
    if (body.min_order_amount !== undefined) {
      updates.min_order_amount = Number(body.min_order_amount);
    }
    if (body.max_uses !== undefined) {
      updates.max_uses = body.max_uses ? Number(body.max_uses) : null;
    }
    if (body.expires_at !== undefined) {
      updates.expires_at = body.expires_at || null;
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .update(updates)
        .eq('code', code)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          coupon: data,
          message: `Coupon "${code}" updated successfully.`,
        });
      }
    } catch {
      // Supabase table missing fallback
    }

    return NextResponse.json({
      success: true,
      coupon: memItem || { code, ...updates },
      message: `Coupon "${code}" updated locally.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ==================== 4. DELETE: REMOVE COUPON (ADMIN) ====================
export async function DELETE(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, revoked: auth.revoked || false, error: 'Admin authorization required' },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const code = (searchParams.get('code') || '').trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false, error: 'code query parameter required' }, { status: 400 });
    }

    // Remove from in-memory store
    const memIdx = inMemoryCouponsStore.findIndex((c) => c.code === code);
    if (memIdx >= 0) {
      inMemoryCouponsStore.splice(memIdx, 1);
    }

    try {
      const { error } = await supabaseAdmin.from('coupons').delete().eq('code', code);
      if (!error) {
        return NextResponse.json({
          success: true,
          message: `Coupon "${code}" deleted successfully.`,
        });
      }
    } catch {
      // Supabase table missing fallback
    }

    return NextResponse.json({
      success: true,
      message: `Coupon "${code}" removed from coupons store.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
