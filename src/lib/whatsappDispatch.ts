import { supabase } from './supabaseClient';

export interface WhatsappLeadData {
  name?: string;
  phone?: string;
  email?: string;
  meeting_date?: string;
  meeting_time?: string;
  google_meet_url?: string;
}

export interface WhatsappStageConfig {
  enabled: boolean;
  msg_type: 'text' | 'image' | 'video';
  media_url?: string;
  message: string;
}

export interface WhatsappConfig {
  evolution_api_url: string;
  evolution_apikey: string;
  instance_name: string;
  step1: WhatsappStageConfig;
  step2: WhatsappStageConfig;
  step3: WhatsappStageConfig;
}

export const DEFAULT_WHATSAPP_CONFIG: WhatsappConfig = {
  evolution_api_url: 'https://evo.infispark.in',
  evolution_apikey: 'vR39h6avY69g7kAU3YQbS6V6XEvudson',
  instance_name: 'instance',
  step1: {
    enabled: true,
    msg_type: 'text',
    media_url: '',
    message: 'Hello {{name}}, welcome! Thank you for getting in touch with us.',
  },
  step2: {
    enabled: true,
    msg_type: 'text',
    media_url: '',
    message: 'Hi {{name}}, we received your survey details. Ready to scale your business?',
  },
  step3: {
    enabled: true,
    msg_type: 'video',
    media_url: 'https://avtshare01.rz.tu-ilmenau.de/avt-vqdb-uhd-1/test_1/segments/bigbuck_bunny_8bit_15000kbps_1080p_60.0fps_h264.mp4',
    message: '🎥 Hello {{name}}! Your strategy session is booked. Join Google Meet link here: {{meeting_url}}',
  },
};

/**
 * Format phone number to Evolution API string (e.g. 919958399157)
 */
export function formatWhatsappNumber(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  return clean;
}

/**
 * Parse variables {{name}} and {{meeting_url}}
 */
export function parseWhatsappTemplate(template: string, lead: WhatsappLeadData, defaultMeetUrl?: string): string {
  const name = lead.name || 'Friend';
  const meetUrl = lead.google_meet_url || defaultMeetUrl || 'https://meet.google.com/qbi-erbq-moy';

  return template
    .replace(/\{\{\s*name\s*\}\}/gi, name)
    .replace(/\{\{\s*meeting_url\s*\}\}/gi, meetUrl);
}

/**
 * Dispatch automatic WhatsApp trigger for a specific funnel step
 */
