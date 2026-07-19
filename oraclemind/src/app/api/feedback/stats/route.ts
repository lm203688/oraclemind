import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface FeedbackStatsResponse {
  success: boolean;
  data: {
    total: number;
    confirmed: number;
    partial: number;
    denied: number;
    accuracy: number;
    byCategory: Array<{
      category: string;
      total: number;
      confirmed: number;
      partial: number;
      denied: number;
      accuracy: number;
    }>;
  } | null;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<FeedbackStatsResponse>> {
  try {
    const allStats = await db.publicAccuracy.findMany();

    const total = allStats.reduce((s, c) => s + c.totalSimulations, 0);
    const confirmed = allStats.reduce((s, c) => s + c.confirmed, 0);
    const partial = allStats.reduce((s, c) => s + c.partial, 0);
    const denied = allStats.reduce((s, c) => s + c.denied, 0);
    const accuracy = total > 0 ? (confirmed + partial * 0.5) / total : 0;

    return NextResponse.json({
      success: true,
      data: {
        total,
        confirmed,
        partial,
        denied,
        accuracy,
        byCategory: allStats.map(c => ({
          category: c.category,
          total: c.totalSimulations,
          confirmed: c.confirmed,
          partial: c.partial,
          denied: c.denied,
          accuracy: c.accuracy,
        })),
      },
    });
  } catch (err) {
    console.error('[Feedback Stats API]', err);
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
