/**
 * 《三命通会》综合众家Agent
 *
 * 核心逻辑（万民英·集大成）：
 *   1. 综合格局基础（不重复子平真诠的判定，只取格局类型作为基础）
 *   2. 神煞辅助判定（天乙、文昌、驿马、桃花、华盖、将星等）
 *   3. 纳音五行（年命纳音与本命关系）
 *   4. 命宫、胎元（辅助判定）
 *   5. 综合层次：上局 / 中局 / 下局
 *
 * 输出：综合层次 + 关键吉凶神煞 + 修饰性建议
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
import { identifyPattern } from './ziping-agent';

// ---------------------------------------------------------------------------
// 纳音五行表（六十甲子纳音）
// ---------------------------------------------------------------------------

/** 六十甲子纳音五行（每两个甲子对应一个纳音） */
const NAYIN_TABLE: Record<string, string> = {
  // 金
  甲子: '海中金', 乙丑: '海中金', 壬寅: '金箔金', 癸卯: '金箔金',
  庚辰: '白蜡金', 辛巳: '白蜡金', 甲午: '沙中金', 乙未: '沙中金',
  壬申: '剑锋金', 癸酉: '剑锋金', 庚戌: '钗钏金', 辛亥: '钗钏金',
  // 木
  戊辰: '大林木', 己巳: '大林木', 壬午: '杨柳木', 癸未: '杨柳木',
  庚寅: '松柏木', 辛卯: '松柏木', 戊戌: '平地木', 己亥: '平地木',
  壬子: '桑柘木', 癸丑: '桑柘木', 庚申: '石榴木', 辛酉: '石榴木',
  // 水
  丙子: '涧下水', 丁丑: '涧下水', 甲申: '泉中水', 乙酉: '泉中水',
  壬辰: '长流水', 癸巳: '长流水', 丙午: '天河水', 丁未: '天河水',
  甲寅: '大溪水', 乙卯: '大溪水', 壬戌: '大海水', 癸亥: '大海水',
  // 火
  戊子: '霹雳火', 己丑: '霹雳火', 丙寅: '炉中火', 丁卯: '炉中火',
  甲辰: '覆灯火', 乙巳: '覆灯火', 戊午: '天上火', 己未: '天上火',
  丙申: '山下火', 丁酉: '山下火', 甲戌: '山头火', 乙亥: '山头火',
  // 土
  庚子: '壁上土', 辛丑: '壁上土', 戊寅: '城头土', 己卯: '城头土',
  丙辰: '沙中土', 丁巳: '沙中土', 庚午: '路旁土', 辛未: '路旁土',
  戊申: '大驿土', 己酉: '大驿土', 丙戌: '屋上土', 丁亥: '屋上土',
};

function getNayinElement(nayin: string): string {
  if (nayin.includes('金')) return 'metal';
  if (nayin.includes('木')) return 'wood';
  if (nayin.includes('水')) return 'water';
  if (nayin.includes('火')) return 'fire';
  if (nayin.includes('土')) return 'earth';
  return 'earth';
}

// ---------------------------------------------------------------------------
// 神煞详细表
// ---------------------------------------------------------------------------

/** 天乙贵人 */
const TIANYI_TABLE: Record<string, string[]> = {
  甲: ['丑', '未'], 乙: ['子', '申'], 丙: ['酉', '亥'], 丁: ['酉', '亥'],
  戊: ['丑', '未'], 己: ['子', '申'], 庚: ['丑', '未'], 辛: ['寅', '午'],
  壬: ['卯', '巳'], 癸: ['卯', '巳'],
};

/** 文昌 */
const WENCHANG_TABLE: Record<string, string> = {
  甲: '巳', 乙: '午', 丙: '申', 丁: '酉', 戊: '申',
  己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
};

