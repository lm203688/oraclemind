'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { LuckPillar } from '@/lib/bazi-engine';
import { Clock, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const ELEMENT_COLORS: Record<string, { text: string }> = {
  wood: { text: 'text-[oklch(0.72_0.16_145)]' },
  fire: { text: 'text-[oklch(0.72_0.18_25)]' },
  earth: { text: 'text-[oklch(0.78_0.14_75)]' },
  metal: { text: 'text-[oklch(0.75_0.03_265)]' },
  water: { text: 'text-[oklch(0.68_0.12_240)]' },
};

const ELEMENT_CHINESE: Record<string, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

const TEN_GOD_THEMES: Record<string, string[]> = {
  '正官': ['Authority gains', 'Stable career', 'Recognition'],
  '七杀': ['Challenges', 'Breakthrough', 'Competition'],
  '正财': ['Wealth accumulation', 'Stable income', 'Business gains'],
  '偏财': ['Unexpected gains', 'Windfall luck', 'Investment returns'],
  '正印': ['Education', 'Mentorship', 'Nurturing'],
  '偏印': ['Creativity', 'Spiritual growth', 'Intuition'],
  '食神': ['Enjoyment', 'Artistic talent', 'Social grace'],
  '伤官': ['Innovation', 'Creative expression', 'Technical skill'],
  '比肩': ['Self-reliance', 'Partnership', 'Independence'],
  '劫财': ['Competitive drive', 'Risk-taking', 'Social expansion'],
  '日主': ['Self-awareness', 'Personal growth', 'Identity'],
};

function getThemesForPeriod(luckPillar: LuckPillar): string[] {
  const themes = TEN_GOD_THEMES[luckPillar.stemGod] || ['General development', 'Growth period', 'Transition'];
  return themes.slice(0, 3);
}

interface LuckPillarsTimelineProps {
  luckPillars: LuckPillar[];
  currentAge: number;
}

export function LuckPillarsTimeline({ luckPillars, currentAge }: LuckPillarsTimelineProps) {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Luck Pillars</h3>
          <p className="mt-0.5 text-xs text-[oklch(0.45_0.02_265)]">大运 · 10-Year Periods</p>
        </div>
        <Badge variant="outline" className="border-[oklch(1_0_0_/10%)] text-xs text-[oklch(0.60_0.02_265)]">
          <Star className="mr-1 size-3" />
          Age {currentAge}
        </Badge>
      </div>

      {/* Timeline */}
      <ScrollArea className="w-full pb-2">
        <div className="relative flex gap-0 pb-2" style={{ minWidth: 'max-content' }}>
          {/* Connector Line */}
          <div className="absolute top-[52px] left-4 right-4 h-px bg-[oklch(1_0_0_/8%)]" />

          {luckPillars.map((lp, idx) => {
            const isCurrent = currentAge >= lp.startAge && currentAge <= lp.endAge;
            const isPast = currentAge > lp.endAge;
            const stemColor = ELEMENT_COLORS[lp.pillar.stemElement] || ELEMENT_COLORS.earth;
            const branchColor = ELEMENT_COLORS[lp.pillar.branchElement] || ELEMENT_COLORS.earth;
            const themes = getThemesForPeriod(lp);

            return (
              <motion.div
                key={lp.ageRange}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="relative flex flex-col items-center"
                style={{ width: 130, minWidth: 130 }}
              >
                {/* Age Range */}
                <div className={cn(
                  'mb-2 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide',
                  isCurrent
                    ? 'bg-[oklch(0.78_0.145_85)] text-[oklch(0.12_0.02_265)] shadow-md shadow-[oklch(0.78_0.145_85_/20%)]'
                    : isPast
                      ? 'text-[oklch(0.40_0.02_265)]'
                      : 'text-[oklch(0.60_0.02_265)]'
                )}>
                  {lp.ageRange}
                </div>

                {/* Dot */}
                <div className={cn(
                  'relative z-10 mb-2.5 flex size-3 items-center justify-center rounded-full',
                  isCurrent
                    ? 'bg-[oklch(0.78_0.145_85)] shadow-lg shadow-[oklch(0.78_0.145_85_/40%)]'
                    : isPast
                      ? 'bg-[oklch(0.30_0.02_265)]'
                      : 'bg-[oklch(0.20_0.015_265)] border border-[oklch(1_0_0_/10%)]'
                )} />

                {/* Card */}
                <div className={cn(
                  'w-[118px] rounded-xl border p-2.5 transition-all duration-300',
                  isCurrent
                    ? 'border-[oklch(0.78_0.145_85_/20%)] bg-[oklch(0.78_0.145_85_/5%)]'
                    : isPast
                      ? 'border-[oklch(1_0_0_/4%)] opacity-40'
                      : 'border-[oklch(1_0_0_/6%)] bg-[oklch(0.12_0.015_265)]'
                )}>
                  {/* Stem + Branch */}
                  <div className="mb-2 flex items-center justify-center gap-1.5">
                    <span className={cn('text-lg font-bold', stemColor.text)}>
                      {lp.pillar.stem}
                    </span>
                    <ArrowRight className="size-2.5 text-[oklch(0.30_0.02_265)]" />
                    <span className={cn('text-lg font-bold', branchColor.text)}>
                      {lp.pillar.branch}
                    </span>
                  </div>

                  {/* Ten God */}
                  <div className="mb-1.5 text-center">
                    <Badge
                      variant="outline"
                      className="border-[oklch(1_0_0_/8%)] text-[10px] text-[oklch(0.50_0.02_265)]"
                    >
                      {lp.stemGod}
                    </Badge>
                  </div>

                  {/* Elements */}
                  <div className="mb-2 text-center text-[9px] text-[oklch(0.40_0.02_265)]">
                    {ELEMENT_CHINESE[lp.pillar.stemElement]} · {ELEMENT_CHINESE[lp.pillar.branchElement]}
                  </div>

                  {/* Themes */}
                  <div className="space-y-0.5">
                    {themes.map((theme, ti) => (
                      <p key={ti} className="text-[9px] text-[oklch(0.45_0.02_265)] truncate text-center">
                        {theme}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}