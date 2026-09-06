import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

function formatWhatsappNumber(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  return clean;
}

export async function POST(req: Request) {
  try {
    // 1. Verify Secret Header
    const secret = req.headers.get('x-webhook-secret');
    const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET || 'secret_pipeline_auto_2026_xyz987';

    if (secret && secret !== expectedSecret) {
      console.warn('[Automation Webhook] Unauthorized attempt with invalid secret header.');
      return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
    }

    const body = await req.json();
    const {
      organizationId,
      leadId,
      stageId,
      ruleId,
      triggerKey,
      template,
      instanceName: providedInstance,
    } = body;

    if (!organizationId || !leadId || !stageId || !triggerKey) {
      return NextResponse.json({ error: 'Missing required payload parameters' }, { status: 400 });
    }

    // 2. FETCH LIVE STATE OF LEAD FROM DATABASE
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .maybeSingle();

    if (leadErr || !lead) {
      console.warn(`[Automation Webhook] Lead ${leadId} was deleted or not found.`);
      return NextResponse.json({ skipped: true, reason: 'Lead was deleted' });
    }

    // 3. CRITICAL SAFETY CHECK: VERIFY STAGE ALIGNMENT (ZERO GHOST MESSAGES)
    const currentLeadStage = lead.stage_id || lead.step_progress;
    if (currentLeadStage !== stageId) {
      console.warn(
        `[Automation Webhook] Lead ${lead.phone || leadId} moved from ${stageId} to ${currentLeadStage}. Aborting task execution.`
      );

      // Mark the task as cancelled in scheduled tasks
      await supabaseAdmin
        .from('scheduled_automation_tasks')
        .update({ status: 'cancelled' })
        .eq('organization_id', organizationId)
        .eq('trigger_key', triggerKey);

      return NextResponse.json({
        skipped: true,
        reason: `Lead moved to another stage (${currentLeadStage})`,
      });
    }

    // 4. CHECK IDEMPOTENCY
    const { data: execution } = await supabaseAdmin
      .from('automation_executions')
      .select('status')
      .eq('organization_id', organizationId)
      .eq('trigger_key', triggerKey)
      .maybeSingle();

    if (execution?.status === 'sent') {
      console.log(`[Automation Webhook] Trigger ${triggerKey} was already successfully sent. Skipping.`);
      return NextResponse.json({ skipped: true, reason: 'Already sent' });
    }

    // 5. RESOLVE WHATSAPP SENDER INSTANCE
    let instanceName = providedInstance;
    let evolutionApiUrl = process.env.EVOLUTION_API_URL || 'https://evo.infispark.in';
    let evolutionApiKey = process.env.EVOLUTION_APIKEY || 'vR39h6avY69g7kAU3YQbS6V6XEvudson';

    if (!instanceName) {
      const { data: ws } = await supabaseAdmin
        .from('funnel_workspaces')
        .select('whatsapp_config, google_meet_url')
        .or(`user_id.eq.${organizationId},id.eq.${lead.funnel_id || lead.workspace_id}`)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ws?.whatsapp_config?.instance_name) {
        instanceName = ws.whatsapp_config.instance_name;
      }
      if (ws?.whatsapp_config?.evolution_api_url) {
        evolutionApiUrl = ws.whatsapp_config.evolution_api_url;
      }
      if (ws?.whatsapp_config?.evolution_apikey) {
        evolutionApiKey = ws.whatsapp_config.evolution_apikey;
      }
      if (ws?.google_meet_url && !lead.google_meet_url && !lead.meeting_url) {
        lead.meeting_url = ws.google_meet_url;
      }
    }

    // Default fallback instance if not found
    if (!instanceName) {
      instanceName = 'mudassir';
    }

    // 6. RENDER DYNAMIC MESSAGE TEMPLATE
    const rawTemplate = template || 'Hello {{name}}, thank you for reaching out!';
    const renderedText = rawTemplate
      .replace(/\{\{\s*name\s*\}\}/gi, lead.full_name || lead.name || 'Friend')
      .replace(/\{\{\s*phone\s*\}\}/gi, lead.phone || '')
      .replace(/\{\{\s*email\s*\}\}/gi, lead.email || '')
      .replace(/\{\{\s*date\s*\}\}/gi, lead.meeting_date || '')
      .replace(/\{\{\s*time\s*\}\}/gi, lead.meeting_time || '')
      .replace(
        /\{\{\s*meeting_url\s*\}\}/gi,
        lead.meeting_url || lead.google_meet_url || 'https://meet.google.com/qbi-erbq-moy'
      )
      .replace(/\{\{\s*stage\s*\}\}/gi, stageId);

    const formattedNumber = formatWhatsappNumber(lead.phone);
    if (!formattedNumber) {
      return NextResponse.json({ skipped: true, reason: 'Invalid or missing phone number' });
    }

    // 7. DISPATCH WHATSAPP MESSAGE VIA EVOLUTION API
    const targetUrl = `${evolutionApiUrl.replace(/\/$/, '')}/message/sendText/${encodeURIComponent(instanceName)}`;
    let isSuccess = false;
    let responseText = '';

    try {
      const dispatchRes = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          apikey: evolutionApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: formattedNumber,
          text: renderedText,
        }),
      });

      responseText = await dispatchRes.text();
      isSuccess = dispatchRes.ok;
      if (!isSuccess) {
        console.error(`[Evolution API Error]: HTTP ${dispatchRes.status} - ${responseText}`);
      }
    } catch (dispatchErr: unknown) {
      console.error('[Evolution API Network Error]:', dispatchErr);
      responseText = (dispatchErr as Error).message;
      isSuccess = false;
    }

    // 8. RECORD FINAL STATUS IN DATABASE
    const nowIso = new Date().toISOString();

    // Update or insert execution log
    await supabaseAdmin.from('automation_executions').upsert(
      {
        organization_id: organizationId,
        trigger_key: triggerKey,
        lead_id: leadId,
        rule_id: ruleId,
        status: isSuccess ? 'sent' : 'failed',
        sent_at: isSuccess ? nowIso : null,
        error_message: isSuccess ? null : responseText,
      },
      { onConflict: 'organization_id,trigger_key' }
    );

    // Update scheduled task tracker
    await supabaseAdmin
      .from('scheduled_automation_tasks')
      .update({ status: isSuccess ? 'completed' : 'failed' })
      .eq('organization_id', organizationId)
      .eq('trigger_key', triggerKey);

    // 9. LOG TO WHATSAPP MESSAGE LOGS TABLE & APPEND TO LEAD LOGS
    const logItem = {
      id: `wa_auto_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: nowIso,
      trigger_step: `stage_automation_${stageId}`,
      recipient_phone: formattedNumber,
      recipient_name: lead.full_name || lead.name || 'Lead',
      message: renderedText,
      media_url: null,
      instance_name: instanceName,
      status: isSuccess ? 'sent' : 'failed',
    };

    try {
      await supabaseAdmin.from('whatsapp_message_logs').insert([
        {
          recipient_phone: formattedNumber,
          recipient_name: lead.full_name || lead.name || 'Lead',
          trigger_type: `auto_${stageId}`,
          message_text: renderedText,
          status: isSuccess ? 'sent' : 'failed',
          instance_name: instanceName,
          created_at: nowIso,
        },
      ]);
    } catch (e) {}

    try {
      const existingLogs = Array.isArray(lead.whatsapp_logs) ? lead.whatsapp_logs : [];
      await supabaseAdmin
        .from('leads')
        .update({ whatsapp_logs: [logItem, ...existingLogs] })
        .eq('id', lead.id);
    } catch (e) {}

    console.log(`[Automation Webhook] Execution completed for trigger ${triggerKey}. Result: ${isSuccess ? 'SENT' : 'FAILED'}`);
    return NextResponse.json({ success: isSuccess, triggerKey });
  } catch (err: unknown) {
    console.error('[Automation Webhook Fatal Error]:', err);
    return NextResponse.json({ error: (err as Error).message || 'Webhook processing failed' }, { status: 500 });
  }
}
