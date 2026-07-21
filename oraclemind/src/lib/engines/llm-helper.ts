/**
 * LLM Helper — 共享的 LLM 调用逻辑
 *
 * 从 simulation-engine.ts 抽出，供 stream API 和非 stream API 共用。
 * 包含：重试机制、429专门处理、超时控制、智能降级内容。
 */

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

/**
 * 调用 LLM，带重试和降级
 */
export async function callAgentLLMWithRetry(
  systemPrompt: string,
  userMessage: string,
  agentRole?: string,
): Promise<{ content: string; tokensUsed: number }> {
  const zai = await getZAI();

  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await Promise.race([
        zai.chat.completions.create({
          messages: [
            { role: 'assistant', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          thinking: { type: 'disabled' },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('LLM call timeout (30s)')), 30000),
        ),
      ]);

      const content = completion.choices?.[0]?.message?.content ?? '';

      if (!content || content.trim().length < 20) {
        throw new Error('Empty or too-short response');
      }

      const tokensUsed = Math.ceil((systemPrompt.length + userMessage.length + content.length) / 3);
      return { content, tokensUsed };
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;
      const errMsg = err instanceof Error ? err.message : String(err);
      const is429 = errMsg.includes('429') || errMsg.includes('Too many requests');
      console.error(`[LLM Helper] call${agentRole ? ` (${agentRole})` : ''} attempt ${attempt}/${maxRetries} failed:`, errMsg);

      if (isLastAttempt) {
        return {
          content: generateFallbackContent(agentRole),
          tokensUsed: 100,
        };
      }

      const delay = is429
        ? 5000 * Math.pow(2, attempt - 1)
        : baseDelay * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return { content: '分析异常', tokensUsed: 100 };
}

function generateFallbackContent(role: string | undefined): string {
  const roleLabels: Record<string, string> = {
    strategist: '策略师',
    data_analyst: '数据分析师',
    risk_auditor: '风险审慎者',
    optimist: '乐观主义者',
    devil_advocate: '魔鬼代言人',
  };
  const label = role ? (roleLabels[role] ?? role) : 'Agent';

  const biases: Record<string, number> = {
    strategist: 0,
    data_analyst: -0.1,
    risk_auditor: -0.2,
    optimist: 0.2,
    devil_advocate: -0.15,
  };
  const bias = role ? (biases[role] ?? 0) : 0;

  if (bias > 0.1) {
    return `${label}视角：基于现有图谱信息，识别到潜在机会窗口。建议关注高中心度节点的正向互动模式，把握时机推进。具体深度分析因系统暂时繁忙未生成，但整体倾向积极。`;
  } else if (bias < -0.1) {
    return `${label}视角：基于现有图谱信息，识别到若干风险信号。建议关注关键节点的负面依赖关系，准备应对方案。具体深度分析因系统暂时繁忙未生成，整体倾向谨慎。`;
  } else {
    return `${label}视角：基于现有图谱信息，整体判断为中性。各要素间存在平衡关系，建议持续观察关键转折点。具体深度分析因系统暂时繁忙未生成。`;
  }
}
