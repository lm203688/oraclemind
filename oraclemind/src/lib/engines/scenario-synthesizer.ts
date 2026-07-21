/**
 * Scenario Synthesizer + Cross Validator
 *
 * 把simulation的多轮输出综合为3条情景路径（乐观/中性/保守），
 * 并构建5×5交叉验证矩阵（现代5Agent × 古典5古籍）。
 *
 * 输出：
 *   - 3条ScenarioOutcome（乐观/中性/保守）
 *   - 5×5交叉验证矩阵
 *   - 四象限综合判定
 */

import { db } from '@/lib/db';
import { RoundResult } from './simulation-engine';
import { ClassicalOrchestrationResult } from '@/lib/classical/classical-orchestrator';
import { ClassicalVerificationReport } from '@/lib/classical/classical-types';
import { MODERN_AGENTS } from './agent-factory';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScenarioOutcomeData {
  scenarioPath: 'optimistic' | 'neutral' | 'conservative';
  probability: number;
  description: string;
  keyTurningPoints: string[];
  recommendation: string;
}

export interface CrossValidationMatrix {
  /** 5现代 × 5古典 一致性分数矩阵 */
  matrix: Record<string, Record<string, number>>;  // [modernRole][classicalBookId] = -1~+1
  /** 现代共识分（5现代平均） */
  modernConsensus: number;
  /** 古典共识分（5古典平均） */
  classicalConsensus: number;
  /** 四象限判定 */
  quadrant: 'high_confidence_proceed' | 'risk_flagged' | 'timing_issue' | 'strong_avoid' | 'insufficient_info';
  /** 矩阵摘要文本 */
  summary: string;
}

export interface SynthesisResult {
  scenarios: ScenarioOutcomeData[];
  crossValidation: CrossValidationMatrix;
  /** 最终建议（综合所有信息） */
  finalRecommendation: string;
  /** 关键分歧点 */
  keyDivergences: string[];
}

// ---------------------------------------------------------------------------
// 主函数
// ---------------------------------------------------------------------------

export async function synthesizeScenarios(
  simulationId: string,
  rounds: RoundResult[],
): Promise<SynthesisResult> {
  // 空轮次保护
  if (!rounds || rounds.length === 0) {
    return {
      scenarios: [],
      crossValidation: { matrix: {}, modernConsensus: 0, classicalConsensus: 0, quadrant: 'insufficient_info', summary: '数据不足' },
      finalRecommendation: '推演数据不足，无法生成综合建议。',
      keyDivergences: [],
    };
  }
  // 1. 提取所有现代Agent的最终输出（最后一轮）
  const lastRound = rounds[rounds.length - 1];
  const modernOutputs = lastRound.modernOutputs ?? [];
  const classicalResult = lastRound.classicalResult ?? { reports: [], consensusScore: 0, consensus: 'neutral' };

  // 2. 分析每个现代Agent的方向倾向
  const modernDirections: Record<string, number> = {};
  for (const output of modernOutputs) {
    modernDirections[output.role] = analyzeDirection(output.content);
  }

  // 3. 提取古典5本的方向分
  const classicalDirections: Record<string, number> = {};
  for (const report of (classicalResult.reports ?? [])) {
    classicalDirections[report.bookId] = report.directionScore;
  }

  // 4. 构建5×5交叉验证矩阵
  const crossValidation = buildCrossValidationMatrix(modernDirections, classicalDirections, classicalResult);

  // 5. 生成3条情景路径
  const scenarios = generateScenarios(rounds, modernOutputs, classicalResult, crossValidation);

  // 6. 写入ScenarioOutcome表
  for (const scenario of scenarios) {
    await db.scenarioOutcome.create({
      data: {
        simulationId,
        scenarioPath: scenario.scenarioPath,
        probability: scenario.probability,
        description: scenario.description,
        keyTurningPoints: JSON.stringify(scenario.keyTurningPoints),
        crossValidationResult: JSON.stringify(crossValidation),
        modernConsensus: crossValidation.modernConsensus,
        classicalConsensus: crossValidation.classicalConsensus,
        recommendation: scenario.recommendation,
      },
    });
  }

  // 7. 综合最终建议
  const finalRecommendation = generateFinalRecommendation(scenarios, crossValidation);

  // 8. 提取关键分歧点
  const keyDivergences = extractKeyDivergences(crossValidation, classicalResult);

  return {
    scenarios,
    crossValidation,
    finalRecommendation,
    keyDivergences,
  };
}

