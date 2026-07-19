'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Minus, TrendingDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Scenario {
  scenarioPath: 'optimistic' | 'neutral' | 'conservative';
  probability: number;
  description: string;
  keyTurningPoints: string[];
  recommendation: string;
}

interface ScenarioTreeProps {
  scenarios: Scenario[];
  onSelect?: (scenario: Scenario) => void;
  selected?: string;
}

const SCENARIO_CONFIG = {
  optimistic: {
    label: '乐观情景',
    labelEn: 'Optimistic',
    color: 'oklch(0.70 0.14 145)',
    colorDim: 'oklch(0.55 0.10 145)',
    bg: 'oklch(0.70 0.14 145 / 8%)',
    border: 'oklch(0.70 0.14 145 / 25%)',
    icon: TrendingUp,
  },
  neutral: {
    label: '中性情景',
    labelEn: 'Neutral',
    color: 'oklch(0.70 0.12 180)',
    colorDim: 'oklch(0.55 0.10 180)',
    bg: 'oklch(0.70 0.12 180 / 8%)',
    border: 'oklch(0.70 0.12 180 / 25%)',
    icon: Minus,
  },
  conservative: {
    label: '保守情景',
    labelEn: 'Conservative',
    color: 'oklch(0.65 0.18 25)',
    colorDim: 'oklch(0.50 0.14 25)',
    bg: 'oklch(0.65 0.18 25 / 8%)',
    border: 'oklch(0.65 0.18 25 / 25%)',
    icon: TrendingDown,
  },
};

export function ScenarioTree({ scenarios, onSelect, selected }: ScenarioTreeProps) {
  return (
    <div className="space-y-3">
      {/* Probability bar */}
      <div className="flex h-2 overflow-hidden rounded-full bg-[oklch(0.20_0.008_200)]">
        {scenarios.map((s) => {
          const config = SCENARIO_CONFIG[s.scenarioPath];
          return (
            <motion.div
              key={s.scenarioPath}
              initial={{ width: 0 }}
              animate={{ width: `${s.probability * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ background: `oklch(${config.color.split(' ')[0].replace('oklch(', '').replace(')', '')})` }}
            />
          );
        })}
      </div>

      {/* Scenario cards */}
      <div className="grid gap-3 lg:grid-cols-3">
        {scenarios.map((scenario, idx) => {
          const config = SCENARIO_CONFIG[scenario.scenarioPath];
          const Icon = config.icon;
          const isSelected = selected === scenario.scenarioPath;

          return (
            <motion.div
              key={scenario.scenarioPath}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => onSelect?.(scenario)}
              className={cn(
                'cursor-pointer rounded-lg border p-4 backdrop-blur-sm transition-all',
                isSelected ? 'ring-1 ring-offset-0' : '',
              )}
              style={{
                background: config.bg,
                borderColor: config.border,
                ...(isSelected ? { '--tw-ring-color': config.color } as any : {}),
              }}
            >
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="size-4" style={{ color: config.color }} />
                  <span className="text-sm font-semibold" style={{ color: config.color }}>
                    {config.label}
                  </span>
                </div>
                <span
                  className="font-mono-tabular text-lg font-bold"
                  style={{ color: config.color }}
                >
                  {Math.round(scenario.probability * 100)}%
                </span>
              </div>

              {/* Description */}
              <p className="mb-3 text-xs leading-relaxed text-[oklch(0.65_0.01_200)] line-clamp-3">
                {scenario.description}
              </p>

              {/* Key turning points */}
              {scenario.keyTurningPoints.length > 0 && (
                <div className="mb-3 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.45_0.015_200)]">
                    关键转折点
                  </div>
                  {scenario.keyTurningPoints.slice(0, 2).map((tp, i) => (
                    <div key={i} className="flex items-start gap-1 text-[11px] text-[oklch(0.55_0.01_200)]">
                      <ArrowRight className="mt-0.5 size-2.5 shrink-0" style={{ color: config.colorDim }} />
                      <span className="line-clamp-1">{tp}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendation */}
              <div className="rounded border-l-2 pl-2 text-[10px] leading-relaxed text-[oklch(0.50_0.015_200)]"
                style={{ borderColor: config.colorDim }}
              >
                {scenario.recommendation}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
