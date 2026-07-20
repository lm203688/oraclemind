import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------

interface VerifyRequest {
  predictionId: string;
  result: 'confirmed' | 'denied' | 'partial';
}

interface VerifyResponse {
  success: boolean;
  data: {
    id: string;
    userId: string;
    question: string;
    prediction: string;
    predictionDate: string;
    verificationDate: string;
    result: string;
    category: string;
    tier: number;
  } | null;
  error?: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_RESULTS = ['confirmed', 'denied', 'partial'] as const;

function validateInput(body: unknown): body is VerifyRequest {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;

  if (typeof b.predictionId !== 'string' || b.predictionId.trim().length === 0) return false;
  if (typeof b.result !== 'string' || !VALID_RESULTS.includes(b.result as typeof VALID_RESULTS[number])) return false;

  return true;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  try {
    const body = await request.json();

    if (!validateInput(body)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error:
            'Invalid input. Required: predictionId (non-empty string), result ("confirmed" | "denied" | "partial").',
        },
        { status: 400 },
      );
    }

    const { predictionId, result } = body;

    // Find the prediction
    const prediction = await db.prediction.findUnique({
      where: { id: predictionId },
    });

    if (!prediction) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: `Prediction record not found: ${predictionId}`,
        },
        { status: 404 },
      );
    }

    if (prediction.status === 'expired') {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'This prediction has expired and can no longer be verified.',
        },
        { status: 400 },
      );
    }

    // Update prediction status
    const updated = await db.prediction.update({
      where: { id: predictionId },
      data: {
        status: result,
        verifiedAt: new Date(),
      },
    });

    // Create feedback record
    await db.feedback.create({
      data: {
        predictionId: updated.id,
        userId: updated.userId,
        result,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        userId: updated.userId,
        question: updated.question,
        prediction: updated.answer,
        predictionDate: updated.createdAt.toISOString(),
        verificationDate: updated.verifiedAt!.toISOString(),
        result: updated.status,
        category: updated.category,
        tier: updated.tier,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: `Verification failed: ${message}`,
      },
      { status: 500 },
    );
  }
}
