/**
 * BaZi (四柱八字) Calculation Engine
 *
 * Pure TypeScript implementation of the Chinese Four Pillars of Destiny system.
 * All calculations are deterministic — no external API calls.
 *
 * References:
 *   - Year Pillar: stem = (year-4) mod 10, branch = (year-4) mod 12
 *   - Month Pillar: derived from solar-term boundaries + year-stem formula
 *   - Day Pillar:  derived from Julian Day Number
 *   - Hour Pillar: 2-hour blocks indexed by day-stem formula
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

/** Hidden stems (藏干) inside each Earthly Branch — ordered by strength (main →次要 →余气) */
export const HIDDEN_STEMS: Record<string, string[]> = {
  子: ['癸'],
  丑: ['己', '癸', '辛'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲'],
};

/**
 * Solar-term approximate boundaries used to map a Gregorian month/day
 * to a BaZi month index (1 = 寅, …, 12 = 丑).
 *
 * Each entry is `[month, day]` — the approximate start of the BaZi month.
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

/**
 * Season mapping for each BaZi month branch index.
 * Used for determining day-master strength seasonally.
 */
const SEASON_FOR_BRANCH: Record<string, 'spring' | 'summer' | 'autumn' | 'winter' | 'transition'> = {
  寅: 'spring',
  卯: 'spring',
  辰: 'transition',
  巳: 'summer',
  午: 'summer',
  未: 'transition',
  申: 'autumn',
  酉: 'autumn',
  戌: 'transition',
  亥: 'winter',
  子: 'winter',
  丑: 'transition',
};

/** Which element is prosperous in each season */
const PROSPEROUS_ELEMENT: Record<string, string> = {
  spring: 'wood',
  summer: 'fire',
  autumn: 'metal',
  winter: 'water',
  transition: 'earth',
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
  hiddenStems: string[];
}

/** Raw count of each Five Element across the four pillars */
export interface ElementScores {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

/** Per-stem Ten Gods (十神) analysis */
export interface TenGodsInfo {
  yearStem: string;   // Ten God label for the year stem
  monthStem: string;  // Ten God label for the month stem
  hourStem: string;   // Ten God label for the hour stem
  /** Full mapping of all seven non-day-master stems → Ten God labels */
  allGods: Record<string, string>;
}

/** A single Major Luck Pillar (大运) spanning 10 years */
export interface LuckPillar {
  ageRange: string;    // e.g. "3-12"
  startAge: number;
  endAge: number;
  pillar: Pillar;
  stemGod: string;     // Ten God label of this luck pillar's stem
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
  elementScores: ElementScores;
  tenGods: TenGodsInfo;
  luckPillars: LuckPillar[];
  yearPillar: string;
  solarTerms: string;
  zodiac: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Compute the Julian Day Number (JDN) for a Gregorian calendar date.
 *
 * Algorithm follows the standard formula from Meeus, _Astronomical Algorithms_.
 * Returns a non-negative integer representing the Julian Day at noon of the
 * given date.
 */
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

/**
 * Determine the BaZi month index (1–12, where 1 = 寅, 12 = 丑) and the
 * active solar-term name for a given Gregorian month and day.
 *
 * Uses the approximate solar-term boundary table defined above.
 */
function getBaziMonthAndTerm(month: number, day: number): { baziMonth: number; term: string } {
  // Walk backwards through the boundary table to find which month we're in.
  for (let i = SOLAR_TERM_BOUNDS.length - 1; i >= 0; i--) {
    const b = SOLAR_TERM_BOUNDS[i];
    if (month > b.month || (month === b.month && day >= b.day)) {
      return { baziMonth: b.baziMonth, term: b.name };
    }
  }
  // Fallback: earliest month (丑)
  return { baziMonth: 12, term: '小寒' };
}

/**
 * Given a BaZi month index (1–12), return the corresponding Earthly Branch index (0–11).
 *
 * Mapping: 1→寅(2), 2→卯(3), …, 11→子(0), 12→丑(1)
 */
function monthIndexToBranchIndex(baziMonth: number): number {
  return (baziMonth + 1) % 12;
}

/**
 * Compute the Heavenly Stem index for the first BaZi month (寅月) of a given
 * year, based on the year-stem formula:
 *   firstMonthStem = (yearStemIndex * 2 + 2) % 10
 */
function yearStemToFirstMonthStem(yearStemIndex: number): number {
  return (yearStemIndex * 2 + 2) % 10;
}

/**
 * Determine the hour-branch index from an hour value (0–23).
 *
 * 子时 covers 23:00–01:00, so hour 23 wraps to branch 0.
 */
function hourToBranchIndex(hour: number): number {
  if (hour === 23) return 0;
  return Math.floor(hour / 2);
}

/**
 * Compute the Heavenly Stem index for 子时 given the day-stem index.
 * Formula: firstHourStem = (dayStemIndex % 5) * 2
 */
function dayStemToFirstHourStem(dayStemIndex: number): number {
  return (dayStemIndex % 5) * 2;
}

/**
 * Build a `Pillar` object from stem and branch indices.
 */
function buildPillar(stemIndex: number, branchIndex: number): Pillar {
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    stemIndex,
    branchIndex,
    stemElement: STEM_ELEMENTS[stemIndex],
    branchElement: BRANCH_ELEMENTS[branchIndex],
    hiddenStems: HIDDEN_STEMS[EARTHLY_BRANCHES[branchIndex]] ?? [],
  };
}

// ---------------------------------------------------------------------------
// Ten Gods (十神) helpers
// ---------------------------------------------------------------------------

/**
 * In the Five Element generation (生) cycle: A generates B.
 * Wood→Fire→Earth→Metal→Water→Wood
 */
function elementGeneratedBy(element: string): string {
  const idx = FIVE_ELEMENTS.indexOf(element as typeof FIVE_ELEMENTS[number]);
  return FIVE_ELEMENTS[(idx - 1 + 5) % 5];
}

/**
 * In the Five Element generation cycle: what does `element` generate?
 */
function elementGenerates(element: string): string {
  const idx = FIVE_ELEMENTS.indexOf(element as typeof FIVE_ELEMENTS[number]);
  return FIVE_ELEMENTS[(idx + 1) % 5];
}

/**
 * In the Five Element control (克) cycle: A controls B.
 * Wood→Earth→Water→Fire→Metal→Wood
 */
function elementControlledBy(element: string): string {
  const idx = FIVE_ELEMENTS.indexOf(element as typeof FIVE_ELEMENTS[number]);
  return FIVE_ELEMENTS[(idx - 2 + 5) % 5];
}

/**
 * In the Five Element control cycle: what does `element` control?
 */
function elementControls(element: string): string {
  const idx = FIVE_ELEMENTS.indexOf(element as typeof FIVE_ELEMENTS[number]);
  return FIVE_ELEMENTS[(idx + 2) % 5];
}

/**
 * Compute the Ten God (十神) label for a stem given the day master.
 *
 * @param stemIndex   Index of the stem being evaluated
 * @param dayMasterIndex  Index of the day master (日干)
 * @returns The Chinese Ten God label
 */
function computeTenGod(stemIndex: number, dayMasterIndex: number): string {
  if (stemIndex === dayMasterIndex) return '日主';

  const dmElement = STEM_ELEMENTS[dayMasterIndex];
  const dmYY = STEM_YINYANG[dayMasterIndex];
  const targetElement = STEM_ELEMENTS[stemIndex];
  const targetYY = STEM_YINYANG[stemIndex];
  const sameYY = dmYY === targetYY;

  if (targetElement === dmElement) {
    // Same element → Friend category
    return sameYY ? '比肩' : '劫财';
  }
  if (elementGenerates(dmElement) === targetElement) {
    // Day master generates this element → Output category
    return sameYY ? '食神' : '伤官';
  }
  if (elementGeneratedBy(dmElement) === targetElement) {
    // This element generates day master → Resource category
    return sameYY ? '偏印' : '正印';
  }
  if (elementControls(dmElement) === targetElement) {
    // This element controls day master → Power category
    return sameYY ? '七杀' : '正官';
  }
  if (elementGenerates(dmElement) !== targetElement &&
      elementGeneratedBy(dmElement) !== targetElement &&
      elementControls(dmElement) !== targetElement) {
    // The remaining relationship: day master controls this element → Wealth category
    return sameYY ? '偏财' : '正财';
  }

  // Fallback (should never reach here)
  return '比肩';
}

// ---------------------------------------------------------------------------
// Element scoring helpers
// ---------------------------------------------------------------------------

/**
 * Count occurrences of each Five Element across all 8 characters
 * (4 stems + 4 branch main elements).
 *
 * Hidden stems are intentionally excluded from the basic score to keep
 * scoring simple and transparent.
 */
function calculateElementScores(chart: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar }): ElementScores {
  const scores: ElementScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const pillars: Pillar[] = [chart.year, chart.month, chart.day, chart.hour];
  for (const p of pillars) {
    scores[p.stemElement as keyof ElementScores]++;
    scores[p.branchElement as keyof ElementScores]++;
  }
  return scores;
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Calculate the complete BaZi (Four Pillars of Destiny) chart for a given
 * birth datetime.
 *
 * @param year  - Full Gregorian year (e.g. 1990)
 * @param month - Gregorian month (1–12)
 * @param day   - Day of month (1–31)
 * @param hour  - Hour of birth (0–23)
 * @returns A fully populated `BaziChart` object
 *
 * @example
 * ```ts
 * const chart = calculateBazi(1990, 6, 15, 14);
 * console.log(chart.dayMaster); // e.g. "丙"
 * ```
 */
export function calculateBazi(year: number, month: number, day: number, hour: number): BaziChart {
  // ---- Handle 子时 wrap-around: 23:00 → next day ----
  let effectiveDay = day;
  let effectiveMonth = month;
  let effectiveYear = year;
  if (hour === 23) {
    effectiveDay++;
    if (effectiveDay > 28) {
      // Rough handling for month rollover (simplified)
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

  // ---- Year Pillar ----
  const yearStemIndex = ((year - 4) % 10 + 10) % 10;
  const yearBranchIndex = ((year - 4) % 12 + 12) % 12;
  const yearPillar = buildPillar(yearStemIndex, yearBranchIndex);

  // ---- Month Pillar ----
  const { baziMonth, term } = getBaziMonthAndTerm(effectiveMonth, effectiveDay);
  const monthBranchIndex = monthIndexToBranchIndex(baziMonth);
  const firstMonthStem = yearStemToFirstMonthStem(yearStemIndex);
  const monthStemIndex = (firstMonthStem + baziMonth - 1) % 10;
  const monthPillar = buildPillar(monthStemIndex, monthBranchIndex);

  // ---- Day Pillar ----
  const jdn = julianDayNumber(effectiveYear, effectiveMonth, effectiveDay);
  const dayStemIndex = ((jdn + 9) % 10 + 10) % 10;
  const dayBranchIndex = ((jdn + 1) % 12 + 12) % 12;
  const dayPillar = buildPillar(dayStemIndex, dayBranchIndex);

  // ---- Hour Pillar ----
  const hourBranchIdx = hourToBranchIndex(hour);
  const firstHourStem = dayStemToFirstHourStem(dayStemIndex);
  const hourStemIndex = (firstHourStem + hourBranchIdx) % 10;
  const hourPillar = buildPillar(hourStemIndex, hourBranchIdx);

  // ---- Day Master ----
  const dayMaster = dayPillar.stem;
  const dayMasterElement = dayPillar.stemElement;
  const dayMasterYinYang = dayPillar.stemElement
    ? STEM_YINYANG[dayStemIndex]
    : 'yang';
  // (stemElement is always defined, the ternary is just a TS safety net)

  // ---- Element Scores ----
  const elementScores = calculateElementScores({ year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar });

  // ---- Ten Gods ----
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

  // ---- Luck Pillars (大运) — 8 major periods ----
  const forward = dayMasterYinYang === 'yang';
  const luckPillars: LuckPillar[] = [];
  let startAge = 3; // Simplified: first luck pillar starts at age 3
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
    const pillar = buildPillar(lStem, lBranch);
    luckPillars.push({
      ageRange: `${age}-${age + 9}`,
      startAge: age,
      endAge: age + 9,
      pillar,
      stemGod: computeTenGod(lStem, dayStemIndex),
    });
  }

  // ---- Year Pillar string (current year) ----
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentYearStem = ((currentYear - 4) % 10 + 10) % 10;
  const currentYearBranch = ((currentYear - 4) % 12 + 12) % 12;
  const yearPillarStr = `${HEAVENLY_STEMS[currentYearStem]}${EARTHLY_BRANCHES[currentYearBranch]}年`;

  // ---- Zodiac (生肖) ----
  const zodiac = BRANCH_ANIMALS[yearBranchIndex];

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    dayMaster,
    dayMasterElement,
    dayMasterYinYang,
    elementScores,
    tenGods: { yearStem: yearStemGod, monthStem: monthStemGod, hourStem: hourStemGod, allGods },
    luckPillars,
    yearPillar: yearPillarStr,
    solarTerms: term,
    zodiac,
  };
}

// ---------------------------------------------------------------------------
// Analysis helpers
// ---------------------------------------------------------------------------

/** Balance classification for a single element */
export interface ElementBalance {
  element: string;
  score: number;
  status: 'strong' | 'balanced' | 'weak' | 'absent';
}

/**
 * Analyse the balance of all five elements in the chart.
 *
 * - **Strong**: score ≥ 3
 * - **Balanced**: score === 2
 * - **Weak**: score === 1
 * - **Absent**: score === 0
 */
export function calculateElementBalance(scores: ElementScores): ElementBalance[] {
  return FIVE_ELEMENTS.map((el) => {
    const score = scores[el as keyof ElementScores];
    let status: ElementBalance['status'];
    if (score === 0) status = 'absent';
    else if (score === 1) status = 'weak';
    else if (score === 2) status = 'balanced';
    else status = 'strong';
    return { element: el, score, status };
  });
}

/** Strength assessment result */
export interface DayMasterStrength {
  strength: 'very_strong' | 'strong' | 'balanced' | 'weak' | 'very_weak';
  description: string;
  favorableElements: string[];
  unfavorableElements: string[];
}

/**
 * Assess the overall strength of the Day Master (日主) in the chart.
 *
 * Factors considered (simplified):
 * 1. **Seasonal prosperity** — is the day master's element prosperous in the
 *    month branch's season?
 * 2. **Element score** — how many total supports (same element + resource
 *    elements) exist?
 * 3. **Peer count** — number of same-element stems/branches.
 *
 * Returns a label, human-readable description, and a list of favorable vs.
 * unfavorable elements.
 */
export function getDayMasterStrength(chart: BaziChart): DayMasterStrength {
  const dm = chart.dayMasterElement;
  const resource = elementGeneratedBy(dm);
  const peerSupport = chart.elementScores[dm as keyof ElementScores];
  const resourceSupport = chart.elementScores[resource as keyof ElementScores];
  const totalSupport = peerSupport + resourceSupport;

  // Seasonal factor
  const monthSeason = SEASON_FOR_BRANCH[chart.month.branch];
  const prosperousElement = PROSPEROUS_ELEMENT[monthSeason];
  const seasonalMatch = prosperousElement === dm ? 1 : prosperousElement === resource ? 0.5 : 0;

  // Composite score (0–7 range approximately)
  const compositeScore = totalSupport + seasonalMatch;

  let strength: DayMasterStrength['strength'];
  let description: string;

  if (compositeScore >= 5) {
    strength = 'very_strong';
    description = `日主${chart.dayMaster}(${dm})非常强旺，得令得势。性格刚毅果断，有领导力，但也需注意过于刚强导致的冲突。`;
  } else if (compositeScore >= 4) {
    strength = 'strong';
    description = `日主${chart.dayMaster}(${dm})偏强，根基稳固。有能力承担责任，适合发展事业。`;
  } else if (compositeScore >= 3) {
    strength = 'balanced';
    description = `日主${chart.dayMaster}(${dm})中和平衡，运势较为平稳。进退有度，适合稳健发展。`;
  } else if (compositeScore >= 2) {
    strength = 'weak';
    description = `日主${chart.dayMaster}(${dm})偏弱，需要外力辅助。适合合作共赢，借助他人力量发展。`;
  } else {
    strength = 'very_weak';
    description = `日主${chart.dayMaster}(${dm})非常衰弱，急需帮扶。应注重积累资源，不宜冒进。`;
  }

  // Determine favorable / unfavorable elements
  const control = elementControls(dm);
  const output = elementGenerates(dm);
  const wealth = elementControlledBy(dm);

  if (compositeScore >= 4) {
    // Strong day master needs to be weakened
    return {
      strength,
      description,
      favorableElements: [output, wealth, control],
      unfavorableElements: [dm, resource],
    };
  } else {
    // Weak day master needs to be strengthened
    return {
      strength,
      description,
      favorableElements: [dm, resource],
      unfavorableElements: [output, wealth, control],
    };
  }
}

/** Compatibility assessment result */
export interface CompatibilityResult {
  score: number;           // 0–100
  level: 'excellent' | 'good' | 'average' | 'poor';
  summary: string;
  details: string[];
}

/**
 * Compute a basic compatibility score between two BaZi charts.
 *
 * Factors:
 * 1. **Element complementarity** — does chart2 have what chart1 needs?
 * 2. **Yin-yang harmony** — day masters with opposite polarity score higher.
 * 3. **Element overlap** — shared elements provide common ground but too
 *    much overlap is penalised slightly.
 *
 * Returns a numeric score 0–100 with a qualitative label.
 */
export function getCompatibility(chart1: BaziChart, chart2: BaziChart): CompatibilityResult {
  const strength1 = getDayMasterStrength(chart1);
  const strength2 = getDayMasterStrength(chart2);

  // 1. Element complementarity (max 40 points)
  let complementScore = 0;
  for (const el of strength1.favorableElements) {
    if (chart2.elementScores[el as keyof ElementScores] >= 2) complementScore += 10;
    else if (chart2.elementScores[el as keyof ElementScores] >= 1) complementScore += 5;
  }
  complementScore = Math.min(complementScore, 40);

  // 2. Yin-yang harmony (max 20 points)
  const yyHarmony = chart1.dayMasterYinYang !== chart2.dayMasterYinYang ? 20 : 10;

  // 3. Element overlap — common ground (max 20 points)
  let overlapCount = 0;
  for (const el of FIVE_ELEMENTS) {
    if (
      chart1.elementScores[el as keyof ElementScores] > 0 &&
      chart2.elementScores[el as keyof ElementScores] > 0
    ) {
      overlapCount++;
    }
  }
  const overlapScore = Math.min(overlapCount * 5, 20);

  // 4. Mutual need satisfaction (max 20 points)
  let mutualScore = 0;
  for (const el of strength1.favorableElements) {
    if (strength2.favorableElements.includes(el)) mutualScore += 5;
  }
  mutualScore = Math.min(mutualScore, 20);

  const total = complementScore + yyHarmony + overlapScore + mutualScore;

  let level: CompatibilityResult['level'];
  let summary: string;

  if (total >= 80) {
    level = 'excellent';
    summary = `两人命盘高度互补，五行相济，阴阳协调，属于上等配合。`;
  } else if (total >= 60) {
    level = 'good';
    summary = `两人命盘较为和谐，存在互补因素，属于中上等配合。`;
  } else if (total >= 40) {
    level = 'average';
    summary = `两人命盘有一定共性，但也存在需要磨合的地方，属于中等配合。`;
  } else {
    level = 'poor';
    summary = `两人命盘互补性较弱，需要更多理解与包容，属于需要努力的配合。`;
  }

  const details = [
    `五行互补分: ${complementScore}/40`,
    `阴阳协调分: ${yyHarmony}/20`,
    `五行重叠分: ${overlapScore}/20`,
    `互需满足分: ${mutualScore}/20`,
    `日主${chart1.dayMaster}(${chart1.dayMasterElement}) 喜用: ${strength1.favorableElements.join(', ')}`,
    `日主${chart2.dayMaster}(${chart2.dayMasterElement}) 喜用: ${strength2.favorableElements.join(', ')}`,
  ];

  return { score: total, level, summary, details };
}
