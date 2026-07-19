/**
 * 《穷通宝鉴》调候时令Agent
 *
 * 核心逻辑（余春台）：
 *   1. 月令定气候（春木旺/夏火旺/秋金旺/冬水旺/四季月土旺）
 *   2. 查调候用神表：按月令+日主五行，确定调候所需元素
 *   3. 判定调候用神在命局的有无与强度
 *   4. 时令得失：得令（日主旺于月令）/ 失令（日主衰于月令）
 *
 * 输出：得令/失令 + 调候用神满足度 + 调和建议
 */

import {
  BaziChart,
  HEAVENLY_STEMS,
  STEM_ELEMENTS,
  EARTHLY_BRANCHES,
  BRANCH_ELEMENTS,
  HIDDEN_STEMS,
  SEASON_FOR_BRANCH,
  PROSPEROUS_ELEMENT,
  elementGeneratedBy,
  elementGenerates,
  elementControls,
  elementControlledBy,
} from './bazi-foundation';
import {
  ClassicalAgentContext,
  ClassicalVerificationReport,
  ClassicalDetail,
} from './classical-types';

// ---------------------------------------------------------------------------
// 调候用神表（穷通宝鉴核心）
// ---------------------------------------------------------------------------

/**
 * 调候用神表：按月令季节+日主五行，确定该季节下日主所需的调候元素
 *
 * 格式：[season][dayMasterElement] = { primary: 调候主神, secondary: 辅助调候, reason: 调候理由 }
 *
 * 这是穷通宝鉴的核心算法。简化版本覆盖10天干在12月令的调候。
 */
type ClimateKey = 'spring' | 'summer' | 'autumn' | 'winter' | 'transition';

interface ClimateRequirement {
  primary: string;    // 主调候元素
  secondary?: string; // 辅助调候元素
  reason: string;     // 调候理由
  severity: 'high' | 'medium' | 'low'; // 调候紧迫度
}

const CLIMATE_TABLE: Record<ClimateKey, Record<string, ClimateRequirement>> = {
  spring: {
    // 春木旺
    wood:  { primary: 'fire', secondary: 'water', reason: '春木旺，需火泄秀，水滋木', severity: 'medium' },
    fire:  { primary: 'wood', secondary: 'earth', reason: '春火相，木生火旺，需木助，土泄火', severity: 'low' },
    earth: { primary: 'fire', secondary: 'wood', reason: '春土死，木旺克土，需火化木生土', severity: 'high' },
    metal: { primary: 'earth', secondary: 'fire', reason: '春金囚，木旺金弱，需土生金，火炼金', severity: 'high' },
    water: { primary: 'metal', secondary: 'fire', reason: '春水休，木泄水气，需金生水', severity: 'medium' },
  },
  summer: {
    // 夏火旺
    wood:  { primary: 'water', secondary: 'fire', reason: '夏木焦，火旺木焚，需水济火', severity: 'high' },
    fire:  { primary: 'water', secondary: 'earth', reason: '夏火炎，需水济火，土泄火', severity: 'high' },
    earth: { primary: 'water', secondary: 'metal', reason: '夏土燥，需水润土，金泄土', severity: 'medium' },
    metal: { primary: 'water', secondary: 'earth', reason: '夏金熔，火旺克金，需水制火，土生金', severity: 'high' },
    water: { primary: 'metal', secondary: 'water', reason: '夏水竭，火旺水干，需金生水', severity: 'high' },
  },
  autumn: {
    // 秋金旺
    wood:  { primary: 'water', secondary: 'fire', reason: '秋木凋，金旺克木，需水化金生木', severity: 'high' },
    fire:  { primary: 'wood', secondary: 'earth', reason: '秋火死，金旺火弱，需木生火', severity: 'medium' },
    earth: { primary: 'fire', secondary: 'metal', reason: '秋土休，金泄土气，需火生土', severity: 'medium' },
    metal: { primary: 'water', secondary: 'fire', reason: '秋金旺，需水泄秀，火炼金', severity: 'low' },
    water: { primary: 'metal', secondary: 'wood', reason: '秋水相，金生水旺，需木泄水', severity: 'low' },
  },
  winter: {
    // 冬水旺
    wood:  { primary: 'fire', secondary: 'water', reason: '冬木寒，水旺木冻，需火暖木', severity: 'high' },
    fire:  { primary: 'wood', secondary: 'fire', reason: '冬火死，水旺克火，需木生火', severity: 'high' },
    earth: { primary: 'fire', secondary: 'metal', reason: '冬土冻，水旺土寒，需火暖土', severity: 'high' },
    metal: { primary: 'earth', secondary: 'fire', reason: '冬金寒，水泄金气，需土生金，火暖金', severity: 'medium' },
    water: { primary: 'fire', secondary: 'earth', reason: '冬水旺，需火济水，土制水', severity: 'medium' },
  },
  transition: {
    // 四季月（辰戌丑未）土旺
    wood:  { primary: 'water', secondary: 'fire', reason: '四季木弱，土旺折木，需水生木', severity: 'medium' },
    fire:  { primary: 'wood', secondary: 'fire', reason: '四季火休，土泄火气，需木生火', severity: 'medium' },
    earth: { primary: 'fire', secondary: 'metal', reason: '四季土旺，需火生土，金泄土', severity: 'low' },
    metal: { primary: 'earth', secondary: 'water', reason: '四季金相，土生金旺，需水泄金', severity: 'low' },
    water: { primary: 'metal', secondary: 'fire', reason: '四季水囚，土克水，需金化土生水', severity: 'high' },
  },
};

