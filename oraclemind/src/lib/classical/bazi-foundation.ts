/**
 * BaZi Foundation Engine — 八字基础排盘引擎
 *
 * 这是整个古典验证层的底座，提供：
 *   - 四柱排盘（年月日时）
 *   - 五行统计
 *   - 十神映射
 *   - 藏干、神煞基础
 *
 * 注意：本文件**只做排盘与基础计算**，不做旺衰/格局/调候判定。
 * 旺衰判定交给《滴天髓》Agent，格局判定交给《子平真诠》Agent，
 * 调候判定交给《穷通宝鉴》Agent。
 *
 * 这样设计是为了让5本古籍各自独立、互不依赖、可并行运行。
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Heavenly Stems (天干) — 10 elements */
export const HEAVENLY_STEMS = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
] as const;

/** Five-element association for each Heavenly Stem */
export const STEM_ELEMENTS = [
  'wood', 'wood', 'fire', 'fire', 'earth',
  'earth', 'metal', 'metal', 'water', 'water',
] as const;

/** Yin/Yang polarity for each Heavenly Stem */
export const STEM_YINYANG = [
  'yang', 'yin', 'yang', 'yin', 'yang',
  'yin', 'yang', 'yin', 'yang', 'yin',
] as const;

/** Earthly Branches (地支) — 12 elements */
export const EARTHLY_BRANCHES = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
] as const;

/** Five-element association for each Earthly Branch (main element) */
export const BRANCH_ELEMENTS = [
  'water', 'earth', 'wood', 'wood', 'earth',
  'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water',
] as const;

/** Chinese zodiac animal for each Earthly Branch */
export const BRANCH_ANIMALS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
] as const;

/** The Five Elements (五行) in generation order */
export const FIVE_ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

/** Hidden stems (藏干) inside each Earthly Branch — ordered by strength (main → 次要 → 余气) */
export const HIDDEN_STEMS: Record<string, { stem: string; weight: number }[]> = {
  子: [{ stem: '癸', weight: 1.0 }],
  丑: [{ stem: '己', weight: 0.6 }, { stem: '癸', weight: 0.25 }, { stem: '辛', weight: 0.15 }],
  寅: [{ stem: '甲', weight: 0.6 }, { stem: '丙', weight: 0.25 }, { stem: '戊', weight: 0.15 }],
  卯: [{ stem: '乙', weight: 1.0 }],
  辰: [{ stem: '戊', weight: 0.5 }, { stem: '乙', weight: 0.3 }, { stem: '癸', weight: 0.2 }],
  巳: [{ stem: '丙', weight: 0.6 }, { stem: '庚', weight: 0.25 }, { stem: '戊', weight: 0.15 }],
  午: [{ stem: '丁', weight: 0.7 }, { stem: '己', weight: 0.3 }],
  未: [{ stem: '己', weight: 0.5 }, { stem: '丁', weight: 0.3 }, { stem: '乙', weight: 0.2 }],
  申: [{ stem: '庚', weight: 0.6 }, { stem: '壬', weight: 0.25 }, { stem: '戊', weight: 0.15 }],
  酉: [{ stem: '辛', weight: 1.0 }],
  戌: [{ stem: '戊', weight: 0.5 }, { stem: '辛', weight: 0.3 }, { stem: '丁', weight: 0.2 }],
  亥: [{ stem: '壬', weight: 0.7 }, { stem: '甲', weight: 0.3 }],
};

/**
 * Solar-term approximate boundaries used to map a Gregorian month/day
 * to a BaZi month index (1 = 寅, …, 12 = 丑).
 */
const SOLAR_TERM_BOUNDS: Array<{ baziMonth: number; month: number; day: number; name: string }> = [
  { baziMonth: 1,  month: 2,  day: 4,  name: '立春' },
  { baziMonth: 2,  month: 3,  day: 6,  name: '惊蛰' },
  { baziMonth: 3,  month: 4,  day: 5,  name: '清明' },
  { baziMonth: 4,  month: 5,  day: 6,  name: '立夏' },
  { baziMonth: 5,  month: 6,  day: 6,  name: '芒种' },
  { baziMonth: 6,  month: 7,  day: 7,  name: '小暑' },
  { baziMonth: 7,  month: 8,  day: 8,  name: '立秋' },
  { baziMonth: 8,  month: 9,  day: 8,  name: '白露' },
  { baziMonth: 9,  month: 10, day: 8,  name: '寒露' },
  { baziMonth: 10, month: 11, day: 7,  name: '立冬' },
  { baziMonth: 11, month: 12, day: 7,  name: '大雪' },
  { baziMonth: 12, month: 1,  day: 6,  name: '小寒' },
];

