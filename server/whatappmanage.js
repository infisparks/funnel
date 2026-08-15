/**
 * Production Server-Side WhatsApp Management Module (whatappmanage.js)
 * Instance is 100% dynamically fetched per user/workspace from Supabase.
 *
 * Handles:
 * 1. Dynamic User WhatsApp Instance Resolution from Supabase `funnel_workspaces.whatsapp_config`
 * 2. Evolution API text & media dispatch (Image, Video, Document)
 * 3. Phone number formatting & cleaning (adding country code if needed)
 * 4. Dynamic template variable substitution ({{name}}, {{meeting_url}})
 * 5. Automatic logging into Supabase `whatsapp_message_logs` table
 * 6. Automatic updating of `leads.whatsapp_logs` JSONB array per lead
 */

const https = require('https');
const http = require('http');

/**
 * Format phone number to Evolution API format (e.g. 919958399157)
 */
function formatWhatsappNumber(phone) {
  if (!phone) return '';
  let clean = phone.toString().replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  return clean;
}

/**
 * Substitute variables in template string
 */
function parseWhatsappTemplate(template, data = {}, defaultMeetUrl = 'https://meet.google.com/qbi-erbq-moy') {
  if (!template) return '';
  const name = data.name || data.recipient_name || 'Friend';
  const meetUrl = data.google_meet_url || data.meeting_url || defaultMeetUrl;

  return template
    .replace(/\{\{\s*name\s*\}\}/gi, name)
    .replace(/\{\{\s*meeting_url\s*\}\}/gi, meetUrl);
}

/**
 * Dynamically fetch user's WhatsApp config and instance name from Supabase
 */
async function getUserWhatsappConfig(userIdOrWorkspaceId, supabase) {
  if (!supabase) return null;
  try {
    if (userIdOrWorkspaceId && userIdOrWorkspaceId !== 'default_user' && userIdOrWorkspaceId !== 'lead_drawer') {
      const { data } = await supabase
        .from('funnel_workspaces')
        .select('id, user_id, whatsapp_config, google_meet_url')
        .or(`id.eq.${userIdOrWorkspaceId},user_id.eq.${userIdOrWorkspaceId}`)
        .limit(1)
        .maybeSingle();

      if (data && data.whatsapp_config && data.whatsapp_config.instance_name) {
        return {
          ...data.whatsapp_config,
          google_meet_url: data.google_meet_url || data.whatsapp_config.google_meet_url,
        };
      }
    }

    // Default workspace fallback
    const { data: defaultWs } = await supabase
      .from('funnel_workspaces')
      .select('id, user_id, whatsapp_config, google_meet_url')
      .limit(1)
      .maybeSingle();

    if (defaultWs && defaultWs.whatsapp_config) {
      return {
        ...defaultWs.whatsapp_config,
        google_meet_url: defaultWs.google_meet_url || defaultWs.whatsapp_config.google_meet_url,
      };
    }
  } catch (err) {
    console.error('[whatappmanage.js] Error loading user whatsapp config:', err.message);
  }
  return null;
}

/**
 * Perform HTTP/HTTPS POST request
 */
function postJson(urlStr, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const dataStr = JSON.stringify(bodyObj);

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataStr),
          ...headers,
        },
      };

      const req = client.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            const parsed = responseBody ? JSON.parse(responseBody) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ ok: true, status: res.statusCode, data: parsed });
            } else {
              resolve({ ok: false, status: res.statusCode, error: parsed.message || parsed.error || responseBody });
            }
          } catch (e) {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: responseBody });
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.write(dataStr);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Dispatch message via Evolution API using dynamically resolved instance
 */
async function sendWhatsappMessage(params, supabase) {
  let {
    recipientPhone,
    messageText,
    mediaUrl,
    mediaType = 'image', // 'image' | 'video' | 'document'
    instanceName,
    apiUrl = process.env.EVOLUTION_API_URL || 'https://evo.infispark.in',
    apiKey = process.env.EVOLUTION_APIKEY || 'vR39h6avY69g7kAU3YQbS6V6XEvudson',
    userId,
  } = params;

  if (!recipientPhone) {
    throw new Error('Recipient phone number is required.');
  }

  // Dynamically resolve instance name from Supabase if not provided
  if (!instanceName && supabase) {
    const userCfg = await getUserWhatsappConfig(userId, supabase);
    if (userCfg && userCfg.instance_name) {
      instanceName = userCfg.instance_name;
      if (userCfg.evolution_api_url) apiUrl = userCfg.evolution_api_url;
      if (userCfg.evolution_apikey) apiKey = userCfg.evolution_apikey;
    }
  }

  if (!instanceName) {
    throw new Error('No WhatsApp sender instance specified or found in Supabase for this user.');
  }

  const formattedNumber = formatWhatsappNumber(recipientPhone);
  const baseUrl = apiUrl.replace(/\/$/, '');

  // 1. Text message
  if (!mediaUrl) {
    const endpoint = `${baseUrl}/message/sendText/${encodeURIComponent(instanceName)}`;
    const result = await postJson(
      endpoint,
      { apikey: apiKey },
      {
        number: formattedNumber,
        text: messageText,
      }
    );

    if (!result.ok) {
      throw new Error(result.error || `Evolution API sendText failed on instance "${instanceName}" (HTTP ${result.status})`);
    }

    return {
      success: true,
      type: 'text',
      instanceName,
      recipientNumber: formattedNumber,
      response: result.data,
    };
  }

  // 2. Media message (Image / Video / Document)
  const isVideo = mediaType === 'video' || mediaUrl.endsWith('.mp4');
  const actualMediaType = isVideo ? 'video' : 'image';
  const mimetype = isVideo ? 'video/mp4' : 'image/png';
  const fileName = `attachment.${isVideo ? 'mp4' : 'png'}`;

  const endpoint = `${baseUrl}/message/sendMedia/${encodeURIComponent(instanceName)}`;
  const result = await postJson(
    endpoint,
    { apikey: apiKey },
    {
      number: formattedNumber,
      mediatype: actualMediaType,
      mimetype: mimetype,
      caption: messageText,
      media: mediaUrl,
      fileName: fileName,
    }
  );

  if (!result.ok) {
    throw new Error(result.error || `Evolution API sendMedia failed on instance "${instanceName}" (HTTP ${result.status})`);
  }

  return {
    success: true,
    type: actualMediaType,
    instanceName,
    recipientNumber: formattedNumber,
    response: result.data,
  };
}

