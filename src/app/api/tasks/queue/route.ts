import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getUserMonthlyQuota } from '@/lib/whatsappManager';
import { CloudTasksClient } from '@google-cloud/tasks';

export const runtime = 'nodejs';

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'firstoption-8da25';
const GCP_LOCATION = process.env.GCP_LOCATION || 'asia-south1';
const GCP_QUEUE_NAME = process.env.GCP_QUEUE_NAME || 'whatsapp-automation-queue';

function getCloudTasksClient() {
  const raw = process.env.GCP_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    const creds = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (creds.private_key) {
      creds.private_key = creds.private_key.replace(/\\n/g, '\n');
    }
    const client = new CloudTasksClient({
      projectId: GCP_PROJECT_ID,
      credentials: {
        client_email: creds.client_email,
        private_key: creds.private_key,
      },
    });
    const queuePath = client.queuePath(GCP_PROJECT_ID, GCP_LOCATION, GCP_QUEUE_NAME);
    return { client, queuePath };
  } catch (e: unknown) {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get('userId') || req.headers.get('x-user-id') || null;
    const quota = await getUserMonthlyQuota(queryUserId);

    let gcpLiveTasks: any[] = [];
    let gcpError: string | null = null;

    const gcp = getCloudTasksClient();
    if (gcp?.client && gcp.queuePath) {
      try {
        const [tasks] = await gcp.client.listTasks({
          parent: gcp.queuePath,
          responseView: 'FULL',
        });

        if (tasks && tasks.length > 0) {
          gcpLiveTasks = tasks.map((t) => {
            let parsedBody: Record<string, any> = {};
            if (t.httpRequest?.body) {
              try {
                const rawBody = Buffer.isBuffer(t.httpRequest.body)
                  ? t.httpRequest.body.toString('utf8')
                  : Buffer.from(t.httpRequest.body as string, 'base64').toString('utf8');
                parsedBody = JSON.parse(rawBody);
              } catch (e) {
                try {
                  parsedBody = JSON.parse(t.httpRequest.body.toString());
                } catch (e2) {}
              }
            }

            const schedSec =
              t.scheduleTime && t.scheduleTime.seconds
                ? Number(t.scheduleTime.seconds)
                : Math.floor(Date.now() / 1000);
            const schedDate = new Date(schedSec * 1000).toISOString();
            const taskId = t.name ? t.name.split('/').pop() : 'gcp_task';

            return {
              id: taskId,
              gcp_task_id: taskId,
              gcp_task_name: t.name,
              user_id: parsedBody.userId || null,
              recipient_phone: parsedBody.recipientPhone || 'N/A',
              recipient_name: parsedBody.recipientName || 'Recipient',
              message_text: parsedBody.messageText || 'Scheduled WhatsApp Broadcast',
              media_url: parsedBody.mediaUrl || null,
              media_type: parsedBody.mediaType || null,
              scheduled_at: parsedBody.scheduledAt || schedDate,
              status: 'scheduled',
              source: 'GCP_LIVE_QUEUE',
              created_at:
                t.createTime && t.createTime.seconds
                  ? new Date(Number(t.createTime.seconds) * 1000).toISOString()
                  : new Date().toISOString(),
            };
          });

          if (queryUserId && queryUserId !== 'all' && queryUserId !== 'default_user') {
            gcpLiveTasks = gcpLiveTasks.filter((t) => t.user_id === queryUserId);
          }
        }
      } catch (err: unknown) {
        console.error('[GCP ListTasks Error]:', (err as Error).message);
        gcpError = (err as Error).message;
      }
    }

    // Fetch history from Supabase
    let dbTasks: any[] = [];
    try {
      let dbQuery = supabaseAdmin
        .from('scheduled_whatsapp_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (queryUserId && queryUserId !== 'all' && queryUserId !== 'default_user') {
        dbQuery = dbQuery.eq('user_id', queryUserId);
      }

      const { data: dbData } = await dbQuery;
      if (dbData) dbTasks = dbData;
    } catch (err: unknown) {
      console.error('Error querying scheduled_whatsapp_tasks:', (err as Error).message);
    }

    const liveTaskNames = new Set(gcpLiveTasks.map((t) => t.gcp_task_name || t.id));
    const historyTasks = dbTasks
      .filter(
        (d) =>
          !liveTaskNames.has(d.gcp_task_name) &&
          !liveTaskNames.has(d.gcp_task_id) &&
          !liveTaskNames.has(d.id)
      )
      .map((d) => ({
        id: d.id || d.gcp_task_id,
        gcp_task_id: d.gcp_task_id,
        gcp_task_name: d.gcp_task_name,
        user_id: d.user_id,
        recipient_phone: d.recipient_phone,
        recipient_name: d.recipient_name,
        message_text: d.message_text,
        media_url: d.media_url,
        media_type: d.media_type,
        scheduled_at: d.scheduled_at,
        status: d.status || 'completed',
        source: 'DATABASE_HISTORY',
        created_at: d.created_at,
      }));

    const allTasks = [...gcpLiveTasks, ...historyTasks];
    const scheduled = allTasks
      .filter((t) => t.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    const finished = allTasks
      .filter((t) => t.status !== 'scheduled')
      .sort(
        (a, b) =>
          new Date(b.scheduled_at || b.created_at).getTime() -
          new Date(a.scheduled_at || a.created_at).getTime()
      );

    const finalTasks = [...scheduled, ...finished].slice(0, 20);

    return NextResponse.json({
      success: true,
      queue: {
        name: GCP_QUEUE_NAME,
        location: GCP_LOCATION,
        projectId: GCP_PROJECT_ID,
        status: gcp?.client ? 'ACTIVE_LIVE_GCP' : 'STANDBY',
        liveCount: gcpLiveTasks.length,
      },
      quota,
      totalScheduled: scheduled.length,
      tasks: finalTasks,
      gcpError,
    });
  } catch (err: unknown) {
    console.error('[API /api/tasks/queue Error]:', (err as Error).message);
    return NextResponse.json({ error: (err as Error).message || 'Failed to fetch queue' }, { status: 500 });
  }
}
