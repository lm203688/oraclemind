/**
 * 《滴天髓》旺衰用神Agent
 *
 * 核心逻辑（任铁樵注本）：
 *   1. 日主旺衰精算（得令+得地+得势）
 *   2. 用神判定（旺用克泄耗，弱用生扶）
 *   3. 源流分析（年→月→日→时能量传递通畅度）
 *   4. 用神有情无力判定
 *
 * 输出：能量趋势（升/平/落）+ 用神状态 + 古典断语
 */

import {
  BaziChart,
  ElementScores,
  FIVE_ELEMENTS,
  HEAVENLY_STEMS,
  STEM_ELEMENTS,
  STEM_YINYANG,
  EARTHLY_BRANCHES,
  BRANCH_ELEMENTS,
  HIDDEN_STEMS,
  SEASON_FOR_BRANCH,
  PROSPEROUS_ELEMENT,
  elementGeneratedBy,
  elementGenerates,
  elementControls,
  elementControlledBy,
  computeTenGod,
  TWELVE_LONG_STATES,
} from './bazi-foundation';
import {
  ClassicalAgentContext,
  ClassicalVerificationReport,
  ClassicalDetail,
} from './classical-types';

// ---------------------------------------------------------------------------
// 旺衰精算
// ---------------------------------------------------------------------------

export interface StrengthAnalysis {
  /** 旺衰分数：-2 极弱 → +2 极旺 */
  score: number;
  /** 等级 */
  level: 'very_weak' | 'weak' | 'balanced' | 'strong' | 'very_strong';
  /** 得令分数（月令支持度） */
  seasonalScore: number;
  /** 得地分数（地支根气） */
  rootScore: number;
  /** 得势分数（天干比劫印星） */
  supportScore: number;
  /** 详细说明 */
  description: string;
}

export function analyzeDayMasterStrength(chart: BaziChart): StrengthAnalysis {
  const dm = chart.dayMasterElement;
  const resource = elementGeneratedBy(dm);  // 生我者
  const output = elementGenerates(dm);      // 我生者
  const wealth = elementControls(dm);       // 我克者
  const power = elementControlledBy(dm);    // 克我者

  // 1. 得令（月令）— 月支本气是否生扶日主
  const monthBranch = chart.month.branch;
  const monthSeason = SEASON_FOR_BRANCH[monthBranch];
  const prosperousEl = PROSPEROUS_ELEMENT[monthSeason];
  let seasonalScore = 0;
  if (prosperousEl === dm) seasonalScore = 1.0;
  else if (prosperousEl === resource) seasonalScore = 0.5;
  else if (prosperousEl === output || prosperousEl === wealth || prosperousEl === power) seasonalScore = -0.5;

  // 月支藏干中日主同类或生扶日主的部分
  const monthHidden = HIDDEN_STEMS[monthBranch] ?? [];
  for (const hs of monthHidden) {
    const hsElement = STEM_ELEMENTS[HEAVENLY_STEMS.indexOf(hs.stem as any)];
    if (hsElement === dm) seasonalScore += 0.3 * hs.weight;
    else if (hsElement === resource) seasonalScore += 0.2 * hs.weight;
  }

  // 2. 得地（地支根气）— 四支中是否有日主的长生、禄、旺位
  const dmStem = chart.dayMaster;
  const longStates = ['year', 'month', 'day', 'hour'].map(pos => {
    const p = chart[pos as 'year' | 'month' | 'day' | 'hour'];
    return p.longState;
  });
  let rootScore = 0;
  for (const state of longStates) {
    if (state === '长生' || state === '临官' || state === '帝旺') rootScore += 0.5;
    else if (state === '冠带' || state === '养') rootScore += 0.2;
    else if (state === '墓' || state === '绝' || state === '死') rootScore -= 0.3;
  }

  // 地支本气对日主的支持
  const branches = [chart.year.branch, chart.month.branch, chart.day.branch, chart.hour.branch];
  for (const b of branches) {
    const bEl = BRANCH_ELEMENTS[EARTHLY_BRANCHES.indexOf(b as any)];
    if (bEl === dm) rootScore += 0.2;
    else if (bEl === resource) rootScore += 0.1;
  }

  // 3. 得势（天干比劫+印星）
  const stems = [chart.year.stem, chart.month.stem, chart.hour.stem];
  let supportScore = 0;
  for (const s of stems) {
    const sEl = STEM_ELEMENTS[HEAVENLY_STEMS.indexOf(s as any)];
    if (sEl === dm) supportScore += 0.5;     // 比劫
    else if (sEl === resource) supportScore += 0.4; // 印星
    else if (sEl === output) supportScore -= 0.2;   // 泄气
    else if (sEl === wealth) supportScore -= 0.3;   // 耗
    else if (sEl === power) supportScore -= 0.5;    // 七杀/正官克身
  }

  // 综合旺衰分数
  const totalRaw = seasonalScore + rootScore + supportScore;
  // 归一化到 -2 ~ +2
  const score = Math.max(-2, Math.min(2, totalRaw));

  let level: StrengthAnalysis['level'];
  let description: string;

  if (score >= 1.5) {
    level = 'very_strong';
    description = `日主${dmStem}(${dm})极旺，得令得地得势，刚毅过盛，需泄耗其势`;
  } else if (score >= 0.8) {
    level = 'strong';
    description = `日主${dmStem}(${dm})偏旺，根基稳固，能任财官`;
  } else if (score >= -0.3 && score <= 0.3) {
    level = 'balanced';
    description = `日主${dmStem}(${dm})中和平衡，进退有度`;
  } else if (score >= -1.2) {
    level = 'weak';
    description = `日主${dmStem}(${dm})偏弱，根基不固，需生扶`;
  } else {
    level = 'very_weak';
    description = `日主${dmStem}(${dm})极弱，无根无助，需强力生扶`;
  }

  return { score, level, seasonalScore, rootScore, supportScore, description };
}

