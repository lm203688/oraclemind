'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { BaziChart, Pillar } from '@/lib/bazi-engine';
import { Star, Sun, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Element color system (gold-tinted for dark cosmic theme) ── */

const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  wood: { bg: 'bg-[oklch(0.25_0.06_145)]', text: 'text-[oklch(0.72_0.16_145)]', border: 'border-[oklch(0.35_0.10_145)]' },
  fire: { bg: 'bg-[oklch(0.25_0.08_25)]', text: 'text-[oklch(0.72_0.18_25)]', border: 'border-[oklch(0.35_0.12_25)]' },
  earth: { bg: 'bg-[oklch(0.22_0.05_75)]', text: 'text-[oklch(0.78_0.14_75)]', border: 'border-[oklch(0.35_0.10_75)]' },
  metal: { bg: 'bg-[oklch(0.20_0.015_265)]', text: 'text-[oklch(0.75_0.03_265)]', border: 'border-[oklch(0.30_0.02_265)]' },
  water: { bg: 'bg-[oklch(0.20_0.04_240)]', text: 'text-[oklch(0.68_0.12_240)]', border: 'border-[oklch(0.30_0.08_240)]' },
};

const ELEMENT_CHINESE: Record<string, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

const ZODIAC_LABELS: Record<string, string> = {
  Rat: '鼠', Ox: '牛', Tiger: '虎', Rabbit: '兔', Dragon: '龙', Snake: '蛇',
  Horse: '马', Goat: '羊', Monkey: '猴', Rooster: '鸡', Dog: '狗', Pig: '猪',
};

/* ── Pillar Card ── */

