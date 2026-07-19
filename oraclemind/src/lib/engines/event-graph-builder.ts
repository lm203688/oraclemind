/**
 * Event Graph Builder — 事件态势图谱构建器
 *
 * 从用户的事件描述中构建事件知识图谱。
 * 这是事件推演的第一步：把一个外部事件接地为利益相关方图谱。
 *
 * 与个人推演的区别：
 *   - 个人推演：以"我"为中心，关注个人决策
 *   - 事件推演：以"事件"为中心，关注多方博弈
 *
 * 事件推演会自动识别利益相关方（创业者/投资人/政策方/用户/竞争者等），
 * 并构建他们之间的博弈关系。
 */

import { extractEntities, ExtractionResult } from '@/lib/graph/entity-extractor';
import { bulkCreateGraph, GraphNodeData } from '@/lib/graph/graph-store';
import { BaziChart } from '@/lib/classical/bazi-foundation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EventGraphInput {
  userId: string;
  /** 事件描述 */
  eventDescription: string;
  /** 事件背景（可选） */
  context?: string;
  /** 时间范围（如"未来3个月"、"2026年Q1"） */
  timeframe?: string;
  /** 是否使用当前流年做事件能量判定 */
  useCurrentYearBazi?: boolean;
}

export interface EventGraphResult {
  extraction: ExtractionResult;
  nodeIds: string[];
  edgeIds: string[];
  /** 关键利益相关方（高中心度节点） */
  keyStakeholders: GraphNodeData[];
  /** 博弈阵营（按社区划分） */
  factions: Array<{ name: string; members: GraphNodeData[]; stance: string }>;
  /** 图谱摘要 */
  graphSummary: string;
}

// ---------------------------------------------------------------------------
// 利益相关方模板（事件推演专用）
// ---------------------------------------------------------------------------

const STAKEHOLDER_TEMPLATES: Array<{
  keywords: string[];
  stakeholderType: string;
  nodeType: 'person' | 'institution' | 'force';
  defaultStance: string;
}> = [
  { keywords: ['创业', '公司', '企业', 'startup'], stakeholderType: '创业者/企业方', nodeType: 'institution', defaultStance: '推动事件发展' },
  { keywords: ['投资', '资本', 'VC', '基金'], stakeholderType: '投资方', nodeType: 'institution', defaultStance: '追求回报' },
  { keywords: ['政策', '政府', '监管', '法律'], stakeholderType: '政策方', nodeType: 'force', defaultStance: '规范市场' },
  { keywords: ['用户', '消费者', '客户', '市场'], stakeholderType: '用户/消费者', nodeType: 'person', defaultStance: '追求利益' },
  { keywords: ['竞争', '对手', '竞品'], stakeholderType: '竞争者', nodeType: 'institution', defaultStance: '争夺市场' },
  { keywords: ['员工', '人才', '求职'], stakeholderType: '人才市场', nodeType: 'person', defaultStance: '追求发展' },
  { keywords: ['媒体', '舆论', '公众'], stakeholderType: '媒体/舆论', nodeType: 'force', defaultStance: '放大信号' },
  { keywords: ['技术', 'AI', '科技', '创新'], stakeholderType: '技术力量', nodeType: 'force', defaultStance: '改变格局' },
];

// ---------------------------------------------------------------------------
// 主函数
// ---------------------------------------------------------------------------

