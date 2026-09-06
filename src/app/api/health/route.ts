import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Next.js Unified Backend API & Automation Service',
    timestamp: new Date().toISOString(),
  });
}
