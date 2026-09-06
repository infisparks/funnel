import { supabaseAdmin } from './supabaseAdmin';
import { handleStepTrigger } from './whatsappManager';
import { DEFAULT_LANDING_HTML } from './defaultLandingHtml';
import { syncLeadAutomations } from './syncLeadAutomations';

export function extractSubdomain(
  hostHeader?: string | null,
  querySubdomain?: string | null,
  queryDomain?: string | null
): string {
  if (querySubdomain) {
    let sub = querySubdomain.toLowerCase().trim();
    if (sub.endsWith('.firstoption.cloud')) sub = sub.replace('.firstoption.cloud', '');
    return sub;
  }

  if (queryDomain) {
    let dom = queryDomain.toLowerCase().trim();
    if (dom.endsWith('.firstoption.cloud')) dom = dom.replace('.firstoption.cloud', '');
    return dom;
  }

  if (!hostHeader) return '';
  const host = hostHeader.toLowerCase().split(':')[0];

  if (host.endsWith('.firstoption.cloud')) {
    const parts = host.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      return parts[0];
    }
  }

  if (
    host !== 'localhost' &&
    host !== '127.0.0.1' &&
    !host.includes('vercel.app') &&
    host !== 'firstoption.cloud' &&
    host !== 'www.firstoption.cloud'
  ) {
    return host;
  }

  return '';
}

export async function resolveWorkspace(targetIdentifier?: string | null) {
  if (!targetIdentifier) return null;
  const cleanId = targetIdentifier
    .toString()
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .split(':')[0];
  const subPart = cleanId.includes('.') ? cleanId.split('.')[0] : cleanId;

  try {
    if (cleanId) {
      const { data, error } = await supabaseAdmin
        .from('funnel_workspaces')
        .select('*')
        .or(
          `custom_domain.eq.${cleanId},subdomain.eq.${cleanId},subdomain.eq.${subPart},custom_domain.ilike.%${cleanId}%,custom_domain.ilike.%${subPart}%,id.eq.${cleanId},user_id.eq.${cleanId}`
        )
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        return data;
      }
    }
    return null;
  } catch (err: unknown) {
    console.error('[landingManager] Error resolving workspace from Supabase:', (err as Error).message);
    return null;
  }
}

export async function captureLead(body: Record<string, any>) {
  const {
    name,
    email,
    phone,
    step_progress = 'step1_contact',
    survey_responses,
    meeting_date,
    meeting_time,
    funnel_id,
    user_id,
    subdomain,
  } = body;

  let cleanPhone = (phone || '').toString().trim();
  if (cleanPhone.length === 10 && !cleanPhone.startsWith('+')) {
    cleanPhone = `+91${cleanPhone}`;
  }

  let resolvedFunnelId = funnel_id || null;
  let resolvedUserId = user_id || null;

  if ((!resolvedFunnelId || !resolvedUserId) && subdomain) {
    const ws = await resolveWorkspace(subdomain);
    if (ws) {
      resolvedFunnelId = ws.id;
      resolvedUserId = ws.user_id;
    }
  }

  // Find existing lead by phone/email
  let existingLeadId: string | null = null;
  if (cleanPhone || email) {
    let query = supabaseAdmin.from('leads').select('id, funnel_id, user_id');
    if (cleanPhone && email) {
      query = query.or(`phone.eq.${cleanPhone},email.eq.${email}`);
    } else if (cleanPhone) {
      query = query.eq('phone', cleanPhone);
    } else if (email) {
      query = query.eq('email', email);
    }

    if (resolvedFunnelId) {
      query = query.eq('funnel_id', resolvedFunnelId);
    } else if (resolvedUserId) {
      query = query.eq('user_id', resolvedUserId);
    }

    const { data: found } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (found?.id) {
      existingLeadId = found.id;
    }
  }

  // Prevent double booking only when actually booking a meeting
  const isMeetingBooked = step_progress === 'meeting_booked';
  if (isMeetingBooked && meeting_date && meeting_time) {
    const cleanDate = meeting_date.includes('T') ? meeting_date.split('T')[0] : meeting_date.trim();
    const cleanTime = meeting_time.trim();

    let slotQuery = supabaseAdmin
      .from('leads')
      .select('id, name, phone, meeting_date, meeting_time')
      .eq('meeting_date', cleanDate)
      .ilike('meeting_time', cleanTime);

    if (resolvedFunnelId) {
      slotQuery = slotQuery.eq('funnel_id', resolvedFunnelId);
    } else if (resolvedUserId) {
      slotQuery = slotQuery.eq('user_id', resolvedUserId);
    }

    if (existingLeadId) {
      slotQuery = slotQuery.neq('id', existingLeadId);
    }

    const { data: conflictLeads } = await slotQuery.limit(1);
    if (conflictLeads && conflictLeads.length > 0) {
      throw new Error(
        `The time slot "${cleanTime}" on ${cleanDate} is already booked in this CRM. Please choose another available slot.`
      );
    }
  }

  if (!resolvedUserId && resolvedFunnelId) {
    const { data: ws } = await supabaseAdmin
      .from('funnel_workspaces')
      .select('user_id')
      .eq('id', resolvedFunnelId)
      .maybeSingle();
    if (ws?.user_id) resolvedUserId = ws.user_id;
  }

  const payload: Record<string, any> = {
    name: name || 'Landing Page Visitor',
    email: email || '',
    phone: cleanPhone,
    step_progress: step_progress || 'step1_contact',
    stage_id: step_progress || 'step1_contact',
    full_name: name || 'Landing Page Visitor',
    survey_responses: survey_responses || null,
    meeting_date: isMeetingBooked ? (meeting_date || null) : null,
    meeting_time: isMeetingBooked ? (meeting_time || null) : null,
    funnel_id: resolvedFunnelId || null,
    user_id: resolvedUserId || null,
    organization_id: resolvedUserId || null,
  };

  let savedRecord = null;
  if (existingLeadId) {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .update(payload)
      .eq('id', existingLeadId)
      .select()
      .maybeSingle();
    if (error) throw error;
    savedRecord = data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert(payload)
      .select()
      .maybeSingle();
    if (error) throw error;
    savedRecord = data;
  }

  // 1. Trigger instant step progress WhatsApp
  if (savedRecord && cleanPhone) {
    const stepKeyMap: Record<string, string> = {
      step1_contact: 'step1',
      survey_completed: 'step2',
      meeting_booked: 'step3',
    };
    const stepKey = stepKeyMap[step_progress] || 'step1';
    handleStepTrigger(
      stepKey,
      {
        ...savedRecord,
        phone: cleanPhone,
        workspace_id: resolvedFunnelId,
        user_id: resolvedUserId,
      },
      null
    ).catch((e) => console.warn('[LandingPage Lead WhatsApp Trigger Error]:', e.message));
  }

  // 2. Trigger GCP Stage Automations via Google Cloud Tasks queue
  const effectiveOrgId = savedRecord?.organization_id || savedRecord?.user_id || resolvedUserId;
  if (effectiveOrgId && savedRecord?.id) {
    syncLeadAutomations({
      leadId: savedRecord.id,
      newStageId: step_progress || 'step1_contact',
      organizationId: effectiveOrgId,
    }).catch((e) => console.warn('[LandingPage Lead Sync Automation Error]:', e.message));
  }

  return savedRecord;
}
