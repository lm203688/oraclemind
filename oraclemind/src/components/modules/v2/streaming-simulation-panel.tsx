'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStream, type SSEEvent } from '@/hooks/use-simulation-stream';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScenarioTree, type Scenario } from '@/components/modules/v2/scenario-tree';
import { CrossValidationMatrix } from '@/components/modules/v2/cross-validation-matrix';
import {
  FlaskConical,
  Network,
  Cpu,
  BookOpen,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Activity,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Agent 角色配置
// ---------------------------------------------------------------------------

const AGENT_CONFIG: Record<string, { name: string; category: 'modern' | 'classical'; color: string; bias: number }> = {
  // 现代
  strategist:     { name: '策略师',       category: 'modern', color: 'oklch(0.70 0.12 180)', bias: 0 },
  data_analyst:   { name: '数据师',       category: 'modern', color: 'oklch(0.70 0.12 180)', bias: -0.1 },
  risk_auditor:   { name: '风险师',       category: 'modern', color: 'oklch(0.70 0.12 180)', bias: -0.2 },
  optimist:       { name: '乐观师',       category: 'modern', color: 'oklch(0.70 0.12 180)', bias: 0.2 },
  devil_advocate: { name: '魔鬼代言人',   category: 'modern', color: 'oklch(0.70 0.12 180)', bias: -0.15 },
  // 古典
  yuanhai:    { name: '渊海子平', category: 'classical', color: 'oklch(0.65 0.10 50)', bias: 0 },
  ziping:     { name: '子平真诠', category: 'classical', color: 'oklch(0.65 0.10 50)', bias: 0 },
  sanming:    { name: '三命通会', category: 'classical', color: 'oklch(0.65 0.10 50)', bias: 0 },
  ditianzhui: { name: '滴天髓',   category: 'classical', color: 'oklch(0.65 0.10 50)', bias: 0 },
  qiongtong:  { name: '穷通宝鉴', category: 'classical', color: 'oklch(0.65 0.10 50)', bias: 0 },
};

// ---------------------------------------------------------------------------
// 流式推演面板
// ---------------------------------------------------------------------------

interface StreamingSimulationPanelProps {
  userId: string;
  question: string;
  context?: string;
  birthInfo?: { year: number; month: number; day: number; hour: number };
  rounds?: number;
  simulationType?: 'personal' | 'event';
  onComplete?: (result: any) => void;
  onBack?: () => void;
}

interface AgentOutput {
  round: number;
  agentRole: string;
  agentName: string;
  content: string;
  category: 'modern' | 'classical';
  directionScore?: number;
  consensus?: string;
}

export function StreamingSimulationPanel({
  userId,
  question,
  context,
  birthInfo,
  rounds = 8,
  simulationType = 'personal',
  onComplete,
  onBack,
}: StreamingSimulationPanelProps) {
  const [outputs, setOutputs] = useState<AgentOutput[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [graphInfo, setGraphInfo] = useState<{ summary: string; nodeCount: number; edgeCount: number; keyNodes: any[] } | null>(null);
  const [phase, setPhase] = useState<'graph' | 'simulating' | 'synthesizing' | 'complete' | 'error'>('graph');
  const [elapsed, setElapsed] = useState(0); // 秒
  const [finalResult, setFinalResult] = useState<any>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  const streamUrl = simulationType === 'event'
    ? '/api/simulate/event/stream'
    : '/api/simulate/personal/stream';

  const { start, stop, isStreaming, error } = useSimulationStream(streamUrl, {
    onEvent: (event: SSEEvent) => {
      switch (event.type) {
        case 'start':
          setPhase('graph');
          break;
        case 'graph_built':
          setGraphInfo({
            summary: event.graphSummary,
            nodeCount: event.nodeCount,
            edgeCount: event.edgeCount,
            keyNodes: event.keyNodes,
          });
          setPhase('simulating');
          break;
        case 'classical_done':
          setCurrentRound(event.round);
          for (const report of event.reports) {
            setOutputs(prev => [...prev, {
              round: event.round,
              agentRole: report.bookId,
              agentName: report.bookName,
              content: report.judgment,
              category: 'classical',
              directionScore: report.directionScore,
              consensus: report.consensus,
            }]);
          }
          break;
        case 'agent_start':
          setCurrentAgent(event.agentRole);
          break;
        case 'agent_done':
          setOutputs(prev => [...prev, {
            round: event.round,
            agentRole: event.agentRole,
            agentName: event.agentName,
            content: event.content,
            category: 'modern',
          }]);
          setCurrentAgent(null);
          break;
        case 'round_done':
          break;
        case 'synthesizing':
          setPhase('synthesizing');
          break;
        case 'complete':
          setPhase('complete');
          setFinalResult(event);
          onComplete?.(event);
          break;
        case 'error':
          setPhase('error');
          break;
      }
    },
    onError: (msg) => {
      setPhase('error');
    },
  });

  // 自动开始
  useEffect(() => {
    const body = simulationType === 'event'
      ? { userId, eventDescription: question, context, rounds }
      : { userId, question, context, birthInfo, rounds };
    start(body);
  }, []);

  // 耗时计时器
  useEffect(() => {
    if (phase === 'complete' || phase === 'error') return;
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // 自动滚动到底部
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [outputs, currentAgent]);

  // 按轮次分组
  const outputsByRound = new Map<number, AgentOutput[]>();
  for (const o of outputs) {
    if (!outputsByRound.has(o.round)) outputsByRound.set(o.round, []);
    outputsByRound.get(o.round)!.push(o);
  }

  const phaseLabel = {
    graph: '构建情境图谱',
    simulating: `多轮推演 (${currentRound}/${rounds})`,
    synthesizing: '综合情景树',
    complete: '推演完成',
    error: '推演出错',
  }[phase];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isStreaming && <Loader2 className="size-4 animate-spin text-[oklch(0.70_0.12_180)]" />}
          {phase === 'complete' && <CheckCircle2 className="size-4 text-[oklch(0.70_0.14_145)]" />}
          <span className="text-sm font-semibold text-foreground">{phaseLabel}</span>
          <Badge variant="outline" className="border-[oklch(0.70_0.12_180/20%)] text-[10px] font-mono text-[oklch(0.70_0.12_180)]">
            {outputs.length} outputs
          </Badge>
          {phase !== 'complete' && phase !== 'error' && (
            <Badge variant="outline" className="border-[oklch(0.70_0.12_180/15%)] text-[10px] font-mono text-[oklch(0.55_0.015_200)]">
              <Clock className="mr-1 size-2.5" />
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
            </Badge>
          )}
          {phase === 'complete' && (
            <Badge variant="outline" className="border-[oklch(0.70_0.14_145/20%)] text-[10px] font-mono text-[oklch(0.70_0.14_145)]">
              <Clock className="mr-1 size-2.5" />
              用时 {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && phase !== 'complete' && (
            <Button
              variant="outline"
              size="sm"
              onClick={stop}
              className="h-7 gap-1 text-[11px] border-[oklch(0.65_0.18_25/25%)] text-[oklch(0.65_0.18_25)] hover:bg-[oklch(0.65_0.18_25/8%)]"
            >
              <span className="size-2.5 rounded-sm bg-current" />
              停止
            </Button>
          )}
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-7 text-[11px] text-[oklch(0.50_0.015_200)]"
            >
              ← 返回
            </Button>
          )}
        </div>
      </div>

      {/* 轮次进度条 */}
      {phase !== 'complete' && phase !== 'error' && (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: rounds }, (_, i) => i + 1).map(r => (
            <div
              key={r}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all duration-300',
                r < currentRound && 'bg-[oklch(0.70_0.12_180)]',
                r === currentRound && phase === 'simulating' && 'bg-[oklch(0.70_0.12_180)] lab-pulse',
                r === currentRound && phase === 'synthesizing' && 'bg-[oklch(0.70_0.12_180)]',
                r > currentRound && 'bg-[oklch(0.20_0.008_200)]',
              )}
            />
          ))}
          <span className="ml-2 text-[10px] font-mono text-[oklch(0.50_0.015_200)] shrink-0">
            {currentRound}/{rounds}
          </span>
        </div>
      )}

      {/* Graph info */}
      {graphInfo && (
        <div className="glass-card rounded-lg p-3">
          <div className="mb-1 flex items-center gap-2">
            <Network className="size-3 text-[oklch(0.70_0.12_180)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
              情境图谱
            </span>
            <span className="text-[10px] font-mono text-[oklch(0.45_0.015_200)]">
              {graphInfo.nodeCount} 节点 · {graphInfo.edgeCount} 边
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[oklch(0.65_0.01_200)]">
            {graphInfo.summary}
          </p>
        </div>
      )}

      {/* Error */}
      {error && phase === 'error' && (
        <div className="rounded-lg border border-[oklch(0.65_0.18_25/30%)] bg-[oklch(0.65_0.18_25/5%)] p-3 text-xs text-[oklch(0.65_0.18_25)]">
          推演出错：{error}
        </div>
      )}

      {/* Agent outputs by round */}
      <div className="space-y-3">
        {Array.from(outputsByRound.entries()).map(([round, roundOutputs]) => (
          <motion.div
            key={round}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {/* Round header */}
            <div className="flex items-center gap-2 border-l-2 border-[oklch(0.70_0.12_180/30%)] pl-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.55_0.015_200)]">
                Round {round}
              </span>
              <div className="h-px flex-1 bg-[oklch(0.70_0.12_180/10%)]" />
            </div>

            {/* Classical outputs (5 books) */}
            <div className="rounded border border-[oklch(0.65_0.10_50/15%)] bg-[oklch(0.65_0.10_50/3%)] p-2">
              <div className="mb-1.5 flex items-center gap-1 text-[10px] font-mono text-[oklch(0.65_0.10_50)]">
                <BookOpen className="size-2.5" />
                古典验证层（5本古籍）
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-5">
                {roundOutputs.filter(o => o.category === 'classical').map((o, i) => (
                  <ClassicalCard key={i} output={o} />
                ))}
              </div>
            </div>

            {/* Modern outputs (5 agents) */}
            <div className="rounded border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.70_0.12_180/3%)] p-2">
              <div className="mb-1.5 flex items-center gap-1 text-[10px] font-mono text-[oklch(0.70_0.12_180)]">
                <Cpu className="size-2.5" />
                现代 Agent 层（5个）
              </div>
              <div className="space-y-1.5">
                {roundOutputs.filter(o => o.category === 'modern').map((o, i) => (
                  <ModernAgentCard
                    key={i}
                    output={o}
                    isExpanded={expandedAgent === `${round}-${o.agentRole}`}
                    onToggle={() => setExpandedAgent(
                      expandedAgent === `${round}-${o.agentRole}`
                        ? null
                        : `${round}-${o.agentRole}`
                    )}
                  />
                ))}
                {/* Current agent loading indicator */}
                {currentAgent && round === currentRound && !roundOutputs.find(o => o.agentRole === currentAgent) && (
                  <div className="flex items-center gap-2 rounded border border-dashed border-[oklch(0.70_0.12_180/20%)] p-2">
                    <Loader2 className="size-3 animate-spin text-[oklch(0.70_0.12_180)]" />
                    <span className="text-[11px] text-[oklch(0.55_0.015_200)]">
                      {AGENT_CONFIG[currentAgent]?.name ?? currentAgent} 推演中...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Synthesizing indicator */}
        {phase === 'synthesizing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 rounded-lg border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.70_0.12_180/5%)] p-4"
          >
            <Loader2 className="size-4 animate-spin text-[oklch(0.70_0.12_180)]" />
            <span className="text-sm text-[oklch(0.70_0.12_180)]">综合情景树 + 5×5交叉验证矩阵...</span>
          </motion.div>
        )}

        <div ref={outputEndRef} />
      </div>

      {/* Final result */}
      {phase === 'complete' && finalResult && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Final recommendation */}
          <div className="rounded-lg border border-[oklch(0.70_0.12_180/25%)] bg-[oklch(0.70_0.12_180/8%)] p-4">
            <div className="mb-1 flex items-center gap-2">
              <FlaskConical className="size-3.5 text-[oklch(0.70_0.12_180)]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
                综合建议
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[oklch(0.85_0.01_200)]">
              {finalResult.finalRecommendation}
            </p>
          </div>

          {/* Cross-validation matrix */}
          <div className="glass-card rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="size-3.5 text-[oklch(0.70_0.12_180)]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
                5×5 交叉验证矩阵
              </span>
            </div>
            <CrossValidationMatrix
              matrix={finalResult.crossValidation.matrix}
              modernConsensus={finalResult.crossValidation.modernConsensus}
              classicalConsensus={finalResult.crossValidation.classicalConsensus}
              quadrant={finalResult.crossValidation.quadrant}
              summary={finalResult.crossValidation.summary}
            />
          </div>

          {/* Scenarios */}
          <div className="glass-card rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="size-3.5 text-[oklch(0.70_0.12_180)]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
                三情景路径
              </span>
            </div>
            <ScenarioTree scenarios={finalResult.scenarios} />
          </div>

          {/* Key divergences */}
          {finalResult.keyDivergences.length > 0 && (
            <div className="rounded-lg border border-[oklch(0.65_0.10_50/20%)] bg-[oklch(0.65_0.10_50/5%)] p-4">
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="size-3.5 text-[oklch(0.65_0.10_50)]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.65_0.10_50)]">
                  关键分歧点
                </span>
              </div>
              <ul className="space-y-1">
                {finalResult.keyDivergences.map((d: string, i: number) => (
                  <li key={i} className="text-xs leading-relaxed text-[oklch(0.65_0.01_200)]">
                    · {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 古典验证卡片
// ---------------------------------------------------------------------------

function ClassicalCard({ output }: { output: AgentOutput }) {
  const consensusColor = output.consensus === 'positive'
    ? 'oklch(0.70 0.14 145)'
    : output.consensus === 'negative'
    ? 'oklch(0.65 0.18 25)'
    : 'oklch(0.55 0.015 200)';

  return (
    <div className="rounded border border-[oklch(0.65_0.10_50/20%)] bg-[oklch(0.13_0.005_200/60%)] p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-[oklch(0.65_0.10_50)]">
          {output.agentName}
        </span>
        <span
          className="font-mono-tabular text-[10px] font-bold"
          style={{ color: consensusColor }}
        >
          {output.directionScore !== undefined ? output.directionScore.toFixed(2) : ''}
        </span>
      </div>
      <p className="line-clamp-2 text-[10px] leading-relaxed text-[oklch(0.55_0.01_200)]">
        {output.content}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 现代 Agent 卡片（可展开）
// ---------------------------------------------------------------------------

function ModernAgentCard({
  output,
  isExpanded,
  onToggle,
}: {
  output: AgentOutput;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.13_0.005_200/60%)] p-2">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[oklch(0.70_0.12_180)]" />
          <span className="text-xs font-semibold text-[oklch(0.70_0.12_180)]">
            {output.agentName}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="size-3 text-[oklch(0.45_0.015_200)]" />
        ) : (
          <ChevronDown className="size-3 text-[oklch(0.45_0.015_200)]" />
        )}
      </button>
      <div className={cn('mt-1.5 text-[11px] leading-relaxed text-[oklch(0.65_0.01_200)]', !isExpanded && 'line-clamp-2')}>
        {isExpanded ? (
          <div className="prose prose-sm prose-invert max-w-none
            [&_p]:my-1 [&_p]:leading-relaxed
            [&_h1]:text-sm [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mt-2 [&_h1]:mb-1
            [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-2 [&_h2]:mb-1
            [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-[oklch(0.75_0.01_200)] [&_h3]:mt-1.5 [&_h3]:mb-0.5
            [&_ul]:my-1 [&_ul]:pl-4 [&_ul]:list-disc [&_ul]:space-y-0.5
            [&_ol]:my-1 [&_ol]:pl-4 [&_ol]:list-decimal [&_ol]:space-y-0.5
            [&_li]:text-[11px] [&_li]:leading-relaxed
            [&_strong]:text-foreground [&_strong]:font-semibold
            [&_code]:text-[oklch(0.70_0.12_180)] [&_code]:bg-[oklch(0.20_0.008_200)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[10px] [&_code]:font-mono
            [&_pre]:bg-[oklch(0.11_0.005_200)] [&_pre]:p-2 [&_pre]:rounded [&_pre]:my-1.5 [&_pre]:overflow-x-auto
            [&_pre_code]:bg-transparent [&_pre_code]:p-0
            [&_blockquote]:border-l-2 [&_blockquote]:border-[oklch(0.70_0.12_180/40%)] [&_blockquote]:pl-2 [&_blockquote]:text-[oklch(0.55_0.01_200)] [&_blockquote]:italic
            [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse
            [&_th]:border [&_th]:border-[oklch(0.70_0.12_180/15%)] [&_th]:px-1.5 [&_th]:py-1 [&_th]:text-left [&_th]:bg-[oklch(0.16_0.008_200)] [&_th]:text-[oklch(0.75_0.01_200)] [&_th]:font-semibold [&_th]:text-[10px]
            [&_td]:border [&_td]:border-[oklch(0.70_0.12_180/10%)] [&_td]:px-1.5 [&_td]:py-1 [&_td]:text-[10px]
            [&_hr]:border-[oklch(0.70_0.12_180/15%)] [&_hr]:my-2
            [&_a]:text-[oklch(0.70_0.12_180)] [&_a]:underline
          ">
            <ReactMarkdown>{output.content}</ReactMarkdown>
          </div>
        ) : (
          <span>{output.content.slice(0, 120)}...</span>
        )}
      </div>
    </div>
  );
}