// ---------------------------------------------------------------------------
// 分析Agent输出的方向（乐观/中性/悲观）
// ---------------------------------------------------------------------------

function analyzeDirection(content: string): number {
  // 简化的情感分析：基于关键词
  const positiveKeywords = ['积极', '建议推进', '把握', '机会', '有利', '可行', '顺势', '上策', '推荐', '有利可图', '高置信', '清晰'];
  const negativeKeywords = ['消极', '风险', '谨慎', '避免', '不利', '保守', '观望', '下策', '不建议', '警告', '下行', '失败'];

  let score = 0;
  for (const kw of positiveKeywords) {
    if (content.includes(kw)) score += 0.15;
  }
  for (const kw of negativeKeywords) {
    if (content.includes(kw)) score -= 0.15;
  }

  // 偏置修正：bias字段
  // 这里简化处理，直接归一化
  return Math.max(-1, Math.min(1, score));
}

// ---------------------------------------------------------------------------
// 构建5×5交叉验证矩阵
// ---------------------------------------------------------------------------

function buildCrossValidationMatrix(
  modernDirections: Record<string, number>,
  classicalDirections: Record<string, number>,
  classicalResult: ClassicalOrchestrationResult,
): CrossValidationMatrix {
  const matrix: Record<string, Record<string, number>> = {};

  // 5现代 × 5古典
  for (const agent of MODERN_AGENTS) {
    const modernDir = modernDirections[agent.role] ?? 0;
    matrix[agent.role] = {};
    for (const report of classicalResult.reports) {
      const classicalDir = classicalDirections[report.bookId] ?? 0;
      // 一致性分数：方向相同的程度
      // 两个都为正且接近 = +1；两个都为负且接近 = +1（一致看跌也是一致）
      // 一个正一个负 = -1（分歧）
      const diff = Math.abs(modernDir - classicalDir);
      const sign = (modernDir * classicalDir) >= 0 ? 1 : -1;
      const consistency = sign * (1 - Math.min(diff, 1));
      matrix[agent.role][report.bookId] = Math.max(-1, Math.min(1, consistency));
    }
  }

  // 现代共识分
  const modernValues = Object.values(modernDirections);
  const modernConsensus = modernValues.reduce((a, b) => a + b, 0) / modernValues.length;

  // 古典共识分
  const classicalConsensus = classicalResult.consensusScore;

  // 四象限判定
  let quadrant: CrossValidationMatrix['quadrant'];
  if (Math.abs(modernConsensus) < 0.15 && Math.abs(classicalConsensus) < 0.15) {
    quadrant = 'insufficient_info';
  } else if (modernConsensus > 0.2 && classicalConsensus > 0.2) {
    quadrant = 'high_confidence_proceed';
  } else if (modernConsensus > 0.2 && classicalConsensus < -0.2) {
    quadrant = 'risk_flagged';
  } else if (modernConsensus < -0.2 && classicalConsensus > 0.2) {
    quadrant = 'timing_issue';
  } else if (modernConsensus < -0.2 && classicalConsensus < -0.2) {
    quadrant = 'strong_avoid';
  } else {
    quadrant = 'insufficient_info';
  }

  // 摘要
  const summary = generateMatrixSummary(matrix, modernConsensus, classicalConsensus, quadrant);

  return {
    matrix,
    modernConsensus,
    classicalConsensus,
    quadrant,
    summary,
  };
}

