import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { DEFAULT_WEB_TOOLS, WebToolItem } from '@/src/data/defaultCatalog';
import { verifyAdminRequest } from '@/src/lib/serverSecurity';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('web_tools')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        success: true,
        source: 'default',
        tools: DEFAULT_WEB_TOOLS,
      });
    }

    const tools: WebToolItem[] = data.map((row) => ({
      id: row.id,
      title: row.title,
      desc: row.desc || '',
      toolUrl: row.tool_url,
      iconUrl: row.icon_url || '',
      badge: row.badge || '⚡ LIVE TOOL',
      buttonLabel: row.button_label || 'Open Live Tool',
      iconType: row.icon_type || 'wand',
      orbGrad: row.orb_grad || 'from-indigo-600 to-purple-600',
      plush: row.plush || 'plush-website',
      openMode: (row.open_mode as 'new_tab' | 'embed_modal' | 'sim_tab') || 'new_tab',
      hidden: row.hidden ?? false,
    }));

    return NextResponse.json({
      success: true,
      source: 'supabase',
      tools,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: true, source: 'fallback', tools: DEFAULT_WEB_TOOLS, warning: message },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const tool: WebToolItem = body.tool;

    if (!tool || !tool.id || !tool.title || !tool.toolUrl) {
      return NextResponse.json(
        { success: false, error: 'tool id, title and toolUrl are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('web_tools')
      .upsert({
        id: tool.id,
        title: tool.title,
        desc: tool.desc || '',
        tool_url: tool.toolUrl,
        icon_url: tool.iconUrl || '',
        badge: tool.badge || 'ONLINE',
        icon_type: tool.iconType || 'wand',
        orb_grad: tool.orbGrad || 'from-indigo-600 to-purple-600',
        plush: tool.plush || 'plush-website',
        hidden: tool.hidden ?? false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, tool: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id param required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('web_tools').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
