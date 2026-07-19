import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface SimulationFeedbackResponse {
  success: boolean;
  data: Array<{
    id: string;
    scenarioOutcomeId: string | null;
    result: string;
    comment: string | null;
    createdAt: string;
  }> | null;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> },
): Promise<NextResponse<SimulationFeedbackResponse>> {
  try {
    const { simulationId } = await params;
    const feedbacks = await db.verificationFeedback.findMany({
      where: { simulationId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: feedbacks.map(f => ({
        id: f.id,
        scenarioOutcomeId: f.scenarioOutcomeId,
        result: f.result,
        comment: f.comment,
        createdAt: f.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('[Simulation Feedback API]', err);
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
