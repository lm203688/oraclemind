/**
 * Graph Store — 自托管轻量GraphRAG存储层
 *
 * 使用Prisma + SQLite存储节点和边，支持：
 *   - 节点CRUD（按userId/simulationId隔离）
 *   - 边CRUD（带关系类型和权重）
 *   - 邻居查询（一跳/多跳）
 *   - 社区检测（Louvain算法纯TS实现）
 *   - 中心度计算（简易PageRank）
 */

import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NodeType =
  | 'person'           // 人物（用户本人、家人、同事、利益相关方）
  | 'goal'             // 目标
  | 'pressure'         // 压力源
  | 'resource'         // 资源
  | 'belief'           // 信念/价值观
  | 'event'            // 事件
  | 'institution'      // 机构/组织
  | 'force';           // 外部力量（政策/市场/趋势）

export type RelationType =
  | 'influence_of'     // A影响B
  | 'opposes'          // A反对B
  | 'supports'         // A支持B
  | 'employs'          // A雇佣B
  | 'depends_on'       // A依赖B
  | 'conflicts_with'   // A与B冲突
  | 'allied_with'      // A与B结盟
  | 'part_of'          // A是B的一部分
  | 'causes'           // A导致B
  | 'fears';           // A害怕B

export interface GraphNodeData {
  id?: string;
  userId?: string;
  simulationId?: string;
  nodeType: NodeType;
  name: string;
  attributes?: Record<string, any>;
  centrality?: number;
  community?: number;
}

export interface GraphEdgeData {
  id?: string;
  userId?: string;
  simulationId?: string;
  fromNodeId: string;
  toNodeId: string;
  relationType: RelationType;
  weight?: number;
}

// ---------------------------------------------------------------------------
// Node CRUD
// ---------------------------------------------------------------------------

export async function createNode(data: GraphNodeData): Promise<string> {
  const node = await db.graphNode.create({
    data: {
      userId: data.userId,
      simulationId: data.simulationId,
      nodeType: data.nodeType,
      name: data.name,
      attributes: data.attributes ? JSON.stringify(data.attributes) : null,
      centrality: data.centrality ?? 0,
      community: data.community,
    },
  });
  return node.id;
}

export async function getNodes(filter: {
  userId?: string;
  simulationId?: string;
  nodeType?: NodeType;
}): Promise<GraphNodeData[]> {
  const nodes = await db.graphNode.findMany({
    where: {
      ...(filter.userId && { userId: filter.userId }),
      ...(filter.simulationId && { simulationId: filter.simulationId }),
      ...(filter.nodeType && { nodeType: filter.nodeType }),
    },
    orderBy: { centrality: 'desc' },
  });

  return nodes.map(n => ({
    id: n.id,
    userId: n.userId ?? undefined,
    simulationId: n.simulationId ?? undefined,
    nodeType: n.nodeType as NodeType,
    name: n.name,
    attributes: n.attributes ? JSON.parse(n.attributes) : undefined,
    centrality: n.centrality,
    community: n.community ?? undefined,
  }));
}

export async function deleteNode(nodeId: string): Promise<void> {
  await db.graphNode.delete({ where: { id: nodeId } });
}

// ---------------------------------------------------------------------------
// Edge CRUD
// ---------------------------------------------------------------------------

export async function createEdge(data: GraphEdgeData): Promise<string> {
  const edge = await db.graphEdge.create({
    data: {
      userId: data.userId,
      simulationId: data.simulationId,
      fromNodeId: data.fromNodeId,
      toNodeId: data.toNodeId,
      relationType: data.relationType,
      weight: data.weight ?? 0.5,
    },
  });
  return edge.id;
}

export async function getEdges(filter: {
  userId?: string;
  simulationId?: string;
  relationType?: RelationType;
}): Promise<GraphEdgeData[]> {
  const edges = await db.graphEdge.findMany({
    where: {
      ...(filter.userId && { userId: filter.userId }),
      ...(filter.simulationId && { simulationId: filter.simulationId }),
      ...(filter.relationType && { relationType: filter.relationType }),
    },
  });

  return edges.map(e => ({
    id: e.id,
    userId: e.userId ?? undefined,
    simulationId: e.simulationId ?? undefined,
    fromNodeId: e.fromNodeId,
    toNodeId: e.toNodeId,
    relationType: e.relationType as RelationType,
    weight: e.weight,
  }));
}

// ---------------------------------------------------------------------------
// 邻居查询
// ---------------------------------------------------------------------------

