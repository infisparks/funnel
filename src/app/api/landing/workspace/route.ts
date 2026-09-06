import { NextResponse } from 'next/server';
import { extractSubdomain, resolveWorkspace } from '@/lib/landingManager';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const host = req.headers.get('host') || '';
    const targetSub = extractSubdomain(
      host,
      url.searchParams.get('subdomain'),
      url.searchParams.get('domain')
    );

    const ws = await resolveWorkspace(targetSub);
    return NextResponse.json({ success: true, workspace: ws });
  } catch (err: unknown) {
    console.error('[API /api/landing/workspace Error]:', (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
