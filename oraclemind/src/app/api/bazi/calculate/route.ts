import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi } from '@/lib/classical/bazi-foundation';

interface BaziCalculateRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
}

interface BaziCalculateResponse {
  success: boolean;
  data: {
    chart: any;
  } | null;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<BaziCalculateResponse>> {
  try {
    const body = await request.json() as BaziCalculateRequest;

    if (!body.year || !body.month || !body.day || body.hour === undefined) {
      return NextResponse.json(
        { success: false, data: null, error: 'Missing required fields: year, month, day, hour' },
        { status: 400 },
      );
    }

    const chart = calculateBazi(body.year, body.month, body.day, body.hour);

    return NextResponse.json({
      success: true,
      data: { chart },
    });
  } catch (err) {
    console.error('[Bazi Calculate API]', err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
