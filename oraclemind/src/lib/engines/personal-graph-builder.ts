/**
 * Personal Graph Builder — 个人生活图谱构建器
 *
 * 从用户的生活事件和决策困惑中构建个人知识图谱。
 * 这是个人推演的第一步：把用户的自然语言输入接地为结构化图谱。
 *
 * 流程：
 *   1. 用GLM-4抽取实体和关系
 *   2. 补充用户历史记忆（从UserMemory读取）
 *   3. 补充八字人格画像（如果提供了出生时间）
 *   4. 构建图谱（节点+边）
 *   5. 计算中心度和社区
 */

import { extractEntities, ExtractionResult } from '@/lib/graph/entity-extractor';
import { bulkCreateGraph, GraphNodeData, RelationType } from '@/lib/graph/graph-store';
import { BaziChart } from '@/lib/classical/bazi-foundation';
import { getUserMemories } from '@/lib/memory/user-memory';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PersonalGraphInput {
  userId: string;
  /** 用户的核心问题/决策困惑 */
  question: string;
  /** 当前生活情境（可选，用户可补充） */
  context?: string;
  /** 出生信息（可选，用于八字人格画像） */
  birthInfo?: { year: number; month: number; day: number; hour: number };
  /** 八字命盘（已计算好的，可选） */
  baziChart?: BaziChart;
  /** 是否注入历史记忆 */
  includeMemory?: boolean;
}

export interface PersonalGraphResult {
  extraction: ExtractionResult;
  nodeIds: string[];
  edgeIds: string[];
  /** 高中心度节点（用于Agent人设生成） */
  keyNodes: GraphNodeData[];
  /** 图谱摘要（用于Agent上下文） */
  graphSummary: string;
}

// ---------------------------------------------------------------------------
// 主函数
// ---------------------------------------------------------------------------

export async function buildPersonalGraph(input: PersonalGraphInput): Promise<PersonalGraphResult> {
  const fullText = input.context
    ? `${input.question}\n\n背景信息：${input.context}`
    : input.question;

  // 1. 用GLM-4抽取实体和关系
  const extraction = await extractEntities(fullText, {
    simulationType: 'personal',
    userBirthInfo: input.birthInfo,
  });

  // 2. 补充用户历史记忆
  if (input.includeMemory !== false) {
    const memories = await getUserMemories(input.userId, { limit: 5, type: 'summary' });
    for (const mem of memories) {
      // 把摘要作为"belief"节点注入
      extraction.entities.push({
        name: `历史关注：${mem.summary?.slice(0, 20) ?? mem.content.slice(0, 20)}`,
        type: 'belief',
        description: mem.content,
      });
      extraction.relations.push({
        from: '我',
        to: `历史关注：${mem.summary?.slice(0, 20) ?? mem.content.slice(0, 20)}`,
        type: 'influence_of',
        weight: 0.4,
      });
    }
  }

  // 3. 补充八字人格画像（如果提供了出生时间）
  if (input.baziChart) {
    const dm = input.baziChart.dayMaster;
    const dmEl = input.baziChart.dayMasterElement;
    const personality = getBaziPersonality(input.baziChart);
    extraction.entities.push({
      name: `八字人格(${dm}${dmEl})`,
      type: 'belief',
      description: personality,
      attributes: {
        dayMaster: dm,
        element: dmEl,
        yinYang: input.baziChart.dayMasterYinYang,
      },
    });
    extraction.relations.push({
      from: '我',
      to: `八字人格(${dm}${dmEl})`,
      type: 'part_of',
      weight: 0.7,
    });
  }

  // 4. 构建图谱
  // 先把"我"放到第一位（如果没有则创建）
  if (!extraction.entities.find(e => e.name === '我')) {
    extraction.entities.unshift({ name: '我', type: 'person', description: '用户本人' });
  }

  // 去重（按name）
  const seenNames = new Set<string>();
  const uniqueEntities = extraction.entities.filter(e => {
    if (seenNames.has(e.name)) return false;
    seenNames.add(e.name);
    return true;
  });

  // 构建name→index映射
  const nameToIndex = new Map(uniqueEntities.map((e, i) => [e.name, i]));

  // 转换关系为index形式
  const edges = extraction.relations
    .filter(r => nameToIndex.has(r.from) && nameToIndex.has(r.to))
    .map(r => ({
      fromIndex: nameToIndex.get(r.from)!,
      toIndex: nameToIndex.get(r.to)!,
      relationType: r.type,
      weight: r.weight,
    }));

  const { nodeIds, edgeIds } = await bulkCreateGraph(
    uniqueEntities.map(e => ({
      nodeType: e.type,
      name: e.name,
      attributes: e.attributes,
    })),
    edges,
    { userId: input.userId },
  );

  // 5. 获取高中心度节点
  const { getNodes } = await import('@/lib/graph/graph-store');
  const allNodes = await getNodes({ userId: input.userId });
  const keyNodes = allNodes
    .filter(n => (n.centrality ?? 0) > 0.3)
    .slice(0, 8);

  // 6. 生成图谱摘要
  const graphSummary = generateGraphSummary(uniqueEntities, extraction.relations, extraction.summary);

  return {
    extraction: { ...extraction, entities: uniqueEntities },
    nodeIds,
    edgeIds,
    keyNodes,
    graphSummary,
  };
}

// ---------------------------------------------------------------------------
// 八字人格画像（从命盘提取性格倾向，作为Agent人设种子）
// ---------------------------------------------------------------------------

function getBaziPersonality(chart: BaziChart): string {
  const dm = chart.dayMaster;
  const dmEl = chart.dayMasterElement;

  const personalities: Record<string, string> = {
    wood: '木日主：仁慈正直，有向上生长的进取心，重情义，但易固执',
    fire: '火日主：热情开朗，善于表达，有领导力，但易急躁冲动',
    earth: '土日主：稳重踏实，信义可靠，重承诺，但易保守固执',
    metal: '金日主：果断坚毅，重义气，有原则，但易刚愎自用',
    water: '水日主：智慧灵活，善于变通，有谋略，但易多虑犹豫',
  };

  return personalities[dmEl] ?? `${dm}日主，性格待分析`;
}

// ---------------------------------------------------------------------------
// 图谱摘要生成
// ---------------------------------------------------------------------------

function generateGraphSummary(
  entities: ExtractionResult['entities'],
  relations: ExtractionResult['relations'],
  originalSummary: string,
): string {
  const personCount = entities.filter(e => e.type === 'person').length;
  const pressureCount = entities.filter(e => e.type === 'pressure').length;
  const goalCount = entities.filter(e => e.type === 'goal').length;
  const resourceCount = entities.filter(e => e.type === 'resource').length;
  const institutionCount = entities.filter(e => e.type === 'institution').length;

  const parts: string[] = [originalSummary];
  if (personCount > 1) parts.push(`涉及${personCount}个相关人物`);
  if (pressureCount > 0) parts.push(`${pressureCount}个压力源`);
  if (goalCount > 0) parts.push(`${goalCount}个目标`);
  if (resourceCount > 0) parts.push(`${resourceCount}项资源`);
  if (institutionCount > 0) parts.push(`${institutionCount}个机构/组织`);

  return parts.join('，') + '。';
}
