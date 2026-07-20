// ==========================================
// RoboParts API Key购买接口
// POST /api/v1/purchase-key
// Body: { plan: 'pay-per-use'|'monthly', credits?: number }
// 返回: { key, credits, plan, payment_url }
// ==========================================

const { createApiKey } = require('../billing');
const crypto = require('crypto');

// 虎皮椒支付配置
const XUNHUPAY_CONFIG = {
  appid: process.env.XUNHUPAY_APPID || '',
  appsecret: process.env.XUNHUPAY_APPSECRET || '',
  notify_url: 'https://roboparts.cc/api/payment-callback',
};

// 定价方案
const PLANS = {
  'pay-per-use': { name: '按次付费', price: 50, credits: 100, desc: '¥50 = 100次API调用（¥0.5/次）' },
  'monthly': { name: '月度套餐', price: 99, credits: 99999, desc: '¥99/月，不限次调用' },
  'startup': { name: '创业包', price: 299, credits: 99999, desc: '¥299/3个月，不限次+优先支持' },
};

function generateHash(params, secret) {
  const sortedKeys = Object.keys(params)
    .filter(k => k !== 'hash' && params[k] !== '' && params[k] != null)
    .sort();
  const str = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
  return crypto.createHash('md5').update(str + secret).digest('hex');
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan = 'pay-per-use' } = req.body || {};
    const planData = PLANS[plan];
    if (!planData) {
      return res.status(400).json({ error: 'Invalid plan', available: Object.keys(PLANS) });
    }

    // 创建API Key（未支付前credits=0）
    const keyData = createApiKey(plan, 0);
    const orderId = `RP${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

    // 生成虎皮椒支付链接
    const params = {
      version: '1.1',
      appid: XUNHUPAY_CONFIG.appid,
      trade_order_id: orderId,
      total_fee: planData.price,
      title: `RoboParts ${planData.name}`,
      time: Math.floor(Date.now() / 1000),
      notify_url: XUNHUPAY_CONFIG.notify_url,
      return_url: `https://roboparts.cc/payment-success?key=${keyData.key}`,
      nonce_str: crypto.randomBytes(8).toString('hex'),
      type: 'WAP',
      wap_url: 'https://roboparts.cc',
      wap_name: 'RoboParts',
    };
    params.hash = generateHash(params, XUNHUPAY_CONFIG.appsecret);

    const paymentUrl = `https://api.xunhupay.com/payment/do.html?${new URLSearchParams(params).toString()}`;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
      success: true,
      order_id: orderId,
      api_key: keyData.key,
      plan: plan,
      plan_name: planData.name,
      price: planData.price,
      credits: planData.credits,
      payment_url: paymentUrl,
      note: '支付完成后API Key自动激活'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
