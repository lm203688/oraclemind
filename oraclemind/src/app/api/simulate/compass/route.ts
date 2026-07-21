import { NextRequest, NextResponse } from 'next/server';

// 罗盘推演——基于方位和时辰的吉凶推算
// 二十四山向 + 六十甲子 + 八卦

interface CompassInput {
  question: string;          // 用户问题
  direction?: string;        // 方位（N/NE/E/SE/S/SW/W/NW 或具体角度）
  activity?: string;         // 活动类型（出行/开业/搬家/签约等）
  date?: string;             // 日期 YYYY-MM-DD
}

interface CompassResult {
  question: string;
  direction: string;
  directionDeg: number;
  mountain: string;          // 二十四山
  auspicious: boolean;
  score: number;             // -1 ~ +1
  advice: string;
  details: {
    bagua: string;           // 对应八卦
    element: string;         // 五行
    wuxing: string;          // 五行关系
    bestHours: string[];     // 吉时
    avoidHours: string[];    // 凶时
    compatibleDirections: string[];
  };
}

// 二十四山
const MOUNTAINS = [
  { name: '壬', deg: 337.5, element: 'Water', bagua: 'Kan' },
  { name: '子', deg: 0, element: 'Water', bagua: 'Kan' },
  { name: '癸', deg: 22.5, element: 'Water', bagua: 'Kan' },
  { name: '丑', deg: 37.5, element: 'Earth', bagua: 'Gen' },
  { name: '艮', deg: 45, element: 'Earth', bagua: 'Gen' },
  { name: '寅', deg: 52.5, element: 'Earth', bagua: 'Gen' },
  { name: '甲', deg: 67.5, element: 'Wood', bagua: 'Zhen' },
  { name: '卯', deg: 90, element: 'Wood', bagua: 'Zhen' },
  { name: '乙', deg: 112.5, element: 'Wood', bagua: 'Xun' },
  { name: '辰', deg: 127.5, element: 'Earth', bagua: 'Xun' },
  { name: '巽', deg: 135, element: 'Wood', bagua: 'Xun' },
  { name: '巳', deg: 142.5, element: 'Fire', bagua: 'Xun' },
  { name: '丙', deg: 157.5, element: 'Fire', bagua: 'Li' },
  { name: '午', deg: 180, element: 'Fire', bagua: 'Li' },
  { name: '丁', deg: 202.5, element: 'Fire', bagua: 'Li' },
  { name: '未', deg: 217.5, element: 'Earth', bagua: 'Kun' },
  { name: '坤', deg: 225, element: 'Earth', bagua: 'Kun' },
  { name: '申', deg: 232.5, element: 'Metal', bagua: 'Kun' },
  { name: '庚', deg: 247.5, element: 'Metal', bagua: 'Dui' },
  { name: '酉', deg: 270, element: 'Metal', bagua: 'Dui' },
  { name: '辛', deg: 292.5, element: 'Metal', bagua: 'Dui' },
  { name: '戌', deg: 307.5, element: 'Earth', bagua: 'Qian' },
  { name: '乾', deg: 315, element: 'Metal', bagua: 'Qian' },
  { name: '亥', deg: 322.5, element: 'Water', bagua: 'Qian' },
];

function degToMountain(deg: number) {
  const normalized = ((deg % 360) + 360) % 360;
  const idx = Math.floor((normalized + 7.5) / 15) % 24;
  return MOUNTAINS[idx];
}

function directionToDeg(dir: string): number {
  const map: Record<string, number> = {
    N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
    北: 0, 东北: 45, 东: 90, 东南: 135, 南: 180, 西南: 225, 西: 270, 西北: 315,
  };
  return map[dir] ?? parseFloat(dir);
}

export async function POST(request: NextRequest) {
  const body: CompassInput = await request.json();
  const { question, direction, activity, date } = body;

  if (!question) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  }

  // 确定方位
  const dirDeg = direction ? directionToDeg(direction) : Math.random() * 360;
  const mountain = degToMountain(dirDeg);

  // 基于问题和方位计算吉凶分数
  const questionHash = question.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const dateHash = date ? date.split('-').reduce((a, c) => a + parseInt(c), 0) : new Date().getDate();
  const seed = (questionHash + dateHash + dirDeg) % 100;
  
  // 分数 -1 ~ +1
  const score = ((seed % 60) - 30) / 30;
  const auspicious = score > 0;

  // 吉时凶时（基于时辰地支）
  const hours = ['子(23-1)', '丑(1-3)', '寅(3-5)', '卯(5-7)', '辰(7-9)', '巳(9-11)', '午(11-13)', '未(13-15)', '申(15-17)', '酉(17-19)', '戌(19-21)', '亥(21-23)'];
  const bestHours = [hours[seed % 12], hours[(seed + 4) % 12], hours[(seed + 8) % 12]];
  const avoidHours = [hours[(seed + 2) % 12], hours[(seed + 6) % 12], hours[(seed + 10) % 12]];

  // 相配方位
  const compatDirs = ['N', 'E', 'S', 'W'].filter((_, i) => (seed + i) % 3 !== 0);

  // 建议
  const advice = auspicious
    ? `Direction ${mountain.name} (${mountain.deg}°) is auspicious for ${activity || 'your endeavor'}. The ${mountain.bagua} trigram aligns with ${mountain.element} energy, supporting forward momentum. Best timing: ${bestHours[0]}.`
    : `Direction ${mountain.name} (${mountain.deg}°) carries mixed energy for ${activity || 'your question'}. The ${mountain.bagua} trigram suggests caution. Consider adjusting timing to ${bestHours[0]} or shifting to a compatible direction.`;

  const result: CompassResult = {
    question,
    direction: direction || `${Math.round(dirDeg)}°`,
    directionDeg: Math.round(dirDeg),
    mountain: mountain.name,
    auspicious,
    score: Math.round(score * 100) / 100,
    advice,
    details: {
      bagua: mountain.bagua,
      element: mountain.element,
      wuxing: mountain.element,
      bestHours,
      avoidHours,
      compatibleDirections: compatDirs,
    },
  };

  return NextResponse.json({ success: true, result });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
