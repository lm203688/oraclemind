/**
 * AI Provider — Unified interface for LLM inference
 *
 * Uses z-ai-web-dev-sdk for chat completions.
 * Falls back to a structured template engine if the SDK is unavailable.
 * Supports multi-agent debate for L4/L5 tiers.
 */

import type { BaziChart } from '@/lib/bazi-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIPredictionResult {
  content: string;
  tokensUsed: number;
  costUsd: number;
  model: string;
}

export interface AIPredictionOptions {
  question: string;
  chart: BaziChart;
  tier: number;
  methods: string[];
  category: string;
}

// ---------------------------------------------------------------------------
// System prompts
// ---------------------------------------------------------------------------

function buildChartContext(chart: BaziChart): string {
  return `
## User's BaZi Chart (四柱八字)
- **Day Master (日主)**: ${chart.dayMaster} (${chart.dayMasterElement}, ${chart.dayMasterYinYang})
- **Zodiac (生肖)**: ${chart.zodiac}
- **Four Pillars**:
  - Year: ${chart.year?.stem || ''}${chart.year?.branch || ''} (天干地支)
  - Month: ${chart.month?.stem || ''}${chart.month?.branch || ''}
  - Day: ${chart.day?.stem || ''}${chart.day?.branch || ''}
  - Hour: ${chart.hour?.stem || ''}${chart.hour?.branch || ''}
- **Hidden Stems**:
  - Year: ${(chart.year?.hiddenStems || []).join(', ')}
  - Month: ${(chart.month?.hiddenStems || []).join(', ')}
  - Day: ${(chart.day?.hiddenStems || []).join(', ')}
  - Hour: ${(chart.hour?.hiddenStems || []).join(', ')}
- **Ten Gods (十神)**:
  - Year Stem: ${chart.tenGods?.yearStem || 'N/A'}
  - Month Stem: ${chart.tenGods?.monthStem || 'N/A'}
  - Hour Stem: ${chart.tenGods?.hourStem || 'N/A'}
- **Five Element Scores**: Wood=${chart.elementScores?.wood ?? 'N/A'}, Fire=${chart.elementScores?.fire ?? 'N/A'}, Earth=${chart.elementScores?.earth ?? 'N/A'}, Metal=${chart.elementScores?.metal ?? 'N/A'}, Water=${chart.elementScores?.water ?? 'N/A'}
- **Solar Terms**: ${chart.solarTerms}
- **Luck Pillars**: ${(chart.luckPillars || []).map(lp => `${lp.pillar?.stem || ''}${lp.pillar?.branch || ''}(${lp.ageRange || ''})`).join(' → ')}
`.trim();
}

function buildSystemPrompt(options: AIPredictionOptions): string {
  const { category, tier } = options;
  const chartContext = buildChartContext(options.chart);

  const categoryInstructions: Record<string, string> = {
    objective: `You are analyzing an objective/external event question using BaZi principles.
Focus on: timing, probability, environmental factors shown in the chart.
Be specific with timeframes. Use the Five Elements and Ten Gods to reason about the event.`,
    personal_related: `You are providing a personal BaZi reading related to the user's life.
Consider: career prospects, relationships, health tendencies, financial outlook.
Reference the Day Master strength, favorable/unfavorable elements, and current luck pillar.
Be encouraging but honest. Give actionable advice.`,
    deep_destiny: `You are performing a deep destiny analysis using the Four Pillars of Destiny.
Cover: personality traits, life path tendencies, karmic patterns, major life transitions.
Analyze the interplay of all Ten Gods, the Five Element balance, and the luck pillar sequence.
This is the most comprehensive reading — be thorough and insightful.`,
  };

  return `You are OracleMind AI, an expert in Chinese metaphysics — specifically BaZi (Four Pillars of Destiny / 八字命理). You combine ancient Eastern wisdom with modern analytical reasoning.

CRITICAL RULES:
1. Respond in the same language the user uses (Chinese question → Chinese answer, English → English)
2. Use Markdown formatting: **bold** for key concepts, bullet points for lists, > for important notes
3. Always ground your analysis in the specific chart data provided
4. Mention relevant Ten Gods (十神) and Five Elements (五行) by name
5. Give concrete, actionable insights — not vague platitudes
6. If the question is about timing, reference the current or upcoming luck pillar
7. End with a brief summary of the key takeaway

${categoryInstructions[category] ?? categoryInstructions.personal_related}

${chartContext}

Analysis depth tier: ${tier}/5. ${tier >= 4 ? 'Use multi-perspective analysis. Consider opposing viewpoints before concluding.' : ''}`;
}

