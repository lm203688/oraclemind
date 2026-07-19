import { NextResponse } from 'next/server';

export async function GET() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'OracleMind API',
      version: '3.0.0',
      description: 'AI-Powered Destiny Forecast — 5 modern AI agents × 5 ancient Chinese manuscripts',
    },
    servers: [
      { url: 'https://oraclemind.io', description: 'Production' },
    ],
    paths: {
      '/api/simulate/personal/stream': {
        post: {
          summary: 'Personal Destiny Forecast (SSE)',
          description: 'Stream personal destiny prediction with 5 agents + 5 manuscripts',
          tags: ['Prediction'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    question: { type: 'string' },
                    context: { type: 'string' },
                    birthInfo: { type: 'object' },
                    rounds: { type: 'integer', default: 8 },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'SSE stream' },
            '401': { description: 'Rate limit exceeded' },
          },
        },
      },
      '/api/simulate/event/stream': {
        post: {
          summary: 'Event Prediction (SSE)',
          tags: ['Prediction'],
          responses: { '200': { description: 'SSE stream' } },
        },
      },
      '/api/what-if': {
        post: {
          summary: 'Counterfactual What-If Analysis',
          tags: ['Prediction'],
          responses: { '200': { description: 'Alternative timeline analysis' } },
        },
      },
      '/api/bazi/calculate': {
        post: {
          summary: 'Four Pillars (Bazi) Calculation',
          tags: ['Classical'],
          responses: { '200': { description: 'Bazi chart' } },
        },
      },
      '/api/daily-forecast': {
        get: {
          summary: 'Daily Forecast (Registered Users Only)',
          tags: ['Forecast'],
          security: [{ sessionAuth: [] }],
          responses: {
            '200': { description: 'Daily forecast' },
            '401': { description: 'Login required' },
          },
        },
      },
      '/api/billing/plans': {
        get: {
          summary: 'View Pricing Plans',
          tags: ['Billing'],
          responses: { '200': { description: 'Pricing plans' } },
        },
      },
    },
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