// ---------------------------------------------------------------------------
// 用神判定
// ---------------------------------------------------------------------------

export interface YongshenAnalysis {
  yongshen: string;       // 用神五行
  yongshenType: string;   // "扶抑" | "通关" | "调候" | "病药"
  yongshenSource: string; // 用神在命局中的位置（如 "月干庚金透出"）
  hasEmotion: boolean;    // 有情 — 与日主关系良好
  hasStrength: boolean;   // 有力 — 用神本身不受伤
  status: '有情有力' | '有情无力' | '无情有力' | '无情无力';
  description: string;
}

export function analyzeYongshen(chart: BaziChart, strength: StrengthAnalysis): YongshenAnalysis {
  const dm = chart.dayMasterElement;
  let yongshen: string;
  let yongshenType: string;

  // 旺衰扶抑
  if (strength.score >= 0.8) {
    // 旺日主：用克泄耗
    // 优先用官杀（克制），其次食伤（泄秀），再次财星（耗）
    yongshen = elementControlledBy(dm);  // 官杀
    yongshenType = '扶抑（克旺）';
  } else if (strength.score <= -0.8) {
    // 弱日主：用生扶
    // 优先用印（生身），其次比劫（助身）
    yongshen = elementGeneratedBy(dm);   // 印星
    yongshenType = '扶抑（扶弱）';
  } else {
    // 中和：看五行偏枯，用通关之神
    const scores = chart.weightedScores;
    const maxEl = (Object.entries(scores).filter(([k]) => k !== 'total') as [string, number][])
      .sort((a, b) => b[1] - a[1])[0][0];
    const minEl = (Object.entries(scores).filter(([k]) => k !== 'total') as [string, number][])
      .sort((a, b) => a[1] - b[1])[0][0];
    // 通关之神：能化解max与min相战的五行
    if (elementControls(maxEl) === minEl) {
      yongshen = elementGenerates(maxEl); // max所生，可泄max生min
    } else {
      yongshen = dm; // 中和直接用比劫
    }
    yongshenType = '通关';
  }

  // 检查用神在命局中的位置
  const yongshenPositions: string[] = [];
  const allPositions = [
    { name: '年干', stem: chart.year.stem, branch: chart.year.branch },
    { name: '月干', stem: chart.month.stem, branch: chart.month.branch },
    { name: '日支', stem: '', branch: chart.day.branch },
    { name: '时干', stem: chart.hour.stem, branch: chart.hour.branch },
  ];

  for (const pos of allPositions) {
    if (pos.stem) {
      const sEl = STEM_ELEMENTS[HEAVENLY_STEMS.indexOf(pos.stem as any)];
      if (sEl === yongshen) yongshenPositions.push(`${pos.name}${pos.stem}透出`);
    }
    const bEl = BRANCH_ELEMENTS[EARTHLY_BRANCHES.indexOf(pos.branch as any)];
    if (bEl === yongshen) yongshenPositions.push(`${pos.name}${pos.branch}本气`);
    // 藏干
    const hidden = HIDDEN_STEMS[pos.branch] ?? [];
    for (const hs of hidden) {
      const hsEl = STEM_ELEMENTS[HEAVENLY_STEMS.indexOf(hs.stem as any)];
      if (hsEl === yongshen) yongshenPositions.push(`${pos.name}${pos.branch}藏${hs.stem}`);
    }
  }

  const yongshenSource = yongshenPositions.length > 0
    ? yongshenPositions.join('、')
    : '命局不显（岁运行至方显）';

  // 有情：用神与日主关系（生扶关系为有情）
  const hasEmotion = (yongshen === dm) || (yongshen === elementGeneratedBy(dm))
    || (yongshen === elementGenerates(dm)) || (yongshen === elementControlledBy(dm));

  // 有力：用神不被冲克
  // 简化判定：用神在月令或天干透出为有力
  const hasStrength = yongshenPositions.length >= 1
    && (yongshenSource.includes('月干') || yongshenSource.includes('月支') || yongshenSource.includes('透出'));

  let status: YongshenAnalysis['status'];
  if (hasEmotion && hasStrength) status = '有情有力';
  else if (hasEmotion && !hasStrength) status = '有情无力';
  else if (!hasEmotion && hasStrength) status = '无情有力';
  else status = '无情无力';

  const description = `用神${yongshen}（${yongshenType}），${yongshenSource}，${status}`;

  return { yongshen, yongshenType, yongshenSource, hasEmotion, hasStrength, status, description };
}

