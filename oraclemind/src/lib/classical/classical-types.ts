/**
 * Classical Agent Types — 5本古籍共用的类型定义
 *
 * 5本古籍各为一个独立Agent，输出结构化的"古典验证报告"，
 * 由 cross-validator 综合后与现代5Agent形成5×5交叉验证矩阵。
 */

// ---------------------------------------------------------------------------
// 五本古籍标识
// ---------------------------------------------------------------------------

export type ClassicalBookId =
  | 'yuanhai'      // 《渊海子平》— 源流正宗
  | 'ziping'       // 《子平真诠》— 格局成败
  | 'sanming'      // 《三命通会》— 综合众家
  | 'ditianzhui'   // 《滴天髓》— 旺衰用神
  | 'qiongtong';   // 《穷通宝鉴》— 调候时令

export interface ClassicalBookMeta {
  id: ClassicalBookId;
  name: string;          // 中文书名
  nameEn: string;        // 英文名
  author: string;        // 作者
  era: string;           // 朝代
  school: string;        // 流派
  perspective: string;   // 验证视角
  coreQuestion: string;  // 核心问题
  // 东方神秘色彩背景（面向海外用户）
  mysteryTitle: string;       // 神秘标题（英文）
  mysteryOrigin: string;      // 神秘起源（英文）
  mysteryPower: string;       // 神秘力量（英文）
  mysteryRitual: string;      // 神秘仪式（英文）
  auraColor: string;          // 光环颜色
}

export const CLASSICAL_BOOKS: ClassicalBookMeta[] = [
  {
    id: 'yuanhai',
    name: '渊海子平',
    nameEn: 'Yuanhai Ziping',
    author: '徐子平',
    era: '北宋',
    school: '子平祖本',
    perspective: '源流正宗',
    coreQuestion: '是否符合子平祖本的基础规则？',
    mysteryTitle: 'The Abyssal Ocean Manuscript',
    mysteryOrigin: 'Sealed in a mountain monastery for 900 years, this text was said to be channeled through a Daoist immortal who could see the threads of fate woven into the stars. The original bamboo slips were lost to fire, but a single copy survived—hidden inside a statue of Laozi.',
    mysteryPower: 'Reveals the foundational pattern of a person's destiny—the original "source code" written at the moment of their first breath. Those who master its secrets can trace any life event back to its cosmic origin.',
    mysteryRitual: 'Before reading, the scholar must burn three sticks of sandalwood and face the North Star. The text reveals itself only to those whose mind is "still as a frozen lake."',
    auraColor: '#1a3a5c',
  },
  {
    id: 'ziping',
    name: '子平真诠',
    nameEn: 'Ziping Zhenyuan',
    author: '沈孝瞻',
    era: '清',
    school: '格局派系统化',
    perspective: '格局成败',
    coreQuestion: '用神是否成格？是否被破坏？',
    mysteryTitle: 'The True Commentary of the Purple Star',
    mysteryOrigin: 'Written by a reclusive scholar who never left his courtyard for 40 years. Legend says he could predict the exact hour of a stranger's death just by hearing their name. The manuscript was buried with him and only rediscovered when his tomb was opened by soldiers 200 years later.',
    mysteryPower: 'Identifies the "formation" — a hidden structure in destiny that determines whether a life ascends to greatness or crumbles. Like a martial arts stance, the formation can be strong, broken, or transformed by key life events.',
    mysteryRitual: 'The text must be read by candlelight on a night when the moon is unseen. A broken formation can be mended, but only if the reader understands the "pivot point" — the single moment when destiny can be redirected.',
    auraColor: '#4a2c6a',
  },
  {
    id: 'sanming',
    name: '三命通会',
    nameEn: 'Sanming Tonghui',
    author: '万民英',
    era: '明',
    school: '综合集大成',
    perspective: '众家综合',
    coreQuestion: '兼采众家后的综合层次如何？',
    mysteryTitle: 'The Convergence of Three Destinies',
    mysteryOrigin: 'Compiled by a Ming dynasty official who collected fragments from 72 forbidden texts across 12 provinces. Some chapters were copied from scrolls found in abandoned temples; others from memory of a blind oracle who could see the future but not the present.',
    mysteryPower: 'Sees destiny from three dimensions simultaneously — the Heaven dimension (cosmic timing), the Earth dimension (environmental forces), and the Human dimension (personal will). When all three align, the text reveals the "convergence point" — a rare window where destiny can be rewritten.',
    mysteryRitual: 'The reader must hold three coins from three different dynasties while studying the text. Each coin represents one dimension. If all three coins grow warm simultaneously, the convergence point has been found.',
    auraColor: '#8b6914',
  },
  {
    id: 'ditianzhui',
    name: '滴天髓',
    nameEn: 'Ditian Sui',
    author: '任铁樵注',
    era: '清',
    school: '旺衰派',
    perspective: '能量旺衰',
    coreQuestion: '日主能量是涨是落？用神是否有力？',
    mysteryTitle: 'The Marrow of Heaven's Drop',
    mysteryOrigin: 'The original text was allegedly dictated by a celestial being to a Daoist hermit on a mountain peak during a thunderstorm. The hermit wrote with his own blood because no ink could capture the "weight" of the words. The annotated version by Ren Tieqiao was found hidden inside a hollow Buddha statue.',
    mysteryPower: 'Measures the invisible "life energy" flowing through a person's destiny — like reading the voltage of a soul. It can detect when energy is rising (destiny accelerating), falling (destiny fading), or blocked (destiny waiting for a catalyst to release).',
    mysteryRitual: 'The text must be read at dawn, when dew still clings to leaves. A single drop of water placed on the page is said to reveal hidden characters that do not appear in normal light.',
    auraColor: '#0d4d4d',
  },
  {
    id: 'qiongtong',
    name: '穷通宝鉴',
    nameEn: 'Qiongtong Baojian',
    author: '余春台',
    era: '清',
    school: '调候派',
    perspective: '时令调候',
    coreQuestion: '当前时机是否得令？需何调候？',
    mysteryTitle: 'The Mirror of Seasonal Truths',
    mysteryOrigin: 'Originated from a traveling monk who could predict harvests by touching the soil. He claimed the text was "written by the seasons themselves" — each chapter corresponds to a different time of year, and the book must be read in a rotating order depending on when you open it. The original was said to change its contents with the weather.',
    mysteryPower: 'Reveals the "seasonal temperature" of a person's destiny — whether they are in the spring of their life (growth), summer (peak power), autumn (harvest), or winter (dormancy). More importantly, it identifies what "medicine" is needed to restore balance when the season is wrong.',
    mysteryRitual: 'The book must be opened to a random page on the first day of each season. The page it falls to is said to be the "message from the season" — a warning or blessing that will manifest within 90 days.',
    auraColor: '#5c3d2e',
  },
];

