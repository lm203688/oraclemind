// AIShield Content Script - 在GPT Store/MCP市场页面注入安全评分
(function() {
  const API_BASE = 'https://aishield.ai/api/v1';
  
  // 检测当前页面类型
  function detectPageType() {
    const url = window.location.href;
    if (url.includes('chatgpt.com/g/')) return 'gpt';
    if (url.includes('smithery.ai/')) return 'mcp';
    if (url.includes('mcp.so/')) return 'mcp';
    return null;
  }
  
  // 从页面提取工具信息
  function extractToolInfo() {
    const type = detectPageType();
    if (type === 'gpt') {
      const nameEl = document.querySelector('h1');
      const descEl = document.querySelector('[class*="description"]');
      return {
        tool_type: 'gpt',
        name: nameEl?.textContent?.trim() || '',
        source_url: window.location.href,
        description: descEl?.textContent?.trim() || ''
      };
    } else if (type === 'mcp') {
      const nameEl = document.querySelector('h1, [class*="title"]');
      return {
        tool_type: 'mcp',
        name: nameEl?.textContent?.trim() || '',
        source_url: window.location.href,
      };
    }
    return null;
  }
  
  // 创建评分徽章
  function createBadge(score, riskLevel, badgeLevel) {
    const colors = {
      gold: { bg: '#FFD700', fg: '#000' },
      silver: { bg: '#C0C0C0', fg: '#000' },
      bronze: { bg: '#CD7F32', fg: '#fff' },
      none: { bg: '#555', fg: '#fff' }
    };
    const riskColors = {
      safe: '#00b894',
      medium: '#fdcb6e',
      high: '#e17055',
      critical: '#d63031'
    };
    
    const c = colors[badgeLevel] || colors.none;
    const rc = riskColors[riskLevel] || riskColors.safe;
    
    const badge = document.createElement('div');
    badge.className = 'aishield-badge';
    badge.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:8px;background:${c.bg};color:${c.fg};font-family:system-ui;font-size:14px;font-weight:600;cursor:pointer" title="AIShield安全评分">
        🛡️ AIShield
        <span style="font-size:18px">${score}/100</span>
        <span style="padding:2px 8px;border-radius:4px;background:${rc};color:#fff;font-size:12px">${riskLevel}</span>
      </div>
    `;
    return badge;
  }
  
  // 查询安全评分
  async function fetchScore(toolInfo) {
    try {
      const resp = await fetch(`${API_BASE}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolInfo)
      });
      const data = await resp.json();
      
      if (data.success && data.status === 'completed') {
        return data.report;
      } else if (data.audit_id) {
        // 轮询结果
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 3000));
          const pollResp = await fetch(`${API_BASE}/audit/${data.audit_id}`);
          const pollData = await pollResp.json();
          if (pollData.status === 'completed') return pollData;
          if (pollData.status === 'failed') return null;
        }
      }
    } catch (e) {
      console.error('AIShield error:', e);
    }
    return null;
  }
  
  // 主逻辑
  async function main() {
    const toolInfo = extractToolInfo();
    if (!toolInfo) return;
    
    const report = await fetchScore(toolInfo);
    if (!report) return;
    
    // 在页面标题旁插入徽章
    const h1 = document.querySelector('h1');
    if (h1) {
      const badge = createBadge(report.overall_score, report.risk_level, report.badge_level);
      h1.parentNode.insertBefore(badge, h1.nextSibling);
    }
  }
  
  // 延迟执行，等待页面加载
  setTimeout(main, 2000);
})();