function generateMatrixSummary(
  matrix: Record<string, Record<string, number>>,
  modernConsensus: number,
  classicalConsensus: number,
  quadrant: CrossValidationMatrix['quadrant'],
): string {
  const quadrantDesc: Record<string, string> = {
    high_confidence_proceed: '高置信推进（现代+古典双看好）',
    risk_flagged: '风险标注（现代看好但古典警示）',
    timing_issue: '时机未到（古典看好但现代阻力大）',
    strong_avoid: '强烈避免（现代+古典双看衰）',
    insufficient_info: '信息不足（视角严重分裂）',
  };

  // 找出最一致和最分歧的对
  let maxConsistency = -2;
  let maxConsistencyPair = '';
  let minConsistency = 2;
  let minConsistencyPair = '';

  for (const [m, classical] of Object.entries(matrix)) {
    for (const [c, score] of Object.entries(classical)) {
      if (score > maxConsistency) {
        maxConsistency = score;
        maxConsistencyPair = `${m}↔${c}`;
      }
      if (score < minConsistency) {
        minConsistency = score;
        minConsistencyPair = `${m}↔${c}`;
      }
    }
  }

  return `现代共识分：${modernConsensus.toFixed(2)}，古典共识分：${classicalConsensus.toFixed(2)}。${quadrantDesc[quadrant]}。最一致：${maxConsistencyPair}（${maxConsistency.toFixed(2)}）；最分歧：${minConsistencyPair}（${minConsistency.toFixed(2)}）。`;
}

// ---------------------------------------------------------------------------
// 生成3条情景路径
// ---------------------------------------------------------------------------

function generateScenarios(
  rounds: RoundResult[],
  modernOutputs: Array<{ role: string; content: string; tokensUsed: number }>,
  classicalResult: ClassicalOrchestrationResult,
  crossValidation: CrossValidationMatrix,
): ScenarioOutcomeData[] {
  // 提取所有Agent的关键观点
  const allInsights = modernOutputs.map(o => ({
    role: o.role,
    content: o.content,
    direction: analyzeDirection(o.content),
  }));

  const classicalInsights = classicalResult.reports.map(r => ({
    role: r.bookId,
    content: r.judgment,
    direction: r.directionScore,
  }));

  // 乐观情景：取所有正向观点
  const optimisticPoints = [
    ...allInsights.filter(i => i.direction > 0).map(i => i.content),
    ...classicalInsights.filter(i => i.direction > 0).map(i => i.content),
  ];
  // 中性情景：取中位观点
  const neutralPoints = [
    ...allInsights.filter(i => Math.abs(i.direction) < 0.3).map(i => i.content),
    ...classicalInsights.filter(i => Math.abs(i.direction) < 0.3).map(i => i.content),
  ];
  // 保守情景：取所有负向观点
  const conservativePoints = [
    ...allInsights.filter(i => i.direction < 0).map(i => i.content),
    ...classicalInsights.filter(i => i.direction < 0).map(i => i.content),
  ];

  // 计算概率（基于现代+古典共识）
  const modernC = crossValidation.modernConsensus;
  const classicalC = crossValidation.classicalConsensus;
  const avgC = (modernC + classicalC) / 2;

  // 把avgC（-1~+1）映射到概率分布
  // avgC=+1: optimistic 70%, neutral 25%, conservative 5%
  // avgC=0:  optimistic 25%, neutral 50%, conservative 25%
  // avgC=-1: optimistic 5%, neutral 25%, conservative 70%
  const t = (avgC + 1) / 2; // 0~1
  const optimisticProb = 0.05 + t * 0.65;
  const conservativeProb = 0.05 + (1 - t) * 0.65;
  const neutralProb = 1 - optimisticProb - conservativeProb;

  const scenarios: ScenarioOutcomeData[] = [
    {
      scenarioPath: 'optimistic',
      probability: optimisticProb,
      description: summarizePoints(optimisticPoints, '乐观情景'),
      keyTurningPoints: extractTurningPoints(optimisticPoints),
      recommendation: '若此情景发生，建议积极把握，但保留10-20%的灵活性应对意外。',
    },
    {
      scenarioPath: 'neutral',
      probability: neutralProb,
      description: summarizePoints(neutralPoints, '中性情景'),
      keyTurningPoints: extractTurningPoints(neutralPoints),
      recommendation: '若此情景发生，建议稳步推进，准备Plan B，每3个月复盘一次。',
    },
    {
      scenarioPath: 'conservative',
      probability: conservativeProb,
      description: summarizePoints(conservativePoints, '保守情景'),
      keyTurningPoints: extractTurningPoints(conservativePoints),
      recommendation: '若此情景发生，建议谨慎观望，优先保护存量，等待时机明朗。',
    },
  ];

  return scenarios;
}

