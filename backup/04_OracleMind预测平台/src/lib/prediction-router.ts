/**
 * Prediction Router — Smart classification & routing engine
 *
 * Analyses a user's natural-language question and determines:
 *  - Which prediction category it falls into (objective / personal / deep destiny)
 *  - Which prediction methods should be used
 *  - Estimated cost, token usage, tier, and latency
 *
 * This module is pure logic with zero side-effects.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PredictionMethod = 'rule_engine' | 'statistical' | 'multi_agent';

export type EventCategory = 'objective' | 'personal_related' | 'deep_destiny';

/** Optional user context that can refine classification */
export interface UserProfile {
  id?: string;
  preferredLanguage?: 'en' | 'zh';
  previousCategories?: EventCategory[];
  subscriptionTier?: number;
}

/** Result returned by `classifyEvent` */
export interface PredictionRoute {
  /** Primary category for the question */
  category: EventCategory;
  /** Ordered list of prediction methods to invoke */
  methods: PredictionMethod[];
  /** Estimated LLM token consumption across all methods */
  estimatedTokens: number;
  /** Estimated monetary cost in USD */
  estimatedCost: number;
  /** Complexity tier (1 = simplest, 5 = most complex) */
  tier: number;
  /** Human-readable estimated processing time */
  estimatedTime: string;
  /** Confidence score 0–1 of the classification */
  confidence: number;
  /** Matched keywords that drove the classification */
  matchedKeywords: string[];
}

// ---------------------------------------------------------------------------
// Keyword dictionaries
// ---------------------------------------------------------------------------

/** Keywords that indicate an **objective** (external, measurable) event */
const OBJECTIVE_KEYWORDS: Record<string, string[]> = {
  en: [
    'stock market', 'stocks', 'election', 'weather', 'sports', 'game',
    'price', 'economy', 'gdp', 'inflation', 'interest rate', 'market',
    'lottery', 'bitcoin', 'crypto', 'football', 'soccer', 'basketball',
    'baseball', 'temperature', 'rain', 'hurricane', 'earthquake',
    'war', 'peace treaty', 'score', 'winner', 'tournament', 'championship',
    'poll', 'vote', 'referendum', 'ipo', 'earnings', 'revenue',
  ],
  zh: [
    '股市', '股票', '大盘', '选举', '天气', '比赛', '体育',
    '价格', '经济', 'GDP', '通胀', '利率', '市场',
    '彩票', '比特币', '加密货币', '足球', '篮球',
    '气温', '下雨', '台风', '地震',
    '战争', '和平', '比分', '冠军', '锦标赛',
    '民调', '投票', '公投', '上市', '财报',
  ],
};

/** Keywords that indicate a **personal-related** event */
const PERSONAL_KEYWORDS: Record<string, string[]> = {
  en: [
    'job', 'career', 'work', 'relationship', 'marriage', 'project',
    'business', 'partner', 'love', 'date', 'interview', 'promotion',
    'salary', 'raise', 'bonus', 'investment', 'travel', 'move',
    'house', 'buy', 'sell', 'health', 'surgery', 'exam', 'study',
    'school', 'college', 'degree', 'freelance', 'startup', 'invest',
    'switch job', 'job change', 'quit', 'resign', 'layoff',
    'blind date', 'engagement', 'divorce', 'baby', 'pregnancy',
    'loan', 'mortgage', 'debt', 'contract', 'negotiation',
  ],
  zh: [
    '工作', '事业', '职业', '关系', '婚姻', '项目',
    '生意', '伴侣', '爱情', '约会', '面试', '晋升',
    '薪水', '奖金', '投资', '旅行', '搬家', '购房',
    '健康', '手术', '考试', '学业', '创业', '自由职业',
  ],
};

