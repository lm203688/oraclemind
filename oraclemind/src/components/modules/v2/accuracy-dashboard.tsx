'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Target,
  Award,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccuracyTrend } from './accuracy-trend';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AccuracyStats {
  total: number;
  confirmed: number;
  partial: number;
  denied: number;
  accuracy: number;
  byCategory: Array<{
    category: string;
    total: number;
    confirmed: number;
    partial: number;
    denied: number;
    accuracy: number;
  }>;
}

interface AccuracyDashboardProps {
  onBack?: () => void;
}

// ---------------------------------------------------------------------------
// 主组件
// ---------------------------------------------------------------------------

export function AccuracyDashboard({ onBack }: AccuracyDashboardProps) {
  const [stats, setStats] = useState<AccuracyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/feedback/stats');
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Fetch stats failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-[oklch(0.70_0.12_180)]" />
          <span className="text-sm font-semibold text-foreground">准确率统计</span>
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-[oklch(0.70_0.12_180)]" />
            <span className="text-sm font-semibold text-foreground">准确率统计</span>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-[11px] font-mono text-[oklch(0.50_0.015_200)] hover:text-[oklch(0.70_0.12_180)]"
            >
              ← 返回
            </button>
          )}
        </div>
        <div className="rounded-lg border border-dashed border-[oklch(0.70_0.12_180/20%)] p-12 text-center">
          <Target className="mx-auto mb-3 size-8 text-[oklch(0.40_0.015_200)]" />
          <p className="text-sm text-[oklch(0.55_0.015_200)]">还没有验证数据</p>
          <p className="mt-1 text-[11px] text-[oklch(0.40_0.015_200)]">
            完成推演后标记"准确/部分准确/不准"，统计数据会在这里显示
          </p>
        </div>
      </div>
    );
  }

  const accuracyPercent = Math.round(stats.accuracy * 100);
  const confirmedPercent = Math.round((stats.confirmed / stats.total) * 100);
  const partialPercent = Math.round((stats.partial / stats.total) * 100);
  const deniedPercent = Math.round((stats.denied / stats.total) * 100);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-[oklch(0.70_0.12_180)]" />
          <span className="text-sm font-semibold text-foreground">准确率统计</span>
          <Badge variant="outline" className="border-[oklch(0.70_0.12_180/20%)] text-[10px] font-mono text-[oklch(0.70_0.12_180)]">
            {stats.total} 次验证
          </Badge>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="text-[11px] font-mono text-[oklch(0.50_0.015_200)] hover:text-[oklch(0.70_0.12_180)]"
          >
            ← 返回
          </button>
        )}
      </div>

      {/* 总体准确率大卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-lg p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Award className="size-4 text-[oklch(0.70_0.14_145)]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.55_0.015_200)]">
                综合准确率
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tabular text-4xl font-bold text-[oklch(0.70_0.14_145)]">
                {accuracyPercent}
              </span>
              <span className="text-lg text-[oklch(0.55_0.015_200)]">%</span>
            </div>
            <p className="mt-1 text-[11px] text-[oklch(0.45_0.015_200)]">
              基于 {stats.total} 次用户验证（准确=1.0，部分=0.5，不准=0）
            </p>
          </div>

          {/* 圆环图 */}
          <div className="relative size-24">
            <svg className="size-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="oklch(0.20 0.008 200)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="oklch(0.70 0.14 145)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - stats.accuracy) }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono-tabular text-sm font-bold text-[oklch(0.70_0.14_145)]">
                {accuracyPercent}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 验证分布 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-lg p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <Activity className="size-3.5 text-[oklch(0.70_0.12_180)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
            验证分布
          </span>
        </div>

        {/* 堆叠条 */}
        <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-[oklch(0.20_0.008_200)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confirmedPercent}%` }}
            transition={{ duration: 0.8 }}
            style={{ background: 'oklch(0.70 0.14 145)' }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${partialPercent}%` }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ background: 'oklch(0.70 0.12 180)' }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${deniedPercent}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ background: 'oklch(0.65 0.18 25)' }}
          />
        </div>

        {/* 三项数据 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded border border-[oklch(0.35_0.10_145/30%)] bg-[oklch(0.70_0.14_145/5%)] p-2 text-center">
            <CheckCircle2 className="mx-auto mb-1 size-3.5 text-[oklch(0.70_0.14_145)]" />
            <div className="font-mono-tabular text-lg font-bold text-[oklch(0.70_0.14_145)]">
              {stats.confirmed}
            </div>
            <div className="text-[10px] text-[oklch(0.45_0.015_200)]">准确 {confirmedPercent}%</div>
          </div>
          <div className="rounded border border-[oklch(0.35_0.10_180/30%)] bg-[oklch(0.70_0.12_180/5%)] p-2 text-center">
            <MinusCircle className="mx-auto mb-1 size-3.5 text-[oklch(0.70_0.12_180)]" />
            <div className="font-mono-tabular text-lg font-bold text-[oklch(0.70_0.12_180)]">
              {stats.partial}
            </div>
            <div className="text-[10px] text-[oklch(0.45_0.015_200)]">部分 {partialPercent}%</div>
          </div>
          <div className="rounded border border-[oklch(0.35_0.12_25/30%)] bg-[oklch(0.65_0.18_25/5%)] p-2 text-center">
            <XCircle className="mx-auto mb-1 size-3.5 text-[oklch(0.65_0.18_25)]" />
            <div className="font-mono-tabular text-lg font-bold text-[oklch(0.65_0.18_25)]">
              {stats.denied}
            </div>
            <div className="text-[10px] text-[oklch(0.45_0.015_200)]">不准 {deniedPercent}%</div>
          </div>
        </div>
      </motion.div>

      {/* 按类别细分 */}
      {stats.byCategory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-lg p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <Target className="size-3.5 text-[oklch(0.70_0.12_180)]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
              按推演类型细分
            </span>
          </div>
          <div className="space-y-2">
            {stats.byCategory.map((cat, i) => {
              const catLabel = formatCategoryLabel(cat.category);
              const catAccuracy = Math.round(cat.accuracy * 100);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="rounded border border-[oklch(0.70_0.12_180/12%)] bg-[oklch(0.13_0.005_200/60%)] p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[9px] font-mono',
                          cat.category.startsWith('personal')
                            ? 'border-[oklch(0.70_0.12_180/25%)] text-[oklch(0.70_0.12_180)]'
                            : 'border-[oklch(0.65_0.10_50/25%)] text-[oklch(0.65_0.10_50)]'
                        )}
                      >
                        {catLabel}
                      </Badge>
                      <span className="text-[10px] text-[oklch(0.45_0.015_200)]">
                        {cat.total} 次验证
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono-tabular text-sm font-bold text-[oklch(0.70_0.14_145)]">
                        {catAccuracy}%
                      </span>
                      {catAccuracy >= 70 ? (
                        <TrendingUp className="size-3 text-[oklch(0.70_0.14_145)]" />
                      ) : catAccuracy >= 40 ? (
                        <Minus className="size-3 text-[oklch(0.70_0.12_180)]" />
                      ) : (
                        <TrendingDown className="size-3 text-[oklch(0.65_0.18_25)]" />
                      )}
                    </div>
                  </div>
                  {/* 小型分布条 */}
                  <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[oklch(0.20_0.008_200)]">
                    <div
                      style={{
                        width: `${(cat.confirmed / cat.total) * 100}%`,
                        background: 'oklch(0.70 0.14 145)'
                      }}
                    />
                    <div
                      style={{
                        width: `${(cat.partial / cat.total) * 100}%`,
                        background: 'oklch(0.70 0.12 180)'
                      }}
                    />
                    <div
                      style={{
                        width: `${(cat.denied / cat.total) * 100}%`,
                        background: 'oklch(0.65 0.18 25)'
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 准确率趋势图 */}
      <AccuracyTrend />

      {/* 说明 */}
      <div className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.16_0.008_200/40%)] p-3">
        <p className="text-[10px] leading-relaxed text-[oklch(0.50_0.015_200)]">
          📊 OracleMind 坚持<strong className="text-[oklch(0.70_0.12_180)]">可证伪性</strong>原则。
          每次推演完成后，用户可标记结果是否准确。这些反馈数据公开统计，用于持续改进引擎。
          这不是算命——是可验证的概率推演。
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

function formatCategoryLabel(category: string): string {
  if (category.startsWith('personal_confirmed')) return '个人·准确';
  if (category.startsWith('personal_partial')) return '个人·部分';
  if (category.startsWith('personal_denied')) return '个人·不准';
  if (category.startsWith('event_confirmed')) return '事件·准确';
  if (category.startsWith('event_partial')) return '事件·部分';
  if (category.startsWith('event_denied')) return '事件·不准';
  return category;
}