export async function buildEventGraph(input: EventGraphInput): Promise<EventGraphResult> {
  const fullText = input.context
    ? `${input.eventDescription}\n\n背景：${input.context}${input.timeframe ? `\n时间范围：${input.timeframe}` : ''}`
    : `${input.eventDescription}${input.timeframe ? `\n时间范围：${input.timeframe}` : ''}`;

  // 1. 用GLM-4抽取实体和关系
  const extraction = await extractEntities(fullText, {
    simulationType: 'event',
  });

  // 2. 注入事件核心节点（如果不存在）
  const eventNodeName = extraction.summary.slice(0, 15);
  if (!extraction.entities.find(e => e.name === eventNodeName && e.type === 'event')) {
    extraction.entities.unshift({
      name: eventNodeName,
      type: 'event',
      description: input.eventDescription.slice(0, 100),
    });
  }

  // 3. 根据关键词识别利益相关方阵营
  const detectedStakeholders: Array<{ name: string; type: string; nodeType: 'person' | 'institution' | 'force'; stance: string }> = [];
  for (const template of STAKEHOLDER_TEMPLATES) {
    if (template.keywords.some(kw => fullText.includes(kw))) {
      // 检查是否已经抽取了类似实体
      const exists = extraction.entities.some(e =>
        e.name.includes(template.stakeholderType) ||
        template.keywords.some(kw => e.name.includes(kw))
      );
      if (!exists) {
        detectedStakeholders.push({
          name: template.stakeholderType,
          type: template.stakeholderType,
          nodeType: template.nodeType,
          stance: template.defaultStance,
        });
      }
    }
  }

  // 4. 把识别到的利益相关方加入实体
  for (const sh of detectedStakeholders) {
    extraction.entities.push({
      name: sh.name,
      type: sh.nodeType,
      description: `${sh.type}（${sh.stance}）`,
      attributes: { stakeholderType: sh.type, stance: sh.stance },
    });
    // 与事件核心节点建立关系
    extraction.relations.push({
      from: sh.name,
      to: eventNodeName,
      type: 'influence_of',
      weight: 0.7,
    });
  }

  // 5. 注入当前流年作为外部force（如果启用）
  if (input.useCurrentYearBazi !== false) {
    const now = new Date();
    const year = now.getFullYear();
    // 计算当前流年干支
    const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const yearStem = stems[((year - 4) % 10 + 10) % 10];
    const yearBranch = branches[((year - 4) % 12 + 12) % 12];
    const yearName = `${yearStem}${yearBranch}年`;

    extraction.entities.push({
      name: yearName,
      type: 'force',
      description: `${year}年流年能量（${yearStem}${yearBranch}）`,
      attributes: { stem: yearStem, branch: yearBranch },
    });
    extraction.relations.push({
      from: yearName,
      to: eventNodeName,
      type: 'influence_of',
      weight: 0.6,
    });
  }

  // 6. 去重
  const seenNames = new Set<string>();
  const uniqueEntities = extraction.entities.filter(e => {
    if (seenNames.has(e.name)) return false;
    seenNames.add(e.name);
    return true;
  });

  // 7. 构建name→index映射
  const nameToIndex = new Map(uniqueEntities.map((e, i) => [e.name, i]));

  // 8. 转换关系为index形式
  const edges = extraction.relations
    .filter(r => nameToIndex.has(r.from) && nameToIndex.has(r.to))
    .map(r => ({
      fromIndex: nameToIndex.get(r.from)!,
      toIndex: nameToIndex.get(r.to)!,
      relationType: r.type,
      weight: r.weight,
    }));

  // 9. 构建图谱
  const { nodeIds, edgeIds } = await bulkCreateGraph(
    uniqueEntities.map(e => ({
      nodeType: e.type,
      name: e.name,
      attributes: e.attributes,
    })),
    edges,
    { userId: input.userId },
  );

  // 10. 获取关键利益相关方
  const { getNodes } = await import('@/lib/graph/graph-store');
  const allNodes = await getNodes({ userId: input.userId });
  const keyStakeholders = allNodes
    .filter(n => (n.centrality ?? 0) > 0.3 && n.name !== eventNodeName)
    .slice(0, 10);

  // 11. 按社区划分阵营
  const factions = groupByFaction(allNodes);

  // 12. 生成图谱摘要
  const graphSummary = generateEventSummary(uniqueEntities, extraction.relations, extraction.summary, factions);

  return {
    extraction: { ...extraction, entities: uniqueEntities },
    nodeIds,
    edgeIds,
    keyStakeholders,
    factions,
    graphSummary,
  };
}

// ---------------------------------------------------------------------------
// 按社区划分阵营
// ---------------------------------------------------------------------------

function groupByFaction(nodes: GraphNodeData[]): Array<{ name: string; members: GraphNodeData[]; stance: string }> {
  const communityMap = new Map<number, GraphNodeData[]>();
  for (const node of nodes) {
    const c = node.community ?? -1;
    if (!communityMap.has(c)) communityMap.set(c, []);
    communityMap.get(c)!.push(node);
  }

  const factions: Array<{ name: string; members: GraphNodeData[]; stance: string }> = [];
  let idx = 0;
  for (const [communityId, members] of communityMap) {
    if (communityId < 0 || members.length === 0) continue;
    idx++;
    // 推断阵营立场
    const stance = inferFactionStance(members);
    factions.push({
      name: `阵营${idx}`,
      members,
      stance,
    });
  }

  return factions;
}

function inferFactionStance(members: GraphNodeData[]): string {
  const types = members.map(m => m.nodeType);
  if (types.includes('force')) return '外部影响方';
  if (types.includes('institution') && types.includes('person')) return '行业生态方';
  if (types.every(t => t === 'person')) return '个人利益方';
  if (types.every(t => t === 'institution')) return '机构博弈方';
  return '利益相关方';
}

// ---------------------------------------------------------------------------
// 事件图谱摘要
// ---------------------------------------------------------------------------

function generateEventSummary(
  entities: ExtractionResult['entities'],
  relations: ExtractionResult['relations'],
  originalSummary: string,
  factions: Array<{ name: string; members: GraphNodeData[]; stance: string }>,
): string {
  const parts: string[] = [originalSummary];
  parts.push(`共${entities.length}个实体，${relations.length}条关系`);
  if (factions.length > 0) {
    parts.push(`划分为${factions.length}个阵营`);
  }
  return parts.join('，') + '。';
}
