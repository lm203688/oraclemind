/**
 * Entity Extractor — 使用GLM-4从自然语言中抽取实体和关系
 *
 * 这是GraphRAG的第一步：把用户的自然语言输入转换为结构化的实体-关系图。
 *
 * 输出格式参考Microsoft GraphRAG：
 *   - 实体：{name, type, description, attributes}
 *   - 关系：{from, to, type, weight, description}
 */

import { NodeType, RelationType } from './graph-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExtractedEntity {
  name: string;
  type: NodeType;
  description?: string;
  attributes?: Record<string, any>;
}

export interface ExtractedRelation {
  from: string;       // entity name
  to: string;         // entity name
  type: RelationType;
  weight?: number;    // 0-1
  description?: string;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  relations: ExtractedRelation[];
  summary: string;    // 一句话摘要
}

// ---------------------------------------------------------------------------
// LLM-based extraction
// ---------------------------------------------------------------------------

let cachedZAI: any = null;

async function getZAI() {
  if (!cachedZAI) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    cachedZAI = await ZAI.create();
  }
  return cachedZAI;
}

const EXTRACTION_SYSTEM_PROMPT = `你是一个专业的实体关系抽取器，从自然语言中提取结构化的实体和关系，用于构建知识图谱。

## 实体类型（nodeType）
- person: 人物（用户本人、家人、同事、领导、利益相关方）
- goal: 目标（用户想达成的事情）
- pressure: 压力源（让用户焦虑的因素）
- resource: 资源（用户拥有的能力、人脉、资金）
- belief: 信念/价值观
- event: 事件（已经发生或即将发生）
- institution: 机构/组织/公司
- force: 外部力量（政策/市场趋势/行业变化）

## 关系类型（relationType）
- influence_of: A影响B
- opposes: A反对B
- supports: A支持B
- employs: A雇佣B
- depends_on: A依赖B
- conflicts_with: A与B冲突
- allied_with: A与B结盟
- part_of: A是B的一部分
- causes: A导致B
- fears: A害怕B

## 输出格式（严格JSON，不要markdown代码块）
{
  "entities": [
    {"name": "实体名", "type": "person", "description": "简短描述", "attributes": {}}
  ],
  "relations": [
    {"from": "实体名A", "to": "实体名B", "type": "influence_of", "weight": 0.8, "description": "简短描述"}
  ],
  "summary": "一句话摘要这段输入的核心情境"
}

## 规则
1. 实体名用最简洁的形式（如"老婆"而不是"用户的妻子"）
2. 用户本人默认作为"我"或"自己"实体，type=person
3. 关系权重0-1，强关系0.8+，中等0.5-0.8，弱关系0.3-0.5
4. 至少抽取3个实体，至多15个
5. 至少抽取2个关系，至多20个
6. summary不超过30字`;

/**
 * 从自然语言中抽取实体和关系
 */
export async function extractEntities(text: string, context?: {
  simulationType?: 'personal' | 'event';
  userBirthInfo?: { year: number; month: number; day: number; hour: number };
}): Promise<ExtractionResult> {
  const zai = await getZAI();

  const userMessage = `请从以下输入中抽取实体和关系：

${text}

${context?.simulationType === 'personal' ? '场景：用户在做个人生活推演' : context?.simulationType === 'event' ? '场景：用户在做事件态势推演' : ''}

请输出严格JSON。`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
    return parseExtractionResult(content, text);
  } catch (err) {
    console.error('[EntityExtractor] LLM call failed, using fallback:', err);
    return fallbackExtraction(text, context?.simulationType);
  }
}

// ---------------------------------------------------------------------------
// 解析LLM输出
// ---------------------------------------------------------------------------

function parseExtractionResult(content: string, originalText: string): ExtractionResult {
  // 尝试从markdown代码块中提取JSON
  let jsonStr = content.trim();

  // 去除可能的markdown代码块
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // 去除可能的前后文字
  const jsonStart = jsonStr.indexOf('{');
  const jsonEnd = jsonStr.lastIndexOf('}');
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      entities: (parsed.entities ?? []).map((e: any) => ({
        name: String(e.name ?? ''),
        type: (e.type as NodeType) ?? 'event',
        description: e.description ? String(e.description) : undefined,
        attributes: e.attributes ?? undefined,
      })),
      relations: (parsed.relations ?? []).map((r: any) => ({
        from: String(r.from ?? ''),
        to: String(r.to ?? ''),
        type: (r.type as RelationType) ?? 'influence_of',
        weight: typeof r.weight === 'number' ? r.weight : 0.5,
        description: r.description ? String(r.description) : undefined,
      })),
      summary: String(parsed.summary ?? originalText.slice(0, 30)),
    };
  } catch (err) {
    console.error('[EntityExtractor] JSON parse failed:', err, '\nRaw:', jsonStr);
    return fallbackExtraction(originalText);
  }
}

// ---------------------------------------------------------------------------
// 回退方案（LLM不可用时）
// ---------------------------------------------------------------------------

function fallbackExtraction(text: string, simulationType?: 'personal' | 'event'): ExtractionResult {
  // 简单关键词匹配的回退方案
  const entities: ExtractedEntity[] = [];
  const relations: ExtractedRelation[] = [];

  if (simulationType === 'personal' || !simulationType) {
    entities.push({ name: '我', type: 'person', description: '用户本人' });

    // 简单识别
    const keywords: Array<{ kw: string; type: NodeType; desc: string }> = [
      { kw: '工作', type: 'institution', desc: '当前工作' },
      { kw: '公司', type: 'institution', desc: '所在公司' },
      { kw: '老板', type: 'person', desc: '上级' },
      { kw: '老婆', type: 'person', desc: '妻子' },
      { kw: '老公', type: 'person', desc: '丈夫' },
      { kw: '家人', type: 'person', desc: '家庭成员' },
      { kw: '钱', type: 'resource', desc: '财务资源' },
      { kw: '健康', type: 'pressure', desc: '健康压力' },
      { kw: '压力', type: 'pressure', desc: '压力源' },
    ];

    for (const k of keywords) {
      if (text.includes(k.kw)) {
        entities.push({ name: k.kw, type: k.type, description: k.desc });
        relations.push({
          from: '我',
          to: k.kw,
          type: k.type === 'person' ? 'depends_on' : k.type === 'pressure' ? 'fears' : 'depends_on',
          weight: 0.6,
        });
      }
    }
  } else {
    // 事件推演回退
    entities.push({ name: '事件', type: 'event', description: text.slice(0, 50) });
    entities.push({ name: '市场', type: 'force', description: '市场力量' });
    entities.push({ name: '政策', type: 'force', description: '政策环境' });
    relations.push({ from: '市场', to: '事件', type: 'influence_of', weight: 0.7 });
    relations.push({ from: '政策', to: '事件', type: 'influence_of', weight: 0.6 });
  }

  return {
    entities,
    relations,
    summary: text.slice(0, 30),
  };
}