// ---------------------------------------------------------------------------
// 古典验证报告（每本书的输出）
// ---------------------------------------------------------------------------

export interface ClassicalVerificationReport {
  bookId: ClassicalBookId;
  bookName: string;
  perspective: string;

  /** 核心判定结果（每本书不同，但都归一化为 -1 ~ +1 的方向分数） */
  judgment: string;            // 人类可读的判定结论
  directionScore: number;      // -1 (消极) ~ +1 (积极)
  confidence: number;          // 0 ~ 1

  /** 详细分析 */
  details: ClassicalDetail[];

  /** 关键提示（针对当前问题/事件） */
  warnings: string[];
  opportunities: string[];

  /** 古典建议（用古典术语表达） */
  classicalAdvice: string;

  /** 用于交叉验证的结构化字段 */
  consensus: 'positive' | 'neutral' | 'negative';
}

export interface ClassicalDetail {
  label: string;        // e.g. "用神状态"
  value: string;        // e.g. "有情有力"
  score: number;        // -1 ~ +1
  note?: string;
}

// ---------------------------------------------------------------------------
// 古典Agent调用上下文
// ---------------------------------------------------------------------------

export interface ClassicalAgentContext {
  /** 用户的八字命盘（如果提供了出生时间） */
  chart?: import('./bazi-foundation').BaziChart;

  /** 用户的问题（自然语言） */
  question: string;

  /** 推演类型 */
  simulationType: 'personal' | 'event';

  /** 个人推演：当前生活情境摘要 */
  personalContext?: string;

  /** 事件推演：事件描述 */
  eventContext?: string;

  /** 当前流年信息（如 2026丙午年） */
  currentYear?: { stem: string; branch: string; element: string };
}

// ---------------------------------------------------------------------------
// 5本古籍内部分歧检测
// ---------------------------------------------------------------------------

export interface ClassicalDivergenceAnalysis {
  /** 格局派内部（渊海+子平真诠+三命通会）一致性 */
  patternSchoolConsensus: 'high' | 'medium' | 'low';

  /** 旺衰派（滴天髓）与格局派一致性 */
  strengthVsPatternConsensus: 'high' | 'medium' | 'low';

  /** 调候派（穷通宝鉴）与其他4本一致性 */
  climateVsOthersConsensus: 'high' | 'medium' | 'low';

  /** 总体一致性 */
  overallConsensus: 'high' | 'medium' | 'low';

  /** 分歧点描述 */
  divergencePoints: string[];

  /** 古典综合方向分（-1 ~ +1） */
  classicalConsensus: number;
}