// ---------------------------------------------------------------------------
// 调候分析
// ---------------------------------------------------------------------------

export interface ClimateAnalysis {
  season: ClimateKey;
  monthBranch: string;
  climateName: string;          // 气候名（春木旺/夏火炎/秋金旺/冬水寒/四季土旺）
  isFavorable: boolean;         // 日主是否得令
  favorableDesc: string;        // 得令/失令描述
  climateRequirement: ClimateRequirement;
  tiaohouPresence: 'transparent' | 'hidden' | 'absent'; // 调候用神透干/藏支/无
  tiaohouStrength: 'strong' | 'medium' | 'weak' | 'none';
  tiaohouSource: string;        // 调候用神来源
  satisfaction: number;         // 调候满足度 0-1
  description: string;
}

export function analyzeClimate(chart: BaziChart): ClimateAnalysis {
  const monthBranch = chart.month.branch;
  const season = SEASON_FOR_BRANCH[monthBranch];
  const dmElement = chart.dayMasterElement;
  const prosperousEl = PROSPEROUS_ELEMENT[season];

  // 得令判定
  const isFavorable = prosperousEl === dmElement;
  const prosperousDescMap: Record<string, string> = {
    spring: '春木旺', summer: '夏火炎', autumn: '秋金旺', winter: '冬水寒', transition: '四季土旺',
  };
  const climateName = prosperousDescMap[season];

  let favorableDesc: string;
  if (isFavorable) {
    favorableDesc = `日主${dmElement}得令于${climateName}，根基得时`;
  } else if (prosperousEl === elementGeneratedBy(dmElement)) {
    favorableDesc = `日主${dmElement}相于${climateName}，月令生身，次得令`;
  } else if (prosperousEl === elementGenerates(dmElement)) {
    favorableDesc = `日主${dmElement}休于${climateName}，月令泄身，失令`;
  } else if (prosperousEl === elementControls(dmElement)) {
    favorableDesc = `日主${dmElement}囚于${climateName}，月令克身，失令`;
  } else {
    favorableDesc = `日主${dmElement}死于${climateName}，月令耗身，大失令`;
  }

  // 查调候用神表
  const requirement = CLIMATE_TABLE[season][dmElement] ?? {
    primary: 'fire', reason: '默认调候', severity: 'low' as const,
  };

  // 检查调候用神在命局的有无与强度
  const tiaohouEl = requirement.primary;
  let tiaohouPresence: ClimateAnalysis['tiaohouPresence'] = 'absent';
  let tiaohouStrength: ClimateAnalysis['tiaohouStrength'] = 'none';
  let tiaohouSource = '命局无调候用神';

  // 检查天干
  const stems = [
    { stem: chart.year.stem, pos: '年干' },
    { stem: chart.month.stem, pos: '月干' },
    { stem: chart.hour.stem, pos: '时干' },
  ];
  for (const s of stems) {
    const sEl = STEM_ELEMENTS[HEAVENLY_STEMS.indexOf(s.stem as any)];
    if (sEl === tiaohouEl) {
      tiaohouPresence = 'transparent';
      tiaohouSource = `天干${s.pos}${s.stem}（${tiaohouEl}）透出，调候有力`;
      tiaohouStrength = 'strong';
      break;
    }
  }

  // 检查地支本气和藏干
  if (tiaohouPresence === 'absent') {
    const branches = [
      { branch: chart.year.branch, pos: '年支' },
      { branch: chart.month.branch, pos: '月支' },
      { branch: chart.day.branch, pos: '日支' },
      { branch: chart.hour.branch, pos: '时支' },
    ];
    for (const b of branches) {
      const bEl = BRANCH_ELEMENTS[EARTHLY_BRANCHES.indexOf(b.branch as any)];
      if (bEl === tiaohouEl) {
        tiaohouPresence = 'hidden';
        tiaohouSource = `地支${b.pos}${b.branch}（${tiaohouEl}）本气藏调候`;
        tiaohouStrength = b.pos === '月支' ? 'strong' : 'medium';
        break;
      }
      // 藏干
      const hidden = HIDDEN_STEMS[b.branch] ?? [];
      for (const hs of hidden) {
        const hsEl = STEM_ELEMENTS[HEAVENLY_STEMS.indexOf(hs.stem as any)];
        if (hsEl === tiaohouEl) {
          if (tiaohouPresence === 'absent') {
            tiaohouPresence = 'hidden';
            tiaohouSource = `地支${b.pos}${b.branch}藏${hs.stem}（${tiaohouEl}），调候较弱`;
            tiaohouStrength = 'weak';
          }
        }
      }
    }
  }

  // 满足度
  let satisfaction = 0;
  if (tiaohouStrength === 'strong') satisfaction = 0.9;
  else if (tiaohouStrength === 'medium') satisfaction = 0.6;
  else if (tiaohouStrength === 'weak') satisfaction = 0.3;
  else satisfaction = 0;

  // 紧迫度高的调候未满足，扣分更多
  if (requirement.severity === 'high' && satisfaction < 0.5) {
    satisfaction *= 0.5;
  }

  const description = `${climateName}，${favorableDesc}。调候用神${tiaohouEl}（${requirement.reason}），${tiaohouSource}，满足度${Math.round(satisfaction * 100)}%`;

  return {
    season,
    monthBranch,
    climateName,
    isFavorable,
    favorableDesc,
    climateRequirement: requirement,
    tiaohouPresence,
    tiaohouStrength,
    tiaohouSource,
    satisfaction,
    description,
  };
}

