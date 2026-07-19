/**
 * Classical Orchestrator — 5本古籍并行执行 + 内部分歧检测
 *
 * 5本书各自独立运行，互不依赖，可并行执行。
 * 输出5份独立的《古典验证报告》+ 1份内部分歧分析。
 */

import { BaziChart } from './bazi-foundation';
import {
  ClassicalAgentContext,
  ClassicalVerificationReport,
  ClassicalDivergenceAnalysis,
  ClassicalBookId,
} from './classical-types';
import { ditianzhuiVerify } from './ditianzhui-agent';
import { zipingVerify } from './ziping-agent';
import { qiongtongVerify } from './qiongtong-agent';
import { yuanhaiVerify } from './yuanhai-agent';
import { sanmingVerify } from './sanming-agent';

export interface ClassicalOrchestrationResult {
  reports: ClassicalVerificationReport[];
  divergence: ClassicalDivergenceAnalysis;
  /** 古典综合方向分（5本平均） */
  consensusScore: number;
  /** 古典综合判定 */
  consensus: 'positive' | 'neutral' | 'negative';
}

/**
 * 并行执行5本古籍验证
 *
 * 这5本书是同步纯计算（无LLM调用），所以用Promise.all模拟并行即可。
 * 实际部署中如果加入LLM增强（让古籍Agent调用LLM做更细致的解读），
 * 这里会变成真正的并行异步调用。
 */
export async function runClassicalVerification(
  ctx: ClassicalAgentContext,
): Promise<ClassicalOrchestrationResult> {
  const [yuanhai, ziping, sanming, ditianzhui, qiongtong] = await Promise.all([
    Promise.resolve(yuanhaiVerify(ctx)),
    Promise.resolve(zipingVerify(ctx)),
    Promise.resolve(sanmingVerify(ctx)),
    Promise.resolve(ditianzhuiVerify(ctx)),
    Promise.resolve(qiongtongVerify(ctx)),
  ]);

  const reports: ClassicalVerificationReport[] = [
    yuanhai, ziping, sanming, ditianzhui, qiongtong,
  ];

  const divergence = analyzeDivergence(reports);

  // 古典综合方向分（5本平均，加权：滴天髓和子平真诠权重高）
  const weights: Record<ClassicalBookId, number> = {
    ditianzhui: 0.30,  // 旺衰派核心
    ziping: 0.25,      // 格局派系统化
    sanming: 0.20,     // 综合派
    qiongtong: 0.15,   // 调候派
    yuanhai: 0.10,     // 祖本基础
  };

  const consensusScore = reports.reduce((sum, r) => sum + r.directionScore * weights[r.bookId], 0);
  const consensus: ClassicalOrchestrationResult['consensus'] =
    consensusScore > 0.2 ? 'positive' : consensusScore < -0.2 ? 'negative' : 'neutral';

  return {
    reports,
    divergence,
    consensusScore,
    consensus,
  };
}

// ---------------------------------------------------------------------------
// 内部分歧检测
// ---------------------------------------------------------------------------

function analyzeDivergence(reports: ClassicalVerificationReport[]): ClassicalDivergenceAnalysis {
  const yuanhai = reports.find(r => r.bookId === 'yuanhai')!;
  const ziping = reports.find(r => r.bookId === 'ziping')!;
  const sanming = reports.find(r => r.bookId === 'sanming')!;
  const ditianzhui = reports.find(r => r.bookId === 'ditianzhui')!;
  const qiongtong = reports.find(r => r.bookId === 'qiongtong')!;

  // 格局派内部一致性（渊海、子平真诠、三命通会）
  const patternScores = [yuanhai.directionScore, ziping.directionScore, sanming.directionScore];
  const patternConsensus = computeConsensus(patternScores);

  // 旺衰派 vs 格局派
  const strengthVsPattern = computeConsensus([ditianzhui.directionScore, avg(patternScores)]);

  // 调候派 vs 其他4本
  const othersAvg = avg([yuanhai.directionScore, ziping.directionScore, sanming.directionScore, ditianzhui.directionScore]);
  const climateVsOthers = computeConsensus([qiongtong.directionScore, othersAvg]);

  // 总体一致性
  const allScores = reports.map(r => r.directionScore);
  const overallConsensus = computeConsensus(allScores);

  // 分歧点
  const divergencePoints: string[] = [];

  if (patternConsensus === 'low') {
    divergencePoints.push('格局派内部（渊海子平/子平真诠/三命通会）判定分歧');
  }
  if (strengthVsPattern === 'low') {
    divergencePoints.push('旺衰派（滴天髓）与格局派判定分歧');
  }
  if (climateVsOthers === 'low') {
    divergencePoints.push('调候派（穷通宝鉴）与其他古籍判定分歧，多涉及时机问题');
  }

  const classicalConsensus = avg(allScores);

  return {
    patternSchoolConsensus: patternConsensus,
    strengthVsPatternConsensus: strengthVsPattern,
    climateVsOthersConsensus: climateVsOthers,
    overallConsensus,
    divergencePoints,
    classicalConsensus,
  };
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function computeConsensus(scores: number[]): 'high' | 'medium' | 'low' {
  if (scores.length < 2) return 'high';
  const mean = avg(scores);
  const variance = avg(scores.map(s => (s - mean) ** 2));
  const std = Math.sqrt(variance);
  if (std < 0.25) return 'high';
  if (std < 0.5) return 'medium';
  return 'low';
}
