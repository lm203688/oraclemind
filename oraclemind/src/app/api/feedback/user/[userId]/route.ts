import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

interface PredictionResponse {
  id: string;
  question: string;
  prediction: string;
  predictionDate: string;
  verificationDate: string | null;
  result: string;
  category: string;
  tier: number;
}

interface UserPredictionsResponse {
  success: boolean;
  data: PredictionResponse[] | null;
  error?: string;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse<UserPredictionsResponse>> {
  try {
    const { userId } = await params;

    if (!userId || userId.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Invalid userId parameter.',
        },
        { status: 400 },
      );
    }

    // Optional status filter from query string
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const validStatuses = ['pending', 'confirmed', 'denied', 'partial', 'expired'];

    const whereClause: Record<string, unknown> = { userId };
    if (statusParam && validStatuses.includes(statusParam)) {
      whereClause.status = statusParam;
    }

    const predictions = await db.prediction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const data: PredictionResponse[] = predictions.map((p) => ({
      id: p.id,
      question: p.question,
      prediction: p.answer,
      predictionDate: p.createdAt.toISOString(),
      verificationDate: p.verifiedAt?.toISOString() ?? null,
      result: p.status,
      category: p.category,
      tier: p.tier,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: `Failed to retrieve predictions: ${message}`,
      },
      { status: 500 },
    );
  }
}
