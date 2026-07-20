import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

interface StatsResponse {
  success: boolean;
  data: {
    totalPredictions: number;
    totalVerified: number;
    accuracy: number;
    categoryAccuracy: Record<string, number>;
    tierAccuracy: Record<number, number>;
    updatedAt: string;
  } | null;
  error?: string;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse<StatsResponse>> {
  try {
    const predictions = await db.prediction.findMany();

    const totalPredictions = predictions.length;
    const verified = predictions.filter(
      (p) => p.status !== 'pending' && p.status !== 'expired',
    );
    const confirmed = predictions.filter((p) => p.status === 'confirmed');
    const totalVerified = verified.length;
    const accuracy = totalVerified > 0 ? confirmed.length / totalVerified : 0;

    // Per-category accuracy
    const catMap: Record<string, { total: number; confirmed: number }> = {};
    for (const p of verified) {
      const cat = p.category || 'uncategorized';
      if (!catMap[cat]) catMap[cat] = { total: 0, confirmed: 0 };
      catMap[cat].total++;
      if (p.status === 'confirmed') catMap[cat].confirmed++;
    }
    const categoryAccuracy: Record<string, number> = {};
    for (const [cat, s] of Object.entries(catMap)) {
      categoryAccuracy[cat] = s.total > 0 ? s.confirmed / s.total : 0;
    }

    // Per-tier accuracy
    const tierMap: Record<number, { total: number; confirmed: number }> = {};
    for (const p of verified) {
      const tier = p.tier;
      if (!tierMap[tier]) tierMap[tier] = { total: 0, confirmed: 0 };
      tierMap[tier].total++;
      if (p.status === 'confirmed') tierMap[tier].confirmed++;
    }
    const tierAccuracy: Record<number, number> = {};
    for (const [tier, s] of Object.entries(tierMap)) {
      tierAccuracy[Number(tier)] = s.total > 0 ? s.confirmed / s.total : 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalPredictions,
        totalVerified,
        accuracy,
        categoryAccuracy,
        tierAccuracy,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: `Failed to retrieve stats: ${message}`,
      },
      { status: 500 },
    );
  }
}
