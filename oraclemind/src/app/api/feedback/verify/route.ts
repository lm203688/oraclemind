import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface FeedbackVerifyRequest {
  scenarioOutcomeId?: string;
  simulationId: string;
  userId: string;
  result: 'confirmed' | 'partial' | 'denied';
  comment?: string;
}

interface FeedbackVerifyResponse {
  success: boolean;
  data: {
    feedbackId: string;
  } | null;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<FeedbackVerifyResponse>> {
  try {
    const body = await request.json() as FeedbackVerifyRequest;

    if (!body.simulationId || !body.userId || !body.result) {
      return NextResponse.json(
        { success: false, data: null, error: 'Missing required fields: simulationId, userId, result' },
        { status: 400 },
      );
    }

    const feedback = await db.verificationFeedback.create({
      data: {
        scenarioOutcomeId: body.scenarioOutcomeId,
        simulationId: body.simulationId,
        userId: body.userId,
        result: body.result,
        comment: body.comment,
      },
    });

    // 更新公开准确率统计
    const simulation = await db.simulation.findUnique({
      where: { id: body.simulationId },
      select: { type: true },
    });
    if (simulation) {
      const category = `${simulation.type}_${body.result}`;
      const existing = await db.publicAccuracy.findUnique({ where: { category } });
      if (existing) {
        const updateData: any = { [body.result]: { increment: 1 } };
        const newTotal = existing.totalSimulations + 1;
        const newConfirmed = existing.confirmed + (body.result === 'confirmed' ? 1 : 0);
        const newPartial = existing.partial + (body.result === 'partial' ? 1 : 0);
        updateData.totalSimulations = newTotal;
        updateData.accuracy = (newConfirmed + newPartial * 0.5) / newTotal;
        await db.publicAccuracy.update({
          where: { category },
          data: updateData,
        });
      } else {
        await db.publicAccuracy.create({
          data: {
            category,
            totalSimulations: 1,
            confirmed: body.result === 'confirmed' ? 1 : 0,
            partial: body.result === 'partial' ? 1 : 0,
            denied: body.result === 'denied' ? 1 : 0,
            accuracy: body.result === 'confirmed' ? 1 : body.result === 'partial' ? 0.5 : 0,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { feedbackId: feedback.id },
    });
  } catch (err) {
    console.error('[Feedback Verify API]', err);
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
