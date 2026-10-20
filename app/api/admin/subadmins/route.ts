import { NextResponse } from 'next/server';
import {
  verifyAdminRequestAsync,
  listAllAdmins,
  createSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
} from '@/src/lib/serverSecurity';

// ==================== 1. GET: LIST ALL ADMINISTRATORS (SUPERADMIN ONLY) ====================
export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req, undefined, true);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          revoked: auth.revoked || false,
          error: auth.reason || 'Unauthorized: Only Superadmin can access administrator accounts.',
        },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const result = await listAllAdmins();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      admins: result.admins,
      currentSuperadmin: auth.payload?.username || 'saqib',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ==================== 2. POST: CREATE NEW SUB-ADMIN (SUPERADMIN ONLY) ====================
export async function POST(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req, undefined, true);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          revoked: auth.revoked || false,
          error: auth.reason || 'Unauthorized: Only Superadmin can create administrators.',
        },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();
    const permissions = body.permissions || {};

    if (!username || username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const result = await createSubAdmin(
      username,
      password,
      permissions,
      auth.payload?.username || 'saqib'
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      admin: result.admin,
      message: `Sub-admin "${username}" created successfully with granular permissions.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ==================== 3. PATCH: UPDATE SUB-ADMIN PERMISSIONS / PASSWORD / STATUS ====================
export async function PATCH(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req, undefined, true);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          revoked: auth.revoked || false,
          error: auth.reason || 'Unauthorized: Only Superadmin can modify administrators.',
        },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const username = (body.username || '').trim();

    if (!username) {
      return NextResponse.json({ success: false, error: 'Target username is required.' }, { status: 400 });
    }

    const result = await updateSubAdmin(username, {
      permissions: body.permissions,
      newPassword: body.newPassword,
      is_active: body.is_active,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message || `Sub-admin "${username}" updated successfully.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ==================== 4. DELETE: DELETE SUB-ADMIN & INSTANT LOGOUT ====================
export async function DELETE(req: Request) {
  try {
    const auth = await verifyAdminRequestAsync(req, undefined, true);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          revoked: auth.revoked || false,
          error: auth.reason || 'Unauthorized: Only Superadmin can delete administrators.',
        },
        { status: auth.revoked ? 401 : 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';

    if (!username.trim()) {
      return NextResponse.json(
        { success: false, error: 'Target username query parameter is required.' },
        { status: 400 }
      );
    }

    const result = await deleteSubAdmin(username.trim());
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
