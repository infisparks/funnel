import { NextResponse } from 'next/server';
import { handleStepTrigger, sendWhatsappMessage, logWhatsappToDatabase } from '@/lib/whatsappManager';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      stepKey,
      leadData,
      customConfig,
      phone,
      message,
      mediaUrl,
      mediaType,
      name,
      email,
      instanceName,
    } = body;

    // Case A: Step trigger (step1, step2, step3)
    if (stepKey && leadData) {
      try {
        const result = await handleStepTrigger(stepKey, leadData, customConfig);
        return NextResponse.json(result);
      } catch (err: unknown) {
        console.error('[WhatsApp Send Step Error]:', (err as Error).message);
        return NextResponse.json({ success: false, error: (err as Error).message });
      }
    }

    // Case B: Direct Message Send
    const targetPhone = phone || (leadData && leadData.phone);
    const targetMessage = message || (leadData && leadData.message);

    if (!targetPhone || !targetMessage) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone and message text are required.' },
        { status: 400 }
      );
    }

    const sendResult = await sendWhatsappMessage({
      recipientPhone: targetPhone,
      messageText: targetMessage,
      mediaUrl: mediaUrl || (leadData && leadData.media_url),
      mediaType: mediaType || 'text',
      instanceName: instanceName || (customConfig && customConfig.instance_name),
    });

    await logWhatsappToDatabase({
      phone: targetPhone,
      name: name || (leadData && leadData.name) || 'Lead',
      email: email || (leadData && leadData.email),
      message: targetMessage,
      mediaUrl: mediaUrl || (leadData && leadData.media_url),
      triggerType: 'direct_admin_message',
      instanceName: instanceName || 'instance',
      responsePayload: sendResult.response,
      status: 'sent',
    });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent & logged successfully!',
      sendResult,
    });
  } catch (err: unknown) {
    console.error('[Direct WhatsApp Send Error]:', (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
