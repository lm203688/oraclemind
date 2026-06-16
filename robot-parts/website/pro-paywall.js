/**
 * Frontier Knowledge Base — Pro Paywall
 * Validates Creem license keys and gates premium content
 * 
 * Usage: Include this script on any page that needs paywall
 * Add class "pro-content" to elements that should be gated
 * Add class "pro-blur" to elements that should be blurred
 * Add data-pro-preview="true" to show a preview snippet
 */

(function() {
  'use strict';
  
  const PRO_STORAGE_KEY = 'fkb_pro_auth';
  const PRO_PRODUCTS = [
    'prod_22YhSbYonX9hiC0OppnXTn',  // Daily Brief $19/mo
    'prod_4EpFVQGKm5vWXChbRiFdbE',  // Intelligence Pro $49/mo
    'prod_pny43rzDa0mmBaj7d9k4w',   // API Access $29/mo
    'prod_5IooNCEQoCyqp758oeVPGT',  // Lifetime $99
    'prod_5OFcAcJeXzfTMkDDt6woBh',  // Full DB $999
    'prod_44o1TOBce0Zt00X4E5ACET'   // Single Domain $49
  ];
  
  // Check if user is Pro
  function getProAuth() {
    try {
      const stored = localStorage.getItem(PRO_STORAGE_KEY);
      if (!stored) return null;
      const auth = JSON.parse(stored);
      // Check if auth is still valid (24h cache)
      if (Date.now() - auth.verified_at > 86400000) {
        localStorage.removeItem(PRO_STORAGE_KEY);
        return null;
      }
      return auth;
    } catch(e) {
      return null;
    }
  }
  
  function setProAuth(key, product_id) {
    const auth = { key, product_id, verified_at: Date.now() };
    localStorage.setItem(PRO_STORAGE_KEY, JSON.stringify(auth));
    return auth;
  }
  
  function isPro() {
    return getProAuth() !== null;
  }
  
  // Validate license key via server-side API (Cloudflare Pages Function)
  async function validateKey(key) {
    try {
      // Use our server-side validation endpoint (API key stays server-side)
      const resp = await fetch(`/api/validate?key=${encodeURIComponent(key)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.valid && data.is_pro) {
          setProAuth(key, data.product_id);
          return { valid: true, product_id: data.product_id, product_name: data.product_name };
        } else if (data.valid && !data.is_pro) {
          return { valid: false, error: 'This license does not include Pro access' };
        }
        return { valid: false, error: data.error || 'Invalid license key' };
      }
      return { valid: false, error: 'Validation service unavailable' };
    } catch(e) {
      return { valid: false, error: 'Network error — please try again' };
    }
  }
  
  // Apply paywall to page
  function applyPaywall() {
    if (isPro()) {
      // User is Pro - show everything
      document.querySelectorAll('.pro-content').forEach(el => {
        el.style.display = '';
        el.style.filter = '';
      });
      document.querySelectorAll('.pro-blur').forEach(el => {
        el.style.filter = '';
        el.style.pointerEvents = '';
      });
      document.querySelectorAll('.pro-lock').forEach(el => {
        el.style.display = 'none';
      });
      // Add Pro badge
      document.querySelectorAll('.pro-badge-slot').forEach(el => {
        el.innerHTML = '<span style="background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">PRO</span>';
      });
    } else {
      // User is Free - gate premium content
      document.querySelectorAll('.pro-content').forEach(el => {
        if (el.dataset.proPreview === 'true') {
          // Show preview but blur
          el.style.filter = 'blur(5px)';
          el.style.pointerEvents = 'none';
          el.style.userSelect = 'none';
        } else {
          el.style.display = 'none';
        }
      });
      document.querySelectorAll('.pro-blur').forEach(el => {
        el.style.filter = 'blur(5px)';
        el.style.pointerEvents = 'none';
        el.style.userSelect = 'none';
      });
      document.querySelectorAll('.pro-badge-slot').forEach(el => {
        el.innerHTML = '<span style="background:rgba(245,158,11,0.2);color:#f59e0b;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">🔒 PRO</span>';
      });
    }
  }
  
  // Create paywall modal
  function createModal() {
    if (document.getElementById('pro-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'pro-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:10000;background:rgba(0,0,0,0.7);display:none;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
    
    modal.innerHTML = `
      <div style="background:#111827;border:1px solid #1e2d4a;border-radius:16px;padding:32px;max-width:440px;width:90%;position:relative">
        <button onclick="document.getElementById('pro-modal').style.display='none'" style="position:absolute;top:12px;right:16px;background:none;border:none;color:#64748b;font-size:20px;cursor:pointer">✕</button>
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:2rem;margin-bottom:8px">🔓</div>
          <h3 style="color:#e2e8f0;font-size:1.2rem;margin-bottom:4px">Unlock Pro Content</h3>
          <p style="color:#94a3b8;font-size:.85rem">Enter your license key or upgrade to access</p>
        </div>
        <div style="margin-bottom:16px">
          <label style="color:#94a3b8;font-size:.8rem;display:block;margin-bottom:6px">License Key</label>
          <input id="pro-key-input" type="text" placeholder="Enter your license key..." 
            style="width:100%;padding:10px 14px;background:#0a0e17;border:1px solid #1e2d4a;border-radius:8px;color:#e2e8f0;font-size:.9rem;outline:none">
          <div id="pro-key-error" style="color:#ef4444;font-size:.8rem;margin-top:4px;display:none"></div>
        </div>
        <button id="pro-activate-btn" onclick="window.__fkbPro.activate()" 
          style="width:100%;padding:12px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:700;cursor:pointer;margin-bottom:12px">
          Activate
        </button>
        <div style="text-align:center;color:#64748b;font-size:.8rem;margin-bottom:12px">— or —</div>
        <a href="https://genetech.tools/credits.html" target="_blank"
          style="display:block;width:100%;padding:12px;background:rgba(245,158,11,0.15);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);border-radius:8px;font-size:.9rem;font-weight:600;text-align:center;text-decoration:none;cursor:pointer">
          💎 Upgrade to Pro — from $19/mo
        </a>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  // Show paywall modal
  function showPaywall() {
    createModal();
    document.getElementById('pro-modal').style.display = 'flex';
    document.getElementById('pro-key-input').focus();
  }
  
  // Activate with key
  async function activate() {
    const input = document.getElementById('pro-key-input');
    const errorDiv = document.getElementById('pro-key-error');
    const btn = document.getElementById('pro-activate-btn');
    const key = input.value.trim();
    
    if (!key) {
      errorDiv.textContent = 'Please enter a license key';
      errorDiv.style.display = 'block';
      return;
    }
    
    btn.textContent = 'Validating...';
    btn.disabled = true;
    
    const result = await validateKey(key);
    
    if (result.valid) {
      document.getElementById('pro-modal').style.display = 'none';
      applyPaywall();
      // Show success toast
      showToast('✅ Pro activated! Enjoy full access.');
    } else {
      errorDiv.textContent = 'Invalid license key. Please check and try again.';
      errorDiv.style.display = 'block';
      btn.textContent = 'Activate';
      btn.disabled = false;
    }
  }
  
  // Toast notification
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111827;border:1px solid #06b6d4;color:#e2e8f0;padding:12px 24px;border-radius:8px;font-size:.9rem;z-index:10001;animation:fadeInUp .3s ease';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
  
  // Expose global API
  window.__fkbPro = {
    isPro,
    showPaywall,
    activate,
    applyPaywall,
    getProAuth,
    logout() {
      localStorage.removeItem(PRO_STORAGE_KEY);
      applyPaywall();
      showToast('Logged out of Pro');
    }
  };
  
  // Auto-apply paywall on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { applyPaywall(); createModal(); });
  } else {
    applyPaywall();
    createModal();
  }
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = '@keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
  document.head.appendChild(style);
})();
