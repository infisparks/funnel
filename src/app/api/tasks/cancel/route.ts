import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cancelScheduledQueueTask } from '@/lib/queue';

export const runtime = 'nodejs';

async function handleCancel(req: Request) {
  try {
    const url = new URL(req.url);
    let taskId = url.searchParams.get('taskId');
    let gcpTaskName = url.searchParams.get('gcpTaskName');

    if (!taskId && req.method !== 'GET') {
      const body = await req.json().catch(() => ({}));
      taskId = body.taskId || body.id;
      gcpTaskName = body.gcpTaskName || body.taskName;
    }

    if (!taskId && !gcpTaskName) {
      const parts = url.pathname.split('/');
      taskId = parts[parts.length - 1];
    }

    if (!taskId && !gcpTaskName) {
      return NextResponse.json({ success: false, error: 'Task ID or Task Name is required.' }, { status: 400 });
    }

    const targetName = gcpTaskName || taskId || '';

    // Delete directly from Google Cloud Tasks
    await cancelScheduledQueueTask(targetName);

    // Update status in Supabase
    if (taskId || gcpTaskName) {
      const matchCondition = gcpTaskName
        ? `gcp_task_name.eq.${gcpTaskName},gcp_task_id.eq.${taskId},id.eq.${taskId}`
        : `gcp_task_id.eq.${taskId},id.eq.${taskId}`;

      await supabaseAdmin
        .from('scheduled_whatsapp_tasks')
        .update({ status: 'cancelled' })
        .or(matchCondition);
    }

    return NextResponse.json({
      success: true,
      message: 'Task cancelled and removed from queue.',
      taskId: taskId || gcpTaskName,
    });
  } catch (err: unknown) {
    console.error('[API /api/tasks/cancel Error]:', (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return handleCancel(req);
}

export async function DELETE(req: Request) {
  return handleCancel(req);
}