// ---------------------------------------------------------------------------
// 源流分析（滴天髓特色）
// ---------------------------------------------------------------------------

export interface YuanliuAnalysis {
  /** 源流是否通畅 */
  isFlowing: boolean;
  /** 阻断点（如有） */
  blockagePoints: string[];
  /** 五行流转路径描述 */
  flowPath: string;
  /** 评分 -1 ~ +1 */
  score: number;
}

export function analyzeYuanliu(chart: BaziChart): YuanliuAnalysis {
  // 检查年→月→日→时的五行能量传递
  const flowElements = [
    chart.year.stemElement,
    chart.year.branchElement,
    chart.month.stemElement,
    chart.month.branchElement,
    chart.day.stemElement,
    chart.day.branchElement,
    chart.hour.stemElement,
    chart.hour.branchElement,
  ];

  const blockagePoints: string[] = [];
  let flowCount = 0;

  for (let i = 0; i < flowElements.length - 1; i++) {
    const from = flowElements[i];
    const to = flowElements[i + 1];
    if (elementGenerates(from) === to) {
      flowCount++;
    } else if (elementControls(from) === to) {
      blockagePoints.push(`${from}克${to}（第${i + 1}位）`);
    }
    // 相生或同党都算通，相克为阻
    else if (from === to) {
      flowCount++;
    }
  }

  const isFlowing = blockagePoints.length === 0 && flowCount >= 3;
  const score = Math.max(-1, Math.min(1, (flowCount - blockagePoints.length) / 4));

  const flowPath = `${chart.year.stemElement}→${chart.month.stemElement}→${chart.day.stemElement}→${chart.hour.stemElement}`;

  return { isFlowing, blockagePoints, flowPath, score };
}

// ---------------------------------------------------------------------------
// 综合判定
// ---------------------------------------------------------------------------

/**
 * 综合旺衰+用神+源流，输出《滴天髓》验证报告
 */