export async function dispatchWhatsappTrigger(
  stepKey: 'step1' | 'step2' | 'step3',
  lead: WhatsappLeadData,
  customConfig?: WhatsappConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!lead.phone) return { success: false, error: 'No phone number provided' };

    let config: WhatsappConfig = customConfig || DEFAULT_WHATSAPP_CONFIG;

    // Fetch workspace whatsapp_config if not passed explicitly
    if (!customConfig) {
      const { data: ws } = await supabase
        .from('funnel_workspaces')
        .select('whatsapp_config, google_meet_url')
        .limit(1)
        .maybeSingle();

      if (ws?.whatsapp_config) {
        config = { ...DEFAULT_WHATSAPP_CONFIG, ...ws.whatsapp_config };
      }
      if (ws?.google_meet_url && !lead.google_meet_url) {
        lead.google_meet_url = ws.google_meet_url;
      }
    }

    const stepConfig = config[stepKey];
    if (!stepConfig || !stepConfig.enabled) {
      console.log(`[WhatsApp Dispatch] Step ${stepKey} trigger is disabled.`);
      return { success: true };
    }

    const formattedNumber = formatWhatsappNumber(lead.phone);
    const parsedMessage = parseWhatsappTemplate(stepConfig.message, lead);
    const baseUrl = config.evolution_api_url.replace(/\/$/, '');
    const instance = config.instance_name || 'instance';

    if (stepConfig.msg_type === 'text' || !stepConfig.media_url) {
      // Send Text Message
      const targetUrl = `${baseUrl}/message/sendText/${encodeURIComponent(instance)}`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.evolution_apikey,
        },
        body: JSON.stringify({
          number: formattedNumber,
          text: parsedMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Evolution API Text send failed');
      }

      // Log to whatsapp_message_logs and update lead.whatsapp_logs
      await logWhatsappMessage({
        triggerKey: stepKey,
        phone: formattedNumber,
        name: lead.name,
        email: lead.email,
        message: parsedMessage,
        mediaUrl: undefined,
        instanceName: instance,
        responsePayload: data,
      });

      return { success: true };
    } else {
      // Send Media (Image / Video) Message
      const targetUrl = `${baseUrl}/message/sendMedia/${encodeURIComponent(instance)}`;
      const isVideo = stepConfig.msg_type === 'video';
      const ext = isVideo ? 'mp4' : 'png';
      const mimetype = isVideo ? 'video/mp4' : 'image/png';

      const payload = {
        number: formattedNumber,
        mediatype: stepConfig.msg_type,
        mimetype: mimetype,
        caption: parsedMessage,
        media: stepConfig.media_url,
        fileName: `media_attachment.${ext}`,
      };

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.evolution_apikey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Evolution API Media send failed');
      }

      // Log to whatsapp_message_logs and update lead.whatsapp_logs
      await logWhatsappMessage({
        triggerKey: stepKey,
        phone: formattedNumber,
        name: lead.name,
        email: lead.email,
        message: parsedMessage,
        mediaUrl: stepConfig.media_url,
        instanceName: instance,
        responsePayload: data,
      });

      return { success: true };
    }
  } catch (err: any) {
    console.error('[WhatsApp Dispatch Error]:', err);
    return { success: false, error: err.message || 'Dispatch failed' };
  }
}

/**
 * Helper to log sent WhatsApp message to both whatsapp_message_logs table and leads.whatsapp_logs JSONB column
 */
async function logWhatsappMessage(params: {
  triggerKey: string;
  phone: string;
  name?: string;
  email?: string;
  message: string;
  mediaUrl?: string;
  instanceName: string;
  responsePayload: any;
}) {
  try {
    const logItem = {
      id: `wa_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      trigger_step: params.triggerKey,
      recipient_phone: params.phone,
      recipient_name: params.name || 'Lead',
      message: params.message,
      media_url: params.mediaUrl || null,
      instance_name: params.instanceName,
      status: 'sent',
    };

    // 1. Insert into global whatsapp_message_logs table
    await supabase.from('whatsapp_message_logs').insert([
      {
        recipient_phone: params.phone,
        recipient_name: params.name || 'Lead',
        trigger_type: params.triggerKey,
        message_text: params.message,
        media_url: params.mediaUrl || null,
        status: 'sent',
        instance_name: params.instanceName,
        response_payload: params.responsePayload,
        created_at: new Date().toISOString(),
      },
    ]);

    // 2. Append to specific lead's whatsapp_logs jsonb array if lead exists
    if (params.phone || params.email) {
      let query = supabase.from('leads').select('id, whatsapp_logs');
      if (params.email) {
        query = query.eq('email', params.email);
      } else if (params.phone) {
        query = query.ilike('phone', `%${params.phone.slice(-10)}%`);
      }

      const { data: matchedLeads } = await query.limit(1);
      if (matchedLeads && matchedLeads.length > 0) {
        const leadRow = matchedLeads[0];
        const existingLogs = Array.isArray(leadRow.whatsapp_logs) ? leadRow.whatsapp_logs : [];
        const updatedLogs = [logItem, ...existingLogs];

        await supabase
          .from('leads')
          .update({ whatsapp_logs: updatedLogs })
          .eq('id', leadRow.id);
      }
    }
  } catch (err) {
    console.error('Failed to log WhatsApp message to Supabase:', err);
  }
}

