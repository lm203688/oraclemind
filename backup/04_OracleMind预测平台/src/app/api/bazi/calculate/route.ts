import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi, getDayMasterStrength } from '@/lib/bazi-engine';
import type { BaziChart, DayMasterStrength } from '@/lib/bazi-engine';

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------

interface BaziCalculateRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
  place?: string;
}

interface BaziCalculateResponse {
  success: boolean;
  data: {
    chart: BaziChart;
    dayMasterStrength: DayMasterStrength;
    gender: string;
    place?: string;
  } | null;
  error?: string;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateInput(body: unknown): body is BaziCalculateRequest {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;

  if (typeof b.year !== 'number' || b.year < 1 || b.year > 2100) return false;
  if (typeof b.month !== 'number' || b.month < 1 || b.month > 12) return false;
  if (typeof b.day !== 'number' || b.day < 1 || b.day > 31) return false;
  if (typeof b.hour !== 'number' || b.hour < 0 || b.hour > 23) return false;
  if (b.gender !== 'male' && b.gender !== 'female') return false;

  // Optional: validate day count for the given month/year
  const maxDay = new Date(b.year as number, b.month as number, 0).getDate();
  if (b.day > maxDay) return false;

  return true;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse<BaziCalculateResponse>> {
  try {
    const body = await request.json();

    if (!validateInput(body)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error:
            'Invalid input. Required: year (1-2100), month (1-12), day (1-31), hour (0-23), gender ("male" | "female").',
        },
        { status: 400 },
      );
    }

    const { year, month, day, hour, gender, place } = body;

    // Calculate the BaZi chart
    const chart = calculateBazi(year, month, day, hour);

    // Assess day master strength
    const dayMasterStrength = getDayMasterStrength(chart);

    return NextResponse.json({
      success: true,
      data: {
        chart,
        dayMasterStrength,
        gender,
        place: place ?? undefined,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: `BaZi calculation failed: ${message}`,
      },
      { status: 500 },
    );
  }
}