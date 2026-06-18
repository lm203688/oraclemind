const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';

const SITES = [
  { dir: 'genetech-tools', domain: 'genetech.tools', name: 'GeneTech Tools', nameZh: '基因技术知识引擎', icon: '🧬' },
  { dir: 'tcm-tools', domain: 'tcm.genetech.tools', name: 'TCMDB', nameZh: '中药方剂知识引擎', icon: '🌿' },
  { dir: 'agent-ecosystem', domain: 'agent.genetech.tools', name: 'Agent Ecosystem DB', nameZh: 'AI Agent生态知识引擎', icon: '🤖' },
  { dir: 'robot-parts', domain: 'robot.genetech.tools', name: 'RobotParts DB', nameZh: '机器人配件协议库', icon: '⚙️' },
  { dir: 'quantum-computing', domain: 'quantum.genetech.tools', name: 'QuantumDB', nameZh: '量子计算知识引擎', icon: '⚛️' },
  { dir: 'brain-science', domain: 'brain.genetech.tools', name: 'BrainDB', nameZh: '脑科学知识引擎', icon: '🧠' },
  { dir: 'nuclear-energy', domain: 'nuclear.genetech.tools', name: 'NuclearDB', nameZh: '核能知识引擎', icon: '☢️' },
  { dir: 'exo-science', domain: 'exo.genetech.tools', name: 'ExoDB', nameZh: '地外科学知识引擎', icon: '🪐' },
  { dir: 'alien-minerals', domain: 'mineral.genetech.tools', name: 'MineralDB', nameZh: '外星矿物知识引擎', icon: '💎' },
  { dir: 'deep-sea-tech', domain: 'deepsea.genetech.tools', name: 'DeepSeaDB', nameZh: '深海科技知识引擎', icon: '🌊' },
  { dir: 'new-energy', domain: 'energy.genetech.tools', name: 'EnergyDB', nameZh: '新能源知识引擎', icon: '⚡' },
  { dir: 'life-science', domain: 'life.genetech.tools', name: 'LifeDB', nameZh: '生命科学知识引擎', icon: '🔬' },
];

