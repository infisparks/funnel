import { NextResponse } from 'next/server';
import { syncLeadAutomations } from '@/lib/syncLeadAutomations';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId, leadId, previousStageId, newStageId } = body;

    if (!organizationId || !leadId || !newStageId) {
      return NextResponse.json(
        { error: 'Missing required parameters: organizationId, leadId, newStageId' },
        { status: 400 }
      );
    }

    const result = await syncLeadAutomations({
      organizationId,
      leadId,
      previousStageId,
      newStageId,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('[API /api/automations/sync-lead] Error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Internal error' }, { status: 500 });
  }
}
