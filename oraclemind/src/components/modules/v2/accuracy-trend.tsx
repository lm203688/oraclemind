'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendData {
  monthly: Array<{
    period: string;
    label: string;
    total: number;
    confirmed: number;
    partial: number;
    denied: number;
    accuracy: number;
  }>;
  trendDirection: 'up' | 'down' | 'stable' | 'insufficient';
  recentVsPrevious: {
    recent: number;
    previous: number;
    change: number;
  };
}

export function AccuracyTrend() {
  const [data, setData] = useState<TrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feedback/trend')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) setData(json.data);
      })
      .catch(err => console.error('Trend fetch failed:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />;
  }

  if (!data || data.monthly.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[oklch(0.70_0.12_180/15%)] p-6 text-center">
        <BarChart3 className="mx-auto mb-2 size-5 text-[oklch(0.40_0.015_200)]" />
        <p className="text-[11px] text-[oklch(0.50_0.015_200)]">
          趋势图需要至少 3 次验证数据，当前数据不足
        </p>
      </div>
    );
  }

  const maxAccuracy = 1;
  const chartHeight = 120;
  const chartWidth = data.monthly.length * 60;

  // 趋势方向配置
  const trendConfig = {
    up: { icon: TrendingUp, color: 'oklch(0.70 0.14 145)', label: '上升趋势' },
    down: { icon: TrendingDown, color: 'oklch(0.65 0.18 25)', label: '下降趋势' },
    stable: { icon: Minus, color: 'oklch(0.70 0.12 180)', label: '保持稳定' },
    insufficient: { icon: Minus, color: 'oklch(0.55 0.015 200)', label: '数据不足' },
  };
  const TrendIcon = trendConfig[data.trendDirection].icon;
  const trendColor = trendConfig[data.trendDirection].color;

  return (
    <div className="glass-card rounded-lg p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-3.5 text-[oklch(0.70_0.12_180)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">
            准确率趋势
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendIcon className="size-3" style={{ color: trendColor }} />
          <span className="text-[10px] font-mono" style={{ color: trendColor }}>
            {trendConfig[data.trendDirection].label}
          </span>
        </div>
      </div>

      {/* 对比数据 */}
      {data.trendDirection !== 'insufficient' && (
        <div className="mb-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded border border-[oklch(0.70_0.12_180/15%)] p-2">
            <div className="text-[9px] font-mono text-[oklch(0.45_0.015_200)]">前期</div>
            <div className="font-mono-tabular text-sm font-bold text-[oklch(0.60_0.01_200)]">
              {Math.round(data.recentVsPrevious.previous * 100)}%
            </div>
          </div>
          <div className="rounded border border-[oklch(0.70_0.12_180/15%)] p-2">
            <div className="text-[9px] font-mono text-[oklch(0.45_0.015_200)]">近期</div>
            <div className="font-mono-tabular text-sm font-bold text-[oklch(0.70_0.12_180)]">
              {Math.round(data.recentVsPrevious.recent * 100)}%
            </div>
          </div>
          <div className="rounded border p-2" style={{
            borderColor: `${trendColor.replace('oklch(', 'oklch(').replace(')', ' / 30%)')}`,
            background: `${trendColor.replace('oklch(', 'oklch(').replace(')', ' / 8%)')}`,
          }}>
            <div className="text-[9px] font-mono text-[oklch(0.45_0.015_200)]">变化</div>
            <div className="font-mono-tabular text-sm font-bold" style={{ color: trendColor }}>
              {data.recentVsPrevious.change > 0 ? '+' : ''}{Math.round(data.recentVsPrevious.change * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* 趋势图（SVG折线图） */}
      <div className="overflow-x-auto">
        <svg width={Math.max(chartWidth, 280)} height={chartHeight + 30} className="block">
          {/* Y轴网格线 */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <g key={t}>
              <line
                x1="30" y1={chartHeight - t * chartHeight + 10}
                x2={Math.max(chartWidth, 280)} y2={chartHeight - t * chartHeight + 10}
                stroke="oklch(0.70 0.12 180 / 8%)"
                strokeWidth="1"
              />
              <text
                x="25" y={chartHeight - t * chartHeight + 14}
                textAnchor="end"
                fontSize="9"
                fill="oklch(0.45 0.015 200)"
                fontFamily="monospace"
              >
                {Math.round(t * 100)}%
              </text>
            </g>
          ))}

          {/* 折线 */}
          {data.monthly.length > 1 && (
            <motion.polyline
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              points={data.monthly.map((m, i) => {
                const x = 30 + i * 60 + 30;
                const y = chartHeight - m.accuracy * chartHeight + 10;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="oklch(0.70 0.12 180)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* 数据点 */}
          {data.monthly.map((m, i) => {
            const x = 30 + i * 60 + 30;
            const y = chartHeight - m.accuracy * chartHeight + 10;
            const pointColor = m.accuracy >= 0.7 ? 'oklch(0.70 0.14 145)' : m.accuracy >= 0.4 ? 'oklch(0.70 0.12 180)' : 'oklch(0.65 0.18 25)';
            return (
              <g key={i}>
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={pointColor}
                />
                {/* 悬浮提示 */}
                <title>{`${m.label}: ${Math.round(m.accuracy * 100)}% (${m.total}次)`}</title>

                {/* X轴标签 */}
                <text
                  x={x} y={chartHeight + 25}
                  textAnchor="middle"
                  fontSize="9"
                  fill="oklch(0.50 0.015 200)"
                  fontFamily="monospace"
                >
                  {m.label}
                </text>

                {/* 数值标签 */}
                <text
                  x={x} y={y - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fill="oklch(0.65 0.01 200)"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {Math.round(m.accuracy * 100)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 说明 */}
      <p className="mt-2 text-[10px] text-[oklch(0.45_0.015_200)]">
        按月统计的准确率趋势 · 准确=100%，部分=50%，不准=0%
      </p>
    </div>
  );
}
