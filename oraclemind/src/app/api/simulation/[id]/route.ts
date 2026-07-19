import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface SimulationDetailResponse {
  success: boolean;
  data: {
    id: string;
    type: string;
    seedInput: any;
    graphSnapshot: string | null;
    baziSnapshot: string | null;
    status: string;
    rounds: number;
    createdAt: string;
    completedAt: string | null;
    scenarioOutcomes: Array<{
      id: string;
      scenarioPath: string;
      probability: number;
      description: string;
      keyTurningPoints: string | null;
      crossValidationResult: string | null;
      modernConsensus: number;
      classicalConsensus: number;
      recommendation: string | null;
    }>;
    agentTraces: Array<{
      id: string;
      agentRole: string;
      agentCategory: string;
      round: number;
      actionType: string;
      content: string;
      reasoning: string | null;
    }>;
    feedbacks: Array<{
      id: string;
      result: string;
      comment: string | null;
    }>;
  } | null;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<SimulationDetailResponse>> {
  try {
    const { id } = await params;

    const simulation = await db.simulation.findUnique({
      where: { id },
      include: {
        scenarioOutcomes: true,
        agentTraces: {
          orderBy: { round: 'asc' },
        },
        feedbacks: true,
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { success: false, data: null, error: 'Simulation not found' },
        { status: 404 },
      );
    }

    let seedInput: any = {};
    try { seedInput = JSON.parse(simulation.seedInput); } catch {}

    let baziSnapshot: any = null;
    if (simulation.baziSnapshot) {
      try { baziSnapshot = JSON.parse(simulation.baziSnapshot); } catch {}
    }

    return NextResponse.json({
      success: true,
      data: {
        id: simulation.id,
        type: simulation.type,
        seedInput,
        graphSnapshot: simulation.graphSnapshot,
        baziSnapshot,
        status: simulation.status,
        rounds: simulation.rounds,
        createdAt: simulation.createdAt.toISOString(),
        completedAt: simulation.completedAt?.toISOString() ?? null,
        scenarioOutcomes: simulation.scenarioOutcomes.map(so => ({
          id: so.id,
          scenarioPath: so.scenarioPath,
          probability: so.probability,
          description: so.description,
          keyTurningPoints: so.keyTurningPoints,
          crossValidationResult: so.crossValidationResult,
          modernConsensus: so.modernConsensus,
          classicalConsensus: so.classicalConsensus,
          recommendation: so.recommendation,
        })),
        agentTraces: simulation.agentTraces.map(t => ({
          id: t.id,
          agentRole: t.agentRole,
          agentCategory: t.agentCategory,
          round: t.round,
          actionType: t.actionType,
          content: t.content,
          reasoning: t.reasoning,
        })),
        feedbacks: simulation.feedbacks.map(f => ({
          id: f.id,
          result: f.result,
          comment: f.comment,
        })),
      },
    });
  } catch (err) {
    console.error('[Simulation Detail API]', err);
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