/** 桃花（按年支或日支定） */
const TAOHUA_TABLE: Record<string, string> = {
  // 寅午戌兔（卯）
  寅: '卯', 午: '卯', 戌: '卯',
  // 申子辰鸡（酉）
  申: '酉', 子: '酉', 辰: '酉',
  // 巳酉丑马（午）
  巳: '午', 酉: '午', 丑: '午',
  // 亥卯未鼠（子）
  亥: '子', 卯: '子', 未: '子',
};

/** 华盖（按年支或日支定） */
const HUAGAI_TABLE: Record<string, string> = {
  寅: '戌', 午: '戌', 戌: '戌',
  申: '辰', 子: '辰', 辰: '辰',
  巳: '丑', 酉: '丑', 丑: '丑',
  亥: '未', 卯: '未', 未: '未',
};

/** 驿马 */
const YIMA_TABLE: Record<string, string> = {
  申: '寅', 子: '寅', 辰: '寅',
  寅: '申', 午: '申', 戌: '申',
  巳: '亥', 酉: '亥', 丑: '亥',
  亥: '巳', 卯: '巳', 未: '巳',
};

// ---------------------------------------------------------------------------
// 命宫、胎元计算
// ---------------------------------------------------------------------------

/** 胎元：月干进一位，月支进三位 */
function computeTaiyuan(chart: BaziChart): { stem: string; branch: string; nayin: string } | null {
  const monthStemIdx = chart.month.stemIndex;
  const monthBranchIdx = chart.month.branchIndex;
  const taiStemIdx = (monthStemIdx + 1) % 10;
  const taiBranchIdx = (monthBranchIdx + 3) % 12;
  const taiStem = HEAVENLY_STEMS[taiStemIdx];
  const taiBranch = EARTHLY_BRANCHES[taiBranchIdx];
  const nayin = NAYIN_TABLE[`${taiStem}${taiBranch}`] ?? '未知';
  return { stem: taiStem, branch: taiBranch, nayin };
}

// ---------------------------------------------------------------------------
// 综合分析
// ---------------------------------------------------------------------------

export interface ComprehensiveAnalysis {
  /** 综合层次 */
  level: '上局' | '中局' | '下局';
  /** 综合评分 0-100 */
  compositeScore: number;
  /** 格局基础（从子平真诠获取） */
  patternBase: string;
  /** 神煞列表 */
  auspiciousShenshas: string[];   // 吉神
  inauspiciousShenshas: string[]; // 凶神
  /** 纳音分析 */
  yearNayin: string;
  yearNayinRelation: string;
  /** 胎元 */
  taiyuan: string;
  taiyuanRelation: string;
  /** 综合判定 */
  description: string;
}

