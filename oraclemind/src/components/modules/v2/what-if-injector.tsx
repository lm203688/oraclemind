'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GitBranch, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WhatIfBranch {
  id: string;
  injectedVariable: string;
  divergencePoint: string;
  newScenarios?: Array<{
    scenarioPath: string;
    probability: number;
    description: string;
  }>;
  createdAt: string;
}

interface WhatIfInjectorProps {
  parentSimulationId: string;
  branches: WhatIfBranch[];
  onInject: (variable: string) => Promise<void>;
  isRunning?: boolean;
}

const SUGGESTED_VARIABLES = [
  '如果我换城市呢？',
  '如果我延迟6个月呢？',
  '如果家人反对呢？',
  '如果市场崩盘呢？',
  '如果合作伙伴退出呢？',
];

export function WhatIfInjector({
  parentSimulationId,
  branches,
  onInject,
  isRunning,
}: WhatIfInjectorProps) {
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleInject = async () => {
    if (!input.trim()) return;
    await onInject(input.trim());
    setInput('');
    setShowInput(false);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="size-3.5 text-[oklch(0.70_0.12_180)]" />
          <span className="text-sm font-semibold text-foreground">What-If 反事实推演</span>
          {branches.length > 0 && (
            <span className="rounded border border-[oklch(0.70_0.12_180/20%)] px-1.5 py-0.5 text-[10px] font-mono text-[oklch(0.70_0.12_180)]">
              {branches.length} branches
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowInput(!showInput)}
          className="h-7 gap-1 text-[11px] border-[oklch(0.70_0.12_180/25%)] text-[oklch(0.70_0.12_180)] hover:bg-[oklch(0.70_0.12_180/8%)]"
        >
          <Plus className="size-3" />
          新增假设
        </Button>
      </div>

      {/* Input panel */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='输入你想测试的假设条件，如"如果我明年换城市呢？"'
              className="min-h-[60px] resize-none border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.16_0.008_200)] text-sm placeholder:text-[oklch(0.40_0.015_200)] focus:border-[oklch(0.70_0.12_180)]"
              rows={2}
            />
            {/* Suggested variables */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_VARIABLES.map(v => (
                <button
                  key={v}
                  onClick={() => setInput(v)}
                  className="rounded-full border border-[oklch(0.70_0.12_180/15%)] px-2.5 py-0.5 text-[10px] text-[oklch(0.55_0.015_200)] transition-all hover:border-[oklch(0.70_0.12_180/30%)] hover:text-[oklch(0.70_0.12_180)]"
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setShowInput(false); setInput(''); }}
                className="h-7 text-[11px] text-[oklch(0.50_0.015_200)]"
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleInject}
                disabled={!input.trim() || isRunning}
                className="h-7 gap-1 bg-[oklch(0.70_0.12_180)] text-[11px] text-[oklch(0.13_0.005_200)] hover:bg-[oklch(0.75_0.14_180)]"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    推演中...
                  </>
                ) : (
                  <>
                    <GitBranch className="size-3" />
                    跑一次
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Branches list */}
      {branches.length > 0 && (
        <div className="space-y-2">
          {branches.map((branch, idx) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.16_0.008_200/60%)] p-3"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="font-mono text-[10px] text-[oklch(0.45_0.015_200)]">
                  #{idx + 1}
                </span>
                <span className="text-xs font-medium text-[oklch(0.70_0.12_180)]">
                  假设：{branch.injectedVariable}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-[oklch(0.60_0.01_200)]">
                {branch.divergencePoint}
              </p>
              {branch.newScenarios && branch.newScenarios.length > 0 && (
                <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[oklch(0.20_0.008_200)]">
                  {branch.newScenarios.map((s) => {
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
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {branches.length === 0 && !showInput && (
        <div className="rounded border border-dashed border-[oklch(0.70_0.12_180/20%)] p-6 text-center">
          <GitBranch className="mx-auto mb-2 size-6 text-[oklch(0.40_0.015_200)]" />
          <p className="text-xs text-[oklch(0.50_0.015_200)]">
            还没有反事实推演。点击"新增假设"测试不同变量下的未来。
          </p>
        </div>
      )}
    </div>
  );
}