/**
 * Log WhatsApp message into Supabase database (both global table and lead JSONB)
 */
async function logWhatsappToDatabase(params, supabase) {
  if (!supabase) return null;

  try {
    const {
      phone,
      name = 'Lead',
      email,
      message,
      mediaUrl = null,
      triggerType = 'direct_message',
      instanceName,
      responsePayload = null,
      status = 'sent',
    } = params;

    const formattedPhone = formatWhatsappNumber(phone);
    const logItem = {
      id: `wa_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      trigger_step: triggerType,
      recipient_phone: formattedPhone,
      recipient_name: name,
      message: message,
      media_url: mediaUrl,
      instance_name: instanceName || 'dynamic_user_instance',
      status: status,
    };

    // 1. Insert into global whatsapp_message_logs table
    await supabase.from('whatsapp_message_logs').insert([
      {
        recipient_phone: formattedPhone,
        recipient_name: name,
        trigger_type: triggerType,
        message_text: message,
        media_url: mediaUrl,
        status: status,
        instance_name: instanceName || 'dynamic_user_instance',
        response_payload: responsePayload,
        created_at: new Date().toISOString(),
      },
    ]);

    // 2. Append to specific lead's whatsapp_logs jsonb array
    if (phone || email) {
      let query = supabase.from('leads').select('id, whatsapp_logs');
      if (email) {
        query = query.eq('email', email);
      } else if (phone) {
        query = query.ilike('phone', `%${formattedPhone.slice(-10)}%`);
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

    return logItem;
  } catch (err) {
    console.error('[whatappmanage.js Logging Error]:', err.message);
    return null;
  }
}

/**
 * Handle Step Trigger (Step 1 Contact, Step 2 Survey, Step 3 Meeting)
 */
async function handleStepTrigger(stepKey, leadData, customConfig, supabase) {
  let config = customConfig;

  // If no custom config passed, fetch user's workspace config dynamically from Supabase
  if (!config && supabase) {
    const userCfg = await getUserWhatsappConfig(leadData.workspace_id || leadData.user_id, supabase);
    if (userCfg) {
      config = userCfg;
    }
  }

  const stepConfig = config && config[stepKey];
  if (stepConfig && stepConfig.enabled === false) {
    console.log(`[whatappmanage.js] Step ${stepKey} is disabled for user.`);
    return { success: true, skipped: true };
  }

  const messageText = parseWhatsappTemplate(
    stepConfig ? stepConfig.message : 'Hello {{name}}, thank you for reaching out!',
    leadData
  );

  const mediaUrl = stepConfig ? stepConfig.media_url : null;
  const mediaType = stepConfig ? stepConfig.msg_type : 'text';
  const instanceName = (config && config.instance_name) || (leadData && leadData.instance_name);
  const apiUrl = (config && config.evolution_api_url) || process.env.EVOLUTION_API_URL;
  const apiKey = (config && config.evolution_apikey) || process.env.EVOLUTION_APIKEY;

  // Send message using dynamically resolved instance
  const result = await sendWhatsappMessage(
    {
      recipientPhone: leadData.phone,
      messageText: messageText,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      instanceName: instanceName,
      apiUrl: apiUrl,
      apiKey: apiKey,
      userId: leadData.workspace_id || leadData.user_id,
    },
    supabase
  );

  // Log in database
  if (supabase) {
    await logWhatsappToDatabase(
      {
        phone: leadData.phone,
        name: leadData.name,
        email: leadData.email,
        message: messageText,
        mediaUrl: mediaUrl,
        triggerType: stepKey,
        instanceName: result.instanceName,
        responsePayload: result.response,
        status: 'sent',
      },
      supabase
    );
  }

  return {
    success: true,
    result,
  };
}

module.exports = {
  formatWhatsappNumber,
  parseWhatsappTemplate,
  getUserWhatsappConfig,
  sendWhatsappMessage,
  logWhatsappToDatabase,
  handleStepTrigger,
};
