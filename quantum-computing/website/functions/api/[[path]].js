/**
 * CF Pages Function: API Gateway
 * Serves /api/* JSON files from static assets, bypassing CF Bot Fight Mode
 * Uses env.ASSETS binding to read static files directly
 */

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = params.path || [];
  const pathStr = Array.isArray(path) ? path.join('/') : path;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Normalize the file path
  const requestedFile = pathStr.endsWith('.json') ? pathStr : pathStr + '.json';
  
  // Security: prevent directory traversal
  if (requestedFile.includes('..') || requestedFile.includes('//')) {
    return new Response(JSON.stringify({ error: 'Invalid path' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
  
  // Read static file via ASSETS binding (bypasses CF challenge)
  try {
    const assetUrl = new URL(`/api/${requestedFile}`, url.origin);
    const assetResponse = await env.ASSETS.fetch(assetUrl);
    
    if (assetResponse.ok) {
      const data = await assetResponse.text();
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-API-Tier': 'free',
          'X-Powered-By': 'GeneTech API Gateway',
          ...corsHeaders,
        }
      });
    } else {
      return new Response(JSON.stringify({
        error: 'Not Found',
        path: `/api/${requestedFile}`,
        status: assetResponse.status,
        hint: 'Available: entities.json, data.json, openapi.json, graph.json, geo-faqs.json'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  } catch(e) {
    return new Response(JSON.stringify({
      error: 'Internal error',
      message: e.message,
      path: `/api/${requestedFile}`,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
