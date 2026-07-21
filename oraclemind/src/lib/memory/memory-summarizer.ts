/**
 * Memory Summarizer — 定期用GLM-4压缩长周期记忆
 *
 * 当episodic记忆累积到一定数量时，调用LLM把它们压缩成summary记忆。
 * 这是Zep模式的核心：用摘要替代重放，降低token开销。
 *
 * 触发条件：
 *   - episodic记忆数 >= 10条
 *   - 距离上次摘要 >= 7天
 *   - 用户主动请求（API调用）
 */

import { db } from '@/lib/db';
import { addMemory, getUserMemories, decayMemories } from './user-memory';

let cachedZAI: any = null;

async function getZAI() {
  if (!cachedZAI) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    // 优先用环境变量，回退到小乌API（公网可访问）
    const apiKey = process.env.ZAI_API_KEY || process.env.OPENAI_API_KEY || 'xiaowu-internal-2026';
    const baseUrl = process.env.OPENAI_BASE_URL || process.env.ZAI_BASE_URL || 'http://150.158.119.19:3003/v1';
    if (apiKey && apiKey !== 'placeholder') {
      cachedZAI = new ZAI({ apiKey, baseUrl });
    } else {
      cachedZAI = new ZAI({ apiKey: 'xiaowu-internal-2026', baseUrl: 'http://150.158.119.19:3003/v1' });
    }
  }
  return cachedZAI;
});
    } else {
      try {
        cachedZAI = await ZAI.create();
      } catch (e) {
        // 无配置文件——用默认匿名配置
        cachedZAI = new ZAI({ apiKey: 'anonymous', baseUrl: 'https://api.z.ai/api/paas/v4' });
      }
    }
  }
  return cachedZAI;
}

const SUMMARIZE_SYSTEM_PROMPT = `你是一个记忆压缩器。你的任务是把多条事件记忆压缩成结构化的摘要，提取关键事实和模式。

## 输出格式（严格JSON）
{
  "summary": "一段100字以内的综合摘要",
  "facts": ["事实1", "事实2", ...],
  "patterns": ["观察到的模式1", "模式2", ...]
}

## 规则
1. summary必须涵盖所有输入事件的核心
2. facts是关于用户的客观事实（如"用户是产品经理"、"用户已婚"）
3. patterns是观察到的行为模式（如"用户倾向保守决策"、"用户多次咨询职业转型"）
4. 不要编造，只总结输入中明确出现的内容`;

export interface SummarizationResult {
  summary: string;
  facts: string[];
  patterns: string[];
  /** 创建的memory ID */
  summaryMemoryId: string;
  /** 创建的semantic memory IDs */
  semanticMemoryIds: string[];
}

/**
 * 触发记忆压缩
 */
export async function summarizeUserMemories(userId: string, options?: { force?: boolean }): Promise<SummarizationResult | null> {
  // 先做衰减
  await decayMemories(userId);

  // 检查是否需要压缩
  const episodicCount = await db.userMemory.count({
    where: { userId, memoryType: 'episodic' },
  });

  if (!options?.force && episodicCount < 10) {
    return null;
  }

  // 获取最近的episodic记忆
  const episodicMemories = await getUserMemories(userId, { limit: 20, type: 'episodic' });
  if (episodicMemories.length === 0) return null;

  // 获取已有summary（避免重复压缩）
  const existingSummaries = await getUserMemories(userId, { limit: 5, type: 'summary' });
  const lastSummaryDate = existingSummaries[0]?.createdAt;
  if (!options?.force && lastSummaryDate) {
    const daysSince = (Date.now() - lastSummaryDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) return null;
  }

  // 用LLM压缩
  const episodicText = episodicMemories.map((m, i) => `${i + 1}. ${m.summary ?? m.content}`).join('\n');

  const zai = await getZAI();
  let result: { summary: string; facts: string[]; patterns: string[] };

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SUMMARIZE_SYSTEM_PROMPT },
        { role: 'user', content: `请压缩以下${episodicMemories.length}条事件记忆：\n\n${episodicText}` },
      ],
      thinking: { type: 'disabled' },
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
    result = parseSummarizationResult(content);
  } catch (err) {
    console.error('[MemorySummarizer] LLM call failed:', err);
    // 回退：简单拼接
    result = {
      summary: episodicText.slice(0, 200),
      facts: [],
      patterns: [],
    };
  }

  // 创建summary记忆
  const summaryMemoryId = await addMemory({
    userId,
    memoryType: 'summary',
    content: result.summary,
    summary: result.summary,
  });

  // 创建semantic记忆（每个fact一条）
  const semanticMemoryIds: string[] = [];
  for (const fact of result.facts) {
    const id = await addMemory({
      userId,
      memoryType: 'semantic',
      content: fact,
    });
    semanticMemoryIds.push(id);
  }

  // 降低已压缩episodic记忆的相关性（不删除，留作回溯）
  await db.userMemory.updateMany({
    where: { id: { in: episodicMemories.map(m => m.id) } },
    data: { relevance: 0.3 },
  });

  return {
    summary: result.summary,
    facts: result.facts,
    patterns: result.patterns,
    summaryMemoryId,
    semanticMemoryIds,
  };
}

function parseSummarizationResult(content: string): { summary: string; facts: string[]; patterns: string[] } {
  let jsonStr = content.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

  const jsonStart = jsonStr.indexOf('{');
  const jsonEnd = jsonStr.lastIndexOf('}');
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      summary: String(parsed.summary ?? ''),
      facts: Array.isArray(parsed.facts) ? parsed.facts.map(String) : [],
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns.map(String) : [],
    };
  } catch {
    return { summary: content.slice(0, 200), facts: [], patterns: [] };
  }
}
