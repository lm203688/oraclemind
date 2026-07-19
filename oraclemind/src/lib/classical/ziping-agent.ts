/**
 * 《子平真诠》格局成败Agent
 *
 * 核心逻辑（沈孝瞻）：
 *   1. 月令透干定格局（八格：正官/七杀/正财/偏财/正印/偏印/食神/伤官）
 *   2. 成格判定：用神有力、有情、无破
 *   3. 破格判定：用神被冲克、被合化、格局混杂
 *   4. 变格判定：败中有救、格局转化
 *   5. 层次：清纯 / 中等 / 混杂 / 破败
 *
 * 输出：格局类型 + 成败状态 + 层次 + 古典断语
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
  elementControls,
  elementControlledBy,
  elementGenerates,
  elementGeneratedBy,
} from './bazi-foundation';
import {
  ClassicalAgentContext,
  ClassicalVerificationReport,
  ClassicalDetail,
} from './classical-types';

// ---------------------------------------------------------------------------
// 八大正格
// ---------------------------------------------------------------------------

export type PatternType =
  | '正官格' | '七杀格'
  | '正财格' | '偏财格'
  | '正印格' | '偏印格'
  | '食神格' | '伤官格'
  | '无格';

export interface PatternAnalysis {
  pattern: PatternType;
  patternGod: string;        // 格局用神（十神名）
  patternElement: string;    // 格局用神五行
  isEstablished: boolean;    // 是否成立
  establishSource: string;   // 成立依据（如 "月干庚金透出"）
}

/**
 * 月令透干定格局
 *
 * 子平真诠原则：以月令所藏之神为用，看何神透出天干，即为何格。
 * 若月令本气透干，则为本气格；若中气透干，则为中气格；余此类推。
 */
export function identifyPattern(chart: BaziChart): PatternAnalysis {
  const monthBranch = chart.month.branch;
  const monthHidden = HIDDEN_STEMS[monthBranch] ?? [];
  const dayMasterIndex = chart.dayMasterIndex;

  // 检查月令藏干是否透出天干
  const stemsInChart = [
    { stem: chart.year.stem, pos: '年干' },
    { stem: chart.month.stem, pos: '月干' },
    { stem: chart.hour.stem, pos: '时干' },
  ];

  // 优先级：本气 > 中气 > 余气；本气透则用本气
  for (const hs of monthHidden) {
    const hsTenGod = computeTenGod(HEAVENLY_STEMS.indexOf(hs.stem as any), dayMasterIndex);
    if (hsTenGod === '日主') continue;

    // 检查此藏干是否透出
    const transparent = stemsInChart.find(s => s.stem === hs.stem);
    if (transparent) {
      return {
        pattern: tenGodToPattern(hsTenGod),
        patternGod: hsTenGod,
        patternElement: STEM_ELEMENTS[HEAVENLY_STEMS.indexOf(hs.stem as any)],
        isEstablished: true,
        establishSource: `月令${monthBranch}藏${hs.stem}（${hsTenGod}）透于${transparent.pos}`,
      };
    }
  }

  // 无透干：用月令本气
  const mainHidden = monthHidden[0];
  if (mainHidden) {
    const hsTenGod = computeTenGod(HEAVENLY_STEMS.indexOf(mainHidden.stem as any), dayMasterIndex);
    if (hsTenGod !== '日主') {
      return {
        pattern: tenGodToPattern(hsTenGod),
        patternGod: hsTenGod,
        patternElement: STEM_ELEMENTS[HEAVENLY_STEMS.indexOf(mainHidden.stem as any)],
        isEstablished: true,
        establishSource: `月令${monthBranch}本气${mainHidden.stem}（${hsTenGod}），未透干而用本气`,
      };
    }
  }

  return {
    pattern: '无格',
    patternGod: '无',
    patternElement: '无',
    isEstablished: false,
    establishSource: '月令无可取用，无格',
  };
}

function tenGodToPattern(tenGod: string): PatternType {
  switch (tenGod) {
    case '正官': return '正官格';
    case '七杀': return '七杀格';
    case '正财': return '正财格';
    case '偏财': return '偏财格';
    case '正印': return '正印格';
    case '偏印': return '偏印格';
    case '食神': return '食神格';
    case '伤官': return '伤官格';
    default: return '无格';
  }
}

// ---------------------------------------------------------------------------
// 成格破格判定
// ---------------------------------------------------------------------------

export interface PatternStatusAnalysis {
  status: '成格' | '破格' | '变格' | '混杂' | '无格';
  /** 破格原因（如有） */
  breakReasons: string[];
  /** 救应（如有） */
  rescues: string[];
  /** 层次 */
  level: '清纯' | '中等' | '混杂' | '破败';
  /** 描述 */
  description: string;
}

