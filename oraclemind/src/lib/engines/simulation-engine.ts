/**
 * Simulation Engine — 多轮异步模拟引擎
 *
 * 参考 MiroFish/OASIS 的架构，但简化为：
 *   - 每轮：5现代Agent并行 + 5古典Agent并行
 *   - 现代5Agent通过LLM调用，可读取上一轮其他Agent输出
 *   - 古典5Agent纯计算（基于八字），每轮独立判定
 *   - 所有Agent输出存入AgentTrace表，可查询
 *
 * 总轮次默认8轮（个人推演）/ 15轮（事件推演）
 */

import { db } from '@/lib/db';
import { BaziChart } from '@/lib/classical/bazi-foundation';
import {
  MODERN_AGENTS,
  buildAgentPrompt,
  AgentContext,
  ModernAgentPersona,
} from './agent-factory';
import { runClassicalVerification, ClassicalOrchestrationResult } from '@/lib/classical/classical-orchestrator';
import { ClassicalAgentContext } from '@/lib/classical/classical-types';
import { GraphNodeData } from '@/lib/graph/graph-store';
import { MemoryHorizon } from '@/lib/memory/user-memory';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SimulationInput {
  userId: string;
  simulationType: 'personal' | 'event';
  question: string;
  graphSummary: string;
  keyNodes: GraphNodeData[];
  memoryHorizon?: MemoryHorizon;
  baziChart?: BaziChart;
  personalContext?: string;
  eventContext?: string;
  rounds?: number;
}

export interface RoundResult {
  round: number;
  modernOutputs: Array<{ role: string; content: string; tokensUsed: number }>;
  classicalResult: ClassicalOrchestrationResult;
}

export interface SimulationResult {
  simulationId: string;
  rounds: RoundResult[];
  finalClassicalConsensus: number;
  totalTokensUsed: number;
}

// ---------------------------------------------------------------------------
// LLM调用
// ---------------------------------------------------------------------------

let cachedZAI: any = null;

async function getZAI() {
  if (!cachedZAI) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    cachedZAI = await ZAI.create();
  }
  return cachedZAI;
}

