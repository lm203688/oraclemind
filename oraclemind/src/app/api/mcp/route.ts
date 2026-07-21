import { NextRequest, NextResponse } from 'next/server';

// MCP (Model Context Protocol) Server endpoint
// 让AI agents可以调用OracleMind的推演能力

export async function GET(request: NextRequest) {
  // 返回MCP工具列表
  const tools = [
    {
      name: 'personal_forecast',
      description: 'Run a personal destiny forecast using 5 modern AI agents × 5 ancient scrolls cross-validation. Returns synthesized recommendation with probability scenarios.',
      inputSchema: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'The life question to forecast (e.g., "Should I change jobs?")' },
          context: { type: 'string', description: 'Additional context about the situation' },
          birthYear: { type: 'number', description: 'Birth year (optional, enhances accuracy)' },
          birthMonth: { type: 'number', description: 'Birth month 1-12 (optional)' },
          birthDay: { type: 'number', description: 'Birth day 1-31 (optional)' },
          birthHour: { type: 'number', description: 'Birth hour 0-23 (optional, for Bazi chart)' },
        },
        required: ['question'],
      },
    },
    {
      name: 'event_forecast',
      description: 'Forecast the outcome of an external event (market trends, project success, etc.) using multi-agent simulation.',
      inputSchema: {
        type: 'object',
        properties: {
          event: { type: 'string', description: 'The event to forecast' },
          context: { type: 'string', description: 'Background context' },
        },
        required: ['event'],
      },
    },
    {
      name: 'what_if_analysis',
      description: 'Explore counterfactual scenarios — what would happen if a different choice was made.',
      inputSchema: {
        type: 'object',
        properties: {
          scenario: { type: 'string', description: 'The counterfactual scenario to explore' },
          baseline: { type: 'string', description: 'The baseline reality to compare against' },
        },
        required: ['scenario'],
      },
    },
    {
      name: 'bazi_calculate',
      description: 'Calculate Four Pillars (Bazi) chart from birth date/time. Returns day master, elements, and personality analysis.',
      inputSchema: {
        type: 'object',
        properties: {
          year: { type: 'number' },
          month: { type: 'number' },
          day: { type: 'number' },
          hour: { type: 'number' },
        },
        required: ['year', 'month', 'day', 'hour'],
      },
    },
    {
      name: 'daily_forecast',
      description: 'Get today\'s energy forecast based on celestial patterns. Returns daily auspicious/inauspicious directions and activities.',
      inputSchema: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD format (optional, defaults to today)' },
        },
      },
    },
  ];

  return NextResponse.json({
    server: 'OracleMind',
    version: '3.0.0',
    description: 'AI-Powered Destiny Forecast — Ancient Eastern wisdom meets modern multi-agent AI',
    tools,
    capabilities: [
      'personal_forecast',
      'event_forecast',
      'what_if_analysis',
      'bazi_calculate',
      'daily_forecast',
    ],
    pricing: {
      free_tier: '5 forecasts/day',
      pro: '$9.99/month unlimited',
      deep_analysis: '$4.99/analysis',
    },
  });
}

export async function POST(request: NextRequest) {
  // MCP tool call
  const body = await request.json();
  const { tool, input } = body;

  try {
    switch (tool) {
      case 'personal_forecast': {
        // 调用内部推演API
        const forecastResponse = await fetch(`${request.nextUrl.origin}/api/simulate/personal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: input.userId || 'mcp_user',
            question: input.question,
            context: input.context,
            birthInfo: input.birthYear ? {
              year: input.birthYear,
              month: input.birthMonth,
              day: input.birthDay,
              hour: input.birthHour,
            } : undefined,
            rounds: 2,
          }),
        });
        const result = await forecastResponse.json();
        return NextResponse.json({
          tool: 'personal_forecast',
          result: {
            recommendation: result.finalRecommendation || 'Forecast completed',
            scenarios: result.scenarios || [],
            confidence: result.crossValidation?.quadrant || 'insufficient_info',
          },
        });
      }

      case 'event_forecast': {
        const eventResponse = await fetch(`${request.nextUrl.origin}/api/simulate/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: input.event,
            context: input.context,
          }),
        });
        const result = await eventResponse.json();
        return NextResponse.json({
          tool: 'event_forecast',
          result,
        });
      }

      case 'what_if_analysis': {
        const whatIfResponse = await fetch(`${request.nextUrl.origin}/api/what-if`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario: input.scenario,
            baseline: input.baseline,
          }),
        });
        const result = await whatIfResponse.json();
        return NextResponse.json({
          tool: 'what_if_analysis',
          result,
        });
      }

      case 'bazi_calculate': {
        const baziResponse = await fetch(`${request.nextUrl.origin}/api/bazi/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: input.year,
            month: input.month,
            day: input.day,
            hour: input.hour,
          }),
        });
        const result = await baziResponse.json();
        return NextResponse.json({
          tool: 'bazi_calculate',
          result,
        });
      }

      case 'daily_forecast': {
        const dailyResponse = await fetch(`${request.nextUrl.origin}/api/daily-forecast`);
        const result = await dailyResponse.json();
        return NextResponse.json({
          tool: 'daily_forecast',
          result,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown tool: ${tool}. Available: personal_forecast, event_forecast, what_if_analysis, bazi_calculate, daily_forecast` },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal error',
      tool,
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
