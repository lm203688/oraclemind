/* Anti-Scraping Protection v2.0 — GeneTech Knowledge Base */
(function(){
  // 1. Disable right-click context menu
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); return false; });

  // 2. Disable text selection on data elements
  var style = document.createElement('style');
  style.textContent = `
    .detail-val,.entity-desc,.entity-card,.data-row,.kb-content,.search-result,
    .entity-name,.entity-detail,.prop-value,.stat-val,.card-body{user-select:none;-webkit-user-select:none}
    .detail-val::after,.entity-desc::after{content:"";position:absolute;width:100%;height:100%;top:0;left:0}
    .honey-link{display:none!important;position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none;width:0;height:0;overflow:hidden}
  `;
  document.head.appendChild(style);

  // 3. Honeypot links — bots will follow these, humans won't see them
  var honey = document.createElement('a');
  honey.href = '/api/honeypot.json';
  honey.className = 'honey-link';
  honey.textContent = 'admin panel login';
  honey.setAttribute('aria-hidden', 'true');
  honey.setAttribute('tabindex', '-1');
  document.body.appendChild(honey);

  // 4. Disable keyboard shortcuts (Ctrl+U, Ctrl+S, Ctrl+Shift+I, F12)
  document.addEventListener('keydown', function(e){
    if((e.ctrlKey && (e.key==='u'||e.key==='U'||e.key==='s'||e.key==='S')) ||
       (e.ctrlKey && e.shiftKey && (e.key==='i'||e.key==='I')) ||
       e.key==='F12'){
      e.preventDefault(); return false;
    }
  });

  // 5. Detect DevTools open (debugger trap)
  var devtools = {open: false};
  var threshold = 160;
  setInterval(function(){
    var widthDiff = window.outerWidth - window.innerWidth > threshold;
    var heightDiff = window.outerHeight - window.innerHeight > threshold;
    if(widthDiff || heightDiff){
      if(!devtools.open){
        devtools.open = true;
        // Add watermark overlay when devtools detected
        var overlay = document.createElement('div');
        overlay.id = 'dt-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;opacity:0.03;background:repeating-linear-gradient(45deg,transparent,transparent 100px,rgba(0,0,0,0.1) 100px,rgba(0,0,0,0.1) 200px)';
        document.body.appendChild(overlay);
      }
    } else {
      devtools.open = false;
      var ol = document.getElementById('dt-overlay');
      if(ol) ol.remove();
    }
  }, 1000);

  // 6. Detect headless browsers
  if(navigator.webdriver || window._phantom || window.__nightmare || window.callPhantom ||
     window._selenium || window.__selenium_unwrapped || window.domAutomation){
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:1.5em;color:#666">Access Denied</div>';
  }

  // 7. Rate limit tracking (client-side)
  var reqCount = 0;
  var reqStart = Date.now();
  var origFetch = window.fetch;
  window.fetch = function(){
    reqCount++;
    if(Date.now() - reqStart > 60000){ reqCount = 0; reqStart = Date.now(); }
    if(reqCount > 60){
      console.warn('Rate limit: too many requests');
      return Promise.resolve(new Response('{"err":"rate_limited"}', {status:429}));
    }
    return origFetch.apply(this, arguments);
  };

  // 8. Obfuscate data in DOM (add noise to make scraping unreliable)
  if(document.querySelector('.entity-card, .detail-val, .entity-desc')){
    var noise = document.createElement('span');
    noise.className = 'honey-link';
    noise.textContent = Math.random().toString(36).substring(7);
    document.body.appendChild(noise);
  }
})();
