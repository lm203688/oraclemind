import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { calculateBazi } from '@/lib/classical/bazi-foundation';
import { buildPersonalGraph } from '@/lib/engines/personal-graph-builder';
import { synthesizeScenarios } from '@/lib/engines/scenario-synthesizer';
import { getMemoryHorizon, addMemory } from '@/lib/memory/user-memory';
import { summarizeUserMemories } from '@/lib/memory/memory-summarizer';
import {
  runClassicalVerification,
  ClassicalOrchestrationResult,
} from '@/lib/classical/classical-orchestrator';
import { ClassicalAgentContext } from '@/lib/classical/classical-types';
import { MODERN_AGENTS, buildAgentPrompt, ModernAgentPersona } from '@/lib/engines/agent-factory';
import { callAgentLLMWithRetry } from '@/lib/engines/llm-helper';

// ---------------------------------------------------------------------------
// SSE 事件类型
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
// 路由处理
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();

  const sendEvent = (event: SSEEvent) => {
    return `data: ${JSON.stringify(event)}\n\n`;
  };

  try {
    const body = await request.json();
    const { userId, question, context, birthInfo, rounds = 8 } = body;

    if (!userId || !question) {
      return new Response(
        sendEvent({ type: 'error', message: 'Missing required fields: userId, question' }),
        { status: 400, headers: { 'Content-Type': 'text/event-stream' } },
      );
    }

    // 创建 ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. 计算八字
          let baziChart;
          if (birthInfo) {
            baziChart = calculateBazi(birthInfo.year, birthInfo.month, birthInfo.day, birthInfo.hour);
          }

          // 2. 创建 Simulation 记录（先占位，status=running）
          await db.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId },
          });

          // 3. 构建个人图谱
          controller.enqueue(encoder.encode(sendEvent({ type: 'start', simulationId: 'pending', totalRounds: rounds, agentCount: 10 })));

          const memoryHorizon = await getMemoryHorizon(userId);
          const graphResult = await buildPersonalGraph({
            userId,
            question,
            context,
            birthInfo,
            baziChart,
            includeMemory: true,
          });

          controller.enqueue(encoder.encode(sendEvent({
            type: 'graph_built',
            graphSummary: graphResult.graphSummary,
            nodeCount: graphResult.nodeIds.length,
            edgeCount: graphResult.edgeIds.length,
            keyNodes: graphResult.keyNodes.slice(0, 6).map(n => ({ name: n.name, nodeType: n.nodeType, centrality: n.centrality ?? 0 })),
          })));

          // 4. 创建 Simulation 记录
          const simulation = await db.simulation.create({
            data: {
              userId,
              type: 'personal',
              seedInput: JSON.stringify({ question, personalContext: context, birthInfo }),
              graphSnapshot: graphResult.graphSummary,
              baziSnapshot: baziChart ? JSON.stringify({
                dayMaster: baziChart.dayMaster,
                element: baziChart.dayMasterElement,
                birthInfo: baziChart.birthInfo,
              }) : null,
              agentCount: 10,
              rounds,
              status: 'running',
            },
          });

          const simulationId = simulation.id;
          const allRounds: any[] = [];
          let totalTokensUsed = 0;

          // 5. 多轮模拟
          for (let round = 1; round <= rounds; round++) {
            // 5a. 古典5Agent并行
            const classicalCtx: ClassicalAgentContext = {
              chart: baziChart,
              question,
              simulationType: 'personal' as const,
              personalContext: context,
            };

            const classicalResult = await runClassicalVerification(classicalCtx);

            // 存古典traces
            await Promise.all(
              classicalResult.reports.map(r => db.agentTrace.create({
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
              reports: classicalResult.reports.map(r => ({
                bookId: r.bookId,
                bookName: ({yuanhai:'◇ Scroll I',ziping:'◇ Scroll II',sanming:'◇ Scroll III',ditianzhui:'◇ Scroll IV',qiongtong:'◇ Scroll V'})[r.bookId] || r.bookId,
                judgment: r.judgment,
                directionScore: r.directionScore,
                consensus: r.consensus,
              })),
              consensusScore: classicalResult.consensusScore,
            })));

            // 5b. 现代5Agent串行
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
                question,
                simulationType: 'personal' as const,
                graphSummary: graphResult.graphSummary,
                keyNodes: graphResult.keyNodes,
                memoryHorizon,
                baziChart,
                personalContext: context,
                currentRound: round,
                totalRounds: rounds,
                previousRoundOutputs: previousOutputs,
              });

              const output = await callAgentLLMWithRetry(systemPrompt, userMessage, agent.role);
              modernOutputs.push({ role: agent.role, content: output.content, tokensUsed: output.tokensUsed });
              totalTokensUsed += output.tokensUsed;

              // 存trace
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

              // Agent间延迟避免429
              await new Promise(r => setTimeout(r, 500));
            }

            allRounds.push({ round, modernOutputs, classicalResult });
            controller.enqueue(encoder.encode(sendEvent({ type: 'round_done', round })));
          }

          // 6. 综合情景
          controller.enqueue(encoder.encode(sendEvent({ type: 'synthesizing' })));
          const synthesis = await synthesizeScenarios(simulationId, allRounds);

          // 7. 更新 Simulation 状态
          await db.simulation.update({
            where: { id: simulationId },
            data: { status: 'completed', completedAt: new Date() },
          });

          // 8. 存记忆
          await addMemory({
            userId,
            memoryType: 'episodic',
            content: `用户提问：${question}`,
            summary: question.slice(0, 50),
          });
          summarizeUserMemories(userId).catch(() => {});

          await db.user.update({
            where: { id: userId },
            data: { totalSimulations: { increment: 1 } },
          });

          // 9. 发送完成事件
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
          console.error('[Stream Personal API]', err);
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
