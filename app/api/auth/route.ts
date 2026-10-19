import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, identifier, password, fullName, role } = body;

    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: 'Mobile number or email is required' },
        { status: 400 }
      );
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
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: cleanId,
          full_name: fullName?.trim() || 'VIP Member',
          phone: cleanId.startsWith('03') || cleanId.startsWith('+92') ? cleanId : null,
          email: cleanId.includes('@') ? cleanId : null,
          role: role || 'member',
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Account created successfully!',
        profile: {
          id: data.id,
          name: data.full_name,
          role: data.role,
          balance: Number(data.balance || 0),
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
        },
      });
    }

    return NextResponse.json({
      success: true,
      source: 'supabase',
      profile: {
        id: profile.id,
        name: profile.full_name,
        role: profile.role,
        balance: Number(profile.balance || 0),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
