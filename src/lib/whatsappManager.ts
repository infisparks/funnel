import { supabaseAdmin } from './supabaseAdmin';

export function formatWhatsappNumber(phone: string | number | undefined | null): string {
  if (!phone) return '';
  let clean = phone.toString().replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  return clean;
}

export function parseWhatsappTemplate(
  template: string | undefined | null,
  data: Record<string, any> = {},
  defaultMeetUrl = 'https://meet.google.com/qbi-erbq-moy'
): string {
  if (!template) return '';
  const name = data.name || data.recipient_name || data.full_name || 'Friend';
  const meetUrl = data.google_meet_url || data.meeting_url || defaultMeetUrl;

  return template
    .replace(/\{\{\s*name\s*\}\}/gi, name)
    .replace(/\{\{\s*phone\s*\}\}/gi, data.phone || '')
    .replace(/\{\{\s*email\s*\}\}/gi, data.email || '')
    .replace(/\{\{\s*date\s*\}\}/gi, data.meeting_date || '')
    .replace(/\{\{\s*time\s*\}\}/gi, data.meeting_time || '')
    .replace(/\{\{\s*meeting_url\s*\}\}/gi, meetUrl);
}

export async function getUserWhatsappConfig(userIdOrWorkspaceId?: string | null) {
  try {
    if (userIdOrWorkspaceId && userIdOrWorkspaceId !== 'default_user' && userIdOrWorkspaceId !== 'lead_drawer') {
      // 1. Try exact workspace match
      const { data: wsById } = await supabaseAdmin
        .from('funnel_workspaces')
        .select('id, user_id, whatsapp_config, google_meet_url')
        .eq('id', userIdOrWorkspaceId)
        .maybeSingle();

      if (wsById?.whatsapp_config?.instance_name) {
        return {
          ...wsById.whatsapp_config,
          google_meet_url: wsById.google_meet_url || wsById.whatsapp_config.google_meet_url,
        };
      }

      // 2. Try user_id match
      const { data: wsByUser } = await supabaseAdmin
        .from('funnel_workspaces')
        .select('id, user_id, whatsapp_config, google_meet_url')
        .eq('user_id', userIdOrWorkspaceId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (wsByUser?.whatsapp_config?.instance_name) {
        return {
          ...wsByUser.whatsapp_config,
          google_meet_url: wsByUser.google_meet_url || wsByUser.whatsapp_config.google_meet_url,
        };
      }
    }

    // Default workspace fallback
    const { data: defaultWs } = await supabaseAdmin
      .from('funnel_workspaces')
      .select('id, user_id, whatsapp_config, google_meet_url')
      .not('whatsapp_config->>instance_name', 'is', null)
      .neq('whatsapp_config->>instance_name', '')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (defaultWs?.whatsapp_config?.instance_name) {
      return {
        ...defaultWs.whatsapp_config,
        google_meet_url: defaultWs.google_meet_url || defaultWs.whatsapp_config.google_meet_url,
      };
    }
  } catch (err: unknown) {
    console.error('[whatsappManager] Error loading user whatsapp config:', (err as Error).message);
  }
  return null;
}

export interface SendWhatsappParams {
  recipientPhone: string;
  messageText: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  instanceName?: string | null;
  apiUrl?: string | null;
  apiKey?: string | null;
  userId?: string | null;
}

export async function sendWhatsappMessage(params: SendWhatsappParams) {
  let {
    recipientPhone,
    messageText,
    mediaUrl,
    mediaType = 'image',
    instanceName,
    apiUrl = process.env.EVOLUTION_API_URL || 'https://evo.infispark.in',
    apiKey = process.env.EVOLUTION_APIKEY || 'vR39h6avY69g7kAU3YQbS6V6XEvudson',
    userId,
  } = params;

  if (!recipientPhone) {
    throw new Error('Recipient phone number is required.');
  }

  // Resolve instance name if missing
  if (!instanceName) {
    const userCfg = await getUserWhatsappConfig(userId);
    if (userCfg?.instance_name) {
      instanceName = userCfg.instance_name;
      if (userCfg.evolution_api_url) apiUrl = userCfg.evolution_api_url;
      if (userCfg.evolution_apikey) apiKey = userCfg.evolution_apikey;
    }
  }

  if (!instanceName) {
    instanceName = 'mudassir';
  }

  const formattedNumber = formatWhatsappNumber(recipientPhone);
  const baseUrl = (apiUrl || 'https://evo.infispark.in').replace(/\/$/, '');

  // 1. Text Message
  if (mediaType === 'text' || !mediaUrl) {
    const endpoint = `${baseUrl}/message/sendText/${encodeURIComponent(instanceName)}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: apiKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: formattedNumber,
        text: messageText,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `Evolution API sendText failed (HTTP ${res.status})`);
    }

    return {
      success: true,
      type: 'text',
      instanceName,
      recipientNumber: formattedNumber,
      response: data,
    };
  }

  // 2. Media Message (Image / Video / Document)
  const isVideo = mediaType === 'video' || (typeof mediaUrl === 'string' && mediaUrl.endsWith('.mp4'));
  const actualMediaType = isVideo ? 'video' : 'image';
  const mimetype = isVideo ? 'video/mp4' : 'image/png';
  const fileName = `attachment.${isVideo ? 'mp4' : 'png'}`;

  const endpoint = `${baseUrl}/message/sendMedia/${encodeURIComponent(instanceName)}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: apiKey || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: formattedNumber,
      mediatype: actualMediaType,
      mimetype: mimetype,
      caption: messageText,
      media: mediaUrl,
      fileName: fileName,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Evolution API sendMedia failed (HTTP ${res.status})`);
  }

  return {
    success: true,
    type: actualMediaType,
    instanceName,
    recipientNumber: formattedNumber,
    response: data,
  };
}

export async function logWhatsappToDatabase(params: {
  phone: string;
  name?: string | null;
  email?: string | null;
  message: string;
  mediaUrl?: string | null;
  triggerType?: string | null;
  instanceName?: string | null;
  responsePayload?: unknown;
  status?: string;
  userId?: string | null;
}) {
  try {
    const formattedPhone = formatWhatsappNumber(params.phone);
    const nowIso = new Date().toISOString();
    const logItem = {
      id: `wa_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: nowIso,
      trigger_step: params.triggerType || 'direct_message',
      recipient_phone: formattedPhone,
      recipient_name: params.name || 'Lead',
      message: params.message,
      media_url: params.mediaUrl || null,
      instance_name: params.instanceName || 'instance',
      status: params.status || 'sent',
    };

    // Global log table
    await supabaseAdmin.from('whatsapp_message_logs').insert([
      {
        user_id: params.userId || null,
        recipient_phone: formattedPhone,
        recipient_name: params.name || 'Lead',
        trigger_type: params.triggerType || 'direct_message',
        message_text: params.message,
        media_url: params.mediaUrl || null,
        status: params.status || 'sent',
        instance_name: params.instanceName || 'instance',
        response_payload: params.responsePayload,
        created_at: nowIso,
      },
    ]);

    // Append to lead's whatsapp_logs
    if (params.phone || params.email) {
      let query = supabaseAdmin.from('leads').select('id, whatsapp_logs');
      if (params.email) {
        query = query.eq('email', params.email);
      } else if (params.phone) {
        query = query.ilike('phone', `%${formattedPhone.slice(-10)}%`);
      }

      const { data: matchedLeads } = await query.limit(1);
      if (matchedLeads && matchedLeads.length > 0) {
        const leadRow = matchedLeads[0];
        const existingLogs = Array.isArray(leadRow.whatsapp_logs) ? leadRow.whatsapp_logs : [];
        await supabaseAdmin
          .from('leads')
          .update({ whatsapp_logs: [logItem, ...existingLogs] })
          .eq('id', leadRow.id);
      }
    }

    return logItem;
  } catch (err: unknown) {
    console.error('[whatsappManager] Logging Error:', (err as Error).message);
    return null;
  }
}