/**
 * 判定格局成败
 *
 * 成格：用神有力、无冲克、无混杂
 * 破格：用神被冲克、被合化变质、或格局混杂
 * 变格：败中有救，转化为新格
 */
export function analyzePatternStatus(chart: BaziChart, pattern: PatternAnalysis): PatternStatusAnalysis {
  if (!pattern.isEstablished || pattern.pattern === '无格') {
    return {
      status: '无格',
      breakReasons: [],
      rescues: [],
      level: '破败',
      description: '月令无格可取，层次最低',
    };
  }

  const breakReasons: string[] = [];
  const rescues: string[] = [];
  const patternGod = pattern.patternGod;
  const patternEl = pattern.patternElement;

  // 检查冲克（用神被克）
  const dayMasterEl = chart.dayMasterElement;

  // 不同格局有不同的破格条件
  switch (pattern.pattern) {
    case '正官格':
      // 正官格怕：伤官见官、官杀混杂、刑冲破害
      const hasShangGuan = Object.values(chart.tenGods.allGods).some(g => g === '伤官');
      if (hasShangGuan) {
        breakReasons.push('伤官见官，破格');
        // 救应：有印化伤官
        const hasYin = Object.values(chart.tenGods.allGods).some(g => g === '正印' || g === '偏印');
        if (hasYin) rescues.push('有印化伤官，败中有救');
      }
      const hasQiSha = Object.values(chart.tenGods.allGods).some(g => g === '七杀');
      if (hasQiSha) {
        breakReasons.push('官杀混杂，格局不清');
        // 救应：有食神制杀或合杀
        const hasShiShen = Object.values(chart.tenGods.allGods).some(g => g === '食神');
        if (hasShiShen) rescues.push('食神制杀，去浊留清');
      }
      break;

    case '七杀格':
      // 七杀格怕：无制无化、官杀混杂
      const hasShiShen2 = Object.values(chart.tenGods.allGods).some(g => g === '食神');
      const hasYin2 = Object.values(chart.tenGods.allGods).some(g => g === '正印' || g === '偏印');
      if (!hasShiShen2 && !hasYin2) {
        breakReasons.push('七杀无制无化，攻身为患');
      } else {
        if (hasShiShen2) rescues.push('食神制杀，格成');
        if (hasYin2) rescues.push('印化杀生身，格成');
      }
      const hasZhengGuan = Object.values(chart.tenGods.allGods).some(g => g === '正官');
      if (hasZhengGuan) breakReasons.push('官杀混杂，格局不清');
      break;

    case '正财格':
    case '偏财格':
      // 财格怕：比劫争财、财被冲克
      const hasBiJie = Object.values(chart.tenGods.allGods).some(g => g === '比肩' || g === '劫财');
      if (hasBiJie) {
        breakReasons.push('比劫争财，财格受损');
        // 救应：有官杀制比劫
        const hasGuan = Object.values(chart.tenGods.allGods).some(g => g === '正官' || g === '七杀');
        if (hasGuan) rescues.push('官杀制比劫，护财有成');
      }
      break;

    case '正印格':
    case '偏印格':
      // 印格怕：财破印、印被冲克
      const hasCai = Object.values(chart.tenGods.allGods).some(g => g === '正财' || g === '偏财');
      if (hasCai) {
        breakReasons.push('财破印，印格受损');
        // 救应：有官杀化财生印
        const hasGuan2 = Object.values(chart.tenGods.allGods).some(g => g === '正官' || g === '七杀');
        if (hasGuan2) rescues.push('官杀化财生印，败中有救');
      }
      break;

    case '食神格':
      // 食神格怕：枭神夺食（偏印克食神）
      const hasPianYin = Object.values(chart.tenGods.allGods).some(g => g === '偏印');
      if (hasPianYin) {
        breakReasons.push('枭神夺食，食神受损');
        // 救应：有财化枭
        const hasCai2 = Object.values(chart.tenGods.allGods).some(g => g === '偏财' || g === '正财');
        if (hasCai2) rescues.push('财化枭神，护食有成');
      }
      break;

    case '伤官格':
      // 伤官格怕：伤官见官、伤官无财
      const hasGuan3 = Object.values(chart.tenGods.allGods).some(g => g === '正官');
      if (hasGuan3) {
        breakReasons.push('伤官见官，为祸百端');
        // 救应：有印制伤护官
        const hasYin3 = Object.values(chart.tenGods.allGods).some(g => g === '正印' || g === '偏印');
        if (hasYin3) rescues.push('印制伤护官，转祸为福');
      }
      const hasCai3 = Object.values(chart.tenGods.allGods).some(g => g === '正财' || g === '偏财');
      if (!hasCai3) {
        breakReasons.push('伤官无财，才华难变现');
      } else {
        rescues.push('伤官生财，才华变现，格成');
      }
      break;
  }

  // 判定最终状态
  let status: PatternStatusAnalysis['status'];
  let level: PatternStatusAnalysis['level'];

  if (breakReasons.length === 0) {
    status = '成格';
    level = rescues.length > 0 ? '中等' : '清纯';
  } else if (rescues.length >= breakReasons.length) {
    status = '变格';
    level = '中等';
  } else if (breakReasons.length > rescues.length && rescues.length > 0) {
    status = '混杂';
    level = '混杂';
  } else {
    status = '破格';
    level = '破败';
  }

  const description = `${pattern.pattern}，${status}（${level}）${breakReasons.length > 0 ? '，破格原因：' + breakReasons.join('；') : ''}${rescues.length > 0 ? '，救应：' + rescues.join('；') : ''}`;

  return { status, breakReasons, rescues, level, description };
}

