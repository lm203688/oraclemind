import { NextRequest, NextResponse } from 'next/server';
import { runWhatIf } from '@/lib/engines/what-if-runner';

interface WhatIfRequest {
  parentSimulationId: string;
  userId: string;
  injectedVariable: string;
}

interface WhatIfResponse {
  success: boolean;
  data: {
    whatIfBranchId: string;
    newSimulationId: string;
    divergencePoint: string;
    newScenarios: Array<{
      scenarioPath: string;
      probability: number;
      description: string;
    }>;
    newQuadrant: string;
    parentQuadrant?: string;
  } | null;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<WhatIfResponse>> {
  try {
    const body = await request.json() as WhatIfRequest;

    if (!body.parentSimulationId || !body.userId || !body.injectedVariable) {
      return NextResponse.json(
        { success: false, data: null, error: 'Missing required fields: parentSimulationId, userId, injectedVariable' },
        { status: 400 },
      );
    }

    const result = await runWhatIf({
      parentSimulationId: body.parentSimulationId,
      userId: body.userId,
      injectedVariable: body.injectedVariable,
    });

    return NextResponse.json({
      success: true,
      data: {
        whatIfBranchId: result.whatIfBranchId,
        newSimulationId: result.newSimulation.simulationId,
        divergencePoint: result.divergencePoint,
        newScenarios: result.newSynthesis.scenarios.map(s => ({
          scenarioPath: s.scenarioPath,
          probability: s.probability,
          description: s.description,
        })),
        newQuadrant: result.newSynthesis.crossValidation.quadrant,
        parentQuadrant: result.parentSynthesis?.crossValidation.quadrant,
      },
    });
  } catch (err) {
    console.error('[What-If API]', err);
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