// In-memory deduplication cache
const dispatchCooldownMap = new Map<string, number>();

function isDuplicateDispatch(stepKey: string, phone: string): boolean {
  const clean = formatWhatsappNumber(phone);
  if (!clean) return false;
  const key = `${stepKey}_${clean}`;
  const now = Date.now();
  const lastTime = dispatchCooldownMap.get(key);
  if (lastTime && now - lastTime < 25000) {
    return true;
  }
  dispatchCooldownMap.set(key, now);
  return false;
}

export async function handleStepTrigger(
  stepKey: string,
  leadData: Record<string, any>,
  customConfig?: any
) {
  if (!leadData || !leadData.phone) {
    return { success: false, error: 'Recipient phone number is required.' };
  }

  if (isDuplicateDispatch(stepKey, leadData.phone)) {
    return { success: true, deduplicated: true };
  }

  let config = customConfig;
  if (!config) {
    const userCfg = await getUserWhatsappConfig(
      leadData.workspace_id || leadData.funnel_id || leadData.user_id
    );
    if (userCfg) config = userCfg;
  }

  const stepConfig = config && config[stepKey];
  if (stepConfig && stepConfig.enabled === false) {
    return { success: true, skipped: true };
  }

  const messageText = parseWhatsappTemplate(
    stepConfig ? stepConfig.message : 'Hello {{name}}, thank you for reaching out!',
    leadData
  );

  const mediaType = (stepConfig && stepConfig.msg_type) || 'text';
  const mediaUrl = stepConfig && mediaType !== 'text' ? stepConfig.media_url : null;
  const instanceName = (config && config.instance_name) || leadData.instance_name;

  const result = await sendWhatsappMessage({
    recipientPhone: leadData.phone,
    messageText,
    mediaUrl,
    mediaType,
    instanceName,
    userId: leadData.workspace_id || leadData.user_id,
  });

  await logWhatsappToDatabase({
    phone: leadData.phone,
    name: leadData.name || leadData.full_name,
    email: leadData.email,
    message: messageText,
    mediaUrl,
    triggerType: stepKey,
    instanceName: result.instanceName,
    responsePayload: result.response,
    status: 'sent',
    userId: leadData.user_id,
  });

  return { success: true, result };
}

export const MONTHLY_MAX_LIMIT = 10000;

export async function getUserMonthlyQuota(userId?: string | null) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const nextMonth = new Date(year, now.getMonth() + 1, 1);
  const resetDate = nextMonth.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const startOfMonth = new Date(year, now.getMonth(), 1).toISOString();

  try {
    let query = supabaseAdmin
      .from('scheduled_whatsapp_tasks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    if (userId && userId !== 'all' && userId !== 'default_user') {
      query = query.eq('user_id', userId);
    }

    const { count } = await query;
    const used = typeof count === 'number' ? count : 0;
    return {
      used,
      maxLimit: MONTHLY_MAX_LIMIT,
      remaining: Math.max(0, MONTHLY_MAX_LIMIT - used),
      resetDate,
      monthKey: `${year}-${month}`,
    };
  } catch (err: unknown) {
    return {
      used: 0,
      maxLimit: MONTHLY_MAX_LIMIT,
      remaining: MONTHLY_MAX_LIMIT,
      resetDate,
      monthKey: `${year}-${month}`,
    };
  }
}
