export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = 'http://150.158.119.19:8460' + url.pathname + url.search;
    
    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        body: request.method === 'GET' ? undefined : request.body,
      });
      
      const contentType = response.headers.get('Content-Type') || '';
      let html = await response.text();
      
      if (contentType.includes('text/html')) {
        // 注入修复脚本
        const fixScript = `<script>
        window.addEventListener('DOMContentLoaded', function() {
          window.loadHistory = function() {
            if (!window.authToken) return;
            fetch('/api/v1/experiments/history', {headers: {'Authorization': 'Bearer ' + window.authToken}})
              .then(r => r.json())
              .then(d => {
                var l = d.experiments || [];
                var el = document.getElementById('historyList');
                if (!el) return;
                if (!l.length) { el.innerHTML = '<div style="color:#64748b;font-size:13px">暂无历史实验</div>'; return; }
                el.innerHTML = l.map(function(e) {
                  return '<div data-eid="' + e.experiment_id + '" style="background:#0f172a;border:1px solid #1e2d4a;border-radius:8px;padding:12px;cursor:pointer"><div style="font-size:12px;color:#10b981;font-weight:600">' + e.name + '</div><div style="font-size:10px;color:#64748b">' + (e.completed_at || '') + '</div></div>';
                }).join('');
                el.querySelectorAll('[data-eid]').forEach(function(el2) {
                  el2.onclick = function() { window.loadExpHistory(this.getAttribute('data-eid')); };
                });
              })
              .catch(function(e) { console.error(e); });
          };
          window.queryReagent = function() {
            var cat = document.getElementById('catalyst').value || 'Pd(PPh3)4';
            fetch('/api/v1/reagent/' + encodeURIComponent(cat)).then(r => r.json()).then(d => {
              alert(d.reagent + '\\n价格: ' + d.price + '\\n供应商: ' + d.supplier + '\\nCAS: ' + d.cas);
            }).catch(function(e) { alert('查询失败'); });
          };
          window.queryPatent = function() {
            var name = document.getElementById('expName').value || 'EGFR';
            fetch('/api/v1/patent/' + encodeURIComponent(name)).then(r => r.json()).then(d => {
              var msg = d.count > 0 ? d.count + '条专利:\\n' + d.patents.map(function(p) { return p.title.slice(0,40); }).join('\\n') : '未找到相关专利';
              alert(msg);
            }).catch(function(e) { alert('查询失败'); });
          };
        });
        </script>`;
        
        html = html.replace('</body>', fixScript + '</body>');
      }
      
      return new Response(html, {
        status: response.status,
        headers: { 'Content-Type': contentType || 'text/html' },
      });
    } catch (e) {
      return new Response('Proxy error: ' + e.message, { status: 502 });
    }
  }
};
