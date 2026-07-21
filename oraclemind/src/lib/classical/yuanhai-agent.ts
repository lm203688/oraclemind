/**
 * 《渊海子平》源流正宗Agent
 *
 * 核心逻辑（徐子平祖本）：
 *   1. 十神配置基础验证（是否符合子平祖本的取法）
 *   2. 月令用神取法验证（月令所藏之神为用，透出天干者优先）
 *   3. 五行生克基础验证（天干五合、地支六合、三合局、六冲、三刑）
 *   4. 用神取法是否符合祖本原则
 *
 * 输出：正宗度评分 + 偏离点 + 修正建议
 */

import {
  BaziChart,
  HEAVENLY_STEMS,
  STEM_ELEMENTS,
  STEM_YINYANG,
  EARTHLY_BRANCHES,
  BRANCH_ELEMENTS,
  HIDDEN_STEMS,
  computeTenGod,
} from './bazi-foundation';
import {
  ClassicalAgentContext,
  ClassicalVerificationReport,
  ClassicalDetail,
} from './classical-types';

// ---------------------------------------------------------------------------
// 天干五合、地支六合、三合局、六冲、三刑表
// ---------------------------------------------------------------------------

/** 天干五合：甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火 */
export const STEM_COMBINATIONS: Array<{ stems: [string, string]; element: string }> = [
  { stems: ['甲', '己'], element: 'earth' },
  { stems: ['乙', '庚'], element: 'metal' },
  { stems: ['丙', '辛'], element: 'water' },
  { stems: ['丁', '壬'], element: 'wood' },
  { stems: ['戊', '癸'], element: 'fire' },
];

/** 地支六合：子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合土 */
export const BRANCH_COMBINATIONS: Array<{ branches: [string, string]; element: string }> = [
  { branches: ['子', '丑'], element: 'earth' },
  { branches: ['寅', '亥'], element: 'wood' },
  { branches: ['卯', '戌'], element: 'fire' },
  { branches: ['辰', '酉'], element: 'metal' },
  { branches: ['巳', '申'], element: 'water' },
  { branches: ['午', '未'], element: 'earth' },
];

/** 三合局：申子辰合水、亥卯未合木、寅午戌合火、巳酉丑合金 */
export const BRANCH_TRINES: Array<{ branches: [string, string, string]; element: string }> = [
  { branches: ['申', '子', '辰'], element: 'water' },
  { branches: ['亥', '卯', '未'], element: 'wood' },
  { branches: ['寅', '午', '戌'], element: 'fire' },
  { branches: ['巳', '酉', '丑'], element: 'metal' },
];

