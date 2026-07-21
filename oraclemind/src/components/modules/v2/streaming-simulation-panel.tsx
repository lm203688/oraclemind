'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Clock, Sparkles, Zap, Orbit } from 'lucide-react';
import { useSimulationStream } from '@/hooks/use-simulation-stream';

interface StreamingSimulationPanelProps {
  userId: string;
  question: string;
  context?: string;
  birthInfo?: { year: number; month: number; day: number; hour: number };
  rounds?: number;
  simulationType?: 'personal' | 'event' | 'compass';
  onComplete?: (result: any) => void;
  onBack?: () => void;
}

export function StreamingSimulationPanel({
  userId, question, context, birthInfo, rounds = 3, simulationType = 'personal', onComplete, onBack,
}: StreamingSimulationPanelProps) {
  const [phase, setPhase] = useState<'summoning' | 'scanning' | 'converging' | 'complete' | 'error'>('summoning');
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeOrbs, setActiveOrbs] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(Date.now());

  const apiUrl = simulationType === 'event'
    ? `/api/simulate/event/stream`
    : `/api/simulate/personal/stream`;

  const { start, stop, isStreaming } = useSimulationStream(apiUrl, {
    onEvent: (event: any) => {
      if (event.type === 'start') {
        setPhase('scanning');
        setProgress(10);
      } else if (event.type === 'graph_built') {
        setProgress(25);
        setActiveOrbs(5);
      } else if (event.type === 'classical_done') {
        setProgress(45);
        setActiveOrbs(10);
      } else if (event.type === 'agent_start') {
        setProgress(50 + Math.floor(Math.random() * 30));
      } else if (event.type === 'agent_done') {
        setActiveOrbs(prev => Math.min(prev + 1, 15));
        setProgress(prev => Math.min(prev + 5, 85));
      } else if (event.type === 'round_done') {
        setProgress(70);
      } else if (event.type === 'synthesizing') {
        setPhase('converging');
        setProgress(85);
      } else if (event.type === 'complete') {
        setPhase('complete');
        setProgress(100);
        setFinalResult(event);
        onComplete?.(event);
      } else if (event.type === 'error') {
        setError(event.message);
        setPhase('error');
      }
    },
    onError: (msg: string) => { setError(msg); setPhase('error'); },
    onComplete: () => {},
  });

  // 计时 + 超时检测
  useEffect(() => {
    const timer = setInterval(() => {
      const sec = Math.floor((Date.now() - startTime.current) / 1000);
      setElapsed(sec);
      // 超时保护——120秒后如果还在scanning，显示超时提示
      if (sec > 120 && phase === 'scanning') {
        setError('Forecast is taking longer than expected. The oracle engine may be under heavy load. Please try again.');
        setPhase('error');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // 自动启动
  useEffect(() => {
    const body: any = { userId, question, rounds };
    if (context) body.context = context;
    if (birthInfo) body.birthInfo = birthInfo;
    start(body);
    // eslint-disable-next-line
  }, []);

  // 自动滚动
  useEffect(() => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [phase]);

  const phaseLabel = {
    summoning: 'Initializing Oracle Engine',
    scanning: 'Scanning Probability Space',
    converging: 'Converging Multidimensional Signals',
    complete: 'Forecast Complete',
    error: 'Signal Disrupted',
  }[phase];

  const phaseDesc = {
    summoning: 'Aligning quantum pathways...',
    scanning: 'Cross-validating across 10 dimensional vectors...',
    converging: 'Synthesizing divergent signals into unified forecast...',
    complete: '',
    error: '',
  }[phase];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isStreaming && <Orbit className="size-5 animate-spin text-[oklch(0.70_0.12_180)]" style={{ animationDuration: '2s' }} />}
          {phase === 'complete' && <CheckCircle2 className="size-5 text-[oklch(0.70_0.14_145)]" />}
          <div>
            <div className="text-sm font-semibold text-foreground">{phaseLabel}</div>
            <div className="text-[10px] text-[oklch(0.50_0.015_200)]">{phaseDesc}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono">
            <Clock className="mr-1 size-2.5" />
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
          </Badge>
          {isStreaming && (
            <Button variant="outline" size="sm" onClick={stop} className="h-7 text-[11px]">
              Stop
            </Button>
          )}
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="h-7 text-[11px]">
              ← Back
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-[oklch(0.50_0.015_200)]">{progress}%</span>
          <span className="text-[10px] font-mono text-[oklch(0.50_0.015_200)]">{activeOrbs} signals</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[oklch(0.20_0.005_200)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[oklch(0.70_0.12_180)] via-[oklch(0.70_0.14_145)] to-[oklch(0.70_0.18_50)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Visual orb display */}
      {phase !== 'complete' && phase !== 'error' && (
        <div className="mb-6 flex h-40 items-center justify-center">
          <div className="relative">
            {/* Central orb */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="size-16 rounded-full bg-gradient-to-br from-[oklch(0.70_0.12_180/30%)] to-[oklch(0.70_0.18_50/10%)] backdrop-blur" />
            </motion.div>
            
            {/* Orbiting orbs */}
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i / 10) * 360;
              const delay = i * 0.1;
              const active = i < activeOrbs;
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay }}
                  style={{ transformOrigin: '0 0' }}
                >
                  <div
                    className={`size-3 rounded-full transition-all duration-500 ${active ? 'bg-[oklch(0.70_0.12_180)] shadow-[0_0_12px_oklch(0.70_0.12_180/50%)]' : 'bg-[oklch(0.30_0.005_200)]'}`}
                    style={{
                      transform: `rotate(${angle}deg) translateX(80px)`,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && phase === 'error' && (
        <div className="rounded-lg border border-[oklch(0.65_0.18_25/30%)] bg-[oklch(0.65_0.18_25/5%)] p-4 text-sm text-[oklch(0.65_0.18_25)]">
          ⚠ {error}
        </div>
      )}

      {/* Final synthesized result */}
      <div ref={outputRef} />
      {phase === 'complete' && finalResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SynthesizedResult result={finalResult} elapsed={elapsed} />
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 综合结果展示——只给一个结论，不分别展示各agent
// ---------------------------------------------------------------------------

function SynthesizedResult({ result, elapsed }: { result: any; elapsed: number }) {
  const recommendation = result.finalRecommendation || '';
  const scenarios = result.scenarios || [];
  const keyDivergences = result.keyDivergences || [];

  // 提取概率
  const topScenario = scenarios.reduce((a: any, b: any) => (a.probability > b.probability ? a : b), scenarios[0] || {});
  const probability = Math.round((topScenario.probability || 0) * 100);
  const scenarioLabel = topScenario.scenarioPath === 'optimistic' ? 'Favorable' : topScenario.scenarioPath === 'neutral' ? 'Transitional' : 'Challenging';

  // 置信度
  const quadrant = result.crossValidation?.quadrant || 'insufficient_info';
  const confidenceLabel = {
    high_confidence_proceed: 'High Confidence',
    risk_flagged: 'Cautious Optimism',
    timing_issue: 'Timing Sensitive',
    strong_avoid: 'High Risk',
    insufficient_info: 'Mixed Signals',
  }[quadrant] || 'Analyzing';

  const confidenceColor = {
    high_confidence_proceed: 'oklch(0.70 0.14 145)',
    risk_flagged: 'oklch(0.70 0.18 50)',
    timing_issue: 'oklch(0.70 0.12 180)',
    strong_avoid: 'oklch(0.65 0.18 25)',
    insufficient_info: 'oklch(0.55 0.015 200)',
  }[quadrant] || 'oklch(0.55 0.015 200)';

  return (
    <div className="space-y-4">
      {/* 主结论卡片 */}
      <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.70_0.12_180/20%)] bg-gradient-to-br from-[oklch(0.13_0.005_200/80%)] to-[oklch(0.13_0.02_280/60%)] p-6">
        {/* 光效 */}
        <div className="absolute -right-20 -top-20 size-40 rounded-full bg-[oklch(0.70_0.12_180/10%)] blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-[oklch(0.70_0.18_50/10%)] blur-3xl" />

        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-4 text-[oklch(0.70_0.12_180)]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">Oracle Forecast</span>
            <Badge variant="outline" className="ml-auto text-[10px]" style={{ color: confidenceColor, borderColor: `${confidenceColor.replace('oklch(', 'oklch('}/20%)` }}>
              {confidenceLabel}
            </Badge>
          </div>

          {/* 概率 */}
          <div className="mb-4 flex items-end gap-3">
            <span className="text-5xl font-bold text-foreground">{probability}%</span>
            <span className="mb-1 text-sm text-[oklch(0.50_0.015_200)]">{scenarioLabel} outcome</span>
          </div>

          {/* 综合建议——只给一个结论 */}
          <p className="text-base leading-relaxed text-foreground">
            {recommendation}
          </p>

          {/* 元信息 */}
          <div className="mt-4 flex items-center gap-3 text-[10px] font-mono text-[oklch(0.40_0.015_200)]">
            <span><Clock className="mr-1 inline size-2.5" />{elapsed}s</span>
            <span>·</span>
            <span>{scenarios.length} scenarios analyzed</span>
            <span>·</span>
            <span>10 vectors cross-validated</span>
          </div>
        </div>
      </div>

      {/* 三条情景路径——简洁版 */}
      {scenarios.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {scenarios.map((s: any, i: number) => {
            const pct = Math.round(s.probability * 100);
            const label = s.scenarioPath === 'optimistic' ? 'Favorable' : s.scenarioPath === 'neutral' ? 'Transitional' : 'Challenging';
            const color = s.scenarioPath === 'optimistic' ? 'oklch(0.70 0.14 145)' : s.scenarioPath === 'neutral' ? 'oklch(0.70 0.12 180)' : 'oklch(0.65 0.18 25)';
            return (
              <div key={i} className="rounded-lg border border-[oklch(0.20_0.005_200)] bg-[oklch(0.13_0.005_200/60%)] p-3">
                <div className="text-[10px] font-mono text-[oklch(0.50_0.015_200)]">{label}</div>
                <div className="mt-1 text-lg font-bold" style={{ color }}>{pct}%</div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[oklch(0.20_0.005_200)]">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 关键分歧——如果有 */}
      {keyDivergences.length > 0 && (
        <div className="rounded-lg border border-[oklch(0.65_0.10_50/15%)] bg-[oklch(0.65_0.10_50/3%)] p-4">
          <div className="mb-2 text-[10px] font-mono uppercase text-[oklch(0.65_0.10_50)]">Signal Divergences</div>
          <ul className="space-y-1">
            {keyDivergences.map((d: string, i: number) => (
              <li key={i} className="text-xs text-[oklch(0.60_0.01_200)]">· {d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
