import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildEventGraph } from '@/lib/engines/event-graph-builder';
import { runSimulation } from '@/lib/engines/simulation-engine';
import { synthesizeScenarios } from '@/lib/engines/scenario-synthesizer';
import { addMemory } from '@/lib/memory/user-memory';

interface EventSimulateRequest {
  userId: string;
  eventDescription: string;
  context?: string;
  timeframe?: string;
  rounds?: number;
}

interface EventSimulateResponse {
  success: boolean;
  data: {
    simulationId: string;
    graphSummary: string;
    keyStakeholders: Array<{ name: string; nodeType: string; centrality: number }>;
    factions: Array<{ name: string; stance: string; memberCount: number }>;
    scenarios: Array<{
      scenarioPath: string;
      probability: number;
      description: string;
      keyTurningPoints: string[];
      recommendation: string;
    }>;
    crossValidation: {
      matrix: Record<string, Record<string, number>>;
      modernConsensus: number;
      classicalConsensus: number;
      quadrant: string;
      summary: string;
    };
    finalRecommendation: string;
    keyDivergences: string[];
    totalRounds: number;
    totalTokensUsed: number;
  } | null;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<EventSimulateResponse>> {
  try {
    const body = await request.json() as EventSimulateRequest;

    if (!body.userId || !body.eventDescription) {
      return NextResponse.json(
        { success: false, data: null, error: 'Missing required fields: userId, eventDescription' },
        { status: 400 },
      );
    }

    // 1. 构建事件图谱
    const graphResult = await buildEventGraph({
      userId: body.userId,
      eventDescription: body.eventDescription,
      context: body.context,
      timeframe: body.timeframe,
      useCurrentYearBazi: true,
    });

    // 2. 运行多轮模拟（事件推演默认15轮）
    const simulation = await runSimulation({
      userId: body.userId,
      simulationType: 'event',
      question: body.eventDescription,
      graphSummary: graphResult.graphSummary,
      keyNodes: graphResult.keyStakeholders,
      eventContext: body.context,
      rounds: body.rounds ?? 15,
    });

    // 3. 综合情景
    const synthesis = await synthesizeScenarios(simulation.simulationId, simulation.rounds);

    // 4. 存入episodic记忆
    await addMemory({
      userId: body.userId,
      memoryType: 'episodic',
      content: `事件推演：${body.eventDescription}`,
      summary: body.eventDescription.slice(0, 50),
    });

    // 5. 更新用户模拟计数
    await db.user.upsert({
      where: { id: body.userId },
      update: { totalSimulations: { increment: 1 } },
      create: { id: body.userId, totalSimulations: 1 },
    });

    return NextResponse.json({
      success: true,
      data: {
        simulationId: simulation.simulationId,
        graphSummary: graphResult.graphSummary,
        keyStakeholders: graphResult.keyStakeholders.map(n => ({
          name: n.name,
          nodeType: n.nodeType,
          centrality: n.centrality ?? 0,
        })),
        factions: graphResult.factions.map(f => ({
          name: f.name,
          stance: f.stance,
          memberCount: f.members.length,
        })),
        scenarios: synthesis.scenarios,
        crossValidation: synthesis.crossValidation,
        finalRecommendation: synthesis.finalRecommendation,
        keyDivergences: synthesis.keyDivergences,
        totalRounds: simulation.rounds.length,
        totalTokensUsed: simulation.totalTokensUsed,
      },
    });
  } catch (err) {
    console.error('[Event Simulate API]', err);
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
