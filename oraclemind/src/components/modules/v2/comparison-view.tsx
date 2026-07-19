'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GitCompare,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SimulationCompareData {
  id: string;
  type: string;
  question: string;
  context: string;
  createdAt: string;
  rounds: number;
  scenarios: Array<{
    scenarioPath: string;
    probability: number;
    description: string;
  }>;
  crossValidation: {
    modernConsensus: number;
    classicalConsensus: number;
    quadrant: string;
  } | null;
  recommendation: string | null;
  feedback: { result: string } | null;
}

interface ComparisonViewProps {
  simulationIds: string[];
  onBack: () => void;
}

const QUADRANT_LABELS: Record<string, string> = {
  high_confidence_proceed: '高置信推进',
  risk_flagged: '风险标注',
  timing_issue: '时机未到',
  strong_avoid: '强烈避免',
  insufficient_info: '信息不足',
};

const QUADRANT_COLORS: Record<string, string> = {
  high_confidence_proceed: 'oklch(0.70 0.14 145)',
  risk_flagged: 'oklch(0.70 0.12 180)',
  timing_issue: 'oklch(0.65 0.10 50)',
  strong_avoid: 'oklch(0.65 0.18 25)',
  insufficient_info: 'oklch(0.55 0.015 200)',
};

// ---------------------------------------------------------------------------