// ---------------------------------------------------------------------------
// Multi-agent debate system prompts
// ---------------------------------------------------------------------------

function buildDebatePrompts(options: AIPredictionOptions): { traditionalist: string; modernist: string; skeptic: string; synthesizer: string } {
  const chartContext = buildChartContext(options.chart);

  return {
    traditionalist: `You are a **Traditional BaZi Master** (传统命理师) with 40 years of experience in classical Chinese metaphysics.
You strictly follow ancient texts like 《滴天髓》《穷通宝鉴》《三命通会》.
Your analysis is rooted in classical principles: Ten Gods relationships, seasonal strength, hidden stems, and traditional luck pillar interpretation.
Be thorough, cite classical principles, and provide your honest assessment.

${chartContext}

Analyze this question from the traditional BaZi perspective: "${options.question}"`,

    modernist: `You are a **Modern BaZi Analyst** (现代命理分析师) who combines traditional BaZi with modern psychology, personality science, and life coaching.
You interpret Five Elements through the lens of personality traits, behavioral patterns, and life tendencies.
You focus on actionable insights: career fit, relationship compatibility, health predispositions, and optimal timing.

${chartContext}

Analyze this question from a modern, psychologically-informed BaZi perspective: "${options.question}"`,

    skeptic: `You are a **Critical Thinker & Skeptic** (批判性思考者) who respects BaZi as a framework but challenges overconfident predictions.
You point out limitations, alternative interpretations, and confounding factors.
You assign confidence levels and identify what additional information would improve the prediction.

${chartContext}

Critically evaluate this BaZi prediction question: "${options.question}"`,

    synthesizer: `You are the **Chief Oracle** (主命理师) of OracleMind. You receive analyses from three experts:
1. A Traditional BaZi Master
2. A Modern BaZi Analyst
3. A Critical Skeptic

Your job is to synthesize their perspectives into a unified, coherent prediction. Find the consensus, acknowledge disagreements, and give a final balanced assessment with clear actionable advice.`,
  };
}

// ---------------------------------------------------------------------------
// SDK-based LLM call
// ---------------------------------------------------------------------------

let cachedZAI: any = null;

async function getZAI() {
  if (!cachedZAI) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const apiKey = process.env.ZAI_API_KEY || process.env.OPENAI_API_KEY || 'xiaowu-internal-2026';
    const baseUrl = process.env.OPENAI_BASE_URL || process.env.ZAI_BASE_URL || 'http://150.158.119.19:3003/v1';
    cachedZAI = new ZAI({ apiKey, baseUrl });
  }
  return cachedZAI;
}

async function callLLM(systemPrompt: string, userMessage: string, tier: number): Promise<AIPredictionResult> {
  const zai = await getZAI();

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    thinking: { type: 'disabled' },
  });

  const content = completion.choices?.[0]?.message?.content ?? 'Unable to generate prediction. Please try again.';

  // Estimate tokens (rough: 1 token ≈ 2 chars for Chinese, 4 chars for English)
  const charCount = systemPrompt.length + userMessage.length + content.length;
  const tokensUsed = Math.ceil(charCount / 3);

  // Cost estimation
  const costUsd = (tokensUsed / 1_000_000) * 0.1;

  return { content, tokensUsed, costUsd, model: 'glm-4' };
}

// ---------------------------------------------------------------------------
// Multi-agent debate (L4/L5)
// ---------------------------------------------------------------------------

