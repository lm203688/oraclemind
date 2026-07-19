/**
 * What-If Runner — 反事实推演
 *
 * 用户在看完主推演后，可以注入一个变量（"如果X改变呢？"），
 * 重新跑一次轻量推演，对比与原推演的差异。
 *
 * 实现：
 *   - 基于原推演的图谱，注入新变量
 *   - 只跑3轮（vs 主推演8轮）
 *   - 只跑5现代Agent（古典部分基于命盘不变，跳过）
 *   - 输出与原推演的divergencePoint
 */

import { db } from '@/lib/db';
import { calculateBazi } from '@/lib/classical/bazi-foundation';
import { runSimulation, SimulationInput, SimulationResult } from './simulation-engine';
import { synthesizeScenarios, SynthesisResult } from './scenario-synthesizer';
import { getGraphSnapshot, createNode, createEdge, GraphSnapshot } from '@/lib/graph/graph-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WhatIfInput {
  parentSimulationId: string;
  userId: string;
  injectedVariable: string;  // 如"如果我明年换城市呢？"
}

export interface WhatIfResult {
  whatIfBranchId: string;
  newSimulation: SimulationResult;
  newSynthesis: SynthesisResult;
  parentSynthesis: SynthesisResult | null;
  divergencePoint: string;
}

// ---------------------------------------------------------------------------
// 主函数
// ---------------------------------------------------------------------------

export async function runWhatIf(input: WhatIfInput): Promise<WhatIfResult> {
  // 1. 获取父推演
  const parentSim = await db.simulation.findUnique({
    where: { id: input.parentSimulationId },
    include: { agentTraces: true, scenarioOutcomes: true },
  });
  if (!parentSim) throw new Error('Parent simulation not found');

  // 2. 解析父推演的输入
  const parentSeed = JSON.parse(parentSim.seedInput);
  const parentQuestion = parentSeed.question ?? '';
  const newQuestion = `${parentQuestion} 【假设：${input.injectedVariable}】`;

  // 3. 获取父推演的图谱快照
  const parentGraph = await getGraphSnapshot({ userId: input.userId });

  // 4. 注入新变量到图谱
  // 把injectedVariable作为一个新的"force"节点加入图谱
  const newNodeId = await createNode({
    userId: input.userId,
    nodeType: 'force',
    name: input.injectedVariable.slice(0, 30),
    attributes: { whatIfInjected: true, description: '用户what-if注入的变量' },
  });

  // 把新节点连接到图谱中"我"或"事件核心"
  const meNode = parentGraph.nodes.find(n => n.name === '我' || n.nodeType === 'person');
  if (meNode) {
    await createEdge({
      userId: input.userId,
      fromNodeId: newNodeId,
      toNodeId: meNode.id,
      relationType: 'influence_of',
      weight: 0.8,
    });
  }

  // 5. 重新构建输入（只跑3轮）
  // 如果父推演有 birthInfo，重新计算完整 BaziChart（命盘固定，可重算）
  let baziChart;
  if (parentSeed.birthInfo) {
    try {
      baziChart = calculateBazi(
        parentSeed.birthInfo.year,
        parentSeed.birthInfo.month,
        parentSeed.birthInfo.day,
        parentSeed.birthInfo.hour,
      );
    } catch (err) {
      console.error('[WhatIf] Bazi recalc failed:', err);
    }
  }

  const newSimInput: SimulationInput = {
    userId: input.userId,
    simulationType: parentSim.type as 'personal' | 'event',
    question: newQuestion,
    graphSummary: `${parentGraph.nodes.length}个实体的图谱 + 新注入变量：${input.injectedVariable}`,
    keyNodes: [],  // 简化：what-if不重新计算中心度
    baziChart,
    personalContext: parentSeed.personalContext,
    eventContext: parentSeed.eventContext,
    rounds: 3,
  };

  const newSimulation = await runSimulation(newSimInput);
  const newSynthesis = await synthesizeScenarios(newSimulation.simulationId, newSimulation.rounds);

  // 6. 重建父推演的synthesis（用于对比）
  let parentSynthesis: SynthesisResult | null = null;
  if (parentSim.scenarioOutcomes.length > 0) {
    // 从已存的scenarioOutcomes重建
    const parentScenarios = parentSim.scenarioOutcomes.map(s => ({
      scenarioPath: s.scenarioPath as 'optimistic' | 'neutral' | 'conservative',
      probability: s.probability,
      description: s.description,
      keyTurningPoints: s.keyTurningPoints ? JSON.parse(s.keyTurningPoints) : [],
      recommendation: s.recommendation ?? '',
    }));

    parentSynthesis = {
      scenarios: parentScenarios,
      crossValidation: parentSim.scenarioOutcomes[0].crossValidationResult
        ? JSON.parse(parentSim.scenarioOutcomes[0].crossValidationResult)
        : {
            matrix: {},
            modernConsensus: parentSim.scenarioOutcomes[0].modernConsensus,
            classicalConsensus: parentSim.scenarioOutcomes[0].classicalConsensus,
            quadrant: 'insufficient_info' as const,
            summary: '历史推演，矩阵不可用',
          },
      finalRecommendation: parentSim.scenarioOutcomes[0].recommendation ?? '',
      keyDivergences: [],
    };
  }

  // 7. 计算divergencePoint
  const divergencePoint = computeDivergence(parentSynthesis, newSynthesis, input.injectedVariable);

  // 8. 写入WhatIfBranch
  const whatIfBranch = await db.whatIfBranch.create({
    data: {
      parentSimulationId: input.parentSimulationId,
      injectedVariable: input.injectedVariable,
      newScenarios: JSON.stringify(newSynthesis.scenarios),
      divergencePoint,
    },
  });

  return {
    whatIfBranchId: whatIfBranch.id,
    newSimulation,
    newSynthesis,
    parentSynthesis,
    divergencePoint,
  };
}

// ---------------------------------------------------------------------------
// 计算divergence
// ---------------------------------------------------------------------------

function computeDivergence(
  parent: SynthesisResult | null,
  newResult: SynthesisResult,
  injectedVariable: string,
): string {
  if (!parent) {
    return `注入"${injectedVariable}"后，新推演的情景分布：${newResult.scenarios.map(s => `${s.scenarioPath === 'optimistic' ? '乐观' : s.scenarioPath === 'neutral' ? '中性' : '保守'}${Math.round(s.probability * 100)}%`).join('，')}。`;
  }

  // 对比概率分布
  const diffs: string[] = [];
  for (const newS of newResult.scenarios) {
    const parentS = parent.scenarios.find(s => s.scenarioPath === newS.scenarioPath);
    if (parentS) {
      const probDiff = newS.probability - parentS.probability;
      if (Math.abs(probDiff) > 0.05) {
        const direction = probDiff > 0 ? '上升' : '下降';
        const label = newS.scenarioPath === 'optimistic' ? '乐观' : newS.scenarioPath === 'neutral' ? '中性' : '保守';
        diffs.push(`${label}概率${direction}${Math.abs(Math.round(probDiff * 100))}%`);
      }
    }
  }

  // 对比四象限
  const quadrantChanged = parent.crossValidation.quadrant !== newResult.crossValidation.quadrant;

  const parts: string[] = [`注入"${injectedVariable}"后，`];
  if (diffs.length > 0) {
    parts.push(diffs.join('，'));
  } else {
    parts.push('情景概率分布基本不变');
  }
  if (quadrantChanged) {
    parts.push(`，四象限判定从${parent.crossValidation.quadrant}变为${newResult.crossValidation.quadrant}`);
  }

  return parts.join('') + '。';
}
