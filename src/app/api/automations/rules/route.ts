import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

// GET /api/automations/rules?organizationId=...&stageId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const stageId = searchParams.get('stageId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('stage_automation_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });

    if (stageId) {
      query = query.eq('stage_id', stageId);
    }

    const { data: rules, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rules: rules || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || 'Failed to process request' }, { status: 500 });
  }
}

// POST /api/automations/rules - Create new rule
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      organizationId,
      stageId,
      title,
      triggerBase,
      offsetType,
      offsetValue,
      offsetUnit,
      template,
      channel = 'whatsapp',
      instanceName,
      isEnabled = true,
      applyToExisting = true,
    } = body;

    if (!organizationId || !stageId || !title || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, stageId, title, template' },
        { status: 400 }
      );
    }

    const { data: createdRule, error } = await supabaseAdmin
      .from('stage_automation_rules')
      .insert([
        {
          organization_id: organizationId,
          stage_id: stageId,
          title: title.trim(),
          trigger_base: triggerBase || 'stage_entered',
          offset_type: offsetType || 'after',
          offset_value: Number(offsetValue) || 5,
          offset_unit: offsetUnit || 'minutes',
          template: template.trim(),
          channel,
          instance_name: instanceName || null,
          is_enabled: isEnabled,
          apply_to_existing: applyToExisting,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rule: createdRule });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || 'Failed to create rule' }, { status: 500 });
  }
}

// PUT /api/automations/rules - Update rule
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, organizationId, ...updates } = body;

    if (!id || !organizationId) {
      return NextResponse.json({ error: 'Missing id or organizationId' }, { status: 400 });
    }

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.triggerBase !== undefined) payload.trigger_base = updates.triggerBase;
    if (updates.offsetType !== undefined) payload.offset_type = updates.offsetType;
    if (updates.offsetValue !== undefined) payload.offset_value = Number(updates.offsetValue);
    if (updates.offsetUnit !== undefined) payload.offset_unit = updates.offsetUnit;
    if (updates.template !== undefined) payload.template = updates.template;
    if (updates.instanceName !== undefined) payload.instance_name = updates.instanceName;
    if (updates.isEnabled !== undefined) payload.is_enabled = updates.isEnabled;
    if (updates.applyToExisting !== undefined) payload.apply_to_existing = updates.applyToExisting;

    const { data: updatedRule, error } = await supabaseAdmin
      .from('stage_automation_rules')
      .update(payload)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rule: updatedRule });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || 'Failed to update rule' }, { status: 500 });
  }
}

// DELETE /api/automations/rules?id=...&organizationId=...
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const organizationId = searchParams.get('organizationId');

    if (!id || !organizationId) {
      return NextResponse.json({ error: 'Missing id or organizationId' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('stage_automation_rules')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || 'Failed to delete rule' }, { status: 500 });
  }
}