// ---------------------------------------------------------------------------
// 综合判定
// ---------------------------------------------------------------------------

export function qiongtongVerify(ctx: ClassicalAgentContext): ClassicalVerificationReport {
  if (!ctx.chart) {
    return {
      bookId: 'qiongtong',
      bookName: '穷通宝鉴',
      perspective: '时令调候',
      judgment: '未提供生辰，无法进行调候验证',
      directionScore: 0,
      confidence: 0,
      details: [],
      warnings: [],
      opportunities: [],
      classicalAdvice: '请补充出生时间以启用《穷通宝鉴》调候验证',
      consensus: 'neutral',
    };
  }

  const chart = ctx.chart;
  const climate = analyzeClimate(chart);

  // 方向分
  // 得令 + 调候满足 = 积极
  // 失令 + 调候满足 = 中性
  // 失令 + 调候不满足 = 消极
  let directionScore = 0;
  if (climate.isFavorable) directionScore += 0.4;
  else directionScore -= 0.2;

  directionScore += climate.satisfaction * 0.6 - 0.2;
  // 紧迫度高的调候未满足，额外扣分
  if (climate.climateRequirement.severity === 'high' && climate.satisfaction < 0.5) {
    directionScore -= 0.3;
  }

  directionScore = Math.max(-1, Math.min(1, directionScore));

  const details: ClassicalDetail[] = [
    {
      label: '月令气候',
      value: climate.climateName,
      score: 0,
      note: `月支${climate.monthBranch}，${climate.season === 'spring' ? '春木旺' : climate.season === 'summer' ? '夏火炎' : climate.season === 'autumn' ? '秋金旺' : climate.season === 'winter' ? '冬水寒' : '四季土旺'}`,
    },
    {
      label: '得令失令',
      value: climate.isFavorable ? '得令' : '失令',
      score: climate.isFavorable ? 0.5 : -0.3,
      note: climate.favorableDesc,
    },
    {
      label: '调候用神',
      value: climate.climateRequirement.primary,
      score: 0.2,
      note: climate.climateRequirement.reason,
    },
    {
      label: '调候紧迫度',
      value: climate.climateRequirement.severity === 'high' ? '高' : climate.climateRequirement.severity === 'medium' ? '中' : '低',
      score: climate.climateRequirement.severity === 'high' ? -0.3 : 0,
    },
    {
      label: '调候满足度',
      value: `${Math.round(climate.satisfaction * 100)}%`,
      score: climate.satisfaction * 2 - 1,
      note: climate.tiaohouSource,
    },
  ];

  const warnings: string[] = [];
  const opportunities: string[] = [];

  if (!climate.isFavorable) warnings.push(`日主${chart.dayMasterElement}失令于${climate.climateName}，根基失时`);
  if (climate.climateRequirement.severity === 'high' && climate.satisfaction < 0.5) {
    warnings.push(`调候紧迫度高但满足度仅${Math.round(climate.satisfaction * 100)}%，需补救`);
  }
  if (climate.tiaohouPresence === 'absent') warnings.push(`调候用神${climate.climateRequirement.primary}命局不见，需岁运行至方显`);

  if (climate.isFavorable) opportunities.push(`日主得令于${climate.climateName}，时运相得`);
  if (climate.satisfaction >= 0.7) opportunities.push(`调候用神${climate.climateRequirement.primary}满足度高，气候调和`);
  if (climate.tiaohouPresence === 'transparent') opportunities.push('调候用神透干，气候调和不缺');

  const consensus: ClassicalVerificationReport['consensus'] =
    directionScore > 0.3 ? 'positive' : directionScore < -0.3 ? 'negative' : 'neutral';

  const classicalAdvice = `${climate.climateName}，日主${climate.isFavorable ? '得令' : '失令'}。调候用神${climate.climateRequirement.primary}（${climate.climateRequirement.reason}），${climate.tiaohouSource}，满足度${Math.round(climate.satisfaction * 100)}%。${climate.satisfaction >= 0.5 ? '气候调和，行事顺遂' : '气候失调，需待时而动'}`;

  return {
    bookId: 'qiongtong',
    bookName: '穷通宝鉴',
    perspective: '时令调候',
    judgment: climate.description,
    directionScore,
    confidence: 0.7,
    details,
    warnings,
    opportunities,
    classicalAdvice,
    consensus,
  };
}
