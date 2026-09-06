import { supabaseAdmin } from './supabaseAdmin';
import { cancelScheduledQueueTask, enqueueScheduledTask } from './queue';

export interface SyncLeadAutomationsParams {
  organizationId: string;
  leadId: string;
  previousStageId?: string | null;
  newStageId: string;
}

export interface SyncLeadAutomationsResult {
  success: boolean;
  count?: number;
  message?: string;
  tasks?: Array<{ ruleId: string; scheduledFor: string; triggerKey: string }>;
  error?: string;
}

/**
 * Stage Movement Sync & Cancellation Engine
 * Handles old queue task purging, idempotency locking, calculation of execution time,
 * and enqueuing new tasks to Google Cloud Tasks.
 */
export async function syncLeadAutomations(
  params: SyncLeadAutomationsParams
): Promise<SyncLeadAutomationsResult> {
  const { organizationId, leadId, previousStageId, newStageId } = params;

  // 1. Fetch current lead details directly by primary key UUID
  const { data: lead, error: leadErr } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .maybeSingle();

  if (leadErr || !lead) {
    console.error('[Automation Sync] Lead not found:', leadErr?.message || leadId);
    return { success: false, error: 'Lead not found' };
  }

  const effectiveOrgId = lead.organization_id || lead.user_id || organizationId;
  const leadPhone = lead.phone || '';
  const cleanPhone = leadPhone.replace(/[^0-9]/g, '');

  if (!lead.organization_id && effectiveOrgId) {
    await supabaseAdmin.from('leads').update({ organization_id: effectiveOrgId }).eq('id', leadId);
  }

  // 2. STAGE CHANGE DETECTED: CANCEL ALL PENDING TASKS OF OLD STAGE
  const effectivePreviousStage = previousStageId || (lead.stage_id && lead.stage_id !== newStageId ? lead.stage_id : null);
  if (effectivePreviousStage && effectivePreviousStage !== newStageId) {
    console.log(
      `[Automation Sync] Lead ${lead.phone || leadId} moving: ${effectivePreviousStage} -> ${newStageId}. Purging old pending tasks...`
    );

    const { data: pendingTasks } = await supabaseAdmin
      .from('scheduled_automation_tasks')
      .select('*')
      .eq('lead_id', leadId)
      .eq('status', 'scheduled');

    if (pendingTasks && pendingTasks.length > 0) {
      for (const task of pendingTasks) {
        // Cancel in external Google Cloud Tasks queue
        if (task.external_task_id) {
          try {
            await cancelScheduledQueueTask(task.external_task_id);
          } catch (e: unknown) {
            console.warn('[Automation Sync] Queue task cancel warning:', (e as Error).message);
          }
        }

        // Remove pending idempotency lock so if the lead is dragged back later, it can re-schedule cleanly
        await supabaseAdmin
          .from('automation_executions')
          .delete()
          .eq('trigger_key', task.trigger_key)
          .eq('status', 'pending');
      }

      // Mark tasks as cancelled in Supabase
      await supabaseAdmin
        .from('scheduled_automation_tasks')
        .update({ status: 'cancelled' })
        .eq('lead_id', leadId)
        .eq('status', 'scheduled');
    }
  }

  // Persist updated stage timestamps on lead
  const stageMovedAt = new Date().toISOString();
  const leadUpdatePayload: Record<string, any> = {
    stage_id: newStageId,
    step_progress: newStageId,
    stage_moved_at: stageMovedAt,
  };
  if (newStageId !== 'meeting_booked') {
    leadUpdatePayload.meeting_date = null;
    leadUpdatePayload.meeting_time = null;
  }
  await supabaseAdmin
    .from('leads')
    .update(leadUpdatePayload)
    .eq('id', leadId);

  // 3. FETCH ACTIVE RULES FOR NEW STAGE
  const candidateOrgIds = Array.from(
    new Set([effectiveOrgId, lead.user_id, organizationId].filter(Boolean))
  );
  const orgFilter = candidateOrgIds.map((id) => `organization_id.eq.${id}`).join(',');

  const { data: rules, error: rulesErr } = await supabaseAdmin
    .from('stage_automation_rules')
    .select('*')
    .or(orgFilter)
    .eq('stage_id', newStageId)
    .eq('is_enabled', true);

  if (rulesErr) {
    console.error('[Automation Sync] Error querying stage rules:', rulesErr.message);
  }

  if (!rules || rules.length === 0) {
    return { success: true, count: 0, message: 'No active rules configured for this stage.' };
  }

  const nowMs = Date.now();
  const scheduledResults: Array<{ ruleId: string; scheduledFor: string; triggerKey: string }> = [];
  const appPublicUrl =
    process.env.APP_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    'https://funnel.infiplus.in';

  for (const rule of rules) {
    let referenceDate: Date;
    let meetingKey = 'none';

    if (rule.trigger_base === 'meeting_scheduled') {
      if (!lead.meeting_date) {
        console.log(`[Automation Sync] Rule "${rule.title}" requires meeting date, but lead has none. Skipping.`);
        continue;
      }
      referenceDate = new Date(`${lead.meeting_date}T${lead.meeting_time || '12:00:00'}+05:30`);
      meetingKey = `${lead.meeting_date}_${lead.meeting_time || '00'}`.replace(/\D/g, '');
    } else {
      referenceDate = new Date(stageMovedAt);
    }

    if (isNaN(referenceDate.getTime())) {
      continue;
    }

    // Calculate Millisecond Offset
    let offsetMs = Number(rule.offset_value || 0) * 60 * 1000;
    if (rule.offset_unit === 'hours') offsetMs = Number(rule.offset_value) * 3600 * 1000;
    if (rule.offset_unit === 'days') offsetMs = Number(rule.offset_value) * 86400 * 1000;

    let targetTimeMs = 0;
    const effectiveOffsetType = rule.trigger_base === 'stage_entered' ? 'after' : rule.offset_type;
    if (effectiveOffsetType === 'before') {
      targetTimeMs = referenceDate.getTime() - offsetMs;
    } else {
      targetTimeMs = referenceDate.getTime() + offsetMs;
    }

    // Skip if target trigger time has already passed
    if (targetTimeMs <= nowMs) {
      console.log(`[Automation Sync] Skipping rule "${rule.title}": scheduled time is in the past.`);
      continue;
    }

    const triggerKey = `auto_${cleanPhone}_stg_${newStageId}_rule_${rule.id}_${meetingKey}`;

    // 4. CHECK STRICT IDEMPOTENCY / DOUBLE-SEND LOCK
    const { data: existingExecution } = await supabaseAdmin
      .from('automation_executions')
      .select('status')
      .eq('organization_id', effectiveOrgId)
      .eq('trigger_key', triggerKey)
      .maybeSingle();

    if (existingExecution?.status === 'sent') {
      console.log(`[Automation Sync] Trigger key ${triggerKey} was already sent. Skipping.`);
      continue;
    }

    // Insert or refresh pending idempotency lock
    await supabaseAdmin.from('automation_executions').upsert(
      {
        organization_id: effectiveOrgId,
        trigger_key: triggerKey,
        lead_id: leadId,
        rule_id: rule.id,
        status: 'pending',
      },
      { onConflict: 'organization_id,trigger_key' }
    );

    const targetSeconds = Math.floor(targetTimeMs / 1000);

    // 5. ENQUEUE SCHEDULED TASK TO GOOGLE CLOUD TASKS
    const cleanMsgText = (rule.template || '')
      .replace(/\{\{name\}\}/gi, lead.name || 'there')
      .replace(/\{\{phone\}\}/gi, lead.phone || '')
      .replace(/\{\{email\}\}/gi, lead.email || '');

    const webhookPayload = {
      organizationId: effectiveOrgId,
      userId: effectiveOrgId,
      leadId: lead.id,
      recipientPhone: lead.phone,
      recipientName: lead.name || 'Lead',
      stageId: newStageId,
      ruleId: rule.id,
      ruleTitle: rule.title || 'Stage Automation',
      triggerKey,
      template: rule.template,
      messageText: cleanMsgText,
      scheduledAt: new Date(targetTimeMs).toISOString(),
      instanceName: rule.instance_name || null,
    };

    const webhookUrl = `${appPublicUrl.replace(/\/$/, '')}/api/automations/execute-webhook`;
    const queueRes = await enqueueScheduledTask({
      url: webhookUrl,
      payload: webhookPayload,
      scheduleTimeSeconds: targetSeconds,
    });

    // 6. RECORD IN DATABASE TRACKER TABLE
    await supabaseAdmin.from('scheduled_automation_tasks').insert({
      organization_id: effectiveOrgId,
      lead_id: lead.id,
      rule_id: rule.id,
      external_task_id: queueRes.externalTaskId,
      trigger_key: triggerKey,
      scheduled_for: new Date(targetTimeMs).toISOString(),
      status: 'scheduled',
    });

    scheduledResults.push({
      ruleId: rule.id,
      scheduledFor: new Date(targetTimeMs).toISOString(),
      triggerKey,
    });
  }

  return {
    success: true,
    count: scheduledResults.length,
    tasks: scheduledResults,
  };
}