export interface NeighborResult {
  node: GraphNodeData;
  edge: GraphEdgeData;
  direction: 'outgoing' | 'incoming';
}

export async function getNeighbors(
  nodeId: string,
  options?: { maxDepth?: number; relationTypes?: RelationType[] },
): Promise<NeighborResult[]> {
  const maxDepth = options?.maxDepth ?? 1;
  const visited = new Set<string>([nodeId]);
  const results: NeighborResult[] = [];
  let currentLevel = [nodeId];

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextLevel: string[] = [];

    // 获取当前层所有节点的边
    const edges = await db.graphEdge.findMany({
      where: {
        OR: [
          { fromNodeId: { in: currentLevel } },
          { toNodeId: { in: currentLevel } },
        ],
        ...(options?.relationTypes && { relationType: { in: options.relationTypes } }),
      },
      include: { fromNode: true, toNode: true },
    });

    for (const edge of edges) {
      const isOutgoing = edge.fromNodeId === currentLevel.find(c => c === edge.fromNodeId);
      const neighborId = isOutgoing ? edge.toNodeId : edge.fromNodeId;
      const neighborNode = isOutgoing ? edge.toNode : edge.fromNode;

      if (visited.has(neighborId)) continue;
      visited.add(neighborId);
      nextLevel.push(neighborId);

      results.push({
        node: {
          id: neighborNode.id,
          userId: neighborNode.userId ?? undefined,
          simulationId: neighborNode.simulationId ?? undefined,
          nodeType: neighborNode.nodeType as NodeType,
          name: neighborNode.name,
          attributes: neighborNode.attributes ? JSON.parse(neighborNode.attributes) : undefined,
          centrality: neighborNode.centrality,
          community: neighborNode.community ?? undefined,
        },
        edge: {
          id: edge.id,
          userId: edge.userId ?? undefined,
          simulationId: edge.simulationId ?? undefined,
          fromNodeId: edge.fromNodeId,
          toNodeId: edge.toNodeId,
          relationType: edge.relationType as RelationType,
          weight: edge.weight,
        },
        direction: isOutgoing ? 'outgoing' : 'incoming',
      });
    }

    if (nextLevel.length === 0) break;
    currentLevel = nextLevel;
  }

  return results;
}

// ---------------------------------------------------------------------------
// 中心度计算（简易PageRank）
// ---------------------------------------------------------------------------

export async function computeCentrality(simulationId?: string, userId?: string): Promise<void> {
  const where = {
    ...(simulationId && { simulationId }),
    ...(userId && { userId }),
  };

  const nodes = await db.graphNode.findMany({ where });
  const edges = await db.graphEdge.findMany({ where });

  if (nodes.length === 0) return;

  // PageRank简化版
  const d = 0.85; // damping factor
  const N = nodes.length;
  const nodeMap = new Map(nodes.map(n => [n.id, { rank: 1 / N, outEdges: edges.filter(e => e.fromNodeId === n.id) }]));

  // 入边索引
  const inEdges = new Map<string, typeof edges>();
  for (const e of edges) {
    if (!inEdges.has(e.toNodeId)) inEdges.set(e.toNodeId, []);
    inEdges.get(e.toNodeId)!.push(e);
  }

  // 迭代20次
  for (let iter = 0; iter < 20; iter++) {
    const newRanks = new Map<string, number>();
    for (const node of nodes) {
      let rank = (1 - d) / N;
      const incoming = inEdges.get(node.id) ?? [];
      for (const edge of incoming) {
        const source = nodeMap.get(edge.fromNodeId)!;
        const outCount = source.outEdges.length || 1;
        rank += d * (source.rank / outCount) * edge.weight;
      }
      newRanks.set(node.id, rank);
    }
    for (const [id, rank] of newRanks) {
      nodeMap.get(id)!.rank = rank;
    }
  }

  // 归一化到0-1
  const maxRank = Math.max(...Array.from(nodeMap.values()).map(v => v.rank), 0.0001);

  // 写回数据库
  for (const node of nodes) {
    const rank = nodeMap.get(node.id)!.rank;
    const centrality = rank / maxRank;
    await db.graphNode.update({
      where: { id: node.id },
      data: { centrality },
    });
  }
}

// ---------------------------------------------------------------------------
// 社区检测（简化Louvain）
// ---------------------------------------------------------------------------