async function callMultiAgentDebate(options: AIPredictionOptions): Promise<AIPredictionResult> {
  const zai = await getZAI();
  const prompts = buildDebatePrompts(options);

  // Run 3 expert agents in parallel
  const [traditionalResult, modernResult, skepticResult] = await Promise.all([
    zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: prompts.traditionalist },
        { role: 'user', content: `Please provide your traditional BaZi analysis.` },
      ],
      thinking: { type: 'disabled' },
    }),
    zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: prompts.modernist },
        { role: 'user', content: `Please provide your modern BaZi analysis.` },
      ],
      thinking: { type: 'disabled' },
    }),
    zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: prompts.skeptic },
        { role: 'user', content: `Please provide your critical evaluation.` },
      ],
      thinking: { type: 'disabled' },
    }),
  ]);

  const traditional = traditionalResult.choices?.[0]?.message?.content ?? '';
  const modern = modernResult.choices?.[0]?.message?.content ?? '';
  const skeptic = skepticResult.choices?.[0]?.message?.content ?? '';

  // Synthesize via a 4th call
  const synthesisPrompt = `${prompts.synthesizer}

## Expert 1 — Traditional BaZi Master:
${traditional}

## Expert 2 — Modern BaZi Analyst:
${modern}

## Expert 3 — Critical Skeptic:
${skeptic}

Please provide the final synthesized prediction. Structure your response clearly with:
1. **Consensus Points** — what all experts agree on
2. **Key Tensions** — where experts disagree
3. **Final Prediction** — your synthesized answer
4. **Actionable Advice** — what the user should do
5. **Confidence Level** — how confident you are (High/Medium/Low) and why`;

  const synthesisResult = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: synthesisPrompt },
      { role: 'user', content: 'Please synthesize the three expert analyses into a final prediction.' },
    ],
    thinking: { type: 'disabled' },
  });

  const content = synthesisResult.choices?.[0]?.message?.content ?? 'Debate synthesis failed. Please try again.';

  const allText = traditional + modern + skeptic + content + prompts.traditionalist;
  const tokensUsed = Math.ceil(allText.length / 3);
  const costUsd = (tokensUsed / 1_000_000) * 0.5; // Higher cost for 4 LLM calls

  return { content, tokensUsed, costUsd, model: 'multi-agent-debate' };
}

// ---------------------------------------------------------------------------
// Template fallback (when SDK is unavailable)
// ---------------------------------------------------------------------------