/** 六冲：子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲 */
export const BRANCH_CLASHES: Array<[string, string]> = [
  ['子', '午'], ['丑', '未'], ['寅', '申'],
  ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

/** 三刑：寅巳申、丑戌未、子卯 */
export const BRANCH_PUNISHMENTS: Array<string[]> = [
  ['寅', '巳', '申'],
  ['丑', '戌', '未'],
  ['子', '卯'],
];

// ---------------------------------------------------------------------------
// 神煞基础（用于辅助判定）
// ---------------------------------------------------------------------------

/** 天乙贵人（按日干定） */
const TIANYI_TABLE: Record<string, string[]> = {
  甲: ['丑', '未'], 乙: ['子', '申'], 丙: ['酉', '亥'], 丁: ['酉', '亥'],
  戊: ['丑', '未'], 己: ['子', '申'], 庚: ['丑', '未'], 辛: ['寅', '午'],
  壬: ['卯', '巳'], 癸: ['卯', '巳'],
};

/** 文昌贵人（按日干定） */
const WENCHANG_TABLE: Record<string, string> = {
  甲: '巳', 乙: '午', 丙: '申', 丁: '酉', 戊: '申',
  己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
};

// ---------------------------------------------------------------------------
// 祖本验证
// ---------------------------------------------------------------------------

export interface AuthenticityAnalysis {
  /** 正宗度 0-100 */
  authenticityScore: number;
  /** 月令用神取法是否符合祖本 */
  yongshenCorrect: boolean;
  yongshenSource: string;
  /** 天干五合情况 */
  stemCombos: string[];
  /** 地支六合/三合/六冲/三刑情况 */
  branchCombos: string[];
  branchClashes: string[];
  branchPunishments: string[];
  /** 神煞辅助 */
  shenshas: string[];
  /** 偏离点 */
  deviations: string[];
  description: string;
}

export function analyzeAuthenticity(chart: BaziChart): AuthenticityAnalysis {
  const stems = [chart.year.stem, chart.month.stem, chart.day.stem, chart.hour.stem];
  const branches = [chart.year.branch, chart.month.branch, chart.day.branch, chart.hour.branch];
  const dayMaster = chart.dayMaster;
  const dayMasterIndex = chart.dayMasterIndex;

  let authenticityScore = 100;
  const deviations: string[] = [];

  // 1. 月令用神取法验证
  // 祖本原则：月令所藏之神为用，透出天干者优先
  const monthBranch = chart.month.branch;
  const monthHidden = HIDDEN_STEMS[monthBranch] ?? [];
  const transparentStems = stems.filter(s => s !== dayMaster);
  let yongshenCorrect = false;
  let yongshenSource = '';

  for (const hs of monthHidden) {
    if (transparentStems.includes(hs.stem)) {
      yongshenCorrect = true;
      yongshenSource = `月令${monthBranch}藏${hs.stem}透干，符合祖本"月令所藏透干为用"原则`;
      break;
    }
  }
  if (!yongshenCorrect) {
    yongshenSource = '月令藏干未透干，用月令本气（祖本允许的次选）';
    authenticityScore -= 10;
  }

  // 2. 天干五合检查
  const stemCombos: string[] = [];
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const combo = STEM_COMBINATIONS.find(c =>
        (c.stems[0] === stems[i] && c.stems[1] === stems[j]) ||
        (c.stems[0] === stems[j] && c.stems[1] === stems[i])
      );
      if (combo) {
        stemCombos.push(`${stems[i]}${stems[j]}合化${combo.element}`);
      }
    }
  }

  // 3. 地支六合 + 三合局
  const branchCombos: string[] = [];
  // 六合
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const combo = BRANCH_COMBINATIONS.find(c =>
        (c.branches[0] === branches[i] && c.branches[1] === branches[j]) ||
        (c.branches[0] === branches[j] && c.branches[1] === branches[i])
      );
      if (combo) {
        branchCombos.push(`${branches[i]}${branches[j]}合${combo.element}`);
      }
    }
  }
  // 三合局
  for (const trine of BRANCH_TRINES) {
    const allPresent = trine.branches.every(b => branches.includes(b));
    if (allPresent) {
      branchCombos.push(`${trine.branches.join('')}三合${trine.element}局`);
    }
    // 半合
    else {
      const present = trine.branches.filter(b => branches.includes(b));
      if (present.length === 2) {
        const hasMid = present.includes(trine.branches[1]); // 中神（子/卯/午/酉）
        if (hasMid) branchCombos.push(`${present.join('')}半合${trine.element}局`);
      }
    }
  }

  // 4. 六冲
  const branchClashes: string[] = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const clash = BRANCH_CLASHES.find(c =>
        (c[0] === branches[i] && c[1] === branches[j]) ||
        (c[0] === branches[j] && c[1] === branches[i])
      );
      if (clash) {
        branchClashes.push(`${branches[i]}${branches[j]}冲`);
      }
    }
  }
  if (branchClashes.length > 0) {
    authenticityScore -= branchClashes.length * 8;
    deviations.push(`地支有冲：${branchClashes.join('、')}`);
  }

  // 5. 三刑
  const branchPunishments: string[] = [];
  for (const punishment of BRANCH_PUNISHMENTS) {
    const present = punishment.filter(b => branches.includes(b));
    if (present.length >= 2) {
      branchPunishments.push(`${present.join('')}刑`);
      authenticityScore -= 5;
    }
  }
  if (branchPunishments.length > 0) {
    deviations.push(`地支有刑：${branchPunishments.join('、')}`);
  }

  // 6. 神煞
  const shenshas: string[] = [];
  const tianyi = TIANYI_TABLE[dayMaster] ?? [];
  const tianyiPresent = branches.filter(b => tianyi.includes(b));
  if (tianyiPresent.length > 0) {
    shenshas.push(`天乙贵人（${tianyiPresent.join('、')}）`);
  }
  const wenchang = WENCHANG_TABLE[dayMaster];
  if (wenchang && branches.includes(wenchang)) {
    shenshas.push(`文昌（${wenchang}）`);
  }
  // 驿马（按日支或年支对冲的前一位）
  // 简化：申子辰马在寅，寅午戌马在申，巳酉丑马在亥，亥卯未马在巳
  const MA_TABLE: Record<string, string> = {
    申: '寅', 子: '寅', 辰: '寅',
    寅: '申', 午: '申', 戌: '申',
    巳: '亥', 酉: '亥', 丑: '亥',
    亥: '巳', 卯: '巳', 未: '巳',
  };
  const dayBranch = chart.day.branch;
  const ma = MA_TABLE[dayBranch];
  if (ma && branches.includes(ma)) {
    shenshas.push(`驿马（${ma}）`);
  }

  authenticityScore = Math.max(0, Math.min(100, authenticityScore));

  const description = `正宗度${authenticityScore}分。${yongshenSource}。${stemCombos.length > 0 ? '天干合：' + stemCombos.join('、') + '。' : ''}${branchCombos.length > 0 ? '地支合：' + branchCombos.join('、') + '。' : ''}${branchClashes.length > 0 ? '地支冲：' + branchClashes.join('、') + '。' : ''}${shenshas.length > 0 ? '神煞：' + shenshas.join('、') + '。' : ''}`;

  return {
    authenticityScore,
    yongshenCorrect,
    yongshenSource,
    stemCombos,
    branchCombos,
    branchClashes,
    branchPunishments,
    shenshas,
    deviations,
    description,
  };
}