/** Keywords that indicate a **deep destiny** question */
const DEEP_KEYWORDS: Record<string, string[]> = {
  en: [
    'life purpose', 'destiny', 'personality', 'future', 'fate',
    'meaning of life', 'soul', 'karma', 'past life', 'reincarnation',
    'spiritual', 'fortune', 'luck', 'bazi', 'four pillars',
    'eight characters', 'horoscope', 'astrology', 'numerology',
    'destiny analysis', 'life path', 'birth chart', 'natal chart',
    ' compatibility', 'matchmaking', 'soulmate', 'twin flame',
    'element analysis', 'five elements', 'bazi reading',

  ],
  zh: [
    '人生目标', '命运', '性格', '未来', '缘分', '命理',
    '八字', '四柱', '星象', '星座', '生辰八字', '命盘',
    '五行', '十神', '大运', '流年', '运势',
    '性格分析', '灵魂', '因果',
    '桃花运', '贵人', '劫数', '化解',
  ],
};

/**
 * Multi-word complexity indicators that push the question to a higher tier.
 * These suggest the user wants a deep, multi-faceted analysis.
 */
const COMPLEXITY_BOOSTERS = [
  'detailed analysis', 'in depth', 'comprehensive', 'full reading',
  'comprehensive analysis', 'thorough', 'complete', 'all aspects',
  '详细分析', '深入', '全面', '完整', '综合',
  '多维度', '全方位', '深度解读',
];

// ---------------------------------------------------------------------------
// Tier configuration
// ---------------------------------------------------------------------------

interface TierConfig {
  tier: number;
  methods: PredictionMethod[];
  tokens: number;
  cost: number;
  time: string;
  label: string;
}

const TIERS: Record<number, TierConfig> = {
  1: {
    tier: 1,
    methods: ['rule_engine'],
    tokens: 2_000,
    cost: 0.01,
    time: '5 seconds',
    label: 'Simple factual lookup',
  },
  2: {
    tier: 2,
    methods: ['rule_engine', 'statistical'],
    tokens: 10_000,
    cost: 0.05,
    time: '15 seconds',
    label: 'Standard prediction',
  },
  3: {
    tier: 3,
    methods: ['rule_engine', 'statistical'],
    tokens: 50_000,
    cost: 0.30,
    time: '1-2 minutes',
    label: 'Complex standard analysis',
  },
  4: {
    tier: 4,
    methods: ['rule_engine', 'statistical', 'multi_agent'],
    tokens: 200_000,
    cost: 1.00,
    time: '2-5 minutes',
    label: 'Deep multi-agent analysis',
  },
  5: {
    tier: 5,
    methods: ['rule_engine', 'statistical', 'multi_agent'],
    tokens: 500_000,
    cost: 2.50,
    time: '5-10 minutes',
    label: 'Full destiny reading',
  },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalise a string for keyword matching:
 *   - lowercase
 *   - collapse whitespace
 *   - strip punctuation (except CJK)
 */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, ' ')  // keep word chars & CJK
    .trim();
}

/**
 * Find all keyword matches in the normalised query string.
 * Returns matched keyword strings.
 */
function findMatches(query: string, keywords: string[]): string[] {
  const norm = normalise(query);
  return keywords.filter((kw) => {
    const kwNorm = kw.toLowerCase();
    return norm.includes(kwNorm);
  });
}

/**
 * Count complexity boosters present in the query.
 */
function countComplexityBoosters(query: string): number {
  const norm = normalise(query);
  return COMPLEXITY_BOOSTERS.filter((b) => norm.includes(b.toLowerCase())).length;
}

/**
 * Estimate question complexity by:
 *   - Word / character count
 *   - Number of distinct concepts mentioned
 *   - Presence of multiple categories
 */
function estimateQuestionComplexity(query: string, catScores: number[]): number {
  // Length factor (0–1)
  const charCount = query.length;
  const lengthFactor = Math.min(charCount / 200, 1);

  // Category overlap factor (0–1) — how many categories scored above 0
  const activeCategories = catScores.filter((s) => s > 0).length;
  const overlapFactor = Math.min((activeCategories - 1) / 2, 1);

  // Combine
  return lengthFactor * 0.5 + overlapFactor * 0.5;
}

/**
 * Determine the appropriate tier based on category and complexity signals.
 */
