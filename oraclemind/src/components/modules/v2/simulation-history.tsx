'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  History,
  Download,
  GitCompare,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  Activity,
  Network,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScenarioTree, type Scenario } from './scenario-tree';
import { CrossValidationMatrix } from './cross-validation-matrix';
import { AgentTraceExplorer, type AgentTraceData } from './agent-trace-explorer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SimulationSummary {
  id: string;
  type: string;
  seedInput: string;
  graphSnapshot: string | null;
  status: string;
  rounds: number;
  createdAt: string;
  completedAt: string | null;
  scenarioOutcomes: Array<{
    id: string;
    scenarioPath: string;
    probability: number;
    description: string;
  }>;
  feedbacks: Array<{
    id: string;
    result: string;
  }>;
}

interface SimulationDetail {
  id: string;
  type: string;
  seedInput: any;
  graphSnapshot: string | null;
  baziSnapshot: any;
  status: string;
  rounds: number;
  createdAt: string;
  completedAt: string | null;
  scenarioOutcomes: Array<{
    id: string;
    scenarioPath: string;
    probability: number;
    description: string;
    keyTurningPoints: string | null;
    crossValidationResult: string | null;
    modernConsensus: number;
    classicalConsensus: number;
    recommendation: string | null;
  }>;
  agentTraces: AgentTraceData[];
  feedbacks: Array<{
    id: string;
    result: string;
    comment: string | null;
  }>;
}

// ---------------------------------------------------------------------------
// 主组件
// ---------------------------------------------------------------------------

interface SimulationHistoryProps {
  userId: string;
  onBack?: () => void;
  onCompare?: (ids: string[]) => void;
}