export function analyzeComprehensively(chart: BaziChart): ComprehensiveAnalysis {
  const branches = [chart.year.branch, chart.month.branch, chart.day.branch, chart.hour.branch];
  const dayMaster = chart.dayMaster;
  const dayBranch = chart.day.branch;
  const yearBranch = chart.year.branch;

  // 1. 格局基础
  const pattern = identifyPattern(chart);
  const patternBase = pattern.isEstablished ? pattern.pattern : '无格';

  // 2. 神煞
  const auspicious: string[] = [];
  const inauspicious: string[] = [];

  // 天乙贵人
  const tianyi = TIANYI_TABLE[dayMaster] ?? [];
  const tianyiPresent = branches.filter(b => tianyi.includes(b));
  if (tianyiPresent.length > 0) auspicious.push(`天乙贵人(${tianyiPresent.join('、')})`);

  // 文昌
  const wenchang = WENCHANG_TABLE[dayMaster];
  if (wenchang && branches.includes(wenchang)) auspicious.push(`文昌(${wenchang})`);

  // 桃花
  const taohua = TAOHUA_TABLE[dayBranch] ?? TAOHUA_TABLE[yearBranch];
  if (taohua && branches.includes(taohua)) auspicious.push(`桃花(${taohua})`);

  // 华盖
  const huagai = HUAGAI_TABLE[dayBranch] ?? HUAGAI_TABLE[yearBranch];
  if (huagai && branches.includes(huagai)) auspicious.push(`华盖(${huagai})`);

  // 驿马
  const yima = YIMA_TABLE[dayBranch] ?? YIMA_TABLE[yearBranch];
  if (yima && branches.includes(yima)) auspicious.push(`驿马(${yima})`);

  // 凶神（简化判定）
  if (branches.filter(b => ['子', '午', '卯', '酉'].includes(b)).length >= 3) {
    inauspicious.push('桃花过旺（子午卯酉全）');
  }
  if (branches.filter(b => ['辰', '戌', '丑', '未'].includes(b)).length >= 3) {
    inauspicious.push('四库全（土重）');
  }

  // 3. 纳音（年柱纳音）
  const yearStem = chart.year.stem;
  const yearBranchChar = chart.year.branch;
  const yearPillarStr = `${yearStem}${yearBranchChar}`;
  const yearNayin = NAYIN_TABLE[yearPillarStr] ?? '未知';
  const yearNayinEl = getNayinElement(yearNayin);
  const dmElement = chart.dayMasterElement;

  let yearNayinRelation: string;
  if (yearNayinEl === dmElement) yearNayinRelation = `${yearNayin}与日主${dmElement}同类，根基相得`;
  else if (yearNayinEl === dmElement) yearNayinRelation = `${yearNayin}生扶日主，根基有助`;
  else yearNayinRelation = `${yearNayin}与日主${dmElement}相战，根基需调和`;

  // 4. 胎元
  const taiyuan = computeTaiyuan(chart);
  const taiyuanDesc = taiyuan ? `${taiyuan.stem}${taiyuan.branch}（${taiyuan.nayin}）` : '未知';
  let taiyuanRelation = '胎元未明';
  if (taiyuan) {
    const taiyuanEl = getNayinElement(taiyuan.nayin);
    if (taiyuanEl === dmElement || taiyuanEl === chart.dayMasterElement) {
      taiyuanRelation = `胎元${taiyuanDesc}，与日主相得，先天根基佳`;
    } else {
      taiyuanRelation = `胎元${taiyuanDesc}，与日主相战，先天根基需调和`;
    }
  }

  // 5. 综合评分
  let compositeScore = 50; // 基线50分

  // 格局加分
  if (pattern.isEstablished) compositeScore += 10;

  // 神煞加分
  compositeScore += auspicious.length * 5;
  compositeScore -= inauspicious.length * 8;

  // 纳音相得加分
  if (yearNayinRelation.includes('相得') || yearNayinRelation.includes('有助')) compositeScore += 8;

  // 胎元相得加分
  if (taiyuanRelation.includes('相得')) compositeScore += 5;

  compositeScore = Math.max(0, Math.min(100, compositeScore));

  // 6. 层次判定
  let level: ComprehensiveAnalysis['level'];
  if (compositeScore >= 75) level = '上局';
  else if (compositeScore >= 50) level = '中局';
  else level = '下局';

  const description = `${level}（综合评分${compositeScore}）。格局基础：${patternBase}。吉神：${auspicious.length > 0 ? auspicious.join('、') : '无'}。凶神：${inauspicious.length > 0 ? inauspicious.join('、') : '无'}。年柱纳音：${yearNayin}，${yearNayinRelation}。${taiyuanRelation}。`;

  return {
    level,
    compositeScore,
    patternBase,
    auspiciousShenshas: auspicious,
    inauspiciousShenshas: inauspicious,
    yearNayin,
    yearNayinRelation,
    taiyuan: taiyuanDesc,
    taiyuanRelation,
    description,
  };
}

// ---------------------------------------------------------------------------
// 综合判定
// ---------------------------------------------------------------------------

