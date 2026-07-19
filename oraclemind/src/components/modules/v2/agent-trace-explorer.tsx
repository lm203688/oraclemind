'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Cpu, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AgentTraceData {
  id: string;
  agentRole: string;
  agentCategory: 'modern' | 'classical';
  round: number;
  actionType: string;
  content: string;
  reasoning?: string;
  createdAt: string;
}

interface AgentTraceExplorerProps {
  traces: AgentTraceData[];
  totalRounds: number;
}

const ROLE_CONFIG: Record<string, { name: string; category: 'modern' | 'classical'; color: string }> = {
  // 现代5Agent
  strategist: { name: '策略师', category: 'modern', color: 'oklch(0.70 0.12 180)' },
  data_analyst: { name: '数据师', category: 'modern', color: 'oklch(0.70 0.12 180)' },
  risk_auditor: { name: '风险师', category: 'modern', color: 'oklch(0.70 0.12 180)' },
  optimist: { name: '乐观师', category: 'modern', color: 'oklch(0.70 0.12 180)' },
  devil_advocate: { name: '魔鬼代言人', category: 'modern', color: 'oklch(0.70 0.12 180)' },
  // 古典5Agent
  yuanhai: { name: '渊海子平', category: 'classical', color: 'oklch(0.65 0.10 50)' },
  ziping: { name: '子平真诠', category: 'classical', color: 'oklch(0.65 0.10 50)' },
  sanming: { name: '三命通会', category: 'classical', color: 'oklch(0.65 0.10 50)' },
  ditianzhui: { name: '滴天髓', category: 'classical', color: 'oklch(0.65 0.10 50)' },
  qiongtong: { name: '穷通宝鉴', category: 'classical', color: 'oklch(0.65 0.10 50)' },
};

export function AgentTraceExplorer({ traces, totalRounds }: AgentTraceExplorerProps) {
  const [expandedRound, setExpandedRound] = useState<number | null>(totalRounds);
  const [selectedTrace, setSelectedTrace] = useState<AgentTraceData | null>(null);

  // 按轮次分组
  const tracesByRound = new Map<number, AgentTraceData[]>();
  for (const trace of traces) {
    if (!tracesByRound.has(trace.round)) tracesByRound.set(trace.round, []);
    tracesByRound.get(trace.round)!.push(trace);
  }

  return (
    <div className="space-y-2">
      {/* Round selector */}
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => (
          <button
            key={round}
            onClick={() => setExpandedRound(expandedRound === round ? null : round)}
            className={cn(
              'flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-mono transition-all',
              expandedRound === round
                ? 'border-[oklch(0.70_0.12_180)] bg-[oklch(0.70_0.12_180/10%)] text-[oklch(0.70_0.12_180)]'
                : 'border-[oklch(0.70_0.12_180/15%)] text-[oklch(0.50_0.015_200)] hover:border-[oklch(0.70_0.12_180/30%)]'
            )}
          >
            <Clock className="size-2.5" />
            Round {round}
          </button>
        ))}
      </div>

      {/* Expanded round content */}
      <AnimatePresence>
        {expandedRound && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {/* Modern agents row */}
            <div>
              <div className="mb-1 flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
                <Cpu className="size-3" />
                Modern Agents (5)
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {tracesByRound.get(expandedRound)
                  ?.filter(t => t.agentCategory === 'modern')
                  .map(trace => (
                    <TraceCard
                      key={trace.id}
                      trace={trace}
                      onClick={() => setSelectedTrace(selectedTrace?.id === trace.id ? null : trace)}
                      isSelected={selectedTrace?.id === trace.id}
                    />
                  ))}
              </div>
            </div>

            {/* Classical agents row */}
            <div>
              <div className="mb-1 flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[oklch(0.65_0.10_50)]">
                <BookOpen className="size-3" />
                Classical Verification (5 books)
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {tracesByRound.get(expandedRound)
                  ?.filter(t => t.agentCategory === 'classical')
                  .map(trace => (
                    <TraceCard
                      key={trace.id}
                      trace={trace}
                      onClick={() => setSelectedTrace(selectedTrace?.id === trace.id ? null : trace)}
                      isSelected={selectedTrace?.id === trace.id}
                    />
                  ))}
              </div>
            </div>

            {/* Selected trace detail */}
            <AnimatePresence>
              {selectedTrace && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.16_0.008_200/80%)] p-4 backdrop-blur-sm"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: ROLE_CONFIG[selectedTrace.agentRole]?.color }}
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {ROLE_CONFIG[selectedTrace.agentRole]?.name ?? selectedTrace.agentRole}
                      </span>
                      <span className="text-[10px] font-mono text-[oklch(0.45_0.015_200)]">
                        Round {selectedTrace.round} · {selectedTrace.actionType}
                      </span>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-xs leading-relaxed text-[oklch(0.70_0.01_200)]">
                    {selectedTrace.content}
                  </div>
                  {selectedTrace.reasoning && (
                    <div className="mt-3 rounded border-l-2 border-[oklch(0.70_0.12_180/30%)] pl-3">
                      <div className="mb-1 text-[10px] font-mono uppercase text-[oklch(0.45_0.015_200)]">
                        Structured Reasoning
                      </div>
                      <pre className="text-[10px] leading-relaxed text-[oklch(0.55_0.01_200)] overflow-x-auto">
                        {(() => {
                          try { return JSON.stringify(JSON.parse(selectedTrace.reasoning), null, 2); }
                          catch { return selectedTrace.reasoning; }
                        })()}
                      </pre>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TraceCard({
  trace,
  onClick,
  isSelected,
}: {
  trace: AgentTraceData;
  onClick: () => void;
  isSelected: boolean;
}) {
  const config = ROLE_CONFIG[trace.agentRole];
  const isClassical = trace.agentCategory === 'classical';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded border p-2.5 transition-all',
        isSelected && 'ring-1',
      )}
      style={{
        background: isClassical ? 'oklch(0.65 0.10 50 / 5%)' : 'oklch(0.70 0.12 180 / 5%)',
        borderColor: isClassical ? 'oklch(0.65 0.10 50 / 20%)' : 'oklch(0.70 0.12 180 / 20%)',
        ...(isSelected ? { '--tw-ring-color': config?.color } as any : {}),
      }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: config?.color }}>
          {config?.name ?? trace.agentRole}
        </span>
        <span className="text-[9px] font-mono text-[oklch(0.40_0.015_200)] uppercase">
          {trace.actionType}
        </span>
      </div>
      <p className="line-clamp-3 text-[11px] leading-relaxed text-[oklch(0.60_0.01_200)]">
        {trace.content}
      </p>
    </motion.div>
  );
}
