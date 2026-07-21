'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FlaskConical,
  Network,
  Activity,
  Cpu,
  BookOpen,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { ScenarioTree, type Scenario } from '@/components/modules/v2/scenario-tree';
import { CrossValidationMatrix } from '@/components/modules/v2/cross-validation-matrix';
import { AgentTraceExplorer, type AgentTraceData } from '@/components/modules/v2/agent-trace-explorer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShareData {
  id: string;
  type: string;
  seedInput: any;
  graphSnapshot: string | null;
  status: string;
  rounds: number;
  createdAt: string;
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
}

// ---------------------------------------------------------------------------
// 主组件
// ---------------------------------------------------------------------------

export function SharePage({ id }: { id: string }) {
  const [data, setData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/simulation/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || '加载失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="size-6 animate-spin text-[oklch(0.70_0.12_180)]" />
          <span className="text-sm text-[oklch(0.55_0.015_200)]">加载分享的推演报告...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-[oklch(0.65_0.18_25)]">{error || '报告不存在'}</p>
          <p className="mt-2 text-[11px] text-[oklch(0.40_0.015_200)]">
            分享链接可能已失效
          </p>
        </div>
      </div>
    );
  }

  const question = data.seedInput.question ?? data.seedInput.eventDescription ?? '未知问题';
  const context = data.seedInput.personalContext ?? data.seedInput.eventContext ?? '';
  const isPersonal = data.type === 'personal';

  let crossValidation: any = null;
  if (data.scenarioOutcomes[0]?.crossValidationResult) {
    try { crossValidation = JSON.parse(data.scenarioOutcomes[0].crossValidationResult); } catch {}
  }

  const scenarios: Scenario[] = data.scenarioOutcomes.map(so => ({
    scenarioPath: so.scenarioPath as 'optimistic' | 'neutral' | 'conservative',
    probability: so.probability,
    description: so.description,
    keyTurningPoints: so.keyTurningPoints ? JSON.parse(so.keyTurningPoints) : [],
    recommendation: so.recommendation ?? '',
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/80%)] backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.16_0.008_200)]">
              <FlaskConical className="size-3.5 text-[oklch(0.70_0.12_180)]" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-[oklch(0.60_0.015_200)] font-mono">
              OracleMind · 分享报告
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/export/${data.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded border border-[oklch(0.70_0.12_180/25%)] px-2.5 py-1 text-[10px] font-mono text-[oklch(0.70_0.12_180)] transition-all hover:bg-[oklch(0.70_0.12_180/8%)]"
            >
              <Download className="size-3" />
              导出PDF
            </a>
            <a
              href="/"
              className="flex items-center gap-1 text-[10px] font-mono text-[oklch(0.50_0.015_200)] hover:text-[oklch(0.70_0.12_180)]"
            >
              <ArrowLeft className="size-3" />
              我也要推演
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        {/* 分享提示 */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.70_0.12_180/5%)] p-3 text-center"
        >
          <p className="text-[11px] text-[oklch(0.60_0.015_200)]">
            🔗 这是别人分享给你的推演报告 ·{' '}
            <a href="/" className="text-[oklch(0.70_0.12_180)] underline">
              点击这里创建你自己的推演
            </a>
          </p>
        </motion.div>

        {/* 问题 */}
        <div className="glass-card rounded-lg p-4">
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                isPersonal
                  ? 'border-[oklch(0.70_0.12_180/25%)] text-[10px] text-[oklch(0.70_0.12_180)]'
                  : 'border-[oklch(0.65_0.10_50/25%)] text-[10px] text-[oklch(0.65_0.10_50)]'
              }
            >
              {isPersonal ? '个人推演' : '事件推演'}
            </Badge>
            <span className="text-[10px] font-mono text-[oklch(0.45_0.015_200)]">
              {data.rounds}轮 · {data.agentTraces.length} traces · {new Date(data.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">{question}</p>
          {context && (
            <p className="mt-1 text-[11px] text-[oklch(0.55_0.015_200)]">背景：{context}</p>
          )}
        </div>

        {/* 图谱摘要 */}
        {data.graphSnapshot && (
          <div className="glass-card rounded-lg p-3">
            <div className="mb-1 flex items-center gap-2">
              <Network className="size-3 text-[oklch(0.70_0.12_180)]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
                情境图谱
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[oklch(0.65_0.01_200)]">{data.graphSnapshot}</p>
          </div>
        )}

        {/* 综合建议 */}
        {data.scenarioOutcomes[0]?.recommendation && (
          <div className="rounded-lg border border-[oklch(0.70_0.12_180/25%)] bg-[oklch(0.70_0.12_180/8%)] p-4">
            <div className="mb-1 flex items-center gap-2">
              <Activity className="size-3.5 text-[oklch(0.70_0.12_180)]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
                综合建议
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[oklch(0.85_0.01_200)]">
              {data.scenarioOutcomes[0].recommendation}
            </p>
          </div>
        )}

        {/* 交叉验证矩阵 */}
        {crossValidation && (
          <div className="glass-card rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="size-3.5 text-[oklch(0.70_0.12_180)]" />
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
        {data.agentTraces.length > 0 && (
          <div className="glass-card rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="size-3.5 text-[oklch(0.70_0.12_180)]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
                Agent 推演轨迹
              </span>
              <Badge variant="outline" className="border-[oklch(0.70_0.12_180/15%)] text-[10px] font-mono text-[oklch(0.70_0.12_180)]">
                {data.agentTraces.length} traces
              </Badge>
            </div>
            <AgentTraceExplorer traces={data.agentTraces} totalRounds={data.rounds} />
          </div>
        )}

        {/* 底部 CTA */}
        <div className="rounded-lg border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.16_0.008_200/60%)] p-6 text-center">
          <FlaskConical className="mx-auto mb-2 size-6 text-[oklch(0.70_0.12_180)]" />
          <p className="text-sm font-semibold text-foreground">想推演你自己的问题？</p>
          <p className="mt-1 text-[11px] text-[oklch(0.55_0.015_200)]">
            5维现代推演 + 5维古典验证 · 不是算命，是概率推演
          </p>
          <a href="/">
            <Button className="mt-3 h-9 gap-2 bg-[oklch(0.70_0.12_180)] text-[oklch(0.13_0.005_200)] hover:bg-[oklch(0.75_0.14_180)]">
              <FlaskConical className="size-3.5" />
              开始我的推演
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
