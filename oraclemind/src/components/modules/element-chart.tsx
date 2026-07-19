'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from 'recharts';
import type { ElementScores } from '@/lib/bazi-engine';
import { Leaf, Flame, Mountain, Swords, Droplets } from 'lucide-react';

const ELEMENT_META: Record<string, { zh: string; en: string; color: string; icon: React.ReactNode }> = {
  wood: { zh: '木', en: 'Wood', color: '#6bc26f', icon: <Leaf className="size-3.5" /> },
  fire: { zh: '火', en: 'Fire', color: '#e86464', icon: <Flame className="size-3.5" /> },
  earth: { zh: '土', en: 'Earth', color: '#d4a853', icon: <Mountain className="size-3.5" /> },
  metal: { zh: '金', en: 'Metal', color: '#8b8fa3', icon: <Swords className="size-3.5" /> },
  water: { zh: '水', en: 'Water', color: '#5b9bd5', icon: <Droplets className="size-3.5" /> },
};

const ELEMENTS_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

function getBalanceText(scores: ElementScores): string {
  const entries = ELEMENTS_ORDER.map((el) => ({ el, score: scores[el as keyof ElementScores] }));
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  if (strongest.score === weakest.score) return 'Perfectly balanced across all elements.';

  const parts: string[] = [];
  if (strongest.score >= 3) {
    parts.push(`${ELEMENT_META[strongest.el].en} dominant (${ELEMENT_META[strongest.el].zh})`);
  }
  if (weakest.score <= 1) {
    parts.push(`${ELEMENT_META[weakest.el].en} weak (${ELEMENT_META[weakest.el].zh})`);
  }

  return parts.length > 0 ? parts.join(', ') + '.' : 'Relatively balanced elements.';
}

interface ElementChartProps {
  scores: ElementScores;
}

export function ElementChart({ scores }: ElementChartProps) {
  const balanceText = getBalanceText(scores);

  const radarData = ELEMENTS_ORDER.map((el) => ({
    element: ELEMENT_META[el].zh,
    fullLabel: `${ELEMENT_META[el].zh} ${ELEMENT_META[el].en}`,
    score: scores[el as keyof ElementScores],
    fullMark: 8,
  }));

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Five Elements</h3>
        <p className="mt-0.5 text-xs text-[oklch(0.45_0.02_265)]">五行分布</p>
      </div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-[280px]"
      >
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="oklch(1 0 0 / 6%)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="element"
                tick={{ fontSize: 13, fill: 'oklch(0.60 0.02 265)' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 8]}
                tick={{ fontSize: 9, fill: 'oklch(0.40 0.02 265)' }}
                tickCount={5}
                axisLine={false}
              />
              <Radar
                name="Elements"
                dataKey="score"
                stroke="#c9a24d"
                fill="#c9a24d"
                fillOpacity={0.12}
                strokeWidth={1.5}
                dot={{ r: 3, fill: '#c9a24d', strokeWidth: 0 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Element Breakdown */}
      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {ELEMENTS_ORDER.map((el, idx) => {
          const meta = ELEMENT_META[el];
          const score = scores[el as keyof ElementScores];
          return (
            <motion.div
              key={el}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="flex items-center justify-center text-[oklch(0.50_0.02_265)]">
                {meta.icon}
              </div>
              <span className="text-xs font-bold" style={{ color: meta.color }}>
                {meta.zh}
              </span>
              <span className="text-[10px] text-[oklch(0.40_0.02_265)]">{meta.en}</span>
              <span className="text-sm font-bold text-foreground">{score}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Balance Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-4 rounded-lg border border-[oklch(1_0_0_/6%)] bg-[oklch(0.12_0.015_265)] p-3 text-center"
      >
        <p className="text-xs text-[oklch(0.50_0.02_265)] leading-relaxed">
          {balanceText}
        </p>
      </motion.div>
    </div>
  );
}