import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { sendOtpEmail } from '@/src/lib/emailService';

function getHmacSecret() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.EMAILJS_PRIVATE_KEY ||
    'saqib_visuals_vip_otp_secure_key_2026'
  );
}

function generateOtpToken(email: string, otp: string, expiresAt: number, purpose: string) {
  const secret = getHmacSecret();
  const payload = `${email.toLowerCase().trim()}:${otp.trim()}:${expiresAt}:${purpose}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${expiresAt}.${hmac}`;
}

function verifyOtpToken(
  email: string,
  otp: string,
  token: string,
  purpose: string
): { valid: boolean; error?: string } {
  try {
    const parts = (token || '').split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid verification token format' };
    }

    const [expiresAtStr, signature] = parts;
    const expiresAt = Number(expiresAtStr);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return { valid: false, error: 'Verification code has expired. Please request a new code.' };
    }

    const secret = getHmacSecret();
    const payload = `${email.toLowerCase().trim()}:${otp.trim()}:${expiresAt}:${purpose}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (expectedSig !== signature) {
      return { valid: false, error: 'Invalid verification code. Please check your email and try again.' };
    }

    return { valid: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Token verification error';
    return { valid: false, error: msg };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, purpose, otp, verificationToken, password, fullName, phone } = body;

    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    const cleanPurpose = purpose === 'forgot_password' ? 'forgot_password' : 'signup';

    // ─────────────────────────────────────────────────────────────
    // 1. ACTION: SEND OTP
    // ─────────────────────────────────────────────────────────────
    if (action === 'send' || action === 'resend') {
      // Check account existence based on purpose
      if (cleanPurpose === 'signup') {
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', cleanEmail)
          .maybeSingle();

        if (existingProfile) {
          return NextResponse.json(
            {
              success: false,
              error: 'An account with this email already exists. Please Sign In instead.',
            },
            { status: 400 }
          );
        }
      } else if (cleanPurpose === 'forgot_password') {
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', cleanEmail)
          .maybeSingle();

        // Also check supabase auth users if profile not in custom table
        let authFound = false;
        if (!existingProfile) {
          try {
            const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
            const users = (userList?.users || []) as Array<{ id: string; email?: string }>;
            authFound = users.some((u) => u.email?.toLowerCase() === cleanEmail);
          } catch {}
        }

        if (!existingProfile && !authFound) {
          return NextResponse.json(
            {
              success: false,
              error: 'No account registered with this email address. Please check your spelling or create an account.',
            },
            { status: 404 }
          );
        }
      }

      // Generate secure 6-digit random PIN
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
      const newToken = generateOtpToken(cleanEmail, generatedOtp, expiresAt, cleanPurpose);

      // Send OTP via EmailJS
      const emailResult = await sendOtpEmail({
        toEmail: cleanEmail,
        passcode: generatedOtp,
        time: '15 minutes',
        purpose: cleanPurpose,
        name: fullName || cleanEmail.split('@')[0],
      });

      if (!emailResult.success) {
        console.warn('[OTP Service] EmailJS dispatch issue:', emailResult.error);
      }

      return NextResponse.json({
        success: true,
        message: `6-digit VIP verification code sent to ${cleanEmail}`,
        verificationToken: newToken,
        expiresAt,
        // Return OTP for client fallback in dev/browser if needed
        devNotice: process.env.NODE_ENV === 'development' ? `Code: ${generatedOtp}` : undefined,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. ACTION: VERIFY OTP & COMPLETE ACTION
    // ─────────────────────────────────────────────────────────────
    if (action === 'verify') {
      const cleanOtp = (otp || '').trim();
      if (!cleanOtp || cleanOtp.length !== 6) {
        return NextResponse.json(
          { success: false, error: 'Please enter all 6 digits of your verification code' },
          { status: 400 }
        );
      }

      if (!verificationToken) {
        return NextResponse.json(
          { success: false, error: 'Missing verification token. Please request a new OTP code.' },
          { status: 400 }
        );
      }

      // Validate HMAC signature & expiration
      const check = verifyOtpToken(cleanEmail, cleanOtp, verificationToken, cleanPurpose);
      if (!check.valid) {
        return NextResponse.json({ success: false, error: check.error }, { status: 400 });
      }

      const nowIso = new Date().toISOString();

      // Case A: Registration Completion
      if (cleanPurpose === 'signup') {
        const displayName = fullName?.trim() || cleanEmail.split('@')[0];

        // 1. Insert or update profile in Supabase
        let insertResult = await supabaseAdmin
          .from('profiles')
          .insert({
            id: cleanEmail,
            full_name: displayName,
            email: cleanEmail,
            phone: phone?.trim() || null,
            role: 'Regular Customer (Free)',
            balance: 0,
            status: 'active',
            ban_reason: '',
            last_login_at: nowIso,
            created_at: nowIso,
            updated_at: nowIso,
          })
          .select()
          .maybeSingle();

        if (
          insertResult.error &&
          (insertResult.error.message?.includes('column') || insertResult.error.message?.includes('schema cache'))
        ) {
          insertResult = await supabaseAdmin
            .from('profiles')
            .insert({
              id: cleanEmail,
              full_name: displayName,
              email: cleanEmail,
              role: 'Regular Customer (Free)',
              balance: 0,
              created_at: nowIso,
              updated_at: nowIso,
            })
            .select()
            .maybeSingle();
        }

        // 2. Create in Supabase Auth if password provided
        if (password && password.trim().length >= 6) {
          try {
            await supabaseAdmin.auth.admin.createUser({
              email: cleanEmail,
              password: password.trim(),
              email_confirm: true,
              user_metadata: { full_name: displayName },
            });
          } catch (authErr) {
            console.warn('[OTP Auth] Supabase auth create notice:', authErr);
          }
        }

        const profileData = insertResult?.data || {
          id: cleanEmail,
          full_name: displayName,
          role: 'Regular Customer (Free)',
          balance: 0,
          status: 'active',
          last_login_at: nowIso,
        };

        return NextResponse.json({
          success: true,
          message: 'VIP Account successfully verified & registered!',
          profile: {
            id: profileData.id,
            name: profileData.full_name,
            role: profileData.role || 'Regular Customer (Free)',
            balance: Number(profileData.balance || 0),
            status: profileData.status || 'active',
            lastLoginAt: nowIso,
          },
        });
      }

      // Case B: Forgot Password Reset
      if (cleanPurpose === 'forgot_password') {
        const cleanNewPass = (password || '').trim();
        if (!cleanNewPass || cleanNewPass.length < 6) {
          return NextResponse.json(
            { success: false, error: 'New password must be at least 6 characters long' },
            { status: 400 }
          );
        }

        // 1. Update in Supabase Auth
        try {
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
          const users = (userList?.users || []) as Array<{ id: string; email?: string }>;
          const authUser = users.find((u) => u.email?.toLowerCase() === cleanEmail);

          if (authUser) {
            await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
              password: cleanNewPass,
            });
          } else {
            await supabaseAdmin.auth.admin.createUser({
              email: cleanEmail,
              password: cleanNewPass,
              email_confirm: true,
            });
          }
        } catch (authUpdateErr) {
          console.warn('[OTP Auth] Auth update error:', authUpdateErr);
        }

        // 2. Update profile timestamp
        await supabaseAdmin
          .from('profiles')
          .update({
            last_login_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', cleanEmail);

        // Fetch user profile
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', cleanEmail)
          .maybeSingle();

        return NextResponse.json({
          success: true,
          message: 'Password reset successfully! Welcome back to VIP Portal.',
          profile: {
            id: cleanEmail,
            name: profile?.full_name || cleanEmail.split('@')[0],
            role: profile?.role || 'Regular Customer (Free)',
            balance: Number(profile?.balance || 0),
            status: profile?.status || 'active',
            lastLoginAt: nowIso,
          },
        });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error in OTP route';
    console.error('[OTP Route] Exception:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
