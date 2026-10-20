import { NextResponse } from 'next/server';
import { authenticateAdmin, verifyAdminRequest, updateAdminCredentials } from '@/src/lib/serverSecurity';
import {
  checkAdminLockoutAsync,
  recordFailedAttemptAsync,
  resetFailedAttemptsAsync,
} from '@/src/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const body = await req.json().catch(() => ({}));
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();

    const lockoutKey = `admin_lock:${clientIp}:${username.toLowerCase() || 'unknown'}`;
    const ipLockoutKey = `admin_ip_lock:${clientIp}`;

    // 1. Dual-Layer Check: In-Memory + Supabase security_lockouts Table
    const accountLock = await checkAdminLockoutAsync(lockoutKey);
    const ipLock = await checkAdminLockoutAsync(ipLockoutKey);

    const activeLock = accountLock.locked ? accountLock : ipLock.locked ? ipLock : null;

    if (activeLock && activeLock.locked) {
      return NextResponse.json(
        {
          success: false,
          locked: true,
          remainingSeconds: activeLock.remainingSeconds,
          error: `Security Lockout Active: Too many failed login attempts (3). Access locked for ${Math.ceil(
            activeLock.remainingSeconds / 60
          )} minute(s). Try again in ${activeLock.remainingSeconds}s.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(activeLock.remainingSeconds) },
        }
      );
    }

    // 2. Validate empty inputs
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Both username and password are required.' },
        { status: 400 }
      );
    }

    // 3. Authenticate with PBKDF2 SHA-512 + Salt
    const authResult = await authenticateAdmin(username, password);

    // 4. On Failure: Increment failed attempts counter and check 3-attempt limit
    if (!authResult.success || !authResult.token) {
      const state = await recordFailedAttemptAsync(lockoutKey);
      await recordFailedAttemptAsync(ipLockoutKey);

      if (state.locked) {
        return NextResponse.json(
          {
            success: false,
            locked: true,
            remainingSeconds: state.remainingSeconds,
            error: `Security Lockout Activated: 3 consecutive failed login attempts detected. Access locked for 15 minutes.`,
          },
          {
            status: 429,
            headers: { 'Retry-After': String(state.remainingSeconds) },
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          locked: false,
          attemptsLeft: state.attemptsLeft,
          error: `Access Denied: Invalid Admin Credentials. (${state.attemptsLeft} attempt${
            state.attemptsLeft === 1 ? '' : 's'
          } remaining before 15-minute security lockout)`,
        },
        { status: 401 }
      );
    }

    // 5. On Success: Reset all failed attempt records in memory and Supabase DB
    await resetFailedAttemptsAsync(lockoutKey);
    await resetFailedAttemptsAsync(ipLockoutKey);

    const response = NextResponse.json({
      success: true,
      token: authResult.token,
      username: username,
      message: 'Admin authorization successful',
    });

    response.cookies.set({
      name: 'saqib_admin_jwt',
      value: authResult.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ authenticated: false, role: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      role: auth.payload?.role || 'admin',
      username: auth.payload?.username || 'saqib',
    });
  } catch {
    return NextResponse.json({ authenticated: false, role: null }, { status: 200 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Admin logged out successfully',
  });

  response.cookies.set({
    name: 'saqib_admin_jwt',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

export async function PATCH(req: Request) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required to update credentials' },
        { status: 401 }
      );
    }

    const currentAdminUser = auth.payload?.username || 'admin';
    const patchLockoutKey = `admin_pwd_change_lock:${clientIp}:${currentAdminUser.toLowerCase()}`;
    const ipLockoutKey = `admin_pwd_ip_lock:${clientIp}`;

    // 1. Dual-Layer Check: In-Memory + Supabase security_lockouts Table
    const accountLock = await checkAdminLockoutAsync(patchLockoutKey);
    const ipLock = await checkAdminLockoutAsync(ipLockoutKey);
    const activeLock = accountLock.locked ? accountLock : ipLock.locked ? ipLock : null;

    if (activeLock && activeLock.locked) {
      return NextResponse.json(
        {
          success: false,
          locked: true,
          remainingSeconds: activeLock.remainingSeconds,
          error: `Security Lockout Active: Too many failed password update attempts (3). Password updates locked for ${Math.ceil(
            activeLock.remainingSeconds / 60
          )} minute(s). Try again in ${activeLock.remainingSeconds}s.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(activeLock.remainingSeconds) },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newUsername, newPassword } = body;

    const result = await updateAdminCredentials(
      currentPassword,
      newUsername,
      newPassword,
      auth.payload?.username
    );

    // 2. On Failure: Check if wrong current password and record failed attempts
    if (!result.success) {
      if (result.error?.toLowerCase().includes('current password')) {
        const state = await recordFailedAttemptAsync(patchLockoutKey);
        await recordFailedAttemptAsync(ipLockoutKey);

        if (state.locked) {
          return NextResponse.json(
            {
              success: false,
              locked: true,
              remainingSeconds: state.remainingSeconds,
              error: `Security Lockout Activated: 3 consecutive failed password change attempts. Password updating locked for 15 minutes.`,
            },
            {
              status: 429,
              headers: { 'Retry-After': String(state.remainingSeconds) },
            }
          );
        }

        return NextResponse.json(
          {
            success: false,
            locked: false,
            attemptsLeft: state.attemptsLeft,
            error: `${result.error} (${state.attemptsLeft} attempt${
              state.attemptsLeft === 1 ? '' : 's'
            } remaining before 15-minute lockout)`,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    // 3. On Success: Reset all failed password attempt records in memory and Supabase DB
    await resetFailedAttemptsAsync(patchLockoutKey);
    await resetFailedAttemptsAsync(ipLockoutKey);

    const response = NextResponse.json({
      success: true,
      message: result.message,
      username: result.username,
      token: result.token,
    });

    if (result.token) {
      response.cookies.set({
        name: 'saqib_admin_jwt',
        value: result.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
