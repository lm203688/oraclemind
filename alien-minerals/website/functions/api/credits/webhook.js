/**
 * Creem Webhook Handler
 * Receives payment events and credits user accounts
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    
    // Log the webhook event
    console.log('Creem webhook:', body.event);
    
    if (body.event === 'payment.completed' || body.event === 'license.activated') {
      const email = body.data?.customer?.email || '';
      const licenseKey = body.data?.license_key || '';
      const productId = body.data?.product?.id || '';
      const amount = body.data?.amount || 0;
      
      // Credit mapping
      let credits = 0;
      if (amount >= 99) credits = 9999;
      else if (amount >= 49) credits = 990;
      else if (amount >= 29) credits = 500;
      else credits = 100;
      
      // Store credit record
      if (env.USER_CREDITS && licenseKey) {
        const userKey = `gtk_${licenseKey.slice(0, 16)}`;
        const existing = await env.USER_CREDITS.get(userKey);
        const user = existing ? JSON.parse(existing) : { email, credits: 0, plan: 'pro' };
        user.credits = (user.credits || 0) + credits;
        user.email = email;
        user.plan = 'pro';
        await env.USER_CREDITS.put(userKey, JSON.stringify(user));
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: true, ignored: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
