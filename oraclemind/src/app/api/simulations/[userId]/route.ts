import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface SimulationsListResponse {
  success: boolean;
  data: Array<{
    id: string;
    type: string;
    seedInput: string;
    graphSnapshot: string | null;
    status: string;
    rounds: number;
    createdAt: string;
    completedAt: string | null;
    scenarioOutcomes: Array<{
      id: string;
      scenarioPath: string;
      probability: number;
      description: string;
    }>;
    feedbacks: Array<{
      id: string;
      result: string;
    }>;
  }> | null;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse<SimulationsListResponse>> {
  try {
    const { userId } = await params;

    const simulations = await db.simulation.findMany({
      where: { userId, status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 50, // 最近50条
      include: {
        scenarioOutcomes: {
          select: {
            id: true,
            scenarioPath: true,
            probability: true,
            description: true,
          },
        },
        feedbacks: {
          select: {
            id: true,
            result: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: simulations.map(s => {
        let seed: any = {};
        try { seed = JSON.parse(s.seedInput); } catch {}
        return {
          id: s.id,
          type: s.type,
          seedInput: seed.question ?? seed.eventDescription ?? '未知问题',
          graphSnapshot: s.graphSnapshot,
          status: s.status,
          rounds: s.rounds,
          createdAt: s.createdAt.toISOString(),
          completedAt: s.completedAt?.toISOString() ?? null,
          scenarioOutcomes: s.scenarioOutcomes.map(so => ({
            id: so.id,
            scenarioPath: so.scenarioPath,
            probability: so.probability,
            description: so.description,
          })),
          feedbacks: s.feedbacks.map(f => ({
            id: f.id,
            result: f.result,
          })),
        };
      }),
    });
  } catch (err) {
    console.error('[Simulations List API]', err);
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
