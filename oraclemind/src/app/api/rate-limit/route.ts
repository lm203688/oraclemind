import { NextRequest, NextResponse } from 'next/server';
import { getFreeCount, getClientIP } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') || 'anonymous';
  const ip = getClientIP(request);

  try {
    const count = await getFreeCount(ip, userId);
    return NextResponse.json({ success: true, data: count });
  } catch (err) {
    console.error('[Rate Limit API]', err);
    return NextResponse.json({ success: true, data: { used: 0, total: 3 } });
  }
}
