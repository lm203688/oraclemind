// ==========================================
// RoboParts API计费中间件
// 免费层：5次/天/IP（兼容性检查）
// 付费层：¥0.5/次（API Key验证）
// 3D打印佣金：15%（跳转代打平台时加佣金）
// ==========================================

const crypto = require('crypto');

// 简单内存存储（后续可换Supabase）
const usageTracker = new Map();
const API_KEYS = new Map(); // apiKey -> { credits, plan }

// 免费层限制
const FREE_DAILY_LIMIT = 5;
const API_PRICE = 0.5; // ¥0.5/次

/**
 * 检查API调用权限和计费
 */
function checkAccess(req) {
  const ip = (req.headers && req.headers['x-forwarded-for']) || (req.connection && req.connection.remoteAddress) || 'unknown';
  const apiKey = (req.headers && req.headers['x-api-key']) || (req.query && req.query.key);
  const today = new Date().toISOString().slice(0, 10);

  // 有API Key — 付费用户
  if (apiKey) {
    const keyData = API_KEYS.get(apiKey);
    if (!keyData) {
      return { allowed: false, error: 'Invalid API key', code: 401 };
    }
    if (keyData.credits <= 0 && keyData.plan !== 'unlimited') {
      return { allowed: false, error: 'Insufficient credits', code: 402 };
    }
    if (keyData.plan !== 'unlimited') {
      keyData.credits -= 1;
    }
    return { allowed: true, plan: keyData.plan, credits: keyData.credits };
  }

  // 无API Key — 免费用户，按IP限制
  const key = `${ip}:${today}`;
  const usage = usageTracker.get(key) || 0;
  if (usage >= FREE_DAILY_LIMIT) {
    return {
      allowed: false,
      error: `Free limit exceeded (${FREE_DAILY_LIMIT}/day). Get API key for unlimited access.`,
      code: 429,
      upgradeUrl: 'https://roboparts.cc/pricing'
    };
  }
  usageTracker.set(key, usage + 1);
  return { allowed: true, plan: 'free', remaining: FREE_DAILY_LIMIT - usage - 1 };
}

/**
 * 创建API Key（用户购买后调用）
 */
function createApiKey(plan = 'pay-per-use', credits = 100) {
  const key = 'rpk_' + crypto.randomBytes(16).toString('hex');
  API_KEYS.set(key, { credits, plan, createdAt: new Date().toISOString() });
  return { key, credits, plan };
}

/**
 * 3D打印代打链接生成（含15%佣金）
 */
function generatePrintOrder(stlUrl, provider = 'jlcpcb') {
  const basePrice = {
    jlcpcb: 15,      // 嘉立创基础价
    mohou: 20,       // 魔猴网基础价
  };
  const base = basePrice[provider] || 15;
  const commission = Math.round(base * 0.15); // 15%佣金
  const totalPrice = base + commission;

  const links = {
    jlcpcb: `https://www.jlcpcb.com/3d-printing?stl=${encodeURIComponent(stlUrl)}&ref=roboparts`,
    mohou: `https://www.mohou.com/print?stl=${encodeURIComponent(stlUrl)}&ref=roboparts`,
  };

  return {
    provider,
    base_price: base,
    commission_15pct: commission,
    total_price: totalPrice,
    order_url: links[provider] || links.jlcpcb,
    note: `含15%平台佣金（¥${commission}）`
  };
}

/**
 * 计费中间件
 */
function billingMiddleware(req, res, next) {
  const access = checkAccess(req);
  if (!access.allowed) {
    return res.status(access.code || 403).json({
      error: access.error,
      upgrade_url: access.upgradeUrl || 'https://roboparts.cc/pricing'
    });
  }
  req.billing = access;
  res.setHeader('X-Plan', access.plan);
  if (access.remaining !== undefined) {
    res.setHeader('X-Remaining', access.remaining);
  }
  if (access.credits !== undefined) {
    res.setHeader('X-Credits', access.credits);
  }
  next();
}

module.exports = { checkAccess, createApiKey, generatePrintOrder, billingMiddleware, FREE_DAILY_LIMIT, API_PRICE };
