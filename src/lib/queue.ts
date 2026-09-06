import { CloudTasksClient } from '@google-cloud/tasks';

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'firstoption-8da25';
const GCP_LOCATION = process.env.GCP_LOCATION || 'asia-south1';
const GCP_QUEUE_NAME = process.env.GCP_QUEUE_NAME || 'whatsapp-automation-queue';

interface GcpServiceAccountCredentials {
  client_email: string;
  private_key: string;
  [key: string]: unknown;
}

function parseGcpCredentials(): GcpServiceAccountCredentials | null {
  const raw = process.env.GCP_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    return parsed as GcpServiceAccountCredentials;
  } catch (err: unknown) {
    console.error('[queue.ts] Error parsing GCP_SERVICE_ACCOUNT_KEY:', (err as Error).message);
    return null;
  }
}

let client: CloudTasksClient | null = null;
let queuePath: string | null = null;

function getClient(): { client: CloudTasksClient | null; queuePath: string | null } {
  if (client && queuePath) {
    return { client, queuePath };
  }

  const creds = parseGcpCredentials();
  if (creds && GCP_PROJECT_ID && GCP_LOCATION && GCP_QUEUE_NAME) {
    try {
      client = new CloudTasksClient({
        projectId: GCP_PROJECT_ID,
        credentials: {
          client_email: creds.client_email,
          private_key: creds.private_key,
        },
      });
      queuePath = client.queuePath(GCP_PROJECT_ID, GCP_LOCATION, GCP_QUEUE_NAME);
      console.log(`[Google Cloud Tasks] Client initialized for queue: ${queuePath}`);
    } catch (err: unknown) {
      console.error('[Google Cloud Tasks] Initialization failed:', (err as Error).message);
      client = null;
      queuePath = null;
    }
  }

  return { client, queuePath };
}

export interface EnqueueTaskOptions {
  url: string;
  payload: Record<string, unknown>;
  scheduleTimeSeconds: number;
  headers?: Record<string, string>;
}

export interface EnqueueTaskResult {
  taskId: string;
  externalTaskId: string;
  isSimulated?: boolean;
}

/**
 * Schedule a task to fire at scheduleTimeSeconds in Google Cloud Tasks.
 */
export async function enqueueScheduledTask(
  options: EnqueueTaskOptions
): Promise<EnqueueTaskResult> {
  const { url, payload, scheduleTimeSeconds, headers = {} } = options;
  const { client: tasksClient, queuePath: qPath } = getClient();

  const webhookSecret = process.env.AUTOMATION_WEBHOOK_SECRET || 'secret_pipeline_auto_2026_xyz987';

  if (tasksClient && qPath) {
    try {
      const task = {
        httpRequest: {
          httpMethod: 'POST' as const,
          url,
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': webhookSecret,
            ...headers,
          },
          body: Buffer.from(JSON.stringify(payload)).toString('base64'),
        },
        scheduleTime: {
          seconds: scheduleTimeSeconds,
        },
      };

      const [createdTask] = await tasksClient.createTask({
        parent: qPath,
        task,
      });

      const externalTaskId = createdTask.name || '';
      const taskId = externalTaskId ? externalTaskId.split('/').pop() || externalTaskId : `task_${Date.now()}`;
      
      console.log(`[Google Cloud Tasks] Task scheduled in GCP queue: ${externalTaskId} for ${new Date(scheduleTimeSeconds * 1000).toISOString()}`);
      return { taskId, externalTaskId, isSimulated: false };
    } catch (err: unknown) {
      console.error('[Google Cloud Tasks] createTask error:', (err as Error).message);
    }
  }

  // Fallback simulator for development or if GCP queue unreachable
  const simulatedId = `sim_task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  console.warn(`[Google Cloud Tasks] Falling back to simulated task: ${simulatedId}`);
  return {
    taskId: simulatedId,
    externalTaskId: simulatedId,
    isSimulated: true,
  };
}

/**
 * Cancel / delete a pending scheduled task directly from Google Cloud Tasks queue.
 */
export async function cancelScheduledQueueTask(externalTaskId: string): Promise<boolean> {
  if (!externalTaskId) return false;
  const { client: tasksClient, queuePath: qPath } = getClient();

  // If simulated task, just return true
  if (externalTaskId.startsWith('sim_task_') || externalTaskId.startsWith('mock_')) {
    return true;
  }

  if (tasksClient) {
    try {
      const fullTaskName = externalTaskId.includes('/tasks/')
        ? externalTaskId
        : qPath
        ? `${qPath}/tasks/${externalTaskId}`
        : externalTaskId;

      await tasksClient.deleteTask({ name: fullTaskName });
      console.log(`[Google Cloud Tasks] Task deleted from queue: ${fullTaskName}`);
      return true;
    } catch (err: unknown) {
      const errorObj = err as { code?: number; message?: string };
      // Ignore 404 (NOT_FOUND) errors - task already executed or deleted
      if (errorObj.code === 5 || errorObj.message?.includes('NOT_FOUND') || errorObj.message?.includes('404')) {
        console.log(`[Google Cloud Tasks] Task ${externalTaskId} already removed from queue.`);
        return true;
      }
      console.error('[Google Cloud Tasks] deleteTask error:', errorObj.message || err);
      return false;
    }
  }

  return false;
}
