import { NextResponse } from 'next/server';
import { captureLead } from '@/lib/landingManager';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lead = await captureLead(body);
    return NextResponse.json({ success: true, lead_id: lead?.id, lead });
  } catch (err: unknown) {
    console.error('[API /api/landing/lead Error]:', (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 400 });
  }
}
