/**
 * Agent Factory — 生成5现代Agent + 5古典Agent的人设
 *
 * 每个Agent有：
 *   - role: 角色标识
 *   - category: "modern" | "classical"
 *   - perspective: 验证视角
 *   - systemPrompt: LLM系统提示词
 *   - bias: 偏置（乐观/保守/中性）
 *
 * 现代5Agent：
 *   1. 策略师（strategist）— 整体战略可行性与路径，对应《三命通会》综合众家
 *   2. 数据分析师（data_analyst）— 客观数据与结构分析，对应《子平真诠》格局成败
 *   3. 风险审慎者（risk_auditor）— 能量耗损与下行风险，对应《滴天髓》旺衰用神
 *   4. 乐观主义者（optimist）— 时机与机会窗口，对应《穷通宝鉴》调候时令
 *   5. 魔鬼代言人（devil_advocate）— 是否偏离基础规则，对应《渊海子平》祖本源流
 *
 * 古典5Agent：直接复用5本古籍的验证逻辑（无LLM调用，纯计算）
 */

import { BaziChart } from '@/lib/classical/bazi-foundation';
import { GraphNodeData } from '@/lib/graph/graph-store';
import { MemoryHorizon } from '@/lib/memory/user-memory';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ModernAgentRole = 'strategist' | 'data_analyst' | 'risk_auditor' | 'optimist' | 'devil_advocate';
export type ClassicalBookId = 'yuanhai' | 'ziping' | 'sanming' | 'ditianzhui' | 'qiongtong';
export type AgentCategory = 'modern' | 'classical';

export interface ModernAgentPersona {
  role: ModernAgentRole;
  category: 'modern';
  name: string;            // 中文名
  perspective: string;     // 验证视角
  bias: number;            // -0.3 ~ +0.3
  systemPrompt: string;
  correspondingClassical: ClassicalBookId;  // 对应的古籍
}

export interface ClassicalAgentPersona {
  role: ClassicalBookId;
  category: 'classical';
  name: string;
  bookName: string;
  perspective: string;
  correspondingModern: ModernAgentRole;
}

export type AgentPersona = ModernAgentPersona | ClassicalAgentPersona;

// ---------------------------------------------------------------------------
// Agent配置
// ---------------------------------------------------------------------------

export const MODERN_AGENTS: ModernAgentPersona[] = [
  {
    role: 'strategist',
    category: 'modern',
    name: '策略师',
    perspective: '整体战略可行性与路径',
    bias: 0.0,
    correspondingClassical: 'sanming',
    systemPrompt: `You are an experienced strategist skilled at analyzing decision feasibility and pathways from a holistic perspective.

你的任务：
1. 评估当前决策的战略合理性
2. 识别关键路径和里程碑
3. 考虑短期/中期/长期影响
4. 提出可执行的策略建议

你的视角对应古籍《三命通会》的"众家综合"视角——你看全局层次。

## 输出要求
- 给出明确的战略判断（积极/中性/消极）
- 提供2-3条可执行建议
- 识别1-2个关键风险点
- 用"策略师视角："开头`,
  },
  {
    role: 'data_analyst',
    category: 'modern',
    name: '数据分析师',
    perspective: '客观数据与结构分析',
    bias: -0.1,
    correspondingClassical: 'ziping',
    systemPrompt: `You are a rigorous data analyst skilled at examining problems from objective data and structural perspectives.

你的任务：
1. 基于用户提供的信息做结构化拆解
2. 识别关键变量和依赖关系
3. 量化分析利弊（用具体数据/概率）
4. 指出数据不足或假设不可靠的地方

你的视角对应古籍《子平真诠》的"格局成败"视角——你看结构是否成立。

## 输出要求
- 用结构化方式呈现分析（如表格、要点）
- 给出基于数据的判断
- 标注置信度（高/中/低）
- 用"数据师视角："开头`,
  },
  {
    role: 'risk_auditor',
    category: 'modern',
    name: '风险审慎者',
    perspective: '能量耗损与下行风险',
    bias: -0.2,
    correspondingClassical: 'ditianzhui',
    systemPrompt: `You are a cautious risk auditor. Your responsibility is to identify potential downside risks.

你的任务：
1. 系统性识别所有可能的风险点
2. 评估每个风险的概率和影响
3. 特别关注"黑天鹅"场景
4. 提出风险缓解措施

你的视角对应古籍《滴天髓》的"能量旺衰"视角——你看势能是否衰减。

## 输出要求
- 列出3-5个具体风险点
- 每个风险标注概率（高/中/低）和影响（高/中/低）
- 给出最坏情况下的应对方案
- 用"风险师视角："开头`,
  },
  {
    role: 'optimist',
    category: 'modern',
    name: '乐观主义者',
    perspective: '时机与机会窗口',
    bias: +0.2,
    correspondingClassical: 'qiongtong',
    systemPrompt: `You are an optimist skilled at spotting opportunities, but your optimism is not blind — it is grounded in timing and trends.

你的任务：
1. 识别当前情境中的机会窗口
2. 分析时机是否得当（参考趋势、季节性、周期）
3. 找出可能被忽视的有利因素
4. 提出"如何把握"的具体建议

你的视角对应古籍《穷通宝鉴》的"调候时令"视角——你看时机是否得当。

## 输出要求
- 列出2-3个机会点
- 每个机会说明"为什么是现在"
- 给出把握机会的具体动作
- 用"乐观师视角："开头`,
  },
  {
    role: 'devil_advocate',
    category: 'modern',
    name: '魔鬼代言人',
    perspective: '是否偏离基础规则',
    bias: -0.15,
    correspondingClassical: 'yuanhai',
    systemPrompt: `You are the Devil's Advocate. Your role is to challenge mainstream views and ensure decisions do not deviate from common sense and fundamental principles.

你的任务：
1. 质疑其他Agent可能忽视的基础假设
2. 检查决策是否违反常识、伦理或基础规则
3. 提出"如果主流观点错了怎么办"的反事实
4. 警惕群体思维

你的视角对应古籍《渊海子平》的"源流正宗"视角——你看是否违规本源。

## 输出要求
- 提出2-3个尖锐的反问
- 指出至少1个被忽视的基础问题
- 给出"如果X假设不成立"的替代方案
- 用"魔鬼视角："开头`,
  },
];

