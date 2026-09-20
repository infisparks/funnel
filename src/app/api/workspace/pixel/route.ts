import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const subdomain = searchParams.get('subdomain');
    const userId = searchParams.get('user_id');

    let query = supabaseAdmin.from('funnel_workspaces').select('id, user_id, subdomain, custom_domain, pixel_id');

    if (workspaceId) {
      query = query.eq('id', workspaceId);
    } else if (subdomain) {
      query = query.eq('subdomain', subdomain);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) throw error;

    return NextResponse.json({ pixel_id: data?.pixel_id || null, workspace: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pixel_id, workspace_id, user_id, subdomain } = body;

    const cleanPixelId = pixel_id !== undefined && pixel_id !== null && pixel_id !== '' 
      ? pixel_id.toString().trim() 
      : null;

    let updateQuery = supabaseAdmin.from('funnel_workspaces').update({
      pixel_id: cleanPixelId,
      updated_at: new Date().toISOString(),
    });

    if (workspace_id) {
      updateQuery = updateQuery.eq('id', workspace_id);
    } else if (user_id) {
      updateQuery = updateQuery.eq('user_id', user_id);
    } else if (subdomain) {
      updateQuery = updateQuery.eq('subdomain', subdomain);
    } else {
      return NextResponse.json({ error: 'workspace_id, user_id, or subdomain required' }, { status: 400 });
    }

    const { data, error } = await updateQuery.select('id, user_id, subdomain, custom_domain, pixel_id').maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      pixel_id: data?.pixel_id || null,
      workspace: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
