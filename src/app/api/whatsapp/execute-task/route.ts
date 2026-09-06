import { NextResponse } from 'next/server';
import { sendWhatsappMessage, logWhatsappToDatabase } from '@/lib/whatsappManager';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientPhone,
      recipientName,
      messageText,
      mediaUrl,
      mediaType,
      gcpTaskId,
      userId,
      instanceName,
    } = body;

    console.log(`[GCP Webhook Task] Processing WhatsApp broadcast for ${recipientPhone}...`);

    let sendSuccess = true;
    let sendResponse: unknown = null;
    let usedInstance = instanceName || 'gcp_queue';
    let errorMsg: string | null = null;

    try {
      const result = await sendWhatsappMessage({
        recipientPhone,
        messageText,
        mediaUrl,
        mediaType,
        userId,
        instanceName,
      });
      sendResponse = result.response;
      usedInstance = result.instanceName || usedInstance;
      console.log(`[GCP Webhook] Dispatch success to ${recipientPhone} via instance "${usedInstance}"`);
    } catch (sendErr: unknown) {
      console.error('[GCP Webhook] Dispatch Error:', (sendErr as Error).message);
      sendSuccess = false;
      errorMsg = (sendErr as Error).message;
    }

    // Update scheduled task in database
    if (gcpTaskId) {
      try {
        await supabaseAdmin
          .from('scheduled_whatsapp_tasks')
          .update({ status: sendSuccess ? 'completed' : 'failed' })
          .eq('gcp_task_id', gcpTaskId);
      } catch (dbErr) {
        console.error('Error updating scheduled_whatsapp_tasks:', dbErr);
      }
    }

    // Log message
    try {
      await logWhatsappToDatabase({
        phone: recipientPhone,
        name: recipientName || 'Lead',
        message: messageText,
        mediaUrl: mediaUrl || null,
        triggerType: 'gcp_scheduled_broadcast',
        instanceName: usedInstance,
        responsePayload: sendResponse || { error: errorMsg },
        status: sendSuccess ? 'sent' : 'failed',
        userId,
      });
    } catch (dbLogErr) {
      console.error('Error logging to DB:', dbLogErr);
    }

    return NextResponse.json({
      success: sendSuccess,
      message: sendSuccess
        ? `WhatsApp dispatched successfully via GCP Cloud Tasks trigger using instance "${usedInstance}".`
        : `Failed to send WhatsApp via Evolution API: ${errorMsg}`,
      recipientPhone,
      instanceName: usedInstance,
    });
  } catch (err: unknown) {
    console.error('[GCP Webhook] Fatal Error:', (err as Error).message);
    return NextResponse.json({ error: (err as Error).message || 'Webhook processing failed' }, { status: 500 });
  }
}
