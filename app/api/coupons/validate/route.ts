import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';

export interface CouponItem {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount_amount?: number | null;
  min_order_amount?: number;
  max_uses?: number | null;
  used_count?: number;
  expires_at?: string | null;
  is_active: boolean;
  applicable_category?: string;
  description?: string;
}

// Global in-memory coupons store for zero-config offline fallback
export const inMemoryCouponsStore: CouponItem[] = [
  {
    id: 'seed-welcome10',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 200,
    max_discount_amount: 300,
    max_uses: 500,
    used_count: 14,
    is_active: true,
    applicable_category: 'all',
    description: 'Welcome Special: 10% OFF on all orders over Rs. 200',
  },
  {
    id: 'seed-saqib50',
    code: 'SAQIB50',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 300,
    max_uses: 200,
    used_count: 27,
    is_active: true,
    applicable_category: 'all',
    description: 'VIP Flat Discount: Rs. 50 OFF on orders over Rs. 300',
  },
  {
    id: 'seed-eid20',
    code: 'EID20',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 500,
    max_discount_amount: 500,
    max_uses: 1000,
    used_count: 42,
    is_active: true,
    applicable_category: 'all',
    description: 'Festive Special: 20% OFF on orders over Rs. 500',
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawCode = (body.code || '').trim().toUpperCase();
    const orderAmount = Number(body.orderAmount) || 0;
    const categoryId = (body.categoryId || 'all').toLowerCase();

    if (!rawCode) {
      return NextResponse.json(
        { valid: false, error: 'Please enter a coupon code.' },
        { status: 400 }
      );
    }

    if (orderAmount <= 0) {
      return NextResponse.json(
        { valid: false, error: 'Invalid order amount for coupon calculation.' },
        { status: 400 }
      );
    }

    let coupon: CouponItem | null = null;

    // 1. Query Supabase coupons table first
    try {
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', rawCode)
        .maybeSingle();

      if (!error && data) {
        coupon = {
          id: data.id,
          code: data.code,
          discount_type: data.discount_type,
          discount_value: Number(data.discount_value),
          max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
          min_order_amount: Number(data.min_order_amount || 0),
          max_uses: data.max_uses ? Number(data.max_uses) : null,
          used_count: Number(data.used_count || 0),
          expires_at: data.expires_at,
          is_active: Boolean(data.is_active),
          applicable_category: data.applicable_category || 'all',
          description: data.description,
        };
      }
    } catch {
      // Supabase query error fallback
    }

    // 2. Fallback to in-memory store
    if (!coupon) {
      const matched = inMemoryCouponsStore.find((c) => c.code === rawCode);
      if (matched) {
        coupon = { ...matched };
      }
    }

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: `Coupon code "${rawCode}" is invalid.` },
        { status: 404 }
      );
    }

    // 3. Validation: Active status
    if (!coupon.is_active) {
      return NextResponse.json(
        { valid: false, error: `Coupon code "${rawCode}" is currently inactive.` },
        { status: 400 }
      );
    }

    // 4. Validation: Expiration Date
    if (coupon.expires_at) {
      const expDate = new Date(coupon.expires_at).getTime();
      if (!isNaN(expDate) && expDate < Date.now()) {
        return NextResponse.json(
          { valid: false, error: `Coupon code "${rawCode}" has expired.` },
          { status: 400 }
        );
      }
    }

    // 5. Validation: Maximum Usage Limit
    if (coupon.max_uses && (coupon.used_count || 0) >= coupon.max_uses) {
      return NextResponse.json(
        { valid: false, error: `Coupon code "${rawCode}" has reached its maximum redemption limit.` },
        { status: 400 }
      );
    }

    // 6. Validation: Applicable Category
    if (
      coupon.applicable_category &&
      coupon.applicable_category !== 'all' &&
      categoryId !== 'all' &&
      coupon.applicable_category.toLowerCase() !== categoryId
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: `Coupon "${rawCode}" is only applicable to "${coupon.applicable_category}" category services.`,
        },
        { status: 400 }
      );
    }

    // 7. Validation: Minimum Spend
    const minSpend = coupon.min_order_amount || 0;
    if (orderAmount < minSpend) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order amount of Rs. ${minSpend.toLocaleString()} required to use "${rawCode}". (Current order: Rs. ${orderAmount.toLocaleString()})`,
        },
        { status: 400 }
      );
    }

    // 8. Calculate Discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((orderAmount * coupon.discount_value) / 100);
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else {
      // Fixed amount discount
      discountAmount = Math.min(coupon.discount_value, orderAmount);
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount,
        originalAmount: orderAmount,
        finalAmount,
        description: coupon.description,
      },
      message: `🎉 Coupon applied: You saved Rs. ${discountAmount.toLocaleString()}!`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ valid: false, error: message }, { status: 500 });
  }
}
