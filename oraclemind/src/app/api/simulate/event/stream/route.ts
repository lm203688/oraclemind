import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { buildEventGraph } from '@/lib/engines/event-graph-builder';
import { synthesizeScenarios } from '@/lib/engines/scenario-synthesizer';
import { addMemory } from '@/lib/memory/user-memory';
import {
  runClassicalVerification,
} from '@/lib/classical/classical-orchestrator';
import { ClassicalAgentContext } from '@/lib/classical/classical-types';
import { MODERN_AGENTS, buildAgentPrompt } from '@/lib/engines/agent-factory';
import { callAgentLLMWithRetry } from '@/lib/engines/llm-helper';

// ---------------------------------------------------------------------------
// SSE 事件类型（与个人推演一致）
// ---------------------------------------------------------------------------

type SSEEvent =
  | { type: 'start'; simulationId: string; totalRounds: number; agentCount: number }
  | { type: 'graph_built'; graphSummary: string; nodeCount: number; edgeCount: number; keyNodes: Array<{ name: string; nodeType: string; centrality: number }> }
  | { type: 'classical_done'; round: number; reports: Array<{ bookId: string; bookName: string; judgment: string; directionScore: number; consensus: string }>; consensusScore: number }
  | { type: 'agent_start'; round: number; agentRole: string; agentName: string }
  | { type: 'agent_done'; round: number; agentRole: string; agentName: string; content: string; tokensUsed: number }
  | { type: 'round_done'; round: number }
  | { type: 'synthesizing' }
  | { type: 'complete'; simulationId: string; scenarios: any[]; crossValidation: any; finalRecommendation: string; keyDivergences: string[]; totalTokensUsed: number }
  | { type: 'error'; message: string };

// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();

  const sendEvent = (event: SSEEvent) => {
    return `data: ${JSON.stringify(event)}\n\n`;
  };

  try {
    const body = await request.json();
    const { userId, eventDescription, context, timeframe, rounds = 15 } = body;

    if (!userId || !eventDescription) {
      return new Response(
        sendEvent({ type: 'error', message: 'Missing required fields: userId, eventDescription' }),
        { status: 400, headers: { 'Content-Type': 'text/event-stream' } },
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 确保 user 存在
          await db.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId },
          });

          controller.enqueue(encoder.encode(sendEvent({ type: 'start', simulationId: 'pending', totalRounds: rounds, agentCount: 10 })));

          // 1. 构建事件图谱
          const graphResult = await buildEventGraph({
            userId,
            eventDescription,
            context,
            timeframe,
            useCurrentYearBazi: true,
          });

          controller.enqueue(encoder.encode(sendEvent({
            type: 'graph_built',
            graphSummary: graphResult.graphSummary,
            nodeCount: graphResult?.nodeIds?.length ?? 0,
            edgeCount: graphResult?.edgeIds?.length ?? 0,
            keyNodes: (graphResult?.keyStakeholders ?? []).slice(0, 6).map(n => ({ name: n.name, nodeType: n.nodeType, centrality: n.centrality ?? 0 })),
          })));

          // 2. 创建 Simulation 记录
          const simulation = await db.simulation.create({
            data: {
              userId,
              type: 'event',
              seedInput: JSON.stringify({ question: eventDescription, eventContext: context, timeframe }),
              graphSnapshot: graphResult.graphSummary,
              agentCount: 10,
              rounds,
              status: 'running',
            },
          });

          const simulationId = simulation?.id ?? `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const allRounds: any[] = [];
          let totalTokensUsed = 0;

          // 3. 多轮模拟
          for (let round = 1; round <= rounds; round++) {
            // 3a. 古典验证（事件推演无个人八字，用流年判定）
            const classicalCtx: ClassicalAgentContext = {
              chart: undefined, // 事件推演无个人命盘
              question: eventDescription,
              simulationType: 'event' as const,
              eventContext: context,
            };

            const classicalResult = await runClassicalVerification(classicalCtx);
            const classicalReports = classicalResult?.reports ?? [];
            const classicalConsensusScore = classicalResult?.consensusScore ?? 0;

            await Promise.all(
              classicalReports.map(r => db.agentTrace.create({
                data: {
                  simulationId,
                  agentRole: r.bookId,
                  agentCategory: 'classical',
                  round,
                  actionType: 'verify',
                  content: r.judgment,
                  reasoning: JSON.stringify({
                    directionScore: r.directionScore,
                    confidence: r.confidence,
                    consensus: r.consensus,
                  }),
                },
              })),
            );

            controller.enqueue(encoder.encode(sendEvent({
              type: 'classical_done',
              round,
              reports: classicalReports.map(r => ({
                bookId: r.bookId,
                bookName: r.bookName,
                judgment: r.judgment,
                directionScore: r.directionScore,
                consensus: r.consensus,
              })),
              consensusScore: classicalConsensusScore,
            })));

            // 3b. 现代5Agent串行
            const modernOutputs: Array<{ role: string; content: string; tokensUsed: number }> = [];
            const previousOutputs = round > 1
              ? allRounds[round - 2].modernOutputs.map((o: any) => ({ role: o.role, content: o.content }))
              : undefined;

            for (const agent of MODERN_AGENTS) {
              controller.enqueue(encoder.encode(sendEvent({
                type: 'agent_start',
                round,
                agentRole: agent.role,
                agentName: agent.name,
              })));

              const { systemPrompt, userMessage } = buildAgentPrompt(agent, {
                question: eventDescription,
                simulationType: 'event' as const,
                graphSummary: graphResult.graphSummary,
                keyNodes: graphResult?.keyStakeholders ?? [],
                eventContext: context,
                currentRound: round,
                totalRounds: rounds,
                previousRoundOutputs: previousOutputs,
              });

              const output = await callAgentLLMWithRetry(systemPrompt, userMessage, agent.role);
              modernOutputs.push({ role: agent.role, content: output.content, tokensUsed: output.tokensUsed });
              totalTokensUsed += output.tokensUsed;

              await db.agentTrace.create({
                data: {
                  simulationId,
                  agentRole: agent.role,
                  agentCategory: 'modern',
                  round,
                  actionType: 'reason',
                  content: output.content,
                  reasoning: JSON.stringify({ tokensUsed: output.tokensUsed }),
                },
              });

              controller.enqueue(encoder.encode(sendEvent({
                type: 'agent_done',
                round,
                agentRole: agent.role,
                agentName: agent.name,
                content: output.content,
                tokensUsed: output.tokensUsed,
              })));

              await new Promise(r => setTimeout(r, 500));
            }

            allRounds.push({ round, modernOutputs, classicalResult });
            controller.enqueue(encoder.encode(sendEvent({ type: 'round_done', round })));
          }

          // 4. 综合
          controller.enqueue(encoder.encode(sendEvent({ type: 'synthesizing' })));
          const synthesis = await synthesizeScenarios(simulationId, allRounds);

          await db.simulation.update({
            where: { id: simulationId },
            data: { status: 'completed', completedAt: new Date() },
          });

          await addMemory({
            userId,
            memoryType: 'episodic',
            content: `事件推演：${eventDescription}`,
            summary: eventDescription.slice(0, 50),
          });

          await db.user.update({
            where: { id: userId },
            data: { totalSimulations: { increment: 1 } },
          });

          controller.enqueue(encoder.encode(sendEvent({
            type: 'complete',
            simulationId,
            scenarios: synthesis.scenarios,
            crossValidation: synthesis.crossValidation,
            finalRecommendation: synthesis.finalRecommendation,
            keyDivergences: synthesis.keyDivergences,
            totalTokensUsed,
          })));

          controller.close();
        } catch (err) {
          console.error('[Stream Event API]', err);
          controller.enqueue(encoder.encode(sendEvent({
            type: 'error',
            message: err instanceof Error ? err.message : 'Unknown error',
          })));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    return new Response(
      `data: ${JSON.stringify({ type: 'error', message: err instanceof Error ? err.message : 'Unknown error' })}\n\n`,
      { status: 500, headers: { 'Content-Type': 'text/event-stream' } },
    );
  }
}