// ---------------------------------------------------------------------------
// 综合判定
// ---------------------------------------------------------------------------

export function zipingVerify(ctx: ClassicalAgentContext): ClassicalVerificationReport {
  if (!ctx.chart) {
    return {
      bookId: 'ziping',
      bookName: '子平真诠',
      perspective: '格局成败',
      judgment: '未提供生辰，无法进行格局验证',
      directionScore: 0,
      confidence: 0,
      details: [],
      warnings: [],
      opportunities: [],
      classicalAdvice: '请补充出生时间以启用《子平真诠》格局验证',
      consensus: 'neutral',
    };
  }

  const chart = ctx.chart;
  const pattern = identifyPattern(chart);
  const status = analyzePatternStatus(chart, pattern);

  // 方向分：成格清纯 > 中等 > 混杂 > 破败
  const directionMap: Record<string, number> = {
    '成格清纯': 0.8,
    '成格中等': 0.4,
    '变格中等': 0.3,
    '混杂': -0.2,
    '破败': -0.7,
  };
  let directionScore = directionMap[`${status.status}${status.level}`] ?? 0;
  if (status.status === '成格' && status.level === '清纯') directionScore = 0.8;
  else if (status.status === '成格' && status.level === '中等') directionScore = 0.4;
  else if (status.status === '变格') directionScore = 0.2;
  else if (status.status === '混杂') directionScore = -0.2;
  else if (status.status === '破格') directionScore = -0.6;
  else if (status.status === '无格') directionScore = -0.4;

  const details: ClassicalDetail[] = [
    {
      label: '格局类型',
      value: pattern.pattern,
      score: pattern.isEstablished ? 0.3 : -0.4,
      note: pattern.establishSource,
    },
    {
      label: '用神十神',
      value: pattern.patternGod,
      score: 0.2,
    },
    {
      label: '格局状态',
      value: status.status,
      score: status.status === '成格' ? 0.5 : status.status === '变格' ? 0.2 : status.status === '混杂' ? -0.3 : -0.6,
    },
    {
      label: '格局层次',
      value: status.level,
      score: status.level === '清纯' ? 0.7 : status.level === '中等' ? 0.2 : status.level === '混杂' ? -0.3 : -0.7,
    },
  ];

  if (status.breakReasons.length > 0) {
    details.push({
      label: '破格因素',
      value: status.breakReasons.join('；'),
      score: -0.5,
    });
  }
  if (status.rescues.length > 0) {
    details.push({
      label: '救应',
      value: status.rescues.join('；'),
      score: 0.4,
    });
  }

  const warnings: string[] = [];
  const opportunities: string[] = [];

  if (status.status === '破格') warnings.push(`格局破败：${status.breakReasons.join('；')}`);
  if (status.status === '混杂') warnings.push('格局混杂，层次不清，需细辨');
  if (status.breakReasons.includes('伤官见官，破格')) warnings.push('伤官见官，行事易招是非');
  if (status.breakReasons.includes('财破印，印格受损')) warnings.push('财破印，注意名声学业');

  if (status.status === '成格' && status.level === '清纯') opportunities.push('格局清纯，层次高，事业有成');
  if (status.rescues.length > 0) opportunities.push(`有救应：${status.rescues.join('；')}`);

  const consensus: ClassicalVerificationReport['consensus'] =
    directionScore > 0.3 ? 'positive' : directionScore < -0.3 ? 'negative' : 'neutral';

  const classicalAdvice = `${pattern.pattern}（${status.status}，${status.level}）。${status.description}。${status.status === '成格' ? '宜顺格而行，发挥格局优势' : status.status === '变格' ? '败中有救，宜借救应之势' : status.status === '破格' ? '格局破败，宜守不宜攻' : '格局混杂，宜等待时机澄清'}`;

  return {
    bookId: 'ziping',
    bookName: '子平真诠',
    perspective: '格局成败',
    judgment: status.description,
    directionScore,
    confidence: 0.8,
    details,
    warnings,
    opportunities,
    classicalAdvice,
    consensus,
  };
}
