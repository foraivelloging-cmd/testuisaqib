import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, identifier, password, fullName, role, avatarUrl } = body;

    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: 'Mobile number or email is required' },
        { status: 400 }
      );
    }

    if (action === 'google_sync') {
      const email = cleanId.toLowerCase();
      // Check if profile exists
      let { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', email)
        .maybeSingle();

      const nowIso = new Date().toISOString();

      if (!profile) {
        let insertResult = await supabaseAdmin
          .from('profiles')
          .insert({
            id: email,
            full_name: fullName?.trim() || email.split('@')[0],
            phone: null,
            email: email,
            role: role || 'Regular Customer (Free)',
            balance: 0,
            status: 'active',
            ban_reason: '',
            avatar_url: avatarUrl || null,
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
              id: email,
              full_name: fullName?.trim() || email.split('@')[0],
              email: email,
              role: role || 'Regular Customer (Free)',
              balance: 0,
              created_at: nowIso,
              updated_at: nowIso,
            })
            .select()
            .maybeSingle();
        }

        profile = insertResult?.data;
      } else {
        // Update last login & avatar if provided
        const updatePayload: Record<string, any> = { last_login_at: nowIso };
        if (avatarUrl) updatePayload.avatar_url = avatarUrl;
        const updRes = await supabaseAdmin
          .from('profiles')
          .update(updatePayload)
          .eq('id', email);

        if (updRes.error && updRes.error.message?.includes('column')) {
          await supabaseAdmin
            .from('profiles')
            .update({ last_login_at: nowIso })
            .eq('id', email);
        }
      }

      if (profile && profile.status === 'banned') {
        const reason = profile.ban_reason || 'Violation of website terms or fraudulent behavior.';
        return NextResponse.json(
          {
            success: false,
            banned: true,
            error: `Account Suspended: Your account has been banned by the Administrator (${reason}). Please contact support on WhatsApp.`,
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Google profile synced successfully',
        profile: {
          id: profile?.id || email,
          name: profile?.full_name || fullName || email.split('@')[0],
          role: profile?.role || 'member',
          balance: Number(profile?.balance || 0),
          status: profile?.status || 'active',
          avatarUrl: avatarUrl || profile?.avatar_url || '',
          lastLoginAt: nowIso,
        },
      });
    }

    if (action === 'signup') {
      if (!cleanPass) {
        return NextResponse.json(
          { success: false, error: 'Password is required for registration' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', cleanId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'An account with this Phone or Email already exists. Please Sign In.' },
          { status: 400 }
        );
      }

      // Create new profile in Supabase
      const nowIso = new Date().toISOString();
      let insertResult = await supabaseAdmin
        .from('profiles')
        .insert({
          id: cleanId,
          full_name: fullName?.trim() || 'VIP Member',
          phone: cleanId.startsWith('03') || cleanId.startsWith('+92') ? cleanId : null,
          email: cleanId.includes('@') ? cleanId : null,
          role: role || 'member',
          balance: 0,
          status: 'active',
          ban_reason: '',
          last_login_at: nowIso,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select()
        .single();

      // Graceful fallback if status/ban_reason/last_login_at columns are not migrated yet
      if (
        insertResult.error &&
        (insertResult.error.message?.includes('column') || insertResult.error.message?.includes('schema cache'))
      ) {
        insertResult = await supabaseAdmin
          .from('profiles')
          .insert({
            id: cleanId,
            full_name: fullName?.trim() || 'VIP Member',
            phone: cleanId.startsWith('03') || cleanId.startsWith('+92') ? cleanId : null,
            email: cleanId.includes('@') ? cleanId : null,
            role: role || 'member',
            balance: 0,
            created_at: nowIso,
            updated_at: nowIso,
          })
          .select()
          .single();
      }

      if (insertResult.error) {
        return NextResponse.json({ success: false, error: insertResult.error.message }, { status: 500 });
      }

      const data = insertResult.data;

      return NextResponse.json({
        success: true,
        message: 'Account created successfully!',
        profile: {
          id: data.id,
          name: data.full_name,
          role: data.role,
          balance: Number(data.balance || 0),
          status: data.status || 'active',
          lastLoginAt: data.last_login_at || nowIso,
        },
      });
    }

    // Default: Sign In
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', cleanId)
      .maybeSingle();

    if (error || !profile) {
      // Auto-create guest VIP session if user logs in on offline/fallback mode
      return NextResponse.json({
        success: true,
        source: 'auto_created',
        profile: {
          id: cleanId,
          name: fullName?.trim() || cleanId.split('@')[0] || 'VIP Member',
          role: 'member',
          balance: 1800,
          status: 'active',
          lastLoginAt: new Date().toISOString(),
        },
      });
    }

    // 1. Check if Account is Banned by Administrator
    if (profile.status === 'banned') {
      const reason = profile.ban_reason || 'Violation of website terms or fraudulent behavior.';
      return NextResponse.json(
        {
          success: false,
          banned: true,
          error: `Account Suspended: Your account has been banned by the Administrator (${reason}). Please contact support on WhatsApp.`,
        },
        { status: 403 }
      );
    }

    // 2. Update last_login_at timestamp
    const loginNow = new Date().toISOString();
    (async () => {
      try {
        const res = await supabaseAdmin
          .from('profiles')
          .update({
            last_login_at: loginNow,
            updated_at: loginNow,
          })
          .eq('id', cleanId);

        if (res.error && res.error.message?.includes('column')) {
          await supabaseAdmin.from('profiles').update({ updated_at: loginNow }).eq('id', cleanId);
        }
      } catch {}
    })();

    return NextResponse.json({
      success: true,
      source: 'supabase',
      profile: {
        id: profile.id,
        name: profile.full_name,
        role: profile.role,
        balance: Number(profile.balance || 0),
        status: profile.status || 'active',
        lastLoginAt: loginNow,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