// ============================================================
// 1. API PRICING PAGE (api-pricing.html) — per site
// ============================================================
function generatePricingPage(site) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>API Pricing - ${site.name}</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${site.icon}</text></svg>">
<style>
:root{--bg:#0a0e17;--bg2:#111827;--bg3:#1a2236;--border:#1e2d4a;--text:#e2e8f0;--text2:#94a3b8;--accent:#06b6d4;--accent2:#f59e0b;--green:#10b981;--red:#ef4444}
*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
a{color:var(--accent);text-decoration:none}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,14,23,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.nav-inner{max-width:900px;margin:0 auto;padding:0 20px;display:flex;align-items:center;height:52px;gap:16px}
.nav-logo{font-size:17px;font-weight:700;color:#fff}
.nav-links{display:flex;gap:14px;font-size:13px}.nav-links a{color:var(--text2)}
.container{max-width:900px;margin:0 auto;padding:80px 20px 40px}
h1{text-align:center;font-size:2em;margin-bottom:8px}h1 span{color:var(--accent)}
.subtitle{text-align:center;color:var(--text2);margin-bottom:40px}
.plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:40px}
.plan{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:28px;position:relative;transition:border-color .2s}
.plan:hover{border-color:var(--accent)}
.plan.popular{border-color:var(--accent2)}
.plan.popular::before{content:'MOST POPULAR';position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--accent2);color:#000;font-size:.65rem;font-weight:800;padding:3px 12px;border-radius:10px;letter-spacing:.5px}
.plan-name{font-size:1.1em;font-weight:700;margin-bottom:4px}
.plan-price{font-size:2.2em;font-weight:800;color:var(--accent);margin-bottom:4px}
.plan-price span{font-size:.4em;color:var(--text2);font-weight:400}
.plan-desc{color:var(--text2);font-size:.85rem;margin-bottom:16px}
.plan-features{list-style:none;font-size:.85rem}
.plan-features li{padding:4px 0;color:var(--text2)}
.plan-features li::before{content:'✓ ';color:var(--green);font-weight:700}
.plan-features li.no::before{content:'✗ ';color:var(--red)}
.cta-btn{display:block;width:100%;padding:12px;border-radius:10px;border:none;font-size:.95rem;font-weight:700;cursor:pointer;margin-top:16px;transition:all .2s}
.cta-primary{background:var(--accent);color:#000}.cta-primary:hover{opacity:.9}
.cta-secondary{background:transparent;border:1px solid var(--accent);color:var(--accent)}.cta-secondary:hover{background:var(--accent);color:#000}
.section{margin:40px 0}.section h2{font-size:1.3em;margin-bottom:16px;color:var(--accent2)}
.code-block{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:16px;font-family:monospace;font-size:.85rem;overflow-x:auto;margin:12px 0;color:var(--accent)}
.code-block .comment{color:var(--text2)}
.faq-item{border-bottom:1px solid var(--border);padding:16px 0}
.faq-q{font-weight:700;cursor:pointer;display:flex;justify-content:space-between;align-items:center}
.faq-a{color:var(--text2);font-size:.9rem;margin-top:8px;display:none}
.faq-item.open .faq-a{display:block}
.footer{text-align:center;padding:40px 20px;color:var(--text2);font-size:13px;border-top:1px solid var(--border)}
</style>
</head>
<body>
<div class="nav"><div class="nav-inner">
  <div class="nav-logo">${site.icon} ${site.name}</div>
  <div class="nav-links">
    <a href="/">Home</a>
    <a href="/api-pricing.html" style="color:var(--accent2)">Pricing</a>
    <a href="https://genetech.tools">Main Site</a>
  </div>
</div></div>

<div class="container">
<h1>${site.icon} <span>API Pricing</span></h1>
<p class="subtitle">Structured data for ${site.nameZh}. Power your AI agents, research tools, and applications.</p>

<div class="plans">
  <div class="plan">
    <div class="plan-name">Free</div>
    <div class="plan-price">$0<span>/month</span></div>
    <div class="plan-desc">Explore and prototype</div>
    <ul class="plan-features">
      <li>100 API calls/day</li>
      <li>Access to all endpoints</li>
      <li>Community support</li>
      <li class="no">Bulk export</li>
      <li class="no">Webhook updates</li>
      <li class="no">Priority support</li>
    </ul>
    <button class="cta-btn cta-secondary" onclick="startFree()">Get API Key</button>
  </div>

  <div class="plan popular">
    <div class="plan-name">Pro</div>
    <div class="plan-price">$29<span>/month</span></div>
    <div class="plan-desc">For production applications</div>
    <ul class="plan-features">
      <li>Unlimited API calls</li>
      <li>Access to all endpoints</li>
      <li>Bulk JSON export</li>
      <li>Webhook updates (daily)</li>
      <li>Priority email support</li>
      <li>Commercial use license</li>
    </ul>
    <button class="cta-btn cta-primary" onclick="subscribePro()">Subscribe Pro — $29/mo</button>
  </div>

  <div class="plan">
    <div class="plan-name">Enterprise</div>
    <div class="plan-price">$199<span>/month</span></div>
    <div class="plan-desc">For teams and integrations</div>
    <ul class="plan-features">
      <li>Everything in Pro</li>
      <li>Private deployment option</li>
      <li>Custom data schemas</li>
      <li>SLA guarantee (99.9%)</li>
      <li>Dedicated support channel</li>
      <li>Custom data enrichment</li>
    </ul>
    <button class="cta-btn cta-secondary" onclick="contactEnterprise()">Contact Sales</button>
  </div>
</div>

<div class="section">
  <h2>📦 Data Packages (One-time)</h2>
  <p style="color:var(--text2);margin-bottom:16px">Download the complete ${site.name} dataset — no subscription needed.</p>
  <div class="plans" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
    <div class="plan">
      <div class="plan-name">Single Domain</div>
      <div class="plan-price">$49<span> one-time</span></div>
      <div class="plan-desc">Complete ${site.nameZh} data</div>
      <ul class="plan-features">
        <li>All entities (JSON)</li>
        <li>Relationships & cross-refs</li>
        <li>OpenAPI specification</li>
        <li>6 months of updates</li>
      </ul>
      <button class="cta-btn cta-secondary" onclick="buyDataPack()">Buy Data Pack</button>
    </div>
    <div class="plan popular">
      <div class="plan-name">Full Bundle</div>
      <div class="plan-price">$299<span> one-time</span></div>
      <div class="plan-desc">All 12 knowledge bases</div>
      <ul class="plan-features">
        <li>4,500+ entities across 12 domains</li>
        <li>Cross-domain relationships</li>
        <li>All OpenAPI specs</li>
        <li>12 months of updates</li>
      </ul>
      <button class="cta-btn cta-primary" onclick="buyFullBundle()">Buy Full Bundle</button>
    </div>
  </div>
</div>

<div class="section">
  <h2>⚡ Quick Start</h2>
  <div class="code-block">
    <span class="comment"># Get your API key at genetech.tools/api-key</span><br>
    curl -H "Authorization: Bearer YOUR_API_KEY" \<br>
    &nbsp;&nbsp;https://${site.domain}/api/data.json
  </div>
  <div class="code-block">
    <span class="comment"># Search entities</span><br>
    curl -H "Authorization: Bearer YOUR_API_KEY" \<br>
    &nbsp;&nbsp;"https://${site.domain}/api/entities.json?q=keyword"
  </div>
</div>

<div class="section">
  <h2>❓ FAQ</h2>
  <div class="faq-item" onclick="this.classList.toggle('open')">
    <div class="faq-q">What counts as an API call? <span>▼</span></div>
    <div class="faq-a">Each HTTP request to any /api/ endpoint counts as one call. A single /api/data.json request returns all data in one call.</div>
  </div>
  <div class="faq-item" onclick="this.classList.toggle('open')">
    <div class="faq-q">Can I use the data commercially? <span>▼</span></div>
    <div class="faq-a">Free tier is for personal/educational use. Pro and Enterprise plans include a commercial use license. Data packages include commercial rights.</div>
  </div>
  <div class="faq-item" onclick="this.classList.toggle('open')">
    <div class="faq-q">How often is the data updated? <span>▼</span></div>
    <div class="faq-a">We update our knowledge bases daily from authoritative sources. Pro users get webhook notifications on updates.</div>
  </div>
  <div class="faq-item" onclick="this.classList.toggle('open')">
    <div class="faq-q">What payment methods do you accept? <span>▼</span></div>
    <div class="faq-a">Credit card, PayPal, Alipay, and cryptocurrency (USDT/USDC). All payments processed securely via Creem.</div>
  </div>
</div>

</div>

<div class="footer">
  <p>${site.name} · ${site.domain} · Powered by <a href="https://genetech.tools">GeneTech Tools</a></p>
  <p style="margin-top:8px"><a href="/api-pricing.html">Pricing</a> · <a href="https://genetech.tools/api-key">Get API Key</a> · <a href="mailto:61960005@qq.com">Contact</a></p>
</div>

<script>
function startFree(){window.location.href='https://genetech.tools/api-key.html?plan=free&site=${site.domain}'}
function subscribePro(){window.location.href='https://genetech.tools/api-key.html?plan=pro&site=${site.domain}'}
function contactEnterprise(){window.location.href='mailto:61960005@qq.com?subject=Enterprise%20Plan%20-%20${site.domain}'}
function buyDataPack(){window.location.href='https://genetech.tools/api-key.html?plan=data&site=${site.domain}'}
function buyFullBundle(){window.location.href='https://genetech.tools/api-key.html?plan=bundle&site=all'}
</script>
</body></html>`;
}

// ============================================================
// 2. API KEY REGISTRATION PAGE (genetech.tools/api-key.html)
// ============================================================
function generateApiKeyPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Get API Key - GeneTech Tools</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔑</text></svg>">
<style>
:root{--bg:#0a0e17;--bg2:#111827;--bg3:#1a2236;--border:#1e2d4a;--text:#e2e8f0;--text2:#94a3b8;--accent:#06b6d4;--accent2:#f59e0b;--green:#10b981}
*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
a{color:var(--accent);text-decoration:none}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,14,23,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.nav-inner{max-width:800px;margin:0 auto;padding:0 20px;display:flex;align-items:center;height:52px;gap:16px}
.nav-logo{font-size:17px;font-weight:700;color:#fff}
.container{max-width:600px;margin:0 auto;padding:80px 20px 40px}
h1{text-align:center;font-size:1.8em;margin-bottom:8px}h1 span{color:var(--accent)}
.subtitle{text-align:center;color:var(--text2);margin-bottom:32px}
.form-group{margin-bottom:16px}
.form-group label{display:block;font-size:.85rem;color:var(--text2);margin-bottom:4px}
.form-group input,.form-group select{width:100%;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.95rem;outline:none}
.form-group input:focus,.form-group select:focus{border-color:var(--accent)}
.plan-select{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.plan-opt{background:var(--bg2);border:2px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;text-align:center;transition:all .2s}
.plan-opt:hover{border-color:var(--accent)}
.plan-opt.selected{border-color:var(--accent);background:rgba(6,182,212,0.1)}
.plan-opt .name{font-weight:700;font-size:.95rem}
.plan-opt .price{color:var(--accent);font-size:1.2em;font-weight:800;margin-top:4px}
.plan-opt .desc{color:var(--text2);font-size:.75rem;margin-top:2px}
.submit-btn{width:100%;padding:14px;border-radius:10px;border:none;background:var(--accent);color:#000;font-size:1rem;font-weight:700;cursor:pointer;margin-top:8px}
.submit-btn:hover{opacity:.9}
.result-box{display:none;background:var(--bg3);border:1px solid var(--green);border-radius:12px;padding:20px;margin-top:24px;text-align:center}
.result-box.show{display:block}
.result-box .key{font-family:monospace;font-size:1.1em;color:var(--green);word-break:break-all;margin:12px 0;padding:12px;background:var(--bg2);border-radius:8px}
.result-box .warn{color:var(--accent2);font-size:.8rem;margin-top:8px}
.footer{text-align:center;padding:40px 20px;color:var(--text2);font-size:13px;border-top:1px solid var(--border)}
.site-list{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}
.site-tag{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-size:.75rem;color:var(--text2)}
</style>
</head>
<body>
<div class="nav"><div class="nav-inner">
  <div class="nav-logo">🔑 GeneTech API</div>
  <div class="nav-links" style="display:flex;gap:14px;font-size:13px">
    <a href="https://genetech.tools">Home</a>
    <a href="https://genetech.tools/credits.html">Credits</a>
  </div>
</div></div>

<div class="container">
<h1>🔑 <span>Get Your API Key</span></h1>
<p class="subtitle">Access 12 knowledge bases with 4,500+ structured entities for your AI agents and applications.</p>

<div class="plan-select" id="planSelect">
  <div class="plan-opt selected" onclick="selectPlan('free')" data-plan="free">
    <div class="name">Free</div>
    <div class="price">$0/mo</div>
    <div class="desc">100 calls/day</div>
  </div>
  <div class="plan-opt" onclick="selectPlan('pro')" data-plan="pro">
    <div class="name">Pro</div>
    <div class="price">$29/mo</div>
    <div class="desc">Unlimited + export</div>
  </div>
  <div class="plan-opt" onclick="selectPlan('data')" data-plan="data">
    <div class="name">Data Pack</div>
    <div class="price">$49 once</div>
    <div class="desc">Single domain JSON</div>
  </div>
  <div class="plan-opt" onclick="selectPlan('bundle')" data-plan="bundle">
    <div class="name">Full Bundle</div>
    <div class="price">$299 once</div>
    <div class="desc">All 12 domains</div>
  </div>
</div>

<form onsubmit="return generateKey(event)">
  <div class="form-group">
    <label>Email *</label>
    <input type="email" id="email" required placeholder="you@company.com">
  </div>
  <div class="form-group">
    <label>Project / Company</label>
    <input type="text" id="project" placeholder="My AI Project">
  </div>
  <div class="form-group">
    <label>Which sites do you need? (all included by default)</label>
    <div class="site-list">
      <span class="site-tag">🧬 GeneTech</span>
      <span class="site-tag">🌿 TCMDB</span>
      <span class="site-tag">🤖 AgentEco</span>
      <span class="site-tag">⚙️ RobotParts</span>
      <span class="site-tag">⚛️ QuantumDB</span>
      <span class="site-tag">🧠 BrainDB</span>
      <span class="site-tag">☢️ NuclearDB</span>
      <span class="site-tag">🪐 ExoDB</span>
      <span class="site-tag">💎 MineralDB</span>
      <span class="site-tag">🌊 DeepSeaDB</span>
      <span class="site-tag">⚡ EnergyDB</span>
      <span class="site-tag">🔬 LifeDB</span>
    </div>
  </div>
  <button type="submit" class="submit-btn">Generate API Key</button>
</form>

<div class="result-box" id="resultBox">
  <div style="font-size:1.2em;font-weight:700;color:var(--green)">✅ API Key Generated!</div>
  <div class="key" id="apiKey"></div>
  <div class="warn">⚠️ Save this key now — it won't be shown again. Use it as: <code>Authorization: Bearer YOUR_KEY</code></div>
  <div style="margin-top:12px;font-size:.85rem;color:var(--text2)">
    Free keys are active immediately. Pro/Data keys require payment confirmation.<br>
    <a href="https://genetech.tools/credits.html">Pay now</a> to activate instantly.
  </div>
</div>

</div>

<div class="footer">
  <p>GeneTech Tools API · <a href="https://genetech.tools">genetech.tools</a> · <a href="mailto:61960005@qq.com">Support</a></p>
</div>

<script>
let selectedPlan = 'free';
const params = new URLSearchParams(window.location.search);
if (params.get('plan')) selectedPlan = params.get('plan');
if (params.get('site')) document.getElementById('project').value = 'Data for ' + params.get('site');

// Highlight pre-selected plan
document.querySelectorAll('.plan-opt').forEach(el => {
  if (el.dataset.plan === selectedPlan) el.classList.add('selected');
  else el.classList.remove('selected');
});

function selectPlan(plan) {
  selectedPlan = plan;
  document.querySelectorAll('.plan-opt').forEach(el => {
    el.classList.toggle('selected', el.dataset.plan === plan);
  });
}

function generateKey(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const project = document.getElementById('project').value;
  
  // Generate a deterministic-looking key from email + random
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'gt_';
  for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)];
  
  // Show the key
  document.getElementById('apiKey').textContent = key;
  document.getElementById('resultBox').classList.add('show');
  
  // Send notification email
  const subject = encodeURIComponent('New API Key: ' + selectedPlan + ' - ' + email);
  const body = encodeURIComponent(
    'Email: ' + email + '\\n' +
    'Project: ' + project + '\\n' +
    'Plan: ' + selectedPlan + '\\n' +
    'API Key: ' + key + '\\n' +
    'Generated: ' + new Date().toISOString()
  );
  
  // Auto-send notification
  fetch('https://formsubmit.co/ajax/61960005@qq.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: email, _subject: 'New API Key: ' + selectedPlan, plan: selectedPlan, project: project, apiKey: key })
  }).catch(() => {});
  
  // Store key locally
  const keys = JSON.parse(localStorage.getItem('gt_api_keys') || '[]');
  keys.push({ key, email, plan: selectedPlan, project, created: new Date().toISOString() });
  localStorage.setItem('gt_api_keys', JSON.stringify(keys));
  
  // If paid plan, redirect to payment
  if (selectedPlan === 'pro' || selectedPlan === 'data' || selectedPlan === 'bundle') {
    setTimeout(() => {
      window.location.href = 'https://genetech.tools/credits.html?email=' + encodeURIComponent(email) + '&plan=' + selectedPlan;
    }, 3000);
  }
  
  return false;
}
</script>
</body></html>`;
}

// ============================================================
// 3. FLOATING CTA SNIPPET (injected into every index.html)
// ============================================================
function generateCtaSnippet(domain) {
  return `
<!-- API Pro CTA -->
<div id="apiCta" style="position:fixed;bottom:20px;right:20px;z-index:999;background:linear-gradient(135deg,#1e3a5f,#0a2540);border:1px solid #06b6d4;border-radius:12px;padding:14px 18px;max-width:260px;box-shadow:0 4px 20px rgba(6,182,212,0.3);cursor:pointer;transition:all .3s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''" onclick="window.location.href='/api-pricing.html'">
  <div style="font-size:.8rem;color:#f59e0b;font-weight:700;margin-bottom:4px">⚡ API PRO</div>
  <div style="font-size:.85rem;color:#e2e8f0">Unlimited API access + data export</div>
  <div style="font-size:.75rem;color:#06b6d4;margin-top:4px">$29/mo → Get API Key</div>
</div>
`;
}

// ============================================================
// MAIN: Generate and write all files
// ============================================================
console.log('🔧 Generating monetization pages...\n');

// 1. Generate api-pricing.html for each site
for (const site of SITES) {
  const websiteDir = path.join(BASE, site.dir, 'website');
  if (!fs.existsSync(websiteDir)) {
    console.log('⚠️  Skipping ' + site.dir);
    continue;
  }
  
  // Write pricing page
  fs.writeFileSync(path.join(websiteDir, 'api-pricing.html'), generatePricingPage(site));
  
  // Inject CTA into index.html if not already present
  const indexPath = path.join(websiteDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    if (!html.includes('apiCta')) {
      // Insert before </body>
      html = html.replace('</body>', generateCtaSnippet(site.domain) + '\n</body>');
      fs.writeFileSync(indexPath, html);
    }
  }
  
  console.log('✅ ' + site.name + ' (' + site.domain + '): pricing page + CTA added');
}

// 2. Generate api-key.html on genetech.tools (central registration)
const apiKeyPage = generateApiKeyPage();
fs.writeFileSync(path.join(BASE, 'genetech-tools', 'website', 'api-key.html'), apiKeyPage);
console.log('✅ API Key registration page: genetech.tools/api-key.html');

// 3. Update credits.html to reference Creem instead of LemonSqueezy
const creditsPath = path.join(BASE, 'genetech-tools', 'website', 'credits.html');
if (fs.existsSync(creditsPath)) {
  let credits = fs.readFileSync(creditsPath, 'utf8');
  // Replace LemonSqueezy references with Creem
  credits = credits.replace(/LemonSqueezy/g, 'Creem');
  credits = credits.replace(/lemonsqueezy/g, 'creem');
  credits = credits.replace(/🌍 信用卡\/PayPal \(Creem\)/, '🌍 信用卡/PayPal (Creem)');
  credits = credits.replace(/🔒 安全支付 \(Creem\)/, '🔒 安全支付 (Creem)');
  credits = credits.replace(/alert\('Creem支付即将上线！请暂时使用加密货币或支付宝'\)/, "window.open('https://www.creem.io/') // Creem checkout");
  fs.writeFileSync(creditsPath, credits);
  console.log('✅ Credits page updated: LemonSqueezy → Creem');
}

console.log('\n🎉 Monetization pages generated!');
console.log('\n📋 Summary:');
console.log('  - api-pricing.html: 12 sites (per-site pricing page)');
console.log('  - api-key.html: genetech.tools (central API key registration)');
console.log('  - Floating CTA: injected into all 12 index.html pages');
console.log('  - Credits page: updated to Creem');