/** Season mapping for each BaZi month branch index */
export const SEASON_FOR_BRANCH: Record<string, 'spring' | 'summer' | 'autumn' | 'winter' | 'transition'> = {
  寅: 'spring', 卯: 'spring', 辰: 'transition',
  巳: 'summer', 午: 'summer', 未: 'transition',
  申: 'autumn', 酉: 'autumn', 戌: 'transition',
  亥: 'winter', 子: 'winter', 丑: 'transition',
};

/** Which element is prosperous in each season */
export const PROSPEROUS_ELEMENT: Record<string, string> = {
  spring: 'wood', summer: 'fire', autumn: 'metal', winter: 'water', transition: 'earth',
};

// ---------------------------------------------------------------------------
// Twelve Long Stars (十二长生) — for energy state analysis
// ---------------------------------------------------------------------------

export const TWELVE_LONG_STATES = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养',
] as const;

/** 地支长生位（按阳干顺行、阴干逆行简化版本，仅取阳性对应当旺地） */
export const STEM_LONG_TABLE: Record<string, string> = {
  // 阳干长生位
  甲: '亥', 丙: '寅', 戊: '寅', 庚: '巳', 壬: '申',
  // 阴干长生位（按逆行简化）
  乙: '午', 丁: '酉', 己: '酉', 辛: '子', 癸: '卯',
};

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** A single pillar (柱) consisting of one Heavenly Stem + one Earthly Branch */
export interface Pillar {
  stem: string;
  branch: string;
  stemIndex: number;
  branchIndex: number;
  stemElement: string;
  branchElement: string;
  yinYang: 'yang' | 'yin';
  hiddenStems: { stem: string; weight: number; tenGod: string }[];
  longState: string; // 长生位
  position: 'year' | 'month' | 'day' | 'hour';
}

