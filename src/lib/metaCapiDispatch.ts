import { supabase } from './supabaseClient';

export interface MetaCapiConfig {
  meta_capi_enabled: boolean;
  meta_pixel_id: string;
  meta_access_token: string;
  step1_event: boolean;
  step2_event: boolean;
  step3_event: boolean;
}

export const DEFAULT_META_CONFIG: MetaCapiConfig = {
  meta_capi_enabled: false,
  meta_pixel_id: '',
  meta_access_token: '',
  step1_event: true,
  step2_event: true,
  step3_event: true,
};

/**
 * SHA-256 Hashing helper required by Meta CAPI standard for user_data
 */
async function sha256Hash(text: string): Promise<string> {
  const clean = text.trim().toLowerCase();
  if (!clean) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(clean);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    return clean;
  }
}

/**
 * Log dispatch results into Supabase dispatch_logs table
 */
export async function logDispatchEvent(logEntry: {
  workspace_id?: string;
  lead_id?: string;
  lead_name?: string;
  lead_phone?: string;
  trigger_type: 'whatsapp' | 'meta_capi';
  funnel_step: string;
  status: 'success' | 'failed' | 'ignored';
  request_payload?: any;
  response_payload?: any;
  error_message?: string;
}) {
  try {
    await supabase.from('dispatch_logs').insert([
      {
        ...logEntry,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error('Error recording dispatch log:', err);
  }
}

/**
 * Dispatch Meta Conversions API (CAPI) event
 */
export async function dispatchMetaCapiEvent(
  stepKey: 'step1' | 'step2' | 'step3',
  lead: { name?: string; phone?: string; email?: string; google_meet_url?: string; leadId?: string },
  customMetaConfig?: MetaCapiConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    let config: MetaCapiConfig = customMetaConfig || DEFAULT_META_CONFIG;

    if (!customMetaConfig) {
      const { data: ws } = await supabase
        .from('funnel_workspaces')
        .select('meta_config')
        .limit(1)
        .maybeSingle();

      if (ws?.meta_config) {
        config = { ...DEFAULT_META_CONFIG, ...ws.meta_config };
      }
    }

    if (!config.meta_capi_enabled || !config.meta_pixel_id || !config.meta_access_token) {
      await logDispatchEvent({
        lead_id: lead.leadId,
        lead_name: lead.name,
        lead_phone: lead.phone,
        trigger_type: 'meta_capi',
        funnel_step: stepKey,
        status: 'ignored',
        error_message: 'Meta CAPI is disabled or credentials missing.',
      });
      return { success: true };
    }

    const stepEnabled =
      stepKey === 'step1'
        ? config.step1_event
        : stepKey === 'step2'
        ? config.step2_event
        : config.step3_event;

    if (!stepEnabled) {
      await logDispatchEvent({
        lead_id: lead.leadId,
        lead_name: lead.name,
        lead_phone: lead.phone,
        trigger_type: 'meta_capi',
        funnel_step: stepKey,
        status: 'ignored',
        error_message: `Meta CAPI event for ${stepKey} is disabled.`,
      });
      return { success: true };
    }

    // Meta Standard Event Name mapping
    const eventName =
      stepKey === 'step1' ? 'Lead' : stepKey === 'step2' ? 'SubmitApplication' : 'Schedule';

    // Hash user data
    const hashedPhone = lead.phone ? await sha256Hash(lead.phone) : '';
    const hashedEmail = lead.email ? await sha256Hash(lead.email) : '';
    const hashedFirstName = lead.name ? await sha256Hash(lead.name.split(' ')[0]) : '';

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: {
            ph: hashedPhone ? [hashedPhone] : [],
            em: hashedEmail ? [hashedEmail] : [],
            fn: hashedFirstName ? [hashedFirstName] : [],
          },
          custom_data: {
            lead_name: lead.name || '',
            funnel_step: stepKey,
            meeting_url: lead.google_meet_url || '',
          },
        },
      ],
    };

    const pixelId = config.meta_pixel_id.trim();
    const accessToken = config.meta_access_token.trim();
    const targetUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();

    if (response.ok && !resData.error) {
      await logDispatchEvent({
        lead_id: lead.leadId,
        lead_name: lead.name,
        lead_phone: lead.phone,
        trigger_type: 'meta_capi',
        funnel_step: stepKey,
        status: 'success',
        request_payload: payload,
        response_payload: resData,
      });
      return { success: true };
    } else {
      const errorMsg = resData.error?.message || 'Meta CAPI dispatch failed';
      await logDispatchEvent({
        lead_id: lead.leadId,
        lead_name: lead.name,
        lead_phone: lead.phone,
        trigger_type: 'meta_capi',
        funnel_step: stepKey,
        status: 'failed',
        request_payload: payload,
        response_payload: resData,
        error_message: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    const errText = err.message || 'Unknown Meta CAPI error';
    await logDispatchEvent({
      lead_id: lead.leadId,
      lead_name: lead.name,
      lead_phone: lead.phone,
      trigger_type: 'meta_capi',
      funnel_step: stepKey,
      status: 'failed',
      error_message: errText,
    });
    return { success: false, error: errText };
  }
}
