import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface GraphDataResponse {
  success: boolean;
  data: {
    nodes: Array<{
      id: string;
      name: string;
      nodeType: string;
      centrality: number;
      community: number | null;
      attributes: Record<string, any> | null;
    }>;
    edges: Array<{
      fromNodeId: string;
      toNodeId: string;
      relationType: string;
      weight: number;
    }>;
  } | null;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse<GraphDataResponse>> {
  try {
    const { userId } = await params;

    const [nodes, edges] = await Promise.all([
      db.graphNode.findMany({ where: { userId } }),
      db.graphEdge.findMany({ where: { userId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        nodes: nodes.map(n => ({
          id: n.id,
          name: n.name,
          nodeType: n.nodeType,
          centrality: n.centrality,
          community: n.community,
          attributes: n.attributes ? JSON.parse(n.attributes) : null,
        })),
        edges: edges.map(e => ({
          fromNodeId: e.fromNodeId,
          toNodeId: e.toNodeId,
          relationType: e.relationType,
          weight: e.weight,
        })),
      },
    });
  } catch (err) {
    console.error('[Graph Data API]', err);
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
