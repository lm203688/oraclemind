import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 数据导出 API
 * 导出用户所有历史推演数据为 JSON 或 CSV 格式
 * 用户可下载用于备份、分析或迁移
 */

interface ExportData {
  userId: string;
  exportedAt: string;
  version: string;
  simulations: Array<{
    id: string;
    type: string;
    question: string;
    context: string;
    status: string;
    rounds: number;
    createdAt: string;
    completedAt: string | null;
    graphSummary: string | null;
    scenarios: Array<{
      scenarioPath: string;
      probability: number;
      description: string;
      recommendation: string | null;
    }>;
    crossValidation: any;
    agentTraces: Array<{
      agentRole: string;
      agentCategory: string;
      round: number;
      actionType: string;
      content: string;
    }>;
    feedback: Array<{
      result: string;
      comment: string | null;
      createdAt: string;
    }>;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json'; // json | csv

  try {
    const simulations = await db.simulation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        scenarioOutcomes: true,
        agentTraces: { orderBy: { round: 'asc' } },
        feedbacks: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (format === 'csv') {
      const csv = generateCSV(simulations);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="oraclemind-export-${userId}-${Date.now()}.csv"`,
        },
      });
    }

    // JSON 格式
    const exportData: ExportData = {
      userId,
      exportedAt: new Date().toISOString(),
      version: '2.0',
      simulations: simulations.map(sim => {
        let seedInput: any = {};
        try { seedInput = JSON.parse(sim.seedInput); } catch {}

        let crossValidation: any = null;
        if (sim.scenarioOutcomes[0]?.crossValidationResult) {
          try { crossValidation = JSON.parse(sim.scenarioOutcomes[0].crossValidationResult); } catch {}
        }

        return {
          id: sim.id,
          type: sim.type,
          question: seedInput.question ?? seedInput.eventDescription ?? '未知',
          context: seedInput.personalContext ?? seedInput.eventContext ?? '',
          status: sim.status,
          rounds: sim.rounds,
          createdAt: sim.createdAt.toISOString(),
          completedAt: sim.completedAt?.toISOString() ?? null,
          graphSummary: sim.graphSnapshot,
          scenarios: sim.scenarioOutcomes.map(so => ({
            scenarioPath: so.scenarioPath,
            probability: so.probability,
            description: so.description,
            recommendation: so.recommendation,
          })),
          crossValidation: crossValidation ? {
            quadrant: crossValidation.quadrant,
            modernConsensus: crossValidation.modernConsensus,
            classicalConsensus: crossValidation.classicalConsensus,
          } : null,
          agentTraces: sim.agentTraces.map(t => ({
            agentRole: t.agentRole,
            agentCategory: t.agentCategory,
            round: t.round,
            actionType: t.actionType,
            content: t.content,
          })),
          feedback: sim.feedbacks.map(f => ({
            result: f.result,
            comment: f.comment,
            createdAt: f.createdAt.toISOString(),
          })),
        };
      }),
    };

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="oraclemind-export-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    console.error('[Export Data API]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// CSV 生成（精简版，只含关键字段）
// ---------------------------------------------------------------------------

function generateCSV(simulations: any[]): string {
  const headers = [
    'ID',
    '类型',
    '问题',
    '状态',
    '轮次',
    '创建时间',
    '四象限判定',
    '现代共识分',
    '古典共识分',
    '乐观概率',
    '中性概率',
    '保守概率',
    '验证结果',
    'Agent轨迹数',
  ];

  const rows = simulations.map(sim => {
    let seedInput: any = {};
    try { seedInput = JSON.parse(sim.seedInput); } catch {}

    const question = seedInput.question ?? seedInput.eventDescription ?? '未知';

    let quadrant = '';
    let modernConsensus = '';
    let classicalConsensus = '';
    if (sim.scenarioOutcomes[0]?.crossValidationResult) {
      try {
        const cv = JSON.parse(sim.scenarioOutcomes[0].crossValidationResult);
        quadrant = cv.quadrant ?? '';
        modernConsensus = cv.modernConsensus?.toFixed(2) ?? '';
        classicalConsensus = cv.classicalConsensus?.toFixed(2) ?? '';
      } catch {}
    }

    const probs: Record<string, number> = { optimistic: 0, neutral: 0, conservative: 0 };
    for (const so of sim.scenarioOutcomes) {
      probs[so.scenarioPath] = so.probability;
    }

    const feedback = sim.feedbacks[0]?.result ?? '';

    return [
      sim.id,
      sim.type === 'personal' ? '个人推演' : '事件推演',
      `"${question.replace(/"/g, '""')}"`,
      sim.status,
      sim.rounds,
      sim.createdAt.toISOString(),
      quadrant,
      modernConsensus,
      classicalConsensus,
      (probs.optimistic * 100).toFixed(0) + '%',
      (probs.neutral * 100).toFixed(0) + '%',
      (probs.conservative * 100).toFixed(0) + '%',
      feedback,
      sim.agentTraces.length,
    ].join(',');
  });

  return '\uFEFF' + headers.join(',') + '\n' + rows.join('\n'); // \uFEFF = BOM for Excel
}
