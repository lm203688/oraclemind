'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CrossValidationMatrixProps {
  matrix: Record<string, Record<string, number>>;
  modernConsensus: number;
  classicalConsensus: number;
  quadrant: string;
  summary: string;
}

const MODERN_LABELS: Record<string, { name: string; short: string }> = {
  strategist: { name: '◈ 天枢', short: '天枢' },
  data_analyst: { name: '◈ 天璇', short: '天璇' },
  risk_auditor: { name: '◈ 天玑', short: '天玑' },
  optimist: { name: '◈ 天权', short: '天权' },
  devil_advocate: { name: '◈ 玉衡', short: '玉衡' },
};

const CLASSICAL_LABELS: Record<string, { name: string; short: string }> = {
  yuanhai: { name: '◇ 源流', short: '源流' },
  ziping: { name: '◇ 格局', short: '格局' },
  sanming: { name: '◇ 综鉴', short: '综鉴' },
  ditianzhui: { name: '◇ 旺衰', short: '旺衰' },
  qiongtong: { name: '◇ 调候', short: '调候' },
};

const QUADRANT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  high_confidence_proceed: { label: '高置信推进', color: 'oklch(0.70 0.14 145)', bg: 'oklch(0.70 0.14 145 / 10%)' },
  risk_flagged: { label: '风险标注', color: 'oklch(0.70 0.12 180)', bg: 'oklch(0.70 0.12 180 / 10%)' },
  timing_issue: { label: '时机未到', color: 'oklch(0.65 0.10 50)', bg: 'oklch(0.65 0.10 50 / 10%)' },
  strong_avoid: { label: '强烈避免', color: 'oklch(0.65 0.18 25)', bg: 'oklch(0.65 0.18 25 / 10%)' },
  insufficient_info: { label: '信息不足', color: 'oklch(0.55 0.015 200)', bg: 'oklch(0.55 0.015 200 / 10%)' },
};

function scoreToColor(score: number): string {
  if (score > 0.5) return 'oklch(0.70 0.14 145 / 80%)';     // 高一致 — 绿
  if (score > 0.2) return 'oklch(0.70 0.14 145 / 40%)';     // 中一致 — 浅绿
  if (score > -0.2) return 'oklch(0.55 0.015 200 / 30%)';   // 中性 — 灰
  if (score > -0.5) return 'oklch(0.65 0.18 25 / 40%)';     // 中分歧 — 浅红
  return 'oklch(0.65 0.18 25 / 80%)';                        // 高分歧 — 红
}

export function CrossValidationMatrix({
  matrix,
  modernConsensus,
  classicalConsensus,
  quadrant,
  summary,
}: CrossValidationMatrixProps) {
  const modernRoles = Object.keys(matrix);
  const classicalBooks = modernRoles.length > 0 ? Object.keys(matrix[modernRoles[0]]) : [];
  const quadrantConfig = QUADRANT_CONFIG[quadrant] ?? QUADRANT_CONFIG.insufficient_info;

  return (
    <div className="space-y-4">
      {/* Quadrant banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg border p-3"
        style={{ background: quadrantConfig.bg, borderColor: quadrantConfig.color }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.45_0.015_200)]">
              四象限综合判定
            </div>
            <div className="mt-0.5 text-sm font-bold" style={{ color: quadrantConfig.color }}>
              {quadrantConfig.label}
            </div>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <div className="text-[10px] font-mono text-[oklch(0.45_0.015_200)]">现代共识</div>
              <div className="font-mono-tabular text-sm font-bold text-[oklch(0.70_0.12_180)]">
                {modernConsensus.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[oklch(0.45_0.015_200)]">古典共识</div>
              <div className="font-mono-tabular text-sm font-bold text-[oklch(0.65_0.10_50)]">
                {classicalConsensus.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Matrix grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          {/* Header row: classical books */}
          <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 mb-1">
            <div></div>
            {classicalBooks.map(book => (
              <div key={book} className="text-center">
                <div className="text-[10px] font-mono text-[oklch(0.65_0.10_50)]">
                  {CLASSICAL_LABELS[book]?.short ?? book}
                </div>
                <div className="text-[9px] text-[oklch(0.40_0.015_200)]">
                  {CLASSICAL_LABELS[book]?.name ?? book}
                </div>
              </div>
            ))}
          </div>

          {/* Matrix rows: modern agents */}
          {modernRoles.map(role => (
            <div key={role} className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 mb-1">
              <div className="flex items-center justify-end pr-2">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[oklch(0.70_0.12_180)]">
                    {MODERN_LABELS[role]?.short ?? role}
                  </div>
                  <div className="text-[9px] text-[oklch(0.40_0.015_200)]">
                    {MODERN_LABELS[role]?.name ?? role}
                  </div>
                </div>
              </div>
              {classicalBooks.map(book => {
                const score = matrix[role]?.[book] ?? 0;
                return (
                  <motion.div
                    key={book}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'matrix-cell relative flex h-12 items-center justify-center rounded border text-xs font-mono-tabular font-bold',
                    )}
                    style={{
                      background: scoreToColor(score),
                      borderColor: 'oklch(1 0 0 / 5%)',
                      color: Math.abs(score) > 0.5 ? 'oklch(0.13 0.005 200)' : 'oklch(0.70 0.01 200)',
                    }}
                    title={`${MODERN_LABELS[role]?.name ?? role} ↔ ${CLASSICAL_LABELS[book]?.name ?? book}: ${score.toFixed(2)}`}
                  >
                    {score > 0 ? '+' : ''}{score.toFixed(2)}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[oklch(0.50_0.015_200)]">
        <span className="flex items-center gap-1">
          <span className="size-3 rounded" style={{ background: 'oklch(0.70 0.14 145 / 80%)' }} />
          高一致
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded" style={{ background: 'oklch(0.55 0.015 200 / 30%)' }} />
          中性
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded" style={{ background: 'oklch(0.65 0.18 25 / 80%)' }} />
          高分歧
        </span>
        <span className="ml-auto text-[oklch(0.40_0.015_200)]">
          矩阵范围：-1.00 ~ +1.00
        </span>
      </div>

      {/* Summary */}
      <div className="rounded border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.16_0.008_200/60%)] p-3 text-xs leading-relaxed text-[oklch(0.60_0.015_200)]">
        {summary}
      </div>
    </div>
  );
}