function summarizePoints(points: string[], label: string): string {
  if (points.length === 0) return `${label}：无明显支持观点。`;
  // 简单拼接前3条
  const top3 = points.slice(0, 3).map(p => p.slice(0, 200));
  return `${label}：${top3.join(' | ')}`;
}

function extractTurningPoints(points: string[]): string[] {
  // 从观点中提取关键转折词
  const turningKeywords = ['如果', '若', '一旦', '当', '转折', '关键', '决定性', '触发'];
  const turningPoints: string[] = [];
  for (const p of points) {
    for (const kw of turningKeywords) {
      const idx = p.indexOf(kw);
      if (idx >= 0) {
        const snippet = p.slice(idx, Math.min(idx + 50, p.length));
        turningPoints.push(snippet);
        break;
      }
    }
  }
  return turningPoints.slice(0, 5);
}

// ---------------------------------------------------------------------------
// 综合最终建议
// ---------------------------------------------------------------------------

function generateFinalRecommendation(
  scenarios: ScenarioOutcomeData[],
  crossValidation: CrossValidationMatrix,
): string {
  const quadrantAdvice: Record<string, string> = {
    high_confidence_proceed: '现代推演与古籍验证一致看好，可积极推进，但仍需关注关键转折点。',
    risk_flagged: '现代视角看好但古籍警示，建议谨慎，重点关注古籍警告的具体风险点。',
    timing_issue: '古籍看好但现代阻力大，时机未到，建议等待1-3个月再决策。',
    strong_avoid: '现代古籍双看衰，强烈建议避免此路径，考虑替代方案。',
    insufficient_info: '视角严重分裂，建议补充更多信息后再决策，或寻求第二意见。',
  };

  const topScenario = scenarios.reduce((a, b) => a.probability > b.probability ? a : b);

  return `${quadrantAdvice[crossValidation.quadrant]} 最可能情景：${topScenario.scenarioPath === 'optimistic' ? '乐观' : topScenario.scenarioPath === 'neutral' ? '中性' : '保守'}（概率${Math.round(topScenario.probability * 100)}%）。${topScenario.recommendation}`;
}

// ---------------------------------------------------------------------------
// 提取关键分歧点
// ---------------------------------------------------------------------------

function extractKeyDivergences(
  crossValidation: CrossValidationMatrix,
  classicalResult: ClassicalOrchestrationResult,
): string[] {
  const divergences: string[] = [];

  // 1. 矩阵中分歧最大的对
  const matrix = crossValidation.matrix;
  const divergencePairs: Array<{ pair: string; score: number }> = [];
  for (const [m, classical] of Object.entries(matrix)) {
    for (const [c, score] of Object.entries(classical)) {
      if (score < -0.3) {
        divergencePairs.push({ pair: `${m} ↔ ${c}`, score });
      }
    }
  }
  divergencePairs.sort((a, b) => a.score - b.score);
  for (const p of divergencePairs.slice(0, 3)) {
    divergences.push(`现代与古典分歧：${p.pair}（一致性${p.score.toFixed(2)}）`);
  }

  // 2. 古典内部分歧
  for (const point of classicalResult.divergence.divergencePoints) {
    divergences.push(`古典内部分歧：${point}`);
  }

  return divergences;
}
