// ==========================================
// Vercel Serverless: 兼容性检查
// POST /api/v1/compat/check
// ==========================================
// 用途: 第三方开发者/LLM/控制层查询机械臂与夹爪是否兼容
// 输入: { robot_arm: 'dobot-magician', end_effector: 'robotiq-2f85' }
// 输出: { compatible, direct_mount, adapter_required, adapter: {...}, notes }
// ==========================================

const { checkCompatibility, ROBOT_ARMS, END_EFFECTORS } = require('../_data');

// 简单的 API Key 验证（可选，未来可改为按量计费）
function validateApiKey(req) {
  const apiKey = req.headers['x-api-key'];
  // 免费阶段：任何 rbp_ 开头且长度>=16 的 key 都通过
  // 未来可改为查 Supabase api_keys 表
  if (!apiKey) return { valid: false, reason: 'missing' };
  if (!apiKey.startsWith('rbp_') || apiKey.length < 16) {
    return { valid: false, reason: 'invalid_format' };
  }
  return { valid: true, key: apiKey };
}

module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
    return res.status(200).end();
  }

  // 允许 GET（用 query string 调试）和 POST（生产）
  if (req.method === 'GET') {
    return handleListParts(req, res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // API Key 验证
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
    const { robot_arm, end_effector, check_items } = req.body || {};

    if (!robot_arm || !end_effector) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['robot_arm', 'end_effector'],
        example: { robot_arm: 'dobot-magician', end_effector: 'robotiq-2f85' },
      });
    }

    const result = checkCompatibility(robot_arm, end_effector);

    if (result.error) {
      return res.status(404).json(result);
    }

    // 根据 check_items 过滤响应字段
    if (Array.isArray(check_items) && check_items.length > 0) {
      const filtered = {
        robot_arm: result.robot_arm,
        end_effector: result.end_effector,
        compatible: result.compatible,
        direct_mount: result.direct_mount,
        adapter_required: result.adapter_required,
        notes: result.notes,
      };
      if (check_items.includes('flange')) {
        filtered.arm_flange = result.arm_flange;
        filtered.gripper_flange = result.gripper_flange;
      }
      if (check_items.includes('voltage')) {
        filtered.arm_voltage = result.arm_voltage;
        filtered.gripper_voltage = result.gripper_voltage;
      }
      if (check_items.includes('protocol')) {
        filtered.arm_protocol = result.arm_protocol;
        filtered.gripper_protocol = result.gripper_protocol;
        filtered.protocol_match = result.protocol_match;
      }
      if (check_items.includes('adapter') && result.adapter) {
        filtered.adapter = result.adapter;
      }
      return res.status(200).json(filtered);
    }

    // 默认返回全部字段
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-API-Version', '1.0');
    res.setHeader('X-RateLimit-Limit', '1000');
    res.setHeader('X-RateLimit-Remaining', '999');
    return res.status(200).json(result);

  } catch (err) {
    console.error('compat-check error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};

// GET 请求返回可用零件列表（用于探索 API）
function handleListParts(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-API-Version', '1.0');
  return res.status(200).json({
    api: 'RoboParts Compatibility API',
    version: '1.0',
    docs: 'https://roboparts.cc/docs/api',
    endpoints: {
      'POST /api/v1/compat/check': '检查兼容性',
      'POST /api/v1/parts/recommend': '零件推荐',
    },
    robot_arms: ROBOT_ARMS.map(a => ({ id: a.id, brand: a.brand, model: a.model, flange: a.flange })),
    end_effectors: END_EFFECTORS.map(e => ({ id: e.id, brand: e.brand, model: e.model, flange: e.flange })),
    auth: 'X-API-Key header required. Get free key: https://roboparts.cc/#api',
  });
}
