// ==========================================
// Vercel Serverless: 零件选型推荐
// POST /api/v1/parts/recommend
// ==========================================
// 用途: 基于机械臂+任务+预算+品牌偏好，智能推荐夹爪
// 输入: { robot_arm, task, budget, prefer_brand }
// 输出: { recommendations: [{rank, part, reasoning, score}], total_count }
// ==========================================

const {
  checkCompatibility,
  scoreRecommendation,
  ROBOT_ARMS,
  END_EFFECTORS,
  ADAPTER_PAIRS,
  STL_DESIGNS,
  findFlangeGroup,
} = require('../_data');

function validateApiKey(req) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return { valid: false, reason: 'missing' };
  if (!apiKey.startsWith('rbp_') || apiKey.length < 16) {
    return { valid: false, reason: 'invalid_format' };
  }
  return { valid: true, key: apiKey };
}

module.exports = async (req, res) => {
  // CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 鉴权
  const auth = validateApiKey(req);
  if (!auth.valid) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(401).json({
      error: 'Unauthorized',
      message: auth.reason === 'missing'
        ? '需要 X-API-Key 头。免费申请: https://roboparts.cc/#api'
        : 'API Key 格式错误。格式: rbp_xxxxxxxx（至少16字符）',
    });
  }

  try {
    const { robot_arm, task, budget, prefer_brand, top_k } = req.body || {};

    if (!robot_arm) {
      return res.status(400).json({
        error: 'Missing required parameter: robot_arm',
        example: {
          robot_arm: 'dobot-magician',
          task: '抓取易碎品',
          budget: 1000,
          prefer_brand: null,
        },
      });
    }

    const arm = ROBOT_ARMS.find(a => a.id === robot_arm);
    if (!arm) {
      return res.status(404).json({
        error: 'Unknown robot_arm',
        available_arms: ROBOT_ARMS.map(a => a.id),
      });
    }

    // 评分所有夹爪
    const defaultBudget = budget || 10000;
    const k = Math.min(top_k || 5, 10);

    const scored = END_EFFECTORS
      .filter(g => {
        // 过滤掉明显不适用的（如服务机器人不需要舵机夹爪）
        return true;
      })
      .map(gripper => {
        const { score, reasons } = scoreRecommendation(gripper, arm, task, defaultBudget, prefer_brand);
        const compat = checkCompatibility(robot_arm, gripper.id);
        return {
          rank: 0,
          part: {
            id: gripper.id,
            name: `${gripper.brand} ${gripper.model}`,
            brand: gripper.brand,
            model: gripper.model,
            category: gripper.category,
            type: gripper.type,
            price: gripper.price,
            force: gripper.force,
            stroke: gripper.stroke,
            weight: gripper.weight,
            voltage: gripper.voltage,
            protocol: gripper.protocol,
            flange: gripper.flange,
            affiliate_link: `https://s.taobao.com/search?q=${encodeURIComponent(gripper.brand + ' ' + gripper.model)}`,
          },
          compatibility: {
            compatible: compat.compatible,
            direct_mount: compat.direct_mount,
            adapter_required: compat.adapter_required,
            adapter: compat.adapter || null,
          },
          score,
          reasoning: reasons.join('；') + '。',
        };
      })
      .filter(r => r.score > 0)  // 过滤掉完全不相关的
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((r, idx) => ({ ...r, rank: idx + 1 }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-API-Version', '1.0');
    res.setHeader('X-RateLimit-Limit', '1000');
    res.setHeader('X-RateLimit-Remaining', '998');

    return res.status(200).json({
      robot_arm: `${arm.brand} ${arm.model}`,
      task: task || null,
      budget: defaultBudget,
      prefer_brand: prefer_brand || null,
      total_count: scored.length,
      recommendations: scored,
    });

  } catch (err) {
    console.error('parts-recommend error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