/** Raw count of each Five Element across the four pillars */
export interface ElementScores {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

/** Weighted element scores (accounting for hidden stems & positions) */
export interface WeightedElementScores {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  total: number;
}

/** Per-stem Ten Gods (十神) analysis */
export interface TenGodsInfo {
  yearStem: string;
  monthStem: string;
  hourStem: string;
  /** Full mapping of all 9 non-day-master stems → Ten God labels */
  allGods: Record<string, string>;
}

/** A single Major Luck Pillar (大运) spanning 10 years */
export interface LuckPillar {
  ageRange: string;
  startAge: number;
  endAge: number;
  pillar: {
    stem: string;
    branch: string;
    stemIndex: number;
    branchIndex: number;
    stemElement: string;
    branchElement: string;
    hiddenStems: { stem: string; weight: number }[];
  };
  stemGod: string;
}

/** The complete BaZi chart produced by `calculateBazi` */
export interface BaziChart {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMaster: string;
  dayMasterElement: string;
  dayMasterYinYang: string;
  dayMasterIndex: number;
  elementScores: ElementScores;
  weightedScores: WeightedElementScores;
  tenGods: TenGodsInfo;
  luckPillars: LuckPillar[];
  yearPillar: string;
  solarTerms: string;
  zodiac: string;
  birthInfo: { year: number; month: number; day: number; hour: number };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function getBaziMonthAndTerm(month: number, day: number): { baziMonth: number; term: string } {
  for (let i = SOLAR_TERM_BOUNDS.length - 1; i >= 0; i--) {
    const b = SOLAR_TERM_BOUNDS[i];
    if (month > b.month || (month === b.month && day >= b.day)) {
      return { baziMonth: b.baziMonth, term: b.name };
    }
  }
  return { baziMonth: 12, term: '小寒' };
}

function monthIndexToBranchIndex(baziMonth: number): number {
  return (baziMonth + 1) % 12;
}

function yearStemToFirstMonthStem(yearStemIndex: number): number {
  return (yearStemIndex * 2 + 2) % 10;
}

function hourToBranchIndex(hour: number): number {
  if (hour === 23) return 0;
  return Math.floor(hour / 2);
}

function dayStemToFirstHourStem(dayStemIndex: number): number {
  return (dayStemIndex % 5) * 2;
}

// ---------------------------------------------------------------------------
// Five Element relationship helpers
// ---------------------------------------------------------------------------

export function elementGeneratedBy(element: string): string {
  const idx = FIVE_ELEMENTS.indexOf(element as typeof FIVE_ELEMENTS[number]);
  return FIVE_ELEMENTS[(idx - 1 + 5) % 5];
}

export function elementGenerates(element: string): string {
  const idx = FIVE_ELEMENTS.indexOf(element as typeof FIVE_ELEMENTS[number]);
  return FIVE_ELEMENTS[(idx + 1) % 5];
}

export function elementControlledBy(element: string): string {
  const idx = FIVE_ELEMENTS.indexOf(element as typeof FIVE_ELEMENTS[number]);
  return FIVE_ELEMENTS[(idx - 2 + 5) % 5];
}

export function elementControls(element: string): string {
  const idx = FIVE_ELEMENTS.indexOf(element as typeof FIVE_ELEMENTS[number]);
  return FIVE_ELEMENTS[(idx + 2) % 5];
}

// ---------------------------------------------------------------------------
// Ten Gods (十神) helpers
// ---------------------------------------------------------------------------

/**
 * Compute the Ten God (十神) label for a stem given the day master.
 *
 * @param stemIndex   Index of the stem being evaluated
 * @param dayMasterIndex  Index of the day master (日干)
 * @returns The Chinese Ten God label
 */
export function computeTenGod(stemIndex: number, dayMasterIndex: number): string {
  if (stemIndex === dayMasterIndex) return '日主';

  const dmElement = STEM_ELEMENTS[dayMasterIndex];
  const dmYY = STEM_YINYANG[dayMasterIndex];
  const targetElement = STEM_ELEMENTS[stemIndex];
  const targetYY = STEM_YINYANG[stemIndex];
  const sameYY = dmYY === targetYY;

  if (targetElement === dmElement) {
    return sameYY ? '比肩' : '劫财';
  }
  if (elementGenerates(dmElement) === targetElement) {
    return sameYY ? '食神' : '伤官';
  }
  if (elementGeneratedBy(dmElement) === targetElement) {
    return sameYY ? '偏印' : '正印';
  }
  if (elementControls(dmElement) === targetElement) {
    return sameYY ? '七杀' : '正官';
  }
  // day master controls this element → Wealth category
  return sameYY ? '偏财' : '正财';
}

// ---------------------------------------------------------------------------
// Twelve Long States (十二长生) — energy state of an element at a branch
// ---------------------------------------------------------------------------

/**
 * Compute the 12-long-state (长生十二神) for a given stem at a given branch.
 * Returns one of: 长生/沐浴/冠带/临官/帝旺/衰/病/死/墓/绝/胎/养
 */
export function computeLongState(stemIndex: number, branchIndex: number): string {
  const stem = HEAVENLY_STEMS[stemIndex];
  const startYin = STEM_LONG_TABLE[stem];
  if (!startYin) return '胎';

  const startIdx = EARTHLY_BRANCHES.indexOf(startYin as any);
  if (startIdx < 0) return '胎';

  const isYang = STEM_YINYANG[stemIndex] === 'yang';
  let offset: number;
  if (isYang) {
    offset = (branchIndex - startIdx + 12) % 12;
  } else {
    offset = (startIdx - branchIndex + 12) % 12;
  }
  return TWELVE_LONG_STATES[offset];
}

// ---------------------------------------------------------------------------
// Element scoring (weighted, accounting for hidden stems & positions)
// ---------------------------------------------------------------------------

function calculateElementScores(chart: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar }): ElementScores {
  const scores: ElementScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const pillars: Pillar[] = [chart.year, chart.month, chart.day, chart.hour];
  for (const p of pillars) {
    scores[p.stemElement as keyof ElementScores]++;
    scores[p.branchElement as keyof ElementScores]++;
  }
  return scores;
}

/**
 * Weighted element scoring:
 *   - Stem: weight 1.0
 *   - Branch main element: weight 1.0
 *   - Branch hidden stems: weight × 0.6 / 0.3 / 0.2
 *   - Month branch bonus: ×1.5 (月令为提纲)
 */
function calculateWeightedScores(chart: BaziChart): WeightedElementScores {
  const w: WeightedElementScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0, total: 0 };