export function ComparisonView({ simulationIds, onBack }: ComparisonViewProps) {
  const [simulations, setSimulations] = useState<SimulationCompareData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all(
        simulationIds.map(id =>
          fetch(`/api/simulation/${id}`).then(r => r.json())
        )
      );

      const parsed: SimulationCompareData[] = [];
      for (const res of results) {
        if (res.success && res.data) {
          const d = res.data;
          let cv: any = null;
          if (d.scenarioOutcomes[0]?.crossValidationResult) {
            try { cv = JSON.parse(d.scenarioOutcomes[0].crossValidationResult); } catch {}
          }
          parsed.push({
            id: d.id,
            type: d.type,
            question: d.seedInput.question ?? d.seedInput.eventDescription ?? '未知',
            context: d.seedInput.personalContext ?? d.seedInput.eventContext ?? '',
            createdAt: d.createdAt,
            rounds: d.rounds,
            scenarios: d.scenarioOutcomes.map(so => ({
              scenarioPath: so.scenarioPath,
              probability: so.probability,
              description: so.description,
            })),
            crossValidation: cv ? {
              modernConsensus: cv.modernConsensus,
              classicalConsensus: cv.classicalConsensus,
              quadrant: cv.quadrant,
            } : null,
            recommendation: d.scenarioOutcomes[0]?.recommendation ?? null,
            feedback: d.feedbacks[0] ? { result: d.feedbacks[0].result } : null,
          });
        }
      }
      setSimulations(parsed);
    } catch (err) {
      console.error('Compare fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [simulationIds]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-7 text-[11px]">
            <ArrowLeft className="size-3" /> 返回
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-[oklch(0.70_0.12_180)]" />
          <span className="ml-2 text-sm text-[oklch(0.55_0.015_200)]">加载对比数据...</span>
        </div>
      </div>
    );
  }

  if (simulations.length < 2) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 text-[11px]">
          <ArrowLeft className="size-3" /> 返回
        </Button>
        <p className="text-sm text-[oklch(0.55_0.015_200)]">需要至少 2 条推演才能对比</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="size-4 text-[oklch(0.70_0.12_180)]" />
          <span className="text-sm font-semibold text-foreground">深度对比</span>
          <Badge variant="outline" className="border-[oklch(0.70_0.12_180/20%)] text-[10px] font-mono text-[oklch(0.70_0.12_180)]">
            {simulations.length} 条推演
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 text-[11px]">
          <ArrowLeft className="size-3" /> 返回
        </Button>
      </div>

      {/* 对比网格 */}
      <div className={cn(
        'grid gap-3',
        simulations.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      )}>
        {simulations.map((sim, idx) => (
          <motion.div
            key={sim.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card rounded-lg p-4"
          >
            {/* 序号 + 类型 */}
            <div className="mb-2 flex items-center justify-between">
              <Badge
                variant="outline"
                className={cn(
                  'text-[9px] font-mono',
                  sim.type === 'personal'
                    ? 'border-[oklch(0.70_0.12_180/25%)] text-[oklch(0.70_0.12_180)]'
                    : 'border-[oklch(0.65_0.10_50/25%)] text-[oklch(0.65_0.10_50)]'
                )}
              >
                #{idx + 1} · {sim.type === 'personal' ? '个人' : '事件'}
              </Badge>
              <span className="text-[9px] font-mono text-[oklch(0.40_0.015_200)]">
                {new Date(sim.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>

            {/* 问题 */}
            <p className="mb-3 text-xs font-medium text-foreground line-clamp-2">
              {sim.question}
            </p>

            {/* 四象限 */}
            {sim.crossValidation && (
              <div className="mb-3">
                <div className="mb-1 text-[9px] font-mono uppercase text-[oklch(0.45_0.015_200)]">综合判定</div>
                <div
                  className="inline-block rounded px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background: `${QUADRANT_COLORS[sim.crossValidation.quadrant]} / 12%`,
                    color: QUADRANT_COLORS[sim.crossValidation.quadrant],
                    border: `1px solid ${QUADRANT_COLORS[sim.crossValidation.quadrant]} / 30%`,
                  }}
                >
                  {QUADRANT_LABELS[sim.crossValidation.quadrant] ?? sim.crossValidation.quadrant}
                </div>
              </div>
            )}

            {/* 共识分对比 */}
            {sim.crossValidation && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded border border-[oklch(0.70_0.12_180/12%)] p-1.5 text-center">
                  <div className="text-[8px] font-mono text-[oklch(0.45_0.015_200)]">现代共识</div>
                  <div className="font-mono-tabular text-sm font-bold text-[oklch(0.70_0.12_180)]">
                    {sim.crossValidation.modernConsensus.toFixed(2)}
                  </div>
                </div>
                <div className="rounded border border-[oklch(0.65_0.10_50/12%)] p-1.5 text-center">
                  <div className="text-[8px] font-mono text-[oklch(0.45_0.015_200)]">古典共识</div>
                  <div className="font-mono-tabular text-sm font-bold text-[oklch(0.65_0.10_50)]">
                    {sim.crossValidation.classicalConsensus.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* 三情景概率 */}
            <div className="mb-3">
              <div className="mb-1 text-[9px] font-mono uppercase text-[oklch(0.45_0.015_200)]">情景分布</div>
              <div className="flex h-2 overflow-hidden rounded-full bg-[oklch(0.20_0.008_200)]">
                {sim.scenarios.map(s => {
                  const color = s.scenarioPath === 'optimistic'
                    ? 'oklch(0.70 0.14 145)'
                    : s.scenarioPath === 'neutral'
                    ? 'oklch(0.70 0.12 180)'
                    : 'oklch(0.65 0.18 25)';
                  return (
                    <div
                      key={s.scenarioPath}
                      style={{ width: `${s.probability * 100}%`, background: color }}
                    />
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-[9px] font-mono">
                {sim.scenarios.map(s => {
                  const color = s.scenarioPath === 'optimistic'
                    ? 'text-[oklch(0.70_0.14_145)]'
                    : s.scenarioPath === 'neutral'
                    ? 'text-[oklch(0.70_0.12_180)]'
                    : 'text-[oklch(0.65_0.18_25)]';
                  return (
                    <span key={s.scenarioPath} className={color}>
                      {Math.round(s.probability * 100)}%
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 验证状态 */}
            {sim.feedback && (
              <div className="mb-2 flex items-center gap-1.5">
                {sim.feedback.result === 'confirmed' && <CheckCircle2 className="size-3 text-[oklch(0.70_0.14_145)]" />}
                {sim.feedback.result === 'partial' && <MinusCircle className="size-3 text-[oklch(0.70_0.12_180)]" />}
                {sim.feedback.result === 'denied' && <XCircle className="size-3 text-[oklch(0.65_0.18_25)]" />}
                <span className="text-[9px] text-[oklch(0.50_0.015_200)]">
                  {sim.feedback.result === 'confirmed' ? '已验证准确' : sim.feedback.result === 'partial' ? '部分准确' : '不准'}
                </span>
              </div>
            )}

            {/* 查看详情链接 */}
            <a
              href={`/share/${sim.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded border border-[oklch(0.70_0.12_180/15%)] py-1 text-center text-[10px] font-mono text-[oklch(0.70_0.12_180)] transition-all hover:bg-[oklch(0.70_0.12_180/8%)]"
            >
              查看完整报告 →
            </a>
          </motion.div>
        ))}
      </div>

      {/* 差异分析 */}
      <DiffAnalysis simulations={simulations} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 差异分析
// ---------------------------------------------------------------------------

function DiffAnalysis({ simulations }: { simulations: SimulationCompareData[] }) {
  // 计算差异
  const modernScores = simulations.map(s => s.crossValidation?.modernConsensus ?? 0);
  const classicalScores = simulations.map(s => s.crossValidation?.classicalConsensus ?? 0);

  const modernMax = Math.max(...modernScores);
  const modernMin = Math.min(...modernScores);
  const classicalMax = Math.max(...classicalScores);
  const classicalMin = Math.min(...classicalScores);

  const modernDiff = modernMax - modernMin;
  const classicalDiff = classicalMax - classicalMin;

  // 最乐观 vs 最保守
  const optimisticProbs = simulations.map(s => s.scenarios.find(sc => sc.scenarioPath === 'optimistic')?.probability ?? 0);
  const mostOptimisticIdx = optimisticProbs.indexOf(Math.max(...optimisticProbs));
  const mostConservativeIdx = optimisticProbs.indexOf(Math.min(...optimisticProbs));

  const insights: string[] = [];

  if (modernDiff > 0.3) {
    insights.push(`现代Agent共识分歧较大（差值 ${modernDiff.toFixed(2)}），说明现代视角对当前问题的判断分裂`);
  } else if (modernDiff < 0.1) {
    insights.push(`现代Agent共识高度一致（差值仅 ${modernDiff.toFixed(2)}），跨推演判断稳定`);
  }

  if (classicalDiff > 0.3) {
    insights.push(`古籍验证层分歧明显（差值 ${classicalDiff.toFixed(2)}），不同时间/背景下的古典判定有差异`);
  }

  if (mostOptimisticIdx !== mostConservativeIdx) {
    insights.push(`推演 #${mostOptimisticIdx + 1} 乐观概率最高（${Math.round(optimisticProbs[mostOptimisticIdx] * 100)}%），而 #${mostConservativeIdx + 1} 最保守（${Math.round(optimisticProbs[mostConservativeIdx] * 100)}%）`);
  }

  // 验证状态对比
  const confirmedCount = simulations.filter(s => s.feedback?.result === 'confirmed').length;
  const deniedCount = simulations.filter(s => s.feedback?.result === 'denied').length;
  if (confirmedCount > 0) {
    insights.push(`${confirmedCount} 条推演已被验证准确`);
  }
  if (deniedCount > 0) {
    insights.push(`${deniedCount} 条推演验证不准，可作为反面案例参考`);
  }

  if (insights.length === 0) {
    insights.push('各推演结果差异较小，判断方向一致');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-lg border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.70_0.12_180/5%)] p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <GitCompare className="size-3.5 text-[oklch(0.70_0.12_180)]" />
        <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
          差异分析
        </span>
      </div>
      <ul className="space-y-1.5">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-[oklch(0.65_0.01_200)]">
            <span className="mt-0.5 text-[oklch(0.70_0.12_180)]">·</span>
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