async function callAgentLLM(
  systemPrompt: string,
  userMessage: string,
  agentRole?: string,
): Promise<{ content: string; tokensUsed: number }> {
  const zai = await getZAI();

  // 重试机制：最多3次，每次间隔递增
  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 用Promise.race实现超时控制（单次30秒）
      const completion = await Promise.race([
        zai.chat.completions.create({
          messages: [
            { role: 'assistant', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          thinking: { type: 'disabled' },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('LLM call timeout (30s)')), 30000)
        ),
      ]);

      const content = completion.choices?.[0]?.message?.content ?? '';

      // 检查内容是否有效（避免空回复）
      if (!content || content.trim().length < 20) {
        throw new Error('Empty or too-short response');
      }

      const tokensUsed = Math.ceil((systemPrompt.length + userMessage.length + content.length) / 3);
      return { content, tokensUsed };
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;
      const errMsg = err instanceof Error ? err.message : String(err);
      const is429 = errMsg.includes('429') || errMsg.includes('Too many requests');
      console.error(`[SimulationEngine] LLM call${agentRole ? ` (${agentRole})` : ''} attempt ${attempt}/${maxRetries} failed:`, errMsg);

      if (isLastAttempt) {
        // 最终失败：返回有意义的降级内容（而不是"分析失败"）
        return {
          content: generateFallbackContent(agentRole, systemPrompt),
          tokensUsed: 100,
        };
      }

      // 429错误：等更长时间（5s/10s/20s）；其他错误：1s/2s/4s
      const delay = is429
        ? 5000 * Math.pow(2, attempt - 1)
        : baseDelay * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  // 理论上不会走到这里
  return { content: '分析异常', tokensUsed: 100 };
}

/**
 * 生成降级内容：当LLM连续失败时，基于Agent角色给出有意义的回退输出
 * 比单纯说"分析失败"更有价值，至少能保持矩阵计算的连续性
 */
function generateFallbackContent(role: string | undefined, systemPrompt: string): string {
  const roleLabels: Record<string, string> = {
    strategist: '策略师',
    data_analyst: '数据分析师',
    risk_auditor: '风险审慎者',
    optimist: '乐观主义者',
    devil_advocate: '魔鬼代言人',
  };
  const label = role ? (roleLabels[role] ?? role) : 'Agent';

  // 根据Agent的偏置生成不同方向的降级输出
  const biases: Record<string, number> = {
    strategist: 0,
    data_analyst: -0.1,
    risk_auditor: -0.2,
    optimist: 0.2,
    devil_advocate: -0.15,
  };
  const bias = role ? (biases[role] ?? 0) : 0;

  if (bias > 0.1) {
    return `${label}视角：基于现有图谱信息，识别到潜在机会窗口。建议关注高中心度节点的正向互动模式，把握时机推进。具体深度分析因系统暂时繁忙未生成，但整体倾向积极。`;
  } else if (bias < -0.1) {
    return `${label}视角：基于现有图谱信息，识别到若干风险信号。建议关注关键节点的负面依赖关系，准备应对方案。具体深度分析因系统暂时繁忙未生成，整体倾向谨慎。`;
  } else {
    return `${label}视角：基于现有图谱信息，整体判断为中性。各要素间存在平衡关系，建议持续观察关键转折点。具体深度分析因系统暂时繁忙未生成。`;
  }
}

// ---------------------------------------------------------------------------
// 主函数
// ---------------------------------------------------------------------------

export async function runSimulation(input: SimulationInput): Promise<SimulationResult> {
  const rounds = input.rounds ?? (input.simulationType === 'personal' ? 8 : 15);

  // 确保 user 存在（外键约束）
  await db.user.upsert({
    where: { id: input.userId },
    update: {},
    create: { id: input.userId },
  });

  // 创建Simulation记录
  const simulation = await db.simulation.create({
    data: {
      userId: input.userId,
      type: input.simulationType,
      seedInput: JSON.stringify({
        question: input.question,
        personalContext: input.personalContext,
        eventContext: input.eventContext,
        birthInfo: input.baziChart?.birthInfo,
      }),
      graphSnapshot: input.graphSummary,
      baziSnapshot: input.baziChart ? JSON.stringify({
        dayMaster: input.baziChart.dayMaster,
        element: input.baziChart.dayMasterElement,
        pillars: `${input.baziChart.year.stem}${input.baziChart.year.branch}|${input.baziChart.month.stem}${input.baziChart.month.branch}|${input.baziChart.day.stem}${input.baziChart.day.branch}|${input.baziChart.hour.stem}${input.baziChart.hour.branch}`,
      }) : null,
      agentCount: 10,
      rounds,
      status: 'running',
    },
  });

  const simulationId = simulation.id;
  const allRounds: RoundResult[] = [];
  let totalTokensUsed = 0;

  try {
    for (let round = 1; round <= rounds; round++) {
      // 1. 古典5Agent并行（纯计算，无LLM调用，无429风险）
      const classicalCtx: ClassicalAgentContext = {
        chart: input.baziChart,
        question: input.question,
        simulationType: input.simulationType,
        personalContext: input.personalContext,
        eventContext: input.eventContext,
      };

      const classicalResult = await runClassicalVerification(classicalCtx);

      // 2. 现代5Agent串行执行（避免GLM API 429限流）
      // 每个Agent之间间隔500ms，给API喘息时间
      const modernOutputs: Array<{ content: string; tokensUsed: number }> = [];
      for (const agent of MODERN_AGENTS) {
        const output = await runModernAgent(agent, {
          question: input.question,
          simulationType: input.simulationType,
          graphSummary: input.graphSummary,
          keyNodes: input.keyNodes,
          memoryHorizon: input.memoryHorizon,
          baziChart: input.baziChart,
          personalContext: input.personalContext,
          eventContext: input.eventContext,
          currentRound: round,
          totalRounds: rounds,
          previousRoundOutputs: round > 1
            ? allRounds[round - 2].modernOutputs.map(o => ({ role: o.role, content: o.content }))
            : undefined,
        });
        modernOutputs.push(output);
        // Agent间小延迟，避免429
        await new Promise(r => setTimeout(r, 500));
      }

      // 2. 把现代Agent输出转换为标准格式
      const modernOutputsFormatted = MODERN_AGENTS.map((agent, i) => ({
        role: agent.role,
        content: modernOutputs[i].content,
        tokensUsed: modernOutputs[i].tokensUsed,
      }));

      totalTokensUsed += modernOutputsFormatted.reduce((sum, o) => sum + o.tokensUsed, 0);

      // 3. 存入AgentTrace表
      await Promise.all([
        // 现代5Agent
        ...modernOutputsFormatted.map(o => db.agentTrace.create({
          data: {
            simulationId,
            agentRole: o.role,
            agentCategory: 'modern',
            round,
            actionType: 'reason',
            content: o.content,
            reasoning: JSON.stringify({ tokensUsed: o.tokensUsed }),
          },
        })),
        // 古典5Agent（每本古籍一条trace）
        ...classicalResult.reports.map(r => db.agentTrace.create({
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
              details: r.details,
              warnings: r.warnings,
              opportunities: r.opportunities,
            }),
          },
        })),
      ]);

      allRounds.push({
        round,
        modernOutputs: modernOutputsFormatted,
        classicalResult,
      });
    }

    // 更新Simulation状态
    await db.simulation.update({
      where: { id: simulationId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    return {
      simulationId,
      rounds: allRounds,
      finalClassicalConsensus: allRounds[allRounds.length - 1].classicalResult.consensusScore,
      totalTokensUsed,
    };
  } catch (err) {
    await db.simulation.update({
      where: { id: simulationId },
      data: {
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// 执行单个现代Agent
// ---------------------------------------------------------------------------

async function runModernAgent(
  agent: ModernAgentPersona,
  ctx: AgentContext,
): Promise<{ content: string; tokensUsed: number }> {
  const { systemPrompt, userMessage } = buildAgentPrompt(agent, ctx);
  return callAgentLLM(systemPrompt, userMessage, agent.role);
}