  const allPositions: Array<{ pillar: Pillar; weight: number }> = [
    { pillar: chart.year, weight: 1.0 },
    { pillar: chart.month, weight: 1.5 }, // 月令加权
    { pillar: chart.day, weight: 1.2 },   // 日主加权
    { pillar: chart.hour, weight: 1.0 },
  ];

  for (const { pillar, weight } of allPositions) {
    // Stem
    w[pillar.stemElement as keyof WeightedElementScores] += 1.0 * weight;
    // Branch main element
    w[pillar.branchElement as keyof WeightedElementScores] += 1.0 * weight;
    // Hidden stems
    for (const hs of pillar.hiddenStems) {
      const el = STEM_ELEMENTS[HEAVENLY_STEMS.indexOf(hs.stem as any)];
      if (el) w[el as keyof WeightedElementScores] += hs.weight * 0.5 * weight;
    }
  }

  w.total = w.wood + w.fire + w.earth + w.metal + w.water;
  return w;
}

// ---------------------------------------------------------------------------
// Pillar building
// ---------------------------------------------------------------------------

function buildPillar(
  stemIndex: number,
  branchIndex: number,
  dayMasterIndex: number,
  position: 'year' | 'month' | 'day' | 'hour',
): Pillar {
  const hiddenStemsData = HIDDEN_STEMS[EARTHLY_BRANCHES[branchIndex]] ?? [];
  const hiddenStems = hiddenStemsData.map(hs => ({
    stem: hs.stem,
    weight: hs.weight,
    tenGod: computeTenGod(HEAVENLY_STEMS.indexOf(hs.stem as any), dayMasterIndex),
  }));

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    stemIndex,
    branchIndex,
    stemElement: STEM_ELEMENTS[stemIndex],
    branchElement: BRANCH_ELEMENTS[branchIndex],
    yinYang: STEM_YINYANG[stemIndex],
    hiddenStems,
    longState: computeLongState(stemIndex, branchIndex),
    position,
  };
}

// ---------------------------------------------------------------------------
// Exported function: calculateBazi
// ---------------------------------------------------------------------------

/**
 * Calculate the complete BaZi (Four Pillars of Destiny) chart.
 *
 * This is a PURE foundation function — it does not make any judgments about
 * 旺衰 (strength), 格局 (pattern), or 调候 (climate). Those judgments are
 * delegated to the five classical-book agents.
 */
