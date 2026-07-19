import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateBazi } from '@/lib/classical/bazi-foundation';
import { buildPersonalGraph } from '@/lib/engines/personal-graph-builder';
import { runSimulation } from '@/lib/engines/simulation-engine';
import { synthesizeScenarios } from '@/lib/engines/scenario-synthesizer';
import { getMemoryHorizon, addMemory } from '@/lib/memory/user-memory';
import { summarizeUserMemories } from '@/lib/memory/memory-summarizer';

interface PersonalSimulateRequest {
  userId: string;
  question: string;
  context?: string;
  birthInfo?: { year: number; month: number; day: number; hour: number };
  rounds?: number;
}

interface PersonalSimulateResponse {
  success: boolean;
  data: {
    simulationId: string;
    graphSummary: string;
    keyNodes: Array<{ name: string; nodeType: string; centrality: number }>;
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

export async function POST(request: NextRequest): Promise<NextResponse<PersonalSimulateResponse>> {
  try {
    const body = await request.json() as PersonalSimulateRequest;

    if (!body.userId || !body.question) {
      return NextResponse.json(
        { success: false, data: null, error: 'Missing required fields: userId, question' },
        { status: 400 },
      );
    }

    let baziChart;
    if (body.birthInfo) {
      baziChart = calculateBazi(
        body.birthInfo.year,
        body.birthInfo.month,
        body.birthInfo.day,
        body.birthInfo.hour,
      );
    }

    const memoryHorizon = await getMemoryHorizon(body.userId);

    const graphResult = await buildPersonalGraph({
      userId: body.userId,
      question: body.question,
      context: body.context,
      birthInfo: body.birthInfo,
      baziChart,
      includeMemory: true,
    });

    const simulation = await runSimulation({
      userId: body.userId,
      simulationType: 'personal',
      question: body.question,
      graphSummary: graphResult.graphSummary,
      keyNodes: graphResult.keyNodes,
      memoryHorizon,
      baziChart,
      personalContext: body.context,
      rounds: body.rounds ?? 8,
    });

    const synthesis = await synthesizeScenarios(simulation.simulationId, simulation.rounds);

    await addMemory({
      userId: body.userId,
      memoryType: 'episodic',
      content: `用户提问：${body.question}`,
      summary: body.question.slice(0, 50),
    });

    summarizeUserMemories(body.userId).catch(() => {});

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
        keyNodes: graphResult.keyNodes.map(n => ({
          name: n.name,
          nodeType: n.nodeType,
          centrality: n.centrality ?? 0,
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
    console.error('[Personal Simulate API]', err);
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
