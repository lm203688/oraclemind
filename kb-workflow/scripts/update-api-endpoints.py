#!/usr/bin/env python3
"""
Update all 12 sites to use pages.dev API endpoints
- Update llms.txt with correct API URLs
- Update api-pricing page with working API endpoints
- Update api-key page with working registration
"""
import os, re, json

BASE = "/home/z/my-project"

SITES = [
    {"dir": "genetech-tools", "domain": "genetech.tools", "pages_dev": "genetech-tools.pages.dev", "name": "GeneTech Tools"},
    {"dir": "tcm-tools", "domain": "tcm.genetech.tools", "pages_dev": "tcm-tools.pages.dev", "name": "TCMDB"},
    {"dir": "agent-ecosystem", "domain": "agent.genetech.tools", "pages_dev": "agentecosystem.pages.dev", "name": "Agent Ecosystem DB"},
    {"dir": "robot-parts", "domain": "robot.genetech.tools", "pages_dev": "robotparts.pages.dev", "name": "RobotParts DB"},
    {"dir": "quantum-computing", "domain": "quantum.genetech.tools", "pages_dev": "quantumcomputing.pages.dev", "name": "QuantumDB"},
    {"dir": "brain-science", "domain": "brain.genetech.tools", "pages_dev": "brainscience.pages.dev", "name": "BrainDB"},
    {"dir": "nuclear-energy", "domain": "nuclear.genetech.tools", "pages_dev": "nuclearenergy.pages.dev", "name": "NuclearDB"},
    {"dir": "exo-science", "domain": "exo.genetech.tools", "pages_dev": "exoscience.pages.dev", "name": "ExoDB"},
    {"dir": "alien-minerals", "domain": "mineral.genetech.tools", "pages_dev": "alienminerals.pages.dev", "name": "MineralDB"},
    {"dir": "deep-sea-tech", "domain": "deepsea.genetech.tools", "pages_dev": "deepseatech.pages.dev", "name": "DeepSeaDB"},
    {"dir": "new-energy", "domain": "energy.genetech.tools", "pages_dev": "newenergy-nya.pages.dev", "name": "EnergyDB"},
    {"dir": "life-science", "domain": "life.genetech.tools", "pages_dev": "lifescience-epe.pages.dev", "name": "LifeDB"},
]

def update_api_key_page(site):
    """Update api-key.html with working registration form"""
    fpath = os.path.join(BASE, site["dir"], "website", "api-key.html")
    if not os.path.exists(fpath): return False
    
    html = open(fpath).read()
    
    # Replace formsubmit.co with /api/register endpoint
    api_base = f"https://{site['pages_dev']}"
    
    # Find and replace the form section
    new_form = f'''<div class="api-key-container">
<h2>Get Your Free API Key</h2>
<p>Register to get instant access to {site['name']} API</p>
<form id="registerForm">
  <input type="email" id="email" placeholder="Your email address" required>
  <button type="submit">Get API Key</button>
</form>
<div id="result" style="display:none;margin-top:20px;padding:15px;border-radius:8px;background:#f0fdf4;border:1px solid #22c55e">
  <h3>✅ Registration Successful!</h3>
  <p>Your API Key: <code id="apiKey" style="font-size:14px;word-break:break-all"></code></p>
  <p>API Base URL: <code>{api_base}/api/</code></p>
  <p>Usage: <code>curl -H "Authorization: Bearer YOUR_KEY" {api_base}/api/entities.json</code></p>
  <p><a href="https://{site['domain']}/credits">Upgrade to Pro for higher limits →</a></p>
</div>
<div id="error" style="display:none;margin-top:20px;padding:15px;border-radius:8px;background:#fef2f2;border:1px solid #ef4444"></div>
</div>
<script>
document.getElementById('registerForm').addEventListener('submit', async (e) => {{
  e.preventDefault();
  const email = document.getElementById('email').value;
  try {{
    const res = await fetch('{api_base}/api/register', {{
      method: 'POST',
      headers: {{'Content-Type': 'application/json'}},
      body: JSON.stringify({{email}})
    }});
    const data = await res.json();
    if (data.success) {{
      document.getElementById('result').style.display = 'block';
      document.getElementById('apiKey').textContent = data.api_key;
    }} else {{
      document.getElementById('error').style.display = 'block';
      document.getElementById('error').textContent = data.error || 'Registration failed';
    }}
  }} catch(err) {{
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').textContent = 'Network error: ' + err.message;
  }}
}});
</script>'''
    
    # Try to replace existing form area
    # Find the main content area and replace
    if 'formsubmit.co' in html or 'registerForm' not in html:
        # Replace the old formsubmit.co form
        html = re.sub(r'<form[^>]*action="[^"]*formsubmit[^"]*"[^>]*>.*?</form>', '', html, flags=re.DOTALL)
        # Add new form before closing body
        if 'registerForm' not in html:
            html = html.replace('</body>', new_form + '\n</body>')
    
    open(fpath, 'w').write(html)
    return True

def update_llms_txt(site):
    """Update llms.txt with correct API URLs"""
    fpath = os.path.join(BASE, site["dir"], "website", "llms.txt")
    if not os.path.exists(fpath): return False
    
    content = open(fpath).read()
    api_base = f"https://{site['pages_dev']}"
    
    # Replace any existing API URLs with pages.dev versions
    content = re.sub(r'https://[a-z.-]+genetech\.tools/api/', f'{api_base}/api/', content)
    
    # Add API note if not present
    if 'pages.dev' not in content:
        content += f"\n## API Access\n- Base URL: {api_base}/api/\n- Free tier: 30 req/hour (no key needed)\n- Pro tier: 500 req/day (API key required)\n- Register: POST {api_base}/api/register with {{\"email\":\"your@email.com\"}}\n"
    
    open(fpath, 'w').write(content)
    return True

def update_api_pricing(site):
    """Update api-pricing page with working API URLs"""
    fpath = os.path.join(BASE, site["dir"], "website", "api-pricing.html")
    if not os.path.exists(fpath): return False
    
    html = open(fpath).read()
    api_base = f"https://{site['pages_dev']}"
    
    # Replace API endpoint references
    html = re.sub(r'https://[a-z.-]+genetech\.tools/api/', f'{api_base}/api/', html)
    
    # Add note about API base URL if not present
    if 'pages.dev' not in html:
        html = html.replace('</body>', f'''
<div style="background:#fffbeb;border:1px solid #f59e0b;padding:1rem;margin:1rem auto;max-width:800px;border-radius:8px">
  <strong>📌 API Base URL:</strong> <code>{api_base}/api/</code>
  <br>Use this URL for all API calls. The main domain serves the web interface.
</div>
</body>''', 1)
    
    open(fpath, 'w').write(html)
    return True

# Process all sites
for site in SITES:
    print(f"--- {site['name']} ({site['dir']}) ---")
    r1 = update_api_key_page(site)
    r2 = update_llms_txt(site)
    r3 = update_api_pricing(site)
    print(f"  api-key.html: {'✅' if r1 else '⚠️'} | llms.txt: {'✅' if r2 else '⚠️'} | api-pricing.html: {'✅' if r3 else '⚠️'}")

print("\n✅ All sites updated!")