export function sanmingVerify(ctx: ClassicalAgentContext): ClassicalVerificationReport {
  if (!ctx.chart) {
    return {
      bookId: 'sanming',
      bookName: '三命通会',
      perspective: '众家综合',
      judgment: '未提供生辰，无法进行综合验证',
      directionScore: 0,
      confidence: 0,
      details: [],
      warnings: [],
      opportunities: [],
      classicalAdvice: '请补充出生时间以启用《三命通会》综合众家验证',
      consensus: 'neutral',
    };
  }

  const chart = ctx.chart;
  const comp = analyzeComprehensively(chart);

  // 方向分
  let directionScore = (comp.compositeScore - 50) / 50; // 50基线，归一化到 -1 ~ +1
  // 层次加成
  if (comp.level === '上局') directionScore += 0.2;
  else if (comp.level === '下局') directionScore -= 0.2;
  directionScore = Math.max(-1, Math.min(1, directionScore));

  const details: ClassicalDetail[] = [
    {
      label: '综合层次',
      value: comp.level,
      score: comp.level === '上局' ? 0.7 : comp.level === '中局' ? 0.2 : -0.4,
    },
    {
      label: '综合评分',
      value: `${comp.compositeScore}分`,
      score: (comp.compositeScore - 50) / 50,
    },
    {
      label: '格局基础',
      value: comp.patternBase,
      score: comp.patternBase !== '无格' ? 0.3 : -0.2,
    },
    {
      label: '吉神',
      value: comp.auspiciousShenshas.length > 0 ? comp.auspiciousShenshas.join('、') : '无',
      score: comp.auspiciousShenshas.length * 0.15,
    },
    {
      label: '凶神',
      value: comp.inauspiciousShenshas.length > 0 ? comp.inauspiciousShenshas.join('、') : '无',
      score: -comp.inauspiciousShenshas.length * 0.2,
    },
    {
      label: '年柱纳音',
      value: comp.yearNayin,
      score: comp.yearNayinRelation.includes('相得') || comp.yearNayinRelation.includes('有助') ? 0.3 : -0.1,
      note: comp.yearNayinRelation,
    },
    {
      label: '胎元',
      value: comp.taiyuan,
      score: comp.taiyuanRelation.includes('相得') ? 0.2 : 0,
      note: comp.taiyuanRelation,
    },
  ];

  const warnings: string[] = [];
  const opportunities: string[] = [];

  if (comp.level === '下局') warnings.push(`综合层次下局（${comp.compositeScore}分），整体根基偏弱`);
  if (comp.inauspiciousShenshas.length > 0) warnings.push(`有凶神：${comp.inauspiciousShenshas.join('、')}`);
  if (comp.yearNayinRelation.includes('相战')) warnings.push(`年柱纳音${comp.yearNayin}与日主相战，根基需调和`);

  if (comp.level === '上局') opportunities.push(`综合层次上局（${comp.compositeScore}分），整体格局佳`);
  if (comp.auspiciousShenshas.length >= 2) opportunities.push(`多吉神护佑：${comp.auspiciousShenshas.join('、')}`);
  if (comp.yearNayinRelation.includes('相得') || comp.yearNayinRelation.includes('有助')) {
    opportunities.push(`年柱纳音${comp.yearNayin}与日主相得，根基稳固`);
  }

  const consensus: ClassicalVerificationReport['consensus'] =
    directionScore > 0.3 ? 'positive' : directionScore < -0.3 ? 'negative' : 'neutral';

  const classicalAdvice = `综合层次${comp.level}（${comp.compositeScore}分）。格局基础${comp.patternBase}，吉神${comp.auspiciousShenshas.length > 0 ? comp.auspiciousShenshas.join('、') : '不显'}。年柱纳音${comp.yearNayin}。${comp.level === '上局' ? '整体层次高，宜顺势发展' : comp.level === '中局' ? '层次中等，需后天补益' : '层次偏低，宜稳守不宜进取'}`;

  return {
    bookId: 'sanming',
    bookName: '三命通会',
    perspective: '众家综合',
    judgment: comp.description,
    directionScore,
    confidence: 0.7,
    details,
    warnings,
    opportunities,
    classicalAdvice,
    consensus,
  };
}