export async function detectCommunities(simulationId?: string, userId?: string): Promise<void> {
  const where = {
    ...(simulationId && { simulationId }),
    ...(userId && { userId }),
  };

  const nodes = await db.graphNode.findMany({ where });
  const edges = await db.graphEdge.findMany({ where });

  if (nodes.length === 0) return;

  // 简化的标签传播算法（LPA）— Louvain的轻量替代
  const community = new Map<string, number>();
  nodes.forEach((n, i) => community.set(n.id, i));

  // 邻接表
  const adjacency = new Map<string, string[]>();
  for (const n of nodes) adjacency.set(n.id, []);
  for (const e of edges) {
    adjacency.get(e.fromNodeId)?.push(e.toNodeId);
    adjacency.get(e.toNodeId)?.push(e.fromNodeId);
  }

  // 迭代传播
  for (let iter = 0; iter < 10; iter++) {
    let changed = false;
    for (const node of nodes) {
      const neighbors = adjacency.get(node.id) ?? [];
      if (neighbors.length === 0) continue;

      // 取邻居中最多的社区标签
      const counts = new Map<number, number>();
      for (const nb of neighbors) {
        const c = community.get(nb)!;
        counts.set(c, (counts.get(c) ?? 0) + 1);
      }
      let bestC = community.get(node.id)!;
      let bestCount = 0;
      for (const [c, count] of counts) {
        if (count > bestCount) {
          bestC = c;
          bestCount = count;
        }
      }
      if (bestC !== community.get(node.id)) {
        community.set(node.id, bestC);
        changed = true;
      }
    }
    if (!changed) break;
  }

  // 重新编号社区（0,1,2,...）
  const uniqueCommunities = Array.from(new Set(community.values()));
  const remap = new Map(uniqueCommunities.map((c, i) => [c, i]));

  // 写回数据库
  for (const node of nodes) {
    const c = community.get(node.id)!;
    await db.graphNode.update({
      where: { id: node.id },
      data: { community: remap.get(c)! },
    });
  }
}

// ---------------------------------------------------------------------------
// 图谱快照（用于Simulation记录）
// ---------------------------------------------------------------------------

export interface GraphSnapshot {
  nodes: Array<{
    id: string;
    nodeType: NodeType;
    name: string;
    centrality: number;
    community: number | null;
  }>;
  edges: Array<{
    fromNodeId: string;
    toNodeId: string;
    relationType: RelationType;
    weight: number;
  }>;
}

export async function getGraphSnapshot(filter: {
  userId?: string;
  simulationId?: string;
}): Promise<GraphSnapshot> {
  const [nodes, edges] = await Promise.all([
    db.graphNode.findMany({ where: filter }),
    db.graphEdge.findMany({ where: filter }),
  ]);

  return {
    nodes: nodes.map(n => ({
      id: n.id,
      nodeType: n.nodeType as NodeType,
      name: n.name,
      centrality: n.centrality,
      community: n.community,
    })),
    edges: edges.map(e => ({
      fromNodeId: e.fromNodeId,
      toNodeId: e.toNodeId,
      relationType: e.relationType as RelationType,
      weight: e.weight,
    })),
  };
}

// ---------------------------------------------------------------------------
// 图谱构建辅助：批量创建
// ---------------------------------------------------------------------------

export async function bulkCreateGraph(
  nodes: GraphNodeData[],
  edges: Array<{ fromIndex: number; toIndex: number; relationType: RelationType; weight?: number }>,
  ctx: { userId?: string; simulationId?: string },
): Promise<{ nodeIds: string[]; edgeIds: string[] }> {
  // 先确保 user 存在（外键约束）
  if (ctx.userId) {
    await db.user.upsert({
      where: { id: ctx.userId },
      update: {},
      create: { id: ctx.userId },
    });
  }

  const nodeIds: string[] = [];
  for (const node of nodes) {
    const id = await createNode({
      ...node,
      userId: ctx.userId,
      simulationId: ctx.simulationId,
    });
    nodeIds.push(id);
  }

  const edgeIds: string[] = [];
  for (const edge of edges) {
    const id = await createEdge({
      userId: ctx.userId,
      simulationId: ctx.simulationId,
      fromNodeId: nodeIds[edge.fromIndex],
      toNodeId: nodeIds[edge.toIndex],
      relationType: edge.relationType,
      weight: edge.weight,
    });
    edgeIds.push(id);
  }

  // 计算中心度和社区
  await computeCentrality(ctx.simulationId, ctx.userId);
  await detectCommunities(ctx.simulationId, ctx.userId);

  return { nodeIds, edgeIds };
}
