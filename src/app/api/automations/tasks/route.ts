import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

// GET /api/automations/tasks?organizationId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
    }

    const { data: tasks, error } = await supabaseAdmin
      .from('scheduled_automation_tasks')
      .select('id, lead_id, rule_id, scheduled_for, status, trigger_key, created_at')
      .eq('organization_id', organizationId)
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || 'Failed to fetch tasks' }, { status: 500 });
  }
}