function PillarCard({ pillar, label, icon, isDayMaster }: {
  pillar: Pillar; label: string; icon: React.ReactNode; isDayMaster: boolean;
}) {
  const stemColors = ELEMENT_COLORS[pillar.stemElement] || ELEMENT_COLORS.earth;
  const branchColors = ELEMENT_COLORS[pillar.branchElement] || ELEMENT_COLORS.earth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center gap-2.5 rounded-xl border p-3 transition-all duration-300',
        isDayMaster
          ? 'border-[oklch(0.78_0.145_85_/30%)] bg-[oklch(0.78_0.145_85_/5%)] shadow-lg shadow-[oklch(0.78_0.145_85_/8%)]'
          : 'border-[oklch(1_0_0_/6%)] bg-[oklch(0.12_0.015_265)]'
      )}
    >
      {/* Label */}
      <div className={cn(
        'flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider',
        isDayMaster ? 'text-[oklch(0.78_0.145_85)]' : 'text-[oklch(0.45_0.02_265)]'
      )}>
        {icon}
        <span>{label}</span>
        {isDayMaster && <Star className="size-3" />}
      </div>

      {/* Heavenly Stem */}
      <div className={cn(
        'flex w-full flex-col items-center rounded-lg border p-2.5',
        stemColors.bg, stemColors.border
      )}>
        <span className="text-[10px] text-[oklch(0.50_0.02_265)]">天干</span>
        <span className={cn('mt-0.5 text-2xl font-bold', stemColors.text)}>
          {pillar.stem}
        </span>
        <span className="mt-0.5 text-[10px] text-[oklch(0.50_0.02_265)]">
          {ELEMENT_CHINESE[pillar.stemElement]}
        </span>
      </div>

      {/* Earthly Branch */}
      <div className={cn(
        'flex w-full flex-col items-center rounded-lg border p-2.5',
        branchColors.bg, branchColors.border
      )}>
        <span className="text-[10px] text-[oklch(0.50_0.02_265)]">地支</span>
        <span className={cn('mt-0.5 text-2xl font-bold', branchColors.text)}>
          {pillar.branch}
        </span>
        <span className="mt-0.5 text-[10px] text-[oklch(0.50_0.02_265)]">
          {ELEMENT_CHINESE[pillar.branchElement]}
        </span>
      </div>

      {/* Hidden Stems */}
      {pillar.hiddenStems.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1">
          <span className="text-[9px] text-[oklch(0.40_0.02_265)]">藏干</span>
          {pillar.hiddenStems.map((hs, i) => (
            <span key={i} className="text-[10px] font-medium text-[oklch(0.70_0.02_265)] bg-[oklch(0.18_0.015_265)] rounded px-1.5 py-0.5">
              {hs}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Element Score Bars ── */

function ElementScoreBar({ scores }: { scores: BaziChart['elementScores'] }) {
  const maxScore = Math.max(...Object.values(scores), 1);
  const elements = [
    { key: 'wood' as const, label: '木', color: 'bg-[oklch(0.72_0.16_145)]' },
    { key: 'fire' as const, label: '火', color: 'bg-[oklch(0.72_0.18_25)]' },
    { key: 'earth' as const, label: '土', color: 'bg-[oklch(0.78_0.14_75)]' },
    { key: 'metal' as const, label: '金', color: 'bg-[oklch(0.60_0.03_265)]' },
    { key: 'water' as const, label: '水', color: 'bg-[oklch(0.65_0.10_240)]' },
  ];

  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-semibold text-[oklch(0.60_0.02_265)] uppercase tracking-wider">
        Five Element Scores
      </h4>
      <div className="space-y-2">
        {elements.map(({ key, label, color }, idx) => {
          const score = scores[key];
          const percentage = (score / maxScore) * 100;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="w-5 text-xs text-[oklch(0.50_0.02_265)]">{label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[oklch(1_0_0_/6%)]">
                <motion.div
                  className={cn('h-full rounded-full', color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.06 }}
                />
              </div>
              <span className="w-5 text-right text-xs font-semibold text-foreground">{score}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Component ── */

interface BaziChartDisplayProps {
  chart: BaziChart;
}

export function BaziChartDisplay({ chart }: BaziChartDisplayProps) {
  const pillars: { pillar: Pillar; label: string; icon: React.ReactNode; isDayMaster: boolean }[] = [
    { pillar: chart.year, label: 'Year 年', icon: <Calendar className="size-3" />, isDayMaster: false },
    { pillar: chart.month, label: 'Month 月', icon: <Sun className="size-3" />, isDayMaster: false },
    { pillar: chart.day, label: 'Day 日', icon: <Star className="size-3" />, isDayMaster: true },
    { pillar: chart.hour, label: 'Hour 时', icon: <Clock className="size-3" />, isDayMaster: false },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Four Pillars</h3>
          <p className="mt-0.5 text-xs text-[oklch(0.45_0.02_265)]">四柱八字</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[oklch(1_0_0_/10%)] text-xs text-[oklch(0.60_0.02_265)]">
            {chart.zodiac} {ZODIAC_LABELS[chart.zodiac] || ''}
          </Badge>
          <Badge variant="outline" className="border-[oklch(1_0_0_/10%)] text-xs text-[oklch(0.60_0.02_265)]">
            {chart.solarTerms}
          </Badge>
        </div>
      </div>

      {/* Day Master Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[oklch(0.78_0.145_85_/15%)] bg-[oklch(0.78_0.145_85_/5%)] p-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[oklch(0.60_0.02_265)]">Day Master 日主</span>
          <span className="text-xl font-bold gold-glow text-[oklch(0.78_0.145_85)]">{chart.dayMaster}</span>
        </div>
        <Separator orientation="vertical" className="h-5 bg-[oklch(1_0_0_/8%)]" />
        <div className="flex items-center gap-1.5 text-xs text-[oklch(0.50_0.02_265)]">
          <span>{ELEMENT_CHINESE[chart.dayMasterElement]} ({chart.dayMasterElement})</span>
        </div>
        <Separator orientation="vertical" className="h-5 bg-[oklch(1_0_0_/8%)]" />
        <div className="flex items-center gap-1.5 text-xs text-[oklch(0.50_0.02_265)]">
          <span>{chart.dayMasterYinYang === 'yang' ? '阳 Yang' : '阴 Yin'}</span>
        </div>
        <Separator orientation="vertical" className="h-5 bg-[oklch(1_0_0_/8%)]" />
        <div className="flex items-center gap-1.5 text-xs text-[oklch(0.50_0.02_265)]">
          <span>{chart.yearPillar}</span>
        </div>
      </motion.div>

      {/* Four Pillars Grid */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pillars.map((item) => (
          <PillarCard key={item.label} {...item} />
        ))}
      </div>

      {/* Ten Gods */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-5 flex flex-wrap gap-2"
      >
        {[
          { label: '年干', value: chart.tenGods.yearStem },
          { label: '月干', value: chart.tenGods.monthStem },
          { label: '时干', value: chart.tenGods.hourStem },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 rounded-lg border border-[oklch(1_0_0_/6%)] bg-[oklch(0.12_0.015_265)] px-3 py-1.5 text-xs"
          >
            <span className="text-[oklch(0.45_0.02_265)]">{item.label}</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Element Score Bars */}
      <ElementScoreBar scores={chart.elementScores} />
    </div>
  );
}