import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

// GET /api/automations/tasks?organizationId=...&leadId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const leadId = searchParams.get('leadId');

    if (!organizationId && !leadId) {
      return NextResponse.json({ error: 'Missing organizationId or leadId' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('scheduled_automation_tasks')
      .select('id, lead_id, rule_id, external_task_id, scheduled_for, status, trigger_key, created_at, stage_automation_rules(*), leads(id, name, phone, email, step_progress)')
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true });

    if (organizationId && organizationId !== 'undefined' && organizationId !== 'null') {
      query = query.eq('organization_id', organizationId);
    }
    if (leadId && leadId !== 'undefined' && leadId !== 'null') {
      query = query.eq('lead_id', leadId);
    }

    const { data: tasks, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || 'Failed to fetch tasks' }, { status: 500 });
  }
}
