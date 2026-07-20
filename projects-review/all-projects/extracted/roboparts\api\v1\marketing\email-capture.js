// ==========================================
// Vercel Serverless: 邮件捕获 API
// POST /api/v1/marketing/email-capture
// ==========================================
// 用途: 捕获用户邮箱，支持 STL下载门控、退出弹窗、订阅表单
// 输入: { email, source, context }
// 存储: Supabase email_subscribers 表 (降级: 返回200但不存储)
// ==========================================

const https = require('https');

const SUPABASE_URL = 'https://pendpzoycfngylrrbwon.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Cm0je2pGSzSctnoNJh7wig_qsw-YxDo';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function supabaseUpsert(table, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    url.searchParams.set('on_conflict', 'email');

    const body = JSON.stringify(data);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode });
        } else {
          resolve({ success: false, status: res.statusCode, error: responseData });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(body);
    req.end();
  });
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', method: req.method });
  }

  try {
    const { email, source = 'unknown', context = '' } = req.body || {};

    // 输入验证
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_email',
        message: '请提供有效的邮箱地址',
      });
    }

    const validSources = ['stl_download', 'exit_intent', 'subscription_form', 'community_signup', 'print_order'];
    if (!validSources.includes(source)) {
      console.warn(`[email-capture] Unknown source: ${source}, using 'unknown'`);
    }

    // 尝试写入 Supabase
    let dbResult = { success: false, reason: 'no_attempt' };
    try {
      dbResult = await supabaseUpsert('email_subscribers', {
        email: email,
        source: source,
        context: context || '',
        subscribed_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        is_active: true,
      });
    } catch (dbError) {
      console.error('[email-capture] Supabase write failed:', dbError.message);
      dbResult = { success: false, reason: dbError.message };
    }

    console.log(`[email-capture] ${email} | source=${source} | db=${dbResult.success ? 'ok' : 'fallback'}`);

    return res.status(200).json({
      success: true,
      email: email,
      source: source,
      stored: dbResult.success,
      message: dbResult.success
        ? '订阅成功！'
        : '已记录（离线模式）',
    });

  } catch (err) {
    console.error('[email-capture] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: '服务器内部错误',
    });
  }
};