export function SimulationHistory({ userId, onBack, onCompare }: SimulationHistoryProps) {
  const [simulations, setSimulations] = useState<SimulationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SimulationDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());

  // 加载历史列表
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/simulations/${userId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSimulations(json.data);
      }
    } catch (err) {
      console.error('Fetch history failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 加载详情
  const fetchDetail = useCallback(async (id: string) => {
    setSelectedId(id);
    setIsLoadingDetail(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/simulation/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDetail(json.data);
      }
    } catch (err) {
      console.error('Fetch detail failed:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // 列表视图
  if (!selectedId) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-[oklch(0.70_0.12_180)]" />
            <span className="text-sm font-semibold text-foreground">历史推演</span>
            {simulations.length > 0 && (
              <Badge variant="outline" className="border-[oklch(0.70_0.12_180/20%)] text-[10px] font-mono text-[oklch(0.70_0.12_180)]">
                {simulations.length} 条
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* 导出数据 */}
            {simulations.length > 0 && (
              <div className="flex items-center gap-1">
                <a
                  href={`/api/export-data/${userId}?format=json`}
                  className="flex items-center gap-1 rounded border border-[oklch(0.70_0.12_180/25%)] px-2 py-1 text-[10px] font-mono text-[oklch(0.70_0.12_180)] transition-all hover:bg-[oklch(0.70_0.12_180/8%)]"
                  title="导出为JSON（含完整Agent轨迹）"
                >
                  <Download className="size-2.5" />
                  JSON
                </a>
                <a
                  href={`/api/export-data/${userId}?format=csv`}
                  className="flex items-center gap-1 rounded border border-[oklch(0.70_0.12_180/25%)] px-2 py-1 text-[10px] font-mono text-[oklch(0.70_0.12_180)] transition-all hover:bg-[oklch(0.70_0.12_180/8%)]"
                  title="导出为CSV（精简版，适合Excel）"
                >
                  <Download className="size-2.5" />
                  CSV
                </a>
              </div>
            )}
            {onCompare && simulations.length >= 2 && (
              compareMode ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (selectedForCompare.size >= 2) {
                        onCompare(Array.from(selectedForCompare));
                      }
                    }}
                    disabled={selectedForCompare.size < 2}
                    className="h-7 gap-1 bg-[oklch(0.70_0.12_180)] text-[11px] text-[oklch(0.13_0.005_200)] hover:bg-[oklch(0.75_0.14_180)]"
                  >
                    <GitCompare className="size-3" />
                    对比 ({selectedForCompare.size})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setCompareMode(false); setSelectedForCompare(new Set()); }}
                    className="h-7 text-[11px]"
                  >
                    取消
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareMode(true)}
                  className="h-7 gap-1 text-[11px] border-[oklch(0.70_0.12_180/25%)] text-[oklch(0.70_0.12_180)]"
                >
                  <GitCompare className="size-3" />
                  对比模式
                </Button>
              )
            )}
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-7 text-[11px] text-[oklch(0.50_0.015_200)]"
              >
                <ArrowLeft className="size-3" />
                返回首页
              </Button>
            )}
          </div>
        </div>

        {/* 对比模式提示 */}
        {compareMode && (
          <div className="rounded-lg border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.70_0.12_180/5%)] p-2.5 text-center">
            <p className="text-[11px] text-[oklch(0.60_0.015_200)]">
              勾选 2-3 条推演进行对比 · 已选 {selectedForCompare.size} 条
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && simulations.length === 0 && (
          <div className="rounded-lg border border-dashed border-[oklch(0.70_0.12_180/20%)] p-12 text-center">
            <History className="mx-auto mb-3 size-8 text-[oklch(0.40_0.015_200)]" />
            <p className="text-sm text-[oklch(0.55_0.015_200)]">还没有历史推演记录</p>
            <p className="mt-1 text-[11px] text-[oklch(0.40_0.015_200)]">
              完成一次推演后，会在这里显示
            </p>
          </div>
        )}

        {/* 列表 */}
        {!isLoading && simulations.length > 0 && (
          <div className="space-y-2">
            {simulations.map((sim, idx) => {
              const isSelectedForCompare = selectedForCompare.has(sim.id);
              return (
              <motion.div
                key={sim.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => {
                  if (compareMode) {
                    const newSet = new Set(selectedForCompare);
                    if (newSet.has(sim.id)) {
                      newSet.delete(sim.id);
                    } else if (newSet.size < 3) {
                      newSet.add(sim.id);
                    }
                    setSelectedForCompare(newSet);
                  } else {
                    fetchDetail(sim.id);
                  }
                }}
                className={cn(
                  'cursor-pointer rounded-lg border bg-[oklch(0.16_0.008_200/60%)] p-3 backdrop-blur-sm transition-all hover:border-[oklch(0.70_0.12_180/35%)] hover:bg-[oklch(0.18_0.015_200/80%)]',
                  compareMode && isSelectedForCompare
                    ? 'border-[oklch(0.70_0.12_180)] ring-1 ring-[oklch(0.70_0.12_180/30%)]'
                    : 'border-[oklch(0.70_0.12_180/15%)]'
                )}
              >
                {/* 对比模式勾选标记 */}
                {compareMode && (
                  <div className="mb-2 flex items-center gap-2">
                    <div className={cn(
                      'flex size-4 items-center justify-center rounded border',
                      isSelectedForCompare
                        ? 'border-[oklch(0.70_0.12_180)] bg-[oklch(0.70_0.12_180)]'
                        : 'border-[oklch(0.70_0.12_180/30%)]'
                    )}>
                      {isSelectedForCompare && <CheckCircle2 className="size-3 text-[oklch(0.13_0.005_200)]" />}
                    </div>
                    <span className="text-[9px] font-mono text-[oklch(0.50_0.015_200)]">
                      {isSelectedForCompare ? '已选中' : '点击选择'}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* 类型 + 时间 */}
                    <div className="mb-1.5 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[9px] font-mono',
                          sim.type === 'personal'
                            ? 'border-[oklch(0.70_0.12_180/25%)] text-[oklch(0.70_0.12_180)]'
                            : 'border-[oklch(0.65_0.10_50/25%)] text-[oklch(0.65_0.10_50)]'
                        )}
                      >
                        {sim.type === 'personal' ? '个人推演' : '事件推演'}
                      </Badge>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[oklch(0.45_0.015_200)]">
                        <Clock className="size-2.5" />
                        {formatDate(sim.createdAt)}
                      </span>
                      <span className="text-[10px] font-mono text-[oklch(0.45_0.015_200)]">
                        {sim.rounds}轮
                      </span>
                    </div>

                    {/* 问题 */}
                    <p className="text-sm text-foreground line-clamp-1">
                      {sim.seedInput}
                    </p>

                    {/* 情景概率条 */}
                    {sim.scenarioOutcomes.length > 0 && (
                      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[oklch(0.20_0.008_200)]">
                        {sim.scenarioOutcomes.map((so) => {
                          const color = so.scenarioPath === 'optimistic'
                            ? 'oklch(0.70 0.14 145)'
                            : so.scenarioPath === 'neutral'
                            ? 'oklch(0.70 0.12 180)'
                            : 'oklch(0.65 0.18 25)';
                          return (
                            <div
                              key={so.id}
                              style={{ width: `${so.probability * 100}%`, background: color }}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* 验证状态 */}
                    {sim.feedbacks.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1">
                        {sim.feedbacks.map(f => (
                          <Badge
                            key={f.id}
                            variant="outline"
                            className={cn(
                              'text-[9px]',
                              f.result === 'confirmed' && 'border-[oklch(0.35_0.10_145)] text-[oklch(0.70_0.14_145)]',
                              f.result === 'partial' && 'border-[oklch(0.35_0.10_180)] text-[oklch(0.70_0.12_180)]',
                              f.result === 'denied' && 'border-[oklch(0.35_0.12_25)] text-[oklch(0.65_0.18_25)]'
                            )}
                          >
                            {f.result === 'confirmed' && <CheckCircle2 className="mr-0.5 size-2.5" />}
                            {f.result === 'partial' && <MinusCircle className="mr-0.5 size-2.5" />}
                            {f.result === 'denied' && <XCircle className="mr-0.5 size-2.5" />}
                            {f.result === 'confirmed' ? '已验证准确' : f.result === 'partial' ? '部分准确' : '不准'}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {!compareMode && (
                    <ChevronRight className="size-4 shrink-0 text-[oklch(0.40_0.015_200)]" />
                  )}
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 详情视图
  return (
    <SimulationDetailView
      detail={detail}
      isLoading={isLoadingDetail}
      onBack={() => { setSelectedId(null); setDetail(null); }}
    />
  );
}

// ---------------------------------------------------------------------------
// 详情视图
// ---------------------------------------------------------------------------

function SimulationDetailView({
  detail,
  isLoading,
  onBack,
}: {
  detail: SimulationDetail | null;
  isLoading: boolean;
  onBack: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-7 text-[11px]">
            <ArrowLeft className="size-3" /> 返回列表
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-[oklch(0.70_0.12_180)]" />
          <span className="ml-2 text-sm text-[oklch(0.55_0.015_200)]">加载推演详情...</span>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 text-[11px]">
          <ArrowLeft className="size-3" /> 返回列表
        </Button>
        <p className="text-sm text-[oklch(0.55_0.015_200)]">加载失败</p>
      </div>
    );
  }

  const question = detail.seedInput.question ?? detail.seedInput.eventDescription ?? '未知问题';
  const isPersonal = detail.type === 'personal';

  // 解析交叉验证矩阵
  let crossValidation: any = null;
  if (detail.scenarioOutcomes[0]?.crossValidationResult) {
    try {
      crossValidation = JSON.parse(detail.scenarioOutcomes[0].crossValidationResult);
    } catch {}
  }

  const scenarios: Scenario[] = detail.scenarioOutcomes.map(so => ({
    scenarioPath: so.scenarioPath as 'optimistic' | 'neutral' | 'conservative',
    probability: so.probability,
    description: so.description,
    keyTurningPoints: so.keyTurningPoints ? JSON.parse(so.keyTurningPoints) : [],
    recommendation: so.recommendation ?? '',
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 text-[11px] text-[oklch(0.50_0.015_200)]">
          <ArrowLeft className="size-3" /> 返回列表
        </Button>
        <div className="flex items-center gap-2">
          <a
            href={`/export/${detail.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded border border-[oklch(0.70_0.12_180/25%)] px-3 py-1.5 text-[11px] font-mono text-[oklch(0.70_0.12_180)] transition-all hover:border-[oklch(0.70_0.12_180/50%)] hover:bg-[oklch(0.70_0.12_180/8%)]"
          >
            <Download className="size-3" />
            导出报告
          </a>
          <Badge variant="outline" className="text-[10px] font-mono text-[oklch(0.45_0.015_200)]">
            {formatDate(detail.createdAt)}
          </Badge>
        </div>
      </div>

      {/* 问题 */}
      <div className="glass-card rounded-lg p-4">
        <div className="mb-1 flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'text-[9px] font-mono',
              isPersonal
                ? 'border-[oklch(0.70_0.12_180/25%)] text-[oklch(0.70_0.12_180)]'
                : 'border-[oklch(0.65_0.10_50/25%)] text-[oklch(0.65_0.10_50)]'
            )}
          >
            {isPersonal ? '个人推演' : '事件推演'}
          </Badge>
          <span className="text-[10px] font-mono text-[oklch(0.45_0.015_200)]">
            {detail.rounds}轮 · {detail.agentTraces.length} traces
          </span>
        </div>
        <p className="text-sm font-medium text-foreground">{question}</p>
        {detail.seedInput.personalContext && (
          <p className="mt-1 text-[11px] text-[oklch(0.55_0.015_200)]">
            背景：{detail.seedInput.personalContext}
          </p>
        )}
        {detail.seedInput.eventContext && (
          <p className="mt-1 text-[11px] text-[oklch(0.55_0.015_200)]">
            背景：{detail.seedInput.eventContext}
          </p>
        )}
      </div>

      {/* 图谱摘要 */}
      {detail.graphSnapshot && (
        <div className="glass-card rounded-lg p-3">
          <div className="mb-1 flex items-center gap-2">
            <Network className="size-3 text-[oklch(0.70_0.12_180)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
              情境图谱
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[oklch(0.65_0.01_200)]">
            {detail.graphSnapshot}
          </p>
        </div>
      )}

      {/* 综合建议 */}
      {detail.scenarioOutcomes[0]?.recommendation && (
        <div className="rounded-lg border border-[oklch(0.70_0.12_180/25%)] bg-[oklch(0.70_0.12_180/8%)] p-4">
          <div className="mb-1 flex items-center gap-2">
            <Activity className="size-3.5 text-[oklch(0.70_0.12_180)]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
              综合建议
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[oklch(0.85_0.01_200)]">
            {detail.scenarioOutcomes[0].recommendation}
          </p>
        </div>
      )}

      {/* 交叉验证矩阵 */}
      {crossValidation && (
        <div className="glass-card rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
              5×5 交叉验证矩阵
            </span>
          </div>
          <CrossValidationMatrix
            matrix={crossValidation.matrix}
            modernConsensus={crossValidation.modernConsensus}
            classicalConsensus={crossValidation.classicalConsensus}
            quadrant={crossValidation.quadrant}
            summary={crossValidation.summary}
          />
        </div>
      )}

      {/* 三情景 */}
      {scenarios.length > 0 && (
        <div className="glass-card rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="size-3.5 text-[oklch(0.70_0.12_180)]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
              三情景路径
            </span>
          </div>
          <ScenarioTree scenarios={scenarios} />
        </div>
      )}

      {/* Agent 轨迹 */}
      {detail.agentTraces.length > 0 && (
        <div className="glass-card rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
              Agent 推演轨迹
            </span>
            <Badge variant="outline" className="border-[oklch(0.70_0.12_180/15%)] text-[10px] font-mono text-[oklch(0.70_0.12_180)]">
              {detail.agentTraces.length} traces
            </Badge>
          </div>
          <AgentTraceExplorer traces={detail.agentTraces} totalRounds={detail.rounds} />
        </div>
      )}

      {/* 验证状态 */}
      {detail.feedbacks.length > 0 && (
        <div className="rounded-lg border border-[oklch(0.70_0.14_145/20%)] bg-[oklch(0.70_0.14_145/5%)] p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-[oklch(0.70_0.14_145)]" />
            <span className="text-xs font-mono text-[oklch(0.70_0.14_145)]">
              您的验证：{detail.feedbacks[0].result === 'confirmed' ? '准确' : detail.feedbacks[0].result === 'partial' ? '部分准确' : '不准'}
            </span>
          </div>
          {detail.feedbacks[0].comment && (
            <p className="mt-1 text-[11px] text-[oklch(0.55_0.015_200)]">{detail.feedbacks[0].comment}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 日期格式化
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