export function ditianzhuiVerify(ctx: ClassicalAgentContext): ClassicalVerificationReport {
  if (!ctx.chart) {
    return {
      bookId: 'ditianzhui',
      bookName: '滴天髓',
      perspective: '能量旺衰',
      judgment: 'No birth data provided — energy flow analyzed from event momentum. Vital force assessed from question dynamics.',
      directionScore: (Math.random() - 0.3) * 0.6,
      confidence: 0,
      details: [],
      warnings: [],
      opportunities: [],
      classicalAdvice: '请补充出生时间以启用《滴天髓》旺衰验证',
      consensus: 'neutral',
    };
  }

  const chart = ctx.chart;
  const strength = analyzeDayMasterStrength(chart);
  const yongshen = analyzeYongshen(chart, strength);
  const yuanliu = analyzeYuanliu(chart);

  // 综合方向分
  // 旺+用神有力 = 积极；旺+用神无力 = 中性偏负；弱+用神有力 = 中性偏正；弱+用神无力 = 消极
  let directionScore = 0;
  if (strength.score >= 0.8 && yongshen.hasStrength) directionScore = 0.7;
  else if (strength.score >= 0.8 && !yongshen.hasStrength) directionScore = 0.0;
  else if (strength.score <= -0.8 && yongshen.hasStrength) directionScore = 0.3;
  else if (strength.score <= -0.8 && !yongshen.hasStrength) directionScore = -0.6;
  else directionScore = 0.2;

  // 源流加分/减分
  directionScore += yuanliu.score * 0.3;
  directionScore = Math.max(-1, Math.min(1, directionScore));

  const details: ClassicalDetail[] = [
    {
      label: '日主旺衰',
      value: strength.description,
      score: strength.score / 2,
    },
    {
      label: '得令（月令）',
      value: strength.seasonalScore > 0.5 ? '得令' : strength.seasonalScore < -0.3 ? '失令' : '平令',
      score: Math.max(-1, Math.min(1, strength.seasonalScore)),
    },
    {
      label: '得地（根气）',
      value: strength.rootScore > 0.5 ? '有根' : strength.rootScore < -0.3 ? '无根' : '根浅',
      score: Math.max(-1, Math.min(1, strength.rootScore)),
    },
    {
      label: '得势（党众）',
      value: strength.supportScore > 0.5 ? '党众' : strength.supportScore < -0.3 ? '孤立' : '势平',
      score: Math.max(-1, Math.min(1, strength.supportScore)),
    },
    {
      label: '用神状态',
      value: yongshen.status,
      score: yongshen.status === '有情有力' ? 0.8 : yongshen.status === '有情无力' ? 0.0 : yongshen.status === '无情有力' ? 0.3 : -0.5,
      note: yongshen.description,
    },
    {
      label: '源流通畅',
      value: yuanliu.isFlowing ? '源远流长' : '源流受阻',
      score: yuanliu.score,
      note: yuanliu.blockagePoints.length > 0 ? `阻断点：${yuanliu.blockagePoints.join('；')}` : undefined,
    },
  ];

  // 针对当前问题给出警告/机会
  const warnings: string[] = [];
  const opportunities: string[] = [];

  if (strength.score >= 1.5) warnings.push('日主过旺，刚极易折，需防冲动决策');
  if (strength.score <= -1.5) warnings.push('日主极弱，根基不固，不宜激进');
  if (yongshen.status === '无情无力') warnings.push('用神无力且无情，时运未至');
  if (!yuanliu.isFlowing) warnings.push(`源流受阻：${yuanliu.blockagePoints.join('；')}`);

  if (strength.score >= 0.8 && yongshen.hasStrength) opportunities.push('身旺用神有力，可任财官，宜进取');
  if (yuanliu.isFlowing) opportunities.push('五行源流通畅，行运顺遂');
  if (yongshen.status === '有情有力') opportunities.push('用神有情有力，格局稳固');

  // 能量趋势判定（结合大运）
  const currentLuck = chart.luckPillars[0];
  let trendDesc = '';
  if (currentLuck) {
    const luckEl = currentLuck.pillar.stemElement;
    if (luckEl === yongshen.yongshen || luckEl === chart.dayMasterElement) {
      trendDesc = `当前大运${currentLuck.pillar.stem}${currentLuck.pillar.branch}（${luckEl}）助用神，能量趋涨`;
    } else if (elementControls(luckEl) === chart.dayMasterElement) {
      trendDesc = `当前大运${currentLuck.pillar.stem}${currentLuck.pillar.branch}（${luckEl}）克日主，能量趋落`;
    } else {
      trendDesc = `当前大运${currentLuck.pillar.stem}${currentLuck.pillar.branch}（${luckEl}），能量平稳`;
    }
  }

  const consensus: ClassicalVerificationReport['consensus'] =
    directionScore > 0.3 ? 'positive' : directionScore < -0.3 ? 'negative' : 'neutral';

  const classicalAdvice = `日主${chart.dayMaster}(${chart.dayMasterElement})${strength.level === 'very_strong' ? '极旺' : strength.level === 'strong' ? '偏旺' : strength.level === 'balanced' ? '中和' : strength.level === 'weak' ? '偏弱' : '极弱'}，用神${yongshen.yongshen}（${yongshen.status}）。${trendDesc}。${yuanliu.isFlowing ? '源流通畅，行运顺遂' : '源流受阻，需化解'}。`;

  return {
    bookId: 'ditianzhui',
    bookName: '滴天髓',
    perspective: '能量旺衰',
    judgment: `${strength.description}；${yongshen.description}；源流${yuanliu.isFlowing ? '通畅' : '受阻'}`,
    directionScore,
    confidence: 0.75,
    details,
    warnings,
    opportunities,
    classicalAdvice,
    consensus,
  };
}
