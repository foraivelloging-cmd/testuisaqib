import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { verifyAdminRequest } from '@/src/lib/serverSecurity';

// ==================== 1. GET: LIST ALL REGISTERED USERS & WALLETS ====================
export async function GET(req: Request) {
  try {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    let needsMigration = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profiles: any[] | null = null;

    // Attempt to query with new status/ban_reason/last_login_at columns
    const mainQuery = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, role, balance, status, ban_reason, last_login_at, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (mainQuery.error && (mainQuery.error.message?.includes('column') || mainQuery.error.message?.includes('schema cache'))) {
      needsMigration = true;
      // Fallback query without new columns so admin can still see users & balance
      const fallback = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, phone, role, balance, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (fallback.error) {
        return NextResponse.json({ success: false, error: fallback.error.message }, { status: 500 });
      }
      profiles = fallback.data;
    } else if (mainQuery.error) {
      return NextResponse.json({ success: false, error: mainQuery.error.message }, { status: 500 });
    } else {
      profiles = mainQuery.data;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = (profiles || []).map((p: any) => ({
      id: p.id,
      name: p.full_name || 'VIP Member',
      email: p.email || (p.id.includes('@') ? p.id : null),
      phone: p.phone || (p.id.startsWith('03') || p.id.startsWith('+92') ? p.id : null),
      role: p.role || 'member',
      balance: Number(p.balance || 0),
      status: p.status || 'active',
      banReason: p.ban_reason || '',
      lastLoginAt: p.last_login_at || p.created_at,
      createdAt: p.created_at,
    }));

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status !== 'banned').length;
    const bannedUsers = users.filter((u) => u.status === 'banned').length;
    const totalBalance = users.reduce((sum, u) => sum + (Number(u.balance) || 0), 0);

    return NextResponse.json({
      success: true,
      needsMigration,
      users,
      stats: {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalBalance,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error retrieving user list';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ==================== 2. PATCH: BAN / UNBAN / ADJUST BALANCE ====================
export async function PATCH(req: Request) {
  try {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { userId, action, reason, amount, mode, role } = body;

    const cleanUserId = (userId || '').trim();
    if (!cleanUserId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();

    // 1. BAN USER
    if (action === 'ban') {
      const banReason = (reason || '').trim() || 'Suspended by Administrator for terms violation.';
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          status: 'banned',
          ban_reason: banReason,
          updated_at: nowIso,
        })
        .eq('id', cleanUserId);

      if (error && (error.message?.includes('column') || error.message?.includes('schema cache'))) {
        return NextResponse.json({
          success: false,
          needsMigration: true,
          error: 'Please run USER_MANAGEMENT_ADMIN.sql in Supabase SQL Editor to add the status & ban_reason columns!',
        }, { status: 400 });
      }

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `User ${cleanUserId} has been banned successfully.`,
        status: 'banned',
        banReason,
      });
    }

    // 2. UNBAN USER
    if (action === 'unban') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          status: 'active',
          ban_reason: '',
          updated_at: nowIso,
        })
        .eq('id', cleanUserId);

      if (error && (error.message?.includes('column') || error.message?.includes('schema cache'))) {
        return NextResponse.json({
          success: false,
          needsMigration: true,
          error: 'Please run USER_MANAGEMENT_ADMIN.sql in Supabase SQL Editor to add the status & ban_reason columns!',
        }, { status: 400 });
      }

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `User ${cleanUserId} has been unbanned and restored to active status.`,
        status: 'active',
      });
    }

    // 3. ADJUST WALLET BALANCE
    if (action === 'adjust_balance') {
      const numAmount = Number(amount);
      if (isNaN(numAmount)) {
        return NextResponse.json({ success: false, error: 'Invalid amount value' }, { status: 400 });
      }

      // Fetch current balance
      const { data: userRecord, error: fetchErr } = await supabaseAdmin
        .from('profiles')
        .select('balance')
        .eq('id', cleanUserId)
        .maybeSingle();

      if (fetchErr || !userRecord) {
        return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
      }

      const currentBalance = Number(userRecord.balance || 0);
      let newBalance = currentBalance;

      if (mode === 'add') {
        newBalance = currentBalance + Math.abs(numAmount);
      } else if (mode === 'deduct') {
        newBalance = Math.max(0, currentBalance - Math.abs(numAmount));
      } else {
        // Set exact
        newBalance = Math.max(0, numAmount);
      }

      const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update({
          balance: newBalance,
          updated_at: nowIso,
        })
        .eq('id', cleanUserId);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Wallet balance for ${cleanUserId} updated to Rs ${newBalance.toLocaleString()}`,
        newBalance,
      });
    }

    // 4. CHANGE ROLE
    if (action === 'change_role') {
      const cleanRole = (role || 'member').trim().toLowerCase();
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          role: cleanRole,
          updated_at: nowIso,
        })
        .eq('id', cleanUserId);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `User ${cleanUserId} role changed to ${cleanRole}`,
        role: cleanRole,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error processing user update';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ==================== 3. DELETE: REMOVE USER PROFILE ====================
export async function DELETE(req: Request) {
  try {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get('userId') || '').trim();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `User profile ${userId} deleted successfully`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error deleting user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
