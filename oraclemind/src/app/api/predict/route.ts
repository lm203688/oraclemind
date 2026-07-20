import { NextRequest, NextResponse } from 'next/server';
import { classifyEvent } from '@/lib/prediction-router';
import { generatePrediction } from '@/lib/ai-provider';
import { db } from '@/lib/db';
import type { BaziChart } from '@/lib/bazi-engine';
import type { PredictionRoute } from '@/lib/prediction-router';

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------

interface PredictRequest {
  question: string;
  chart: BaziChart;
  tier?: number;
  userId?: string;
}

interface PredictResponse {
  success: boolean;
  data: {
    response: string;
    route: PredictionRoute;
    predictionId: string;
  } | null;
  error?: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateInput(body: unknown): body is PredictRequest {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;

  if (typeof b.question !== 'string' || b.question.trim().length === 0) return false;
  if (typeof b.chart !== 'object' || b.chart === null) return false;

  const chart = b.chart as Record<string, unknown>;
  const requiredPillars = ['year', 'month', 'day', 'hour'];
  for (const p of requiredPillars) {
    if (typeof chart[p] !== 'object' || chart[p] === null) return false;
  }

  if (b.tier !== undefined && (typeof b.tier !== 'number' || b.tier < 1 || b.tier > 5)) return false;
  if (b.userId !== undefined && typeof b.userId !== 'string') return false;

  return true;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse<PredictResponse>> {
  try {
    const body = await request.json();

    if (!validateInput(body)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Invalid input. Required: question (string), chart (BaziChart). Optional: tier (1-5), userId (string).',
        },
        { status: 400 },
      );
    }

    const { question, chart, tier, userId } = body;

    // Classify the question
    const route = classifyEvent(question, { subscriptionTier: tier });

    // Generate prediction via LLM (or template fallback)
    const aiResult = await generatePrediction({
      question,
      chart,
      tier: route.tier,
      methods: route.methods,
      category: route.category,
    });

    // Upsert user (safe - won't block prediction if DB fails)
    const uid = userId ?? 'anonymous';
    try {
      await db.user.upsert({
        where: { id: uid },
        update: { totalPredictions: { increment: 1 } },
        create: { id: uid, totalPredictions: 1 },
      });
    } catch (e) {
      console.error('[predict] db.user.upsert failed, continuing:', e);
    }

    // Create prediction record (safe - won't block if DB fails)
    let predictionId = `pred_${Date.now()}`;
    let prediction: any = { id: predictionId };
    try {
      prediction = await db.prediction.create({
        data: {
          userId: uid,
          question,
          answer: aiResult.content,
          category: route.category,
          tier: route.tier,
          methods: JSON.stringify(route.methods ?? ['rule_engine']),
          chartSnapshot: JSON.stringify(chart),
          status: 'pending',
          tokensUsed: aiResult.tokensUsed,
          costUsd: aiResult.costUsd,
        },
      });
    } catch (dbErr) {
      console.error('[predict] db.prediction.create failed, continuing:', dbErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        response: aiResult.content,
        route: {
          category: route.category,
          tier: route.tier,
          methods: route.methods,
        },
        predictionId: prediction?.id || predictionId,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('[Predict API]', err);
    return NextResponse.json(
      { success: false, data: null, error: `Prediction failed: ${message}` },
      { status: 500 },
    );
  }
}