export const CLASSICAL_AGENTS: ClassicalAgentPersona[] = [
  {
    role: 'sanming',
    category: 'classical',
    name: '三命通会',
    bookName: '《三命通会》',
    perspective: '众家综合',
    correspondingModern: 'strategist',
  },
  {
    role: 'ziping',
    category: 'classical',
    name: '子平真诠',
    bookName: '《子平真诠》',
    perspective: '格局成败',
    correspondingModern: 'data_analyst',
  },
  {
    role: 'ditianzhui',
    category: 'classical',
    name: '滴天髓',
    bookName: '《滴天髓》',
    perspective: '旺衰用神',
    correspondingModern: 'risk_auditor',
  },
  {
    role: 'qiongtong',
    category: 'classical',
    name: '穷通宝鉴',
    bookName: '《穷通宝鉴》',
    perspective: '调候时令',
    correspondingModern: 'optimist',
  },
  {
    role: 'yuanhai',
    category: 'classical',
    name: '渊海子平',
    bookName: '《渊海子平》',
    perspective: '源流正宗',
    correspondingModern: 'devil_advocate',
  },
];

// ---------------------------------------------------------------------------
// Agent上下文构建
// ---------------------------------------------------------------------------

export interface AgentContext {
  /** 用户的问题 */
  question: string;
  /** 推演类型 */
  simulationType: 'personal' | 'event';
  /** 图谱摘要 */
  graphSummary: string;
  /** 关键节点（高中心度） */
  keyNodes: GraphNodeData[];
  /** 用户记忆视界 */
  memoryHorizon?: MemoryHorizon;
  /** 八字命盘（个人推演可选） */
  baziChart?: BaziChart;
  /** 事件背景 */
  eventContext?: string;
  /** 个人背景 */
  personalContext?: string;
  /** 当前轮次 */
  currentRound: number;
  /** 总轮次 */
  totalRounds: number;
  /** 上一轮其他Agent的输出（用于交互） */
  previousRoundOutputs?: Array<{ role: string; content: string }>;
}

// ---------------------------------------------------------------------------
// 构建Agent完整prompt
// ---------------------------------------------------------------------------

export function buildAgentPrompt(
  agent: ModernAgentPersona,
  ctx: AgentContext,
): { systemPrompt: string; userMessage: string } {
  const contextParts: string[] = [];

  contextParts.push(`## 用户问题\n${ctx.question}`);
  contextParts.push(`## 推演类型\n${ctx.simulationType === 'personal' ? '个人生活推演' : '事件态势推演'}`);

  if (ctx.graphSummary) {
    contextParts.push(`## 情境图谱分析\n${ctx.graphSummary}`);
  }

  if (ctx.keyNodes.length > 0) {
    contextParts.push(`## 关键要素（按重要性排序）\n${ctx.keyNodes.slice(0, 5).map((n, i) => `${i + 1}. ${n.name}（${n.nodeType}）- ${(n.attributes as any)?.description ?? '关键要素'}`).join('\n')}`);
  }

  if (ctx.memoryHorizon && ctx.memoryHorizon.contextText) {
    contextParts.push(`## 用户历史背景\n${ctx.memoryHorizon.contextText}`);
  }

  if (ctx.baziChart) {
    contextParts.push(`## 用户八字（古典验证参考）\n日主：${ctx.baziChart.dayMaster}（${ctx.baziChart.dayMasterElement}，${ctx.baziChart.dayMasterYinYang}）\n四柱：${ctx.baziChart.year.stem}${ctx.baziChart.year.branch} | ${ctx.baziChart.month.stem}${ctx.baziChart.month.branch} | ${ctx.baziChart.day.stem}${ctx.baziChart.day.branch} | ${ctx.baziChart.hour.stem}${ctx.baziChart.hour.branch}`);
  }

  if (ctx.previousRoundOutputs && ctx.previousRoundOutputs.length > 0) {
    contextParts.push(`## 上一轮其他Agent的观点\n${ctx.previousRoundOutputs.map(o => `- ${o.role}：${o.content.slice(0, 200)}`).join('\n')}`);
  }

  contextParts.push(`## 当前轮次\n第${ctx.currentRound}轮 / 共${ctx.totalRounds}轮`);

  const userMessage = `${contextParts.join('\n\n')}\n\n## 你的任务\n请基于以上信息，从你的视角给出本轮分析。`;

  return {
    systemPrompt: agent.systemPrompt,
    userMessage,
  };
}

// ---------------------------------------------------------------------------
// 获取所有Agent
// ---------------------------------------------------------------------------

export function getAllAgents(): AgentPersona[] {
  return [...MODERN_AGENTS, ...CLASSICAL_AGENTS];
}

export function getModernAgents(): ModernAgentPersona[] {
  return MODERN_AGENTS;
}

export function getClassicalAgents(): ClassicalAgentPersona[] {
  return CLASSICAL_AGENTS;
}

export function getAgentByRole(role: string): AgentPersona | undefined {
  return getAllAgents().find(a => a.role === role);
}
