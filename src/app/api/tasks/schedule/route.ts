import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getUserMonthlyQuota, getUserWhatsappConfig, MONTHLY_MAX_LIMIT } from '@/lib/whatsappManager';
import { enqueueScheduledTask } from '@/lib/queue';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId = 'default_user',
      recipientPhone,
      recipientName = 'Valued Client',
      messageText,
      mediaUrl,
      mediaType,
      scheduleTime,
      campaignName = 'Date-Time Broadcast',
    } = body;

    if (!recipientPhone || !messageText || !scheduleTime) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: recipientPhone, messageText, scheduleTime',
        },
        { status: 400 }
      );
    }

    // Check Monthly Quota
    const quota = await getUserMonthlyQuota(userId);
    if (quota.used >= MONTHLY_MAX_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `Monthly quota exceeded (10,000 tasks/month). Quota resets on ${quota.resetDate}.`,
          quota,
        },
        { status: 429 }
      );
    }

    let scheduleDate: Date;
    if (typeof scheduleTime === 'number') {
      scheduleDate = new Date(scheduleTime);
    } else if (typeof scheduleTime === 'string') {
      const trimmed = scheduleTime.trim();
      if (trimmed.endsWith('Z') || trimmed.includes('+') || trimmed.split('-').length > 3) {
        scheduleDate = new Date(trimmed);
      } else {
        // Interpret input datetime from Indian Standard Time (IST +05:30)
        scheduleDate = new Date(`${trimmed}:00+05:30`);
        if (isNaN(scheduleDate.getTime())) {
          scheduleDate = new Date(`${trimmed}+05:30`);
        }
        if (isNaN(scheduleDate.getTime())) {
          scheduleDate = new Date(trimmed);
        }
      }
    } else {
      scheduleDate = new Date(scheduleTime);
    }

    const scheduleTimeSeconds = Math.floor(scheduleDate.getTime() / 1000);
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (isNaN(scheduleTimeSeconds) || scheduleTimeSeconds < nowSeconds) {
      return NextResponse.json(
        {
          success: false,
          error: `Scheduled time (${scheduleDate.toISOString()}) must be in the future. Current server time: ${new Date().toISOString()}`,
        },
        { status: 400 }
      );
    }

    // Resolve instance name
    const userCfg = await getUserWhatsappConfig(userId);
    const resolvedInstance = userCfg?.instance_name || '';

    const appPublicUrl =
      process.env.APP_PUBLIC_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'https://funnel.infiplus.in';
    const webhookUrl = `${appPublicUrl.replace(/\/$/, '')}/api/whatsapp/execute-task`;

    const payload = {
      userId,
      instanceName: resolvedInstance,
      recipientPhone,
      recipientName,
      messageText,
      mediaUrl,
      mediaType,
      campaignName,
      scheduledAt: scheduleDate.toISOString(),
    };

    // Schedule task in GCP queue
    const queueRes = await enqueueScheduledTask({
      url: webhookUrl,
      payload,
      scheduleTimeSeconds,
    });

    const gcpTaskId = queueRes.taskId;
    const gcpTaskName = queueRes.externalTaskId;

    // Record in Supabase
    const taskRecord = {
      user_id: userId,
      recipient_phone: recipientPhone,
      recipient_name: recipientName,
      message_text: messageText,
      media_url: mediaUrl || null,
      media_type: mediaType || null,
      scheduled_at: scheduleDate.toISOString(),
      status: 'scheduled',
      gcp_task_id: gcpTaskId,
      gcp_task_name: gcpTaskName || gcpTaskId,
      created_at: new Date().toISOString(),
    };

    await supabaseAdmin.from('scheduled_whatsapp_tasks').insert([taskRecord]);

    return NextResponse.json({
      success: true,
      message: 'WhatsApp Broadcast scheduled directly in Google Cloud Tasks Queue! 🕒',
      taskId: gcpTaskId,
      gcpTaskName,
      scheduledAt: scheduleDate.toISOString(),
      quota: {
        used: quota.used + 1,
        maxLimit: MONTHLY_MAX_LIMIT,
        remaining: Math.max(0, quota.remaining - 1),
        resetDate: quota.resetDate,
      },
    });
  } catch (err: unknown) {
    console.error('[API /api/tasks/schedule Error]:', (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
