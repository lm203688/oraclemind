/**
 * /api/v1/nl-compat — 自然语言兼容性查询（LLM 驱动）
 *
 * 流程：
 *   1) 接 LLM（默认 agnes-2.0-flash，可由 AGNES_MODEL 覆盖）
 *   2) Prompt 把用户中文问题 → 结构化 JSON {robot_arm, task, budget, force_needed}
 *   3) 调用本地 _data 的 scoreRecommendation → top 3 候选夹爪
 *   4) 返回结构化结果 + 透传 LLM 解释
 *
 * 环境变量：
 *   AGNES_API_KEY       必填（推荐使用 agnes sk-… key）
 *   AGNES_BASE_URL      默认 https://apihub.agnes-ai.com/v1
 *   AGNES_MODEL         默认 agnes-2.0-flash
 *   ROBOPARTS_API_KEY   本站鉴权（与 /api/v1/compat-check 共用 key）
 *
 * 鉴权：
 *   客户端需带  X-API-Key: <本站 key>
 */
const { checkCompatibility, scoreRecommendation, ROBOT_ARMS, END_EFFECTORS } = require('../_data');

const ROBOT_IDS = ROBOT_ARMS.map(r => r.id).join(', ');
const EFFECTOR_BRANDS = [...new Set(END_EFFECTORS.map(e => e.brand))].join(', ');

const SYSTEM_PROMPT =
  '你是机器人零件选型助手。用户会用中文描述需求（例如："我想用UR5e抓鸡蛋"、"DOBOT机械臂预算500块抓小件"）。\n' +
  '你的任务：把用户输入转成严格的 JSON（无 Markdown、无多余文字），字段如下：\n' +
  '{\n' +
  '  "robot_arm":   字符串 或 null（必须是已知型号名/ID/品牌简称，例如 "UR5e"、"dobot-magician"、"优必选"、"elephant"）,\n' +
  '  "task":        字符串（"抓易碎品"/"搬运"/"装配"/"拾取"/"分拣" 等）,\n' +
  '  "force_needed": 字符串 ("轻"/"中"/"重" 或 null),\n' +
  '  "budget":      数字（人民币元）或 null,\n' +
  '  "constraints": 字符串数组（"防静电"/"食品级"/"IP67" 等）,\n' +
  '  "clarify_question": 字符串 或 null（如果关键信息缺失，向用户追问）\n' +
  '}\n' +
  '规则：\n' +
  '1. 只输出 JSON，前缀不要加 ```json。\n' +
  '2. 已知机械臂ID列表: ' + ROBOT_IDS + '\n' +
  '3. 已知夹爪品牌列表: ' + EFFECTOR_BRANDS + '\n' +
  '4. 用户没说预算/力 → 设为 null。\n' +
  '5. 如果用户没说明机械臂 → robot_arm 设为 null，并给出 clarify_question。';

// ── LLM 适配层（OpenAI 兼容协议）────────────────────────────────
async function callLLM(userQuery) {
  const apiKey = process.env.AGNES_API_KEY;
  if (!apiKey) {
    throw new Error('AGNES_API_KEY not configured');
  }
  const baseUrl = (process.env.AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1').replace(/\/+$/, '');
  const model = process.env.AGNES_MODEL || 'agnes-2.0-flash';

  const body = JSON.stringify({
    model: model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userQuery }
    ],
    temperature: 0.2,
    max_tokens: 400
  });

  const url = new URL(baseUrl + '/chat/completions');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body: body
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('LLM HTTP ' + res.status + ': ' + err.substring(0, 200));
  }
  return res.json();
}

function extractJson(text) {
  let s = text.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }
  const i = s.indexOf('{');
  const j = s.lastIndexOf('}');
  if (i < 0 || j < 0) throw new Error('No JSON in LLM output');
  return JSON.parse(s.substring(i, j + 1));
}

function resolveRobotArmId(input) {
  if (!input) return null;
  const q = String(input).toLowerCase().trim();
  let hit = ROBOT_ARMS.find(function (r) { return r.id === q; });
  if (hit) return hit.id;
  hit = ROBOT_ARMS.find(function (r) {
    return q.includes(r.id)
      || r.brand.toLowerCase().includes(q)
      || (r.model || '').toLowerCase().includes(q);
  });
  return hit ? hit.id : null;
}

function taskToForce(task) {
  if (!task) return null;
  const t = String(task).toLowerCase();
  if (/易碎|鸡蛋|轻|精密|fragile|egg/.test(t)) return 'light';
  if (/搬|重|大力|heavy|load/.test(t)) return 'heavy';
  return 'medium';
}

// ── 主 handler ────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed', message: 'Use POST' });
  }

  // 鉴权
  const clientKey = (req.headers['x-api-key'] || '').trim();
  const serverKey = (process.env.ROBOPARTS_API_KEY || 'rbp_test1234567890abc').trim();
  if (!clientKey || clientKey !== serverKey) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Invalid or missing X-API-Key header. Use rbp_<your-key>.'
    });
  }

  // 解析 body
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      return res.status(400).json({ error: 'invalid_json' });
    }
  }
  const query = (body && body.query) ? String(body.query).trim() : '';
  if (!query) {
    return res.status(400).json({
      error: 'missing_query',
      example: { query: '我想用UR5e抓鸡蛋，预算2000块' }
    });
  }

  try {
    // 1) LLM 解析
    const llmResp = await callLLM(query);
    const content = llmResp && llmResp.choices && llmResp.choices[0] && llmResp.choices[0].message
      && llmResp.choices[0].message.content;
    if (!content) throw new Error('Empty LLM response');

    const parsed = extractJson(content);
    const robotArmId = resolveRobotArmId(parsed.robot_arm);

    // 只有 robot_arm 解析失败才走 clarify；否则直接出推荐
    if (!robotArmId) {
      return res.status(200).json({
        stage: 'clarify',
        parsed: parsed,
        robot_arm_resolved: null,
        clarify_question: parsed.clarify_question || '请问您使用的机械臂品牌和型号是？',
        usage: llmResp.usage || null
      });
    }

    // 3) 评分推荐
    const forceNeeded = parsed.force_needed || taskToForce(parsed.task);
    const arm = ROBOT_ARMS.find(function (r) { return r.id === robotArmId; });
    const scored = END_EFFECTORS
      .map(function (eff) {
        const s = scoreRecommendation(eff, arm, parsed.task || '', parsed.budget || null, null);
        return { effector: eff, score: s.score, reasons: s.reasons };
      })
      .sort(function (a, b) { return b.score - a.score; });

    // 4) 兼容性矩阵
    const top3 = scored.slice(0, 3).map(function (r) {
      const compat = checkCompatibility(robotArmId, r.effector.id);
      return {
        effector: r.effector,
        score: r.score,
        reasons: r.reasons,
        compatibility: {
          compatible: compat.compatible,
          direct_mount: compat.direct_mount,
          adapter: compat.adapter_required ? compat.adapter : null
        }
      };
    });

    return res.status(200).json({
      stage: 'result',
      query: query,
      parsed: Object.assign({}, parsed, { robot_arm: robotArmId, force_needed: forceNeeded }),
      recommendations: top3,
      usage: llmResp.usage || null,
      model: process.env.AGNES_MODEL || 'agnes-2.0-flash'
    });

  } catch (e) {
    console.error('[nl-compat]', e);
    return res.status(500).json({
      error: 'internal_error',
      message: String(e.message || e).substring(0, 300)
    });
  }
};