function resolveTier(
  primaryCategory: EventCategory,
  complexity: number,
  boosters: number,
  userTier?: number,
): number {
  // Base tier by category
  let base: number;
  switch (primaryCategory) {
    case 'objective':
      base = 1;
      break;
    case 'personal_related':
      base = 2;
      break;
    case 'deep_destiny':
      base = 3;
      break;
  }

  // Complexity pushes tier up
  if (complexity > 0.6) base = Math.min(base + 1, 5);
  if (boosters >= 2) base = Math.min(base + 1, 5);

  // Respect user's subscription tier (never assign a tier above their plan)
  if (userTier && base > userTier) {
    base = userTier;
  }

  return Math.max(1, Math.min(5, base));
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Classify a user's question and return the optimal prediction route.
 *
 * Uses keyword matching across English and Chinese dictionaries to determine
 * the event category, then selects the appropriate tier and methods based on
 * complexity heuristics and optional user profile constraints.
 *
 * @param userQuestion  - The user's natural-language question
 * @param userProfile   - Optional user context for tier gating
 * @returns A `PredictionRoute` with all routing metadata
 *
 * @example
 * ```ts
 * const route = classifyEvent('Will the stock market go up next month?');
 * // route.category === 'objective'
 * // route.tier === 1
 * ```
 */
export function classifyEvent(
  userQuestion: string,
  userProfile?: UserProfile,
): PredictionRoute {
  const lang = userProfile?.preferredLanguage ?? 'en';

  // ---- Keyword matching ----
  const objectiveMatches = [
    ...findMatches(userQuestion, OBJECTIVE_KEYWORDS.en),
    ...findMatches(userQuestion, OBJECTIVE_KEYWORDS.zh),
  ];
  const personalMatches = [
    ...findMatches(userQuestion, PERSONAL_KEYWORDS.en),
    ...findMatches(userQuestion, PERSONAL_KEYWORDS.zh),
  ];
  const deepMatches = [
    ...findMatches(userQuestion, DEEP_KEYWORDS.en),
    ...findMatches(userQuestion, DEEP_KEYWORDS.zh),
  ];

  // ---- Score each category ----
  const objectiveScore = objectiveMatches.length;
  const personalScore = personalMatches.length;
  const deepScore = deepMatches.length;
  const catScores = [objectiveScore, personalScore, deepScore];

  // ---- Determine primary category ----
  let category: EventCategory;
  let matchedKeywords: string[];

  if (objectiveScore >= personalScore && objectiveScore >= deepScore) {
    category = 'objective';
    matchedKeywords = objectiveMatches;
  } else if (personalScore >= deepScore) {
    category = 'personal_related';
    matchedKeywords = personalMatches;
  } else {
    category = 'deep_destiny';
    matchedKeywords = deepMatches;
  }

  // ---- No keywords matched? Use heuristic fallback ----
  if (matchedKeywords.length === 0) {
    // Default: treat unknown questions as personal_related tier 1
    category = 'personal_related';
    matchedKeywords = [];
  }

  // ---- Complexity analysis ----
  const complexity = estimateQuestionComplexity(userQuestion, catScores);
  const boosters = countComplexityBoosters(userQuestion);

  // ---- Tier resolution ----
  const tier = resolveTier(category, complexity, boosters, userProfile?.subscriptionTier);
  const tierConfig = TIERS[tier];

  // ---- Confidence ----
  const maxScore = Math.max(objectiveScore, personalScore, deepScore, 1);
  const totalScore = objectiveScore + personalScore + deepScore;
  const confidence = totalScore === 0
    ? 0.3 // low confidence for unmatched queries
    : Math.min(maxScore / totalScore, 1);

  return {
    category,
    methods: tierConfig.methods,
    estimatedTokens: tierConfig.tokens,
    estimatedCost: tierConfig.cost,
    tier: tierConfig.tier,
    estimatedTime: tierConfig.time,
    confidence,
    matchedKeywords,
  };
}

/**
 * Return the full tier configuration table (useful for UI display).
 */
export function getTierConfigs(): TierConfig[] {
  return Object.values(TIERS);
}

/**
 * Quick check whether a question is likely answerable by rule-engine only
 * (cheapest path). Useful for pre-flight optimisation.
 */
export function isSimpleQuestion(userQuestion: string): boolean {
  const route = classifyEvent(userQuestion);
  return route.tier === 1 && route.confidence > 0.5;
}
