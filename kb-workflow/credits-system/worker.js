/**
 * GeneTech Credits System - Cloudflare Worker v2
 */

const CREDITS_PER_DOLLAR = 100;
const CREDITS_PER_CNY = 14;

async function getCredits(kv, email) {
  const data = await kv.get(`user:${email.toLowerCase()}`, 'json');
  return data || { credits: 0, plan: 'free', expires: null, history: [] };
}

async function addCredits(kv, email, amount, reason, txId) {
  const data = await getCredits(kv, email);
  data.credits += amount;
  if (!data.history) data.history = [];
  data.history.push({ type: 'credit', amount, reason, txId, time: new Date().toISOString() });
  if (data.history.length > 100) data.history = data.history.slice(-100);
  await kv.put(`user:${email.toLowerCase()}`, JSON.stringify(data));
  return data;
}

async function deductCredits(kv, email, amount, reason) {
  const data = await getCredits(kv, email);
  if (data.credits < amount) return { success: false, error: 'Insufficient credits', balance: data.credits };
  data.credits -= amount;
  if (!data.history) data.history = [];
  data.history.push({ type: 'debit', amount, reason, time: new Date().toISOString() });
  if (data.history.length > 100) data.history = data.history.slice(-100);
  await kv.put(`user:${email.toLowerCase()}`, JSON.stringify(data));
  return { success: true, balance: data.credits };
}

function checkAdmin(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const secret = env.ADMIN_SECRET || 'gt-admin-2026-secure';
  return auth === `Bearer ${secret}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const kv = env.CREDITS_KV;
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
    }
    
    try {
      // Health
      if (path === '/health') return new Response(JSON.stringify({ status: 'ok', version: '2.0.0' }), { headers });
      
      // Webhook: Alipay (admin)
      if (path === '/webhook/alipay' && request.method === 'POST') {
        if (!checkAdmin(request, env)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
        const { email, amount_cny, tx_id } = await request.json();
        const credits = Math.floor(amount_cny * CREDITS_PER_CNY);
        const result = await addCredits(kv, email, credits, `Alipay: ¥${amount_cny}`, tx_id);
        return new Response(JSON.stringify({ processed: true, credits: result.credits }), { headers });
      }
      
      // Webhook: LemonSqueezy
      if (path === '/webhook/lemonsqueezy' && request.method === 'POST') {
        const payload = await request.text();
        const event = JSON.parse(payload);
        const data = event.data?.attributes || {};
        if (data.status === 'paid') {
          const email = data.user_email;
          const total = data.total || 0;
          const credits = Math.floor(total / 100 * CREDITS_PER_DOLLAR);
          const result = await addCredits(kv, email, credits, `LemonSqueezy: ${data.order_number || 'order'}`, data.order_number);
          return new Response(JSON.stringify({ processed: true, credits: result.credits }), { headers });
        }
        return new Response(JSON.stringify({ processed: false }), { headers });
      }
      
      // Webhook: Bekena (crypto)
      if (path === '/webhook/bekena' && request.method === 'POST') {
        const event = await request.json();
        if (event.status === 'confirmed') {
          const email = event.metadata?.email || event.custom_data?.email;
          const amount = parseFloat(event.amount) || 0;
          const credits = Math.floor(amount * CREDITS_PER_DOLLAR);
          const result = await addCredits(kv, email, credits, `Crypto: ${amount} ${event.currency || 'USDT'}`, event.payment_id);
          return new Response(JSON.stringify({ processed: true, credits: result.credits }), { headers });
        }
        return new Response(JSON.stringify({ processed: false }), { headers });
      }
      
      // Get credits balance
      if (path.startsWith('/api/credits/') && request.method === 'GET') {
        const email = decodeURIComponent(path.split('/api/credits/')[1]);
        const data = await getCredits(kv, email);
        return new Response(JSON.stringify({ email, credits: data.credits, plan: data.plan, expires: data.expires, recent_transactions: (data.history || []).slice(-10) }), { headers });
      }
      
      // Deduct credits
      if (path === '/api/credits/deduct' && request.method === 'POST') {
        const { email, amount, reason } = await request.json();
        const result = await deductCredits(kv, email, amount, reason);
        return new Response(JSON.stringify(result), { headers });
      }
      
      // Gift credits (admin)
      if (path === '/api/credits/gift' && request.method === 'POST') {
        if (!checkAdmin(request, env)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
        const { email, amount, reason } = await request.json();
        const result = await addCredits(kv, email, amount, reason || 'Admin gift', 'admin');
        return new Response(JSON.stringify({ processed: true, credits: result.credits }), { headers });
      }
      
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }
};
