/**
 * API Key Registration — CF Pages Function
 * Handles user registration and API key generation
 * Flow: email → generate key → store in KV → return key
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body = await request.json();
    const email = body.email;
    
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400, headers: corsHeaders
      });
    }
    
    // Generate API key
    const key = 'gtk_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Store in KV (if available) or return for manual setup
    if (env.API_KEYS) {
      await env.API_KEYS.put(key, JSON.stringify({
        email, plan: 'free', created: new Date().toISOString(),
        rate_limit: 30, calls_today: 0
      }), { expirationTtl: 0 });
    }
    
    return new Response(JSON.stringify({
      success: true,
      api_key: key,
      plan: 'free',
      rate_limit: '30 requests/hour',
      message: 'Save your API key. Use it as: Authorization: Bearer ' + key,
      upgrade_url: 'https://genetech.tools/credits'
    }), { headers: corsHeaders });
    
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: corsHeaders
    });
  }
}
