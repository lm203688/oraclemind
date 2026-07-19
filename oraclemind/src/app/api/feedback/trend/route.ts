import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 准确率趋势 API
 * 返回按时间分组的准确率趋势数据（用于趋势图）
 */

interface TrendResponse {
  success: boolean;
  data: {
    /** 按月分组的趋势数据 */
    monthly: Array<{
      period: string;        // 如 "2026-07"
      label: string;         // 如 "7月"
      total: number;
      confirmed: number;
      partial: number;
      denied: number;
      accuracy: number;
    }>;
    /** 总体趋势（上升/下降/稳定） */
    trendDirection: 'up' | 'down' | 'stable' | 'insufficient';
    /** 最近3个月 vs 之前3个月的准确率对比 */
    recentVsPrevious: {
      recent: number;
      previous: number;
      change: number;
    };
  } | null;
  error?: string;
}

export async function GET(): Promise<NextResponse<TrendResponse>> {
  try {
    const feedbacks = await db.verificationFeedback.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (feedbacks.length < 3) {
      return NextResponse.json({
        success: true,
        data: {
          monthly: [],
          trendDirection: 'insufficient',
          recentVsPrevious: { recent: 0, previous: 0, change: 0 },
        },
      });
    }

    // 按月分组
    const monthlyMap = new Map<string, { total: number; confirmed: number; partial: number; denied: number }>();

    for (const f of feedbacks) {
      const date = new Date(f.createdAt);
      const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${date.getMonth() + 1}月`;

      if (!monthlyMap.has(periodKey)) {
        monthlyMap.set(periodKey, { total: 0, confirmed: 0, partial: 0, denied: 0 });
      }
      const entry = monthlyMap.get(periodKey)!;
      entry.total++;
      if (f.result === 'confirmed') entry.confirmed++;
      else if (f.result === 'partial') entry.partial++;
      else if (f.result === 'denied') entry.denied++;
    }

    // 转为数组并计算准确率
    const monthly = Array.from(monthlyMap.entries())
      .map(([period, data]) => {
        const monthNum = parseInt(period.split('-')[1]);
        return {
          period,
          label: `${monthNum}月`,
          total: data.total,
          confirmed: data.confirmed,
          partial: data.partial,
          denied: data.denied,
          accuracy: data.total > 0 ? (data.confirmed + data.partial * 0.5) / data.total : 0,
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));

    // 计算趋势方向：对比最近3个月 vs 之前3个月
    const recent3 = monthly.slice(-3);
    const previous3 = monthly.slice(-6, -3);

    const recentAvg = recent3.length > 0
      ? recent3.reduce((sum, m) => sum + m.accuracy, 0) / recent3.length
      : 0;
    const previousAvg = previous3.length > 0
      ? previous3.reduce((sum, m) => sum + m.accuracy, 0) / previous3.length
      : 0;

    const change = recentAvg - previousAvg;

    let trendDirection: 'up' | 'down' | 'stable' | 'insufficient';
    if (previous3.length === 0) {
      trendDirection = 'insufficient';
    } else if (change > 0.05) {
      trendDirection = 'up';
    } else if (change < -0.05) {
      trendDirection = 'down';
    } else {
      trendDirection = 'stable';
    }

    return NextResponse.json({
      success: true,
      data: {
        monthly,
        trendDirection,
        recentVsPrevious: {
          recent: recentAvg,
          previous: previousAvg,
          change,
        },
      },
    });
  } catch (err) {
    console.error('[Trend API]', err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
