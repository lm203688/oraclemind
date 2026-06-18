/**
 * Add anti-scraping measures to all KB sites
 * - JavaScript anti-debugging
 * - Honeypot links (invisible to humans, visible to bots)
 * - CSS text selection protection
 * - Right-click protection
 * - Canvas fingerprinting for bot detection
 * - Dynamic content loading (makes scraping harder)
 */

const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';

const SITES = [
  'genetech-tools', 'tcm-tools', 'agent-ecosystem', 'robot-parts',
  'quantum-computing', 'brain-science', 'nuclear-energy', 'exo-science',
  'alien-minerals', 'deep-sea-tech', 'new-energy', 'life-science'
];

const ANTI_SCRAPE_CSS = `
/* Anti-scraping CSS */
.detail-val, .entity-desc {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.detail-val::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
/* Honeypot - invisible to humans */
.honey-link {
  display: none !important;
  position: absolute;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
  overflow: hidden;
}
`;

const ANTI_SCRAPE_JS = `
// Anti-scraping JavaScript
(function(){
  // 1. Anti-debugging
  const d=new Date();debugger;
  setInterval(function(){debugger;},3000);
  
  // 2. Detect DevTools
  let devtoolsOpen=false;
  const threshold=160;
  const check=()=>{
    const widthThreshold=window.outerWidth-window.innerWidth>threshold;
    const heightThreshold=window.outerHeight-window.innerHeight>threshold;
    if(widthThreshold||heightThreshold){
      if(!devtoolsOpen){
        devtoolsOpen=true;
        document.body.innerHTML='<h1 style="text-align:center;margin-top:40vh">Access Denied</h1>';
      }
    }else{devtoolsOpen=false;}
  };
  setInterval(check,1000);
  
  // 3. Honeypot link monitoring
  document.querySelectorAll('.honey-link a').forEach(a=>{
    a.addEventListener('click',function(e){
      e.preventDefault();
      // Bot detected - redirect to honeypot
      window.location.href='/api/honeypot.json';
    });
  });
  
  // 4. Right-click protection on entity content
  document.querySelectorAll('.detail-val, .entity-desc').forEach(el=>{
    el.addEventListener('contextmenu',e=>e.preventDefault());
    el.addEventListener('copy',e=>{
      e.preventDefault();
      e.clipboardData.setData('text/plain','Content protected. Visit '+window.location.href);
    });
  });
  
  // 5. Canvas fingerprint for bot detection
  try{
    const canvas=document.createElement('canvas');
    const ctx=canvas.getContext('2d');
    ctx.textBaseline='top';
    ctx.font='14px Arial';
    ctx.fillText('🤖',2,2);
    const fp=canvas.toDataURL().slice(-50);
    if(!fp||fp.length<10){
      // Likely headless browser
      document.body.style.display='none';
    }
  }catch(e){}
  
  // 6. Mouse movement tracking (bots don't move mouse)
  let mouseMoved=false;
  document.addEventListener('mousemove',()=>{mouseMoved=true;},{once:true});
  setTimeout(()=>{
    if(!mouseMoved && !window._botChecked){
      window._botChecked=true;
      // No mouse movement in 5 seconds - might be a bot
      // Add a hidden verification challenge
      const verify=document.createElement('div');
      verify.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;cursor:pointer';
      verify.textContent='Click to continue';
      verify.onclick=()=>{verify.remove();};
      document.body.appendChild(verify);
    }
  },5000);
  
  // 7. Disable keyboard shortcuts for copying
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&(e.key==='c'||e.key==='u'||e.key==='s'||e.key==='a')){
      if(e.target.closest('.detail-val,.entity-desc')){
        e.preventDefault();
      }
    }
  });
})();
`;

function addAntiScrapingToHTML(html, domain) {
  // Add CSS before </style>
  if (html.includes('</style>')) {
    html = html.replace('</style>', ANTI_SCRAPE_CSS + '\n</style>');
  }
  
  // Add honeypot links before </body>
  const honeypot = `
<!-- Honeypot - invisible to real users, traps bots -->
<div class="honey-link">
  <a href="/api/honeypot.json">Download all data</a>
  <a href="/api/export.json">Export database</a>
  <a href="/admin/">Admin panel</a>
  <a href="/backup/">Backup</a>
</div>
`;
  
  // Add JS before </body>
  const jsBlock = `<script>${ANTI_SCRAPE_JS}</script>\n`;
  
  if (html.includes('</body>')) {
    html = html.replace('</body>', honeypot + jsBlock + '</body>');
  } else {
    html += honeypot + jsBlock;
  }
  
  return html;
}

// Process all sites
let totalFiles = 0;

for (const site of SITES) {
  const websiteDir = path.join(BASE, site, 'website');
  if (!fs.existsSync(websiteDir)) continue;
  
  let siteFiles = 0;
  
  // Process index.html
  const indexPath = path.join(websiteDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    if (!html.includes('honey-link')) {
      html = addAntiScrapingToHTML(html, site);
      fs.writeFileSync(indexPath, html);
      siteFiles++;
    }
  }
  
  // Process all entity pages
  const entityDir = path.join(websiteDir, 'entity');
  if (fs.existsSync(entityDir)) {
    const files = fs.readdirSync(entityDir).filter(f => f.endsWith('.html'));
    for (const file of files) {
      const filePath = path.join(entityDir, file);
      let html = fs.readFileSync(filePath, 'utf8');
      if (!html.includes('honey-link')) {
        html = addAntiScrapingToHTML(html, site);
        fs.writeFileSync(filePath, html);
        siteFiles++;
      }
    }
  }
  
  // Create honeypot API endpoint
  const apiDir = path.join(websiteDir, 'api');
  fs.mkdirSync(apiDir, { recursive: true });
  fs.writeFileSync(path.join(apiDir, 'honeypot.json'), JSON.stringify({
    error: "Access denied",
    message: "This endpoint is monitored. Unauthorized access has been logged.",
    timestamp: new Date().toISOString()
  }));
  
  totalFiles += siteFiles;
  console.log(`✅ ${site}: ${siteFiles} files protected`);
}

console.log(`\n🛡️ Total: ${totalFiles} files with anti-scraping measures`);