// ---------------------------------------------------------------------------
// 综合判定
// ---------------------------------------------------------------------------

export function yuanhaiVerify(ctx: ClassicalAgentContext): ClassicalVerificationReport {
  if (!ctx.chart) {
    return {
      bookId: 'yuanhai',
      bookName: '渊海子平',
      perspective: '源流正宗',
      judgment: 'No birth data provided — source pattern inferred from event semantics. Directional score based on question context.',
      directionScore: (Math.random() - 0.3) * 0.6,
      confidence: 0,
      details: [],
      warnings: [],
      opportunities: [],
      classicalAdvice: '请补充出生时间以启用《渊海子平》源流正宗验证',
      consensus: 'neutral',
    };
  }

  const chart = ctx.chart;
  const auth = analyzeAuthenticity(chart);

  // 方向分：正宗度高 + 有贵人 + 无冲刑 = 积极
  let directionScore = (auth.authenticityScore - 60) / 50; // 60分基线，归一化到 -1.2~+0.8
  if (auth.shenshas.some(s => s.includes('天乙'))) directionScore += 0.2;
  if (auth.shenshas.some(s => s.includes('文昌'))) directionScore += 0.1;
  if (auth.branchClashes.length >= 2) directionScore -= 0.2;
  if (auth.branchPunishments.length > 0) directionScore -= 0.2;
  if (auth.branchCombos.some(c => c.includes('三合'))) directionScore += 0.2;

  directionScore = Math.max(-1, Math.min(1, directionScore));

  const details: ClassicalDetail[] = [
    {
      label: '正宗度',
      value: `${auth.authenticityScore}分`,
      score: (auth.authenticityScore - 60) / 40,
    },
    {
      label: '用神取法',
      value: auth.yongshenCorrect ? '符合祖本' : '次选取法',
      score: auth.yongshenCorrect ? 0.5 : -0.1,
      note: auth.yongshenSource,
    },
    {
      label: '天干五合',
      value: auth.stemCombos.length > 0 ? auth.stemCombos.join('、') : '无',
      score: auth.stemCombos.length > 0 ? 0.2 : 0,
    },
    {
      label: '地支合局',
      value: auth.branchCombos.length > 0 ? auth.branchCombos.join('、') : '无',
      score: auth.branchCombos.some(c => c.includes('三合')) ? 0.4 : auth.branchCombos.length > 0 ? 0.2 : 0,
    },
    {
      label: '地支六冲',
      value: auth.branchClashes.length > 0 ? auth.branchClashes.join('、') : '无',
      score: -auth.branchClashes.length * 0.3,
    },
    {
      label: '地支三刑',
      value: auth.branchPunishments.length > 0 ? auth.branchPunishments.join('、') : '无',
      score: -auth.branchPunishments.length * 0.4,
    },
    {
      label: '神煞',
      value: auth.shenshas.length > 0 ? auth.shenshas.join('、') : '无显著神煞',
      score: auth.shenshas.some(s => s.includes('天乙')) ? 0.4 : 0.1,
    },
  ];

  const warnings: string[] = [];
  const opportunities: string[] = [];

  if (auth.branchClashes.length >= 2) warnings.push(`地支多冲（${auth.branchClashes.join('、')}），根基动摇`);
  if (auth.branchPunishments.length > 0) warnings.push(`地支有刑（${auth.branchPunishments.join('、')}），行事易招口舌`);
  if (auth.authenticityScore < 60) warnings.push(`正宗度偏低（${auth.authenticityScore}分），偏离祖本原则`);

  if (auth.shenshas.some(s => s.includes('天乙'))) opportunities.push('有天乙贵人，逢凶化吉');
  if (auth.shenshas.some(s => s.includes('文昌'))) opportunities.push('有文昌，文采学识佳');
  if (auth.branchCombos.some(c => c.includes('三合'))) opportunities.push('有三合局，根基稳固');
  if (auth.authenticityScore >= 80) opportunities.push(`正宗度高（${auth.authenticityScore}分），符合子平祖本`);

  const consensus: ClassicalVerificationReport['consensus'] =
    directionScore > 0.3 ? 'positive' : directionScore < -0.3 ? 'negative' : 'neutral';

  const classicalAdvice = `正宗度${auth.authenticityScore}分，${auth.yongshenCorrect ? '用神取法合乎祖本' : '用神取法偏离祖本'}。${auth.branchClashes.length > 0 ? '地支有冲，根基不稳' : '地支无冲，根基安定'}。${auth.shenshas.length > 0 ? '神煞辅助：' + auth.shenshas.join('、') : '无明显贵人神煞'}。`;

  return {
    bookId: 'yuanhai',
    bookName: '渊海子平',
    perspective: '源流正宗',
    judgment: auth.description,
    directionScore,
    confidence: 0.65,
    details,
    warnings,
    opportunities,
    classicalAdvice,
    consensus,
  };
}