export function calculateBazi(year: number, month: number, day: number, hour: number): BaziChart {
  let effectiveDay = day;
  let effectiveMonth = month;
  let effectiveYear = year;
  if (hour === 23) {
    effectiveDay++;
    if (effectiveDay > 28) {
      const daysInMonth = new Date(effectiveYear, effectiveMonth, 0).getDate();
      if (effectiveDay > daysInMonth) {
        effectiveDay = 1;
        effectiveMonth++;
        if (effectiveMonth > 12) {
          effectiveMonth = 1;
          effectiveYear++;
        }
      }
    }
  }

  // Year Pillar
  const yearStemIndex = ((year - 4) % 10 + 10) % 10;
  const yearBranchIndex = ((year - 4) % 12 + 12) % 12;

  // Month Pillar
  const { baziMonth, term } = getBaziMonthAndTerm(effectiveMonth, effectiveDay);
  const monthBranchIndex = monthIndexToBranchIndex(baziMonth);
  const firstMonthStem = yearStemToFirstMonthStem(yearStemIndex);
  const monthStemIndex = (firstMonthStem + baziMonth - 1) % 10;

  // Day Pillar
  const jdn = julianDayNumber(effectiveYear, effectiveMonth, effectiveDay);
  const dayStemIndex = ((jdn + 9) % 10 + 10) % 10;
  const dayBranchIndex = ((jdn + 1) % 12 + 12) % 12;

  // Hour Pillar
  const hourBranchIdx = hourToBranchIndex(hour);
  const firstHourStem = dayStemToFirstHourStem(dayStemIndex);
  const hourStemIndex = (firstHourStem + hourBranchIdx) % 10;

  // Build pillars (with day master context)
  const yearPillar = buildPillar(yearStemIndex, yearBranchIndex, dayStemIndex, 'year');
  const monthPillar = buildPillar(monthStemIndex, monthBranchIndex, dayStemIndex, 'month');
  const dayPillar = buildPillar(dayStemIndex, dayBranchIndex, dayStemIndex, 'day');
  const hourPillar = buildPillar(hourStemIndex, hourBranchIdx, dayStemIndex, 'hour');

  // Day Master
  const dayMaster = dayPillar.stem;
  const dayMasterElement = dayPillar.stemElement;
  const dayMasterYinYang = dayPillar.yinYang;

  // Element scores
  const elementScores = calculateElementScores({ year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar });

  // Ten Gods
  const yearStemGod = computeTenGod(yearStemIndex, dayStemIndex);
  const monthStemGod = computeTenGod(monthStemIndex, dayStemIndex);
  const hourStemGod = computeTenGod(hourStemIndex, dayStemIndex);
  const allGods: Record<string, string> = {};
  for (let i = 0; i < 10; i++) {
    if (i !== dayStemIndex) {
      allGods[HEAVENLY_STEMS[i]] = computeTenGod(i, dayStemIndex);
    }
  }
  allGods[HEAVENLY_STEMS[dayStemIndex]] = '日主';

  // Luck Pillars — 8 major periods (forward for yang day master + yang year/male, simplified)
  const forward = dayMasterYinYang === 'yang';
  const luckPillars: LuckPillar[] = [];
  const startAge = 3;
  for (let i = 0; i < 8; i++) {
    const age = startAge + i * 10;
    let lStem: number;
    let lBranch: number;
    if (forward) {
      lStem = (monthStemIndex + i + 1) % 10;
      lBranch = (monthBranchIndex + i + 1) % 12;
    } else {
      lStem = ((monthStemIndex - i - 1) % 10 + 10) % 10;
      lBranch = ((monthBranchIndex - i - 1) % 12 + 12) % 12;
    }
    const hiddenStemsData = HIDDEN_STEMS[EARTHLY_BRANCHES[lBranch]] ?? [];
    luckPillars.push({
      ageRange: `${age}-${age + 9}`,
      startAge: age,
      endAge: age + 9,
      pillar: {
        stem: HEAVENLY_STEMS[lStem],
        branch: EARTHLY_BRANCHES[lBranch],
        stemIndex: lStem,
        branchIndex: lBranch,
        stemElement: STEM_ELEMENTS[lStem],
        branchElement: BRANCH_ELEMENTS[lBranch],
        hiddenStems: hiddenStemsData,
      },
      stemGod: computeTenGod(lStem, dayStemIndex),
    });
  }

  // Current year pillar
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentYearStem = ((currentYear - 4) % 10 + 10) % 10;
  const currentYearBranch = ((currentYear - 4) % 12 + 12) % 12;
  const yearPillarStr = `${HEAVENLY_STEMS[currentYearStem]}${EARTHLY_BRANCHES[currentYearBranch]}年`;

  const zodiac = BRANCH_ANIMALS[yearBranchIndex];

  const chart: BaziChart = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    dayMaster,
    dayMasterElement,
    dayMasterYinYang,
    dayMasterIndex: dayStemIndex,
    elementScores,
    weightedScores: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0, total: 0 },
    tenGods: { yearStem: yearStemGod, monthStem: monthStemGod, hourStem: hourStemGod, allGods },
    luckPillars,
    yearPillar: yearPillarStr,
    solarTerms: term,
    zodiac,
    birthInfo: { year, month, day, hour },
  };

  // Compute weighted scores (needs full chart)
  chart.weightedScores = calculateWeightedScores(chart);

  return chart;
}
