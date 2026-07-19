import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface AgentTraceResponse {
  success: boolean;
  data: {
    simulationId: string;
    totalRounds: number;
    traces: Array<{
      id: string;
      agentRole: string;
      agentCategory: string;
      round: number;
      actionType: string;
      content: string;
      reasoning?: string;
      createdAt: string;
    }>;
  } | null;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<AgentTraceResponse>> {
  try {
    const { id: simulationId } = await params;

    const simulation = await db.simulation.findUnique({
      where: { id: simulationId },
      include: {
        agentTraces: {
          orderBy: { round: 'asc' },
        },
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { success: false, data: null, error: 'Simulation not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        simulationId,
        totalRounds: simulation.rounds,
        traces: simulation.agentTraces.map(t => ({
          id: t.id,
          agentRole: t.agentRole,
          agentCategory: t.agentCategory,
          round: t.round,
          actionType: t.actionType,
          content: t.content,
          reasoning: t.reasoning ?? undefined,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    });
  } catch (err) {
    console.error('[Agent Trace API]', err);
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