function generateTemplateResponse(options: AIPredictionOptions): AIPredictionResult {
  const { question, chart, category, tier } = options;
  const dm = typeof chart.dayMaster === 'object' ? (chart.dayMaster?.stem || 'N/A') : (chart.dayMaster || 'N/A');
  const dmEl = chart.dayMasterElement || (typeof chart.dayMaster === 'object' ? chart.dayMaster?.element : null) || 'N/A';
  const dmYY = chart.dayMasterYinYang || 'N/A';
  const zodiac = chart.zodiac || 'N/A';

  const elZh: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
  const isUserZh = /[\u4e00-\u9fff]/.test(question);
  const dmScore = (chart.elementScores && chart.elementScores[dmEl as keyof typeof chart.elementScores]) || 1;

  if (category === 'deep_destiny' || tier >= 3) {
    return {
      content: isUserZh
        ? `### 命盘深度解读 — ${dm}${dmYY === 'yang' ? '阳' : '阴'}${elZh[dmEl]}日主\n\n**四柱**：${chart.year?.stem || ''}${chart.year?.branch || ''} | ${chart.month?.stem || ''}${chart.month?.branch || ''} | ${chart.day?.stem || ''}${chart.day?.branch || ''} | ${chart.hour?.stem || ''}${chart.hour?.branch || ''}\n**生肖**：${zodiac}  **日主**：${dm}（${elZh[dmEl]}，${dmYY === 'yang' ? '阳' : '阴'}）\n\n---\n\n**性格特质**：日主${dmEl === 'wood' ? '属木，仁慈正直，有向上生长的进取心。' : dmEl === 'fire' ? '属火，热情开朗，善于表达。' : dmEl === 'earth' ? '属土，稳重踏实，信义可靠。' : dmEl === 'metal' ? '属金，果断坚毅，重义气。' : '属水，智慧灵活，善于变通。'}\n\n**五行分析**：${dmEl}${dmScore >= 3 ? '较旺' : dmScore >= 2 ? '中和' : '偏弱'}（${dmScore}分），需关注${dmEl === 'wood' ? '金、火' : dmEl === 'fire' ? '水、土' : dmEl === 'earth' ? '木、金' : dmEl === 'metal' ? '火、水' : '土、木'}的调节。\n\n**大运走向**：当前大运${(chart.luckPillars && chart.luckPillars.length > 0) ? `「${chart.luckPillars[0]?.pillar?.stem || ''}${chart.luckPillars[0]?.pillar?.branch || ''}」(${chart.luckPillars[0]?.ageRange || ''}岁)` : '暂无数据'}，${(chart.tenGods?.monthStem || 'N/A')}当令。\n\n> 此为规则引擎分析，深度推理请升级至高级别预测。`
        : `### Deep Destiny Reading — ${dm} Day Master (${dmEl}, ${dmYY})\n\n**Four Pillars**: ${chart.year?.stem || ''}${chart.year?.branch || ''} | ${chart.month?.stem || ''}${chart.month?.branch || ''} | ${chart.day?.stem || ''}${chart.day?.branch || ''} | ${chart.hour?.stem || ''}${chart.hour?.branch || ''}\n**Zodiac**: ${zodiac}  **Day Master**: ${dm} (${dmEl}, ${dmYY})\n\n---\n\n**Personality**: ${dmEl === 'wood' ? 'Wood Day Master — compassionate, upright, driven to grow.' : dmEl === 'fire' ? 'Fire Day Master — passionate, expressive, natural leader.' : dmEl === 'earth' ? 'Earth Day Master — stable, trustworthy, grounded.' : dmEl === 'metal' ? 'Metal Day Master — decisive, loyal, principled.' : 'Water Day Master — intelligent, adaptable, intuitive.'}\n\n**Element Balance**: ${dmEl} is ${dmScore >= 3 ? 'strong' : dmScore >= 2 ? 'balanced' : 'weak'} (${dmScore} pts). ${dmEl === 'wood' ? 'Metal and Fire provide regulation.' : dmEl === 'fire' ? 'Water and Earth provide grounding.' : dmEl === 'earth' ? 'Wood and Metal provide stimulation.' : dmEl === 'metal' ? 'Fire and Water provide balance.' : 'Earth and Wood provide structure.'}\n\n**Luck Pillar Direction**: Current period ${(chart.luckPillars && chart.luckPillars.length > 0) ? `${chart.luckPillars[0]?.pillar?.stem || ''}${chart.luckPillars[0]?.pillar?.branch || ''} (ages ${chart.luckPillars[0]?.ageRange || ''})` : 'data pending'}, with ${(chart.tenGods?.monthStem || 'N/A')} as the dominant influence.\n\n> This is a rule-engine analysis. Upgrade to a higher tier for deep AI reasoning.`,
      tokensUsed: 800,
      costUsd: 0,
      model: 'template',
    };
  }

  // Default: personal/objective template
  return {
    content: isUserZh
      ? `**${dm}日主（${elZh[dmEl]}，${dmYY === 'yang' ? '阳' : '阴'}）命理分析**\n\n关于您的问题"${question.slice(0, 40)}"，从八字角度分析：\n\n- **整体趋势**：${dmYY === 'yang' ? '阳干主导，势头外显' : '阴干主导，变化内敛'}，月令${(chart.tenGods?.monthStem || 'N/A')}当令。\n- **五行提示**：${dmEl}气${dmScore >= 2 ? '较旺' : '偏弱'}，需注意五行调和。\n- **十神动向**：年柱${chart.tenGods?.yearStem || 'N/A'}，月柱${chart.tenGods?.monthStem || 'N/A'}，时柱${chart.tenGods?.hourStem || 'N/A'}。\n\n> 此为规则引擎基础分析，接入AI后将提供更深入的解读。`
      : `**${dm} Day Master (${dmEl}, ${dmYY}) — Quick Reading**\n\nRegarding "${question.slice(0, 50)}":\n\n- **Trend**: ${dmYY === 'yang' ? 'Yang dominant — energy is outward and visible' : 'Yin dominant — changes are internal and subtle'}, with ${chart.tenGods?.monthStem || 'N/A'} as the dominant monthly influence.\n- **Element Hint**: ${dmEl} is ${dmScore >= 2 ? 'moderately strong' : 'relatively weak'} (${dmScore} pts). Balance is key.\n- **Ten Gods**: Year ${chart.tenGods?.yearStem || 'N/A'}, Month ${chart.tenGods?.monthStem || 'N/A'}, Hour ${chart.tenGods?.hourStem || 'N/A'}.\n\n> This is a basic rule-engine reading. AI-powered deep analysis coming soon.`,
    tokensUsed: 400,
    costUsd: 0,
    model: 'template',
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generatePrediction(options: AIPredictionOptions): Promise<AIPredictionResult> {
  const systemPrompt = buildSystemPrompt(options);

  // Multi-agent debate for L4/L5
  if (options.tier >= 4 && options.methods.includes('multi_agent')) {
    try {
      const result = await callMultiAgentDebate(options);
      if (result) return result;
    } catch (err) {
      console.error('[AI Provider] Multi-agent debate failed, falling back to single LLM:', err);
    }
  }

  // Standard LLM call for L1-L3
  try {
    const result = await callLLM(systemPrompt, options.question, options.tier);
    if (result) return result;
  } catch (err) {
    console.error('[AI Provider] LLM call failed, falling back to templates:', err);
  }

  // Fallback to template engine
  return generateTemplateResponse(options);
}