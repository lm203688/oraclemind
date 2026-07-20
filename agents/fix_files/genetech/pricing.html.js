// ==========================================
// GeneTools 定价页面 — 3档简化版
// Free / Pro $19/月 / Team $99/月
// + 按次：Full DB $499 / Single Domain $49
// ==========================================

const GENETECH_PRICING_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GeneTech Tools 定价 — 前沿科技知识库</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,sans-serif; background:#f0f4f8; color:#1e293b; padding:40px 20px; }
.container { max-width:900px; margin:0 auto; }
h1 { text-align:center; font-size:32px; margin-bottom:8px; }
.subtitle { text-align:center; color:#64748b; margin-bottom:40px; }
.plans { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-bottom:40px; }
.card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:32px; position:relative; }
.card.featured { border:2px solid #1a56db; }
.badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#1a56db; color:#fff; padding:4px 16px; border-radius:20px; font-size:13px; }
.plan-name { font-size:20px; font-weight:600; margin-bottom:8px; }
.plan-price { font-size:36px; font-weight:700; margin-bottom:4px; }
.plan-price small { font-size:14px; font-weight:400; color:#64748b; }
.plan-desc { color:#64748b; font-size:14px; margin-bottom:24px; }
.features { list-style:none; margin-bottom:24px; }
.features li { padding:8px 0; font-size:14px; border-bottom:1px solid #f1f5f9; }
.features li:before { content:"✓ "; color:#057a55; font-weight:bold; }
.btn { display:block; text-align:center; padding:12px; border-radius:8px; text-decoration:none; font-weight:600; }
.btn-primary { background:#1a56db; color:#fff; }
.btn-secondary { background:#e2e8f0; color:#1e293b; }
.addons { background:#fff; border-radius:12px; padding:24px; }
.addons h3 { margin-bottom:16px; }
.addon { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f1f5f9; }
.addon:last-child { border:none; }
.addon-name { font-weight:600; }
.addon-price { color:#1a56db; font-weight:700; }
@media(max-width:768px) { .plans { grid-template-columns:1fr; } }
</style>
</head>
<body>
<div class="container">
<h1>GeneTech Tools 定价</h1>
<p class="subtitle">14站前沿科技知识库 · 6,354实体 · API+MCP接入</p>

<div class="plans">
  <div class="card">
    <div class="plan-name">免费版</div>
    <div class="plan-price">$0<small>/永久</small></div>
    <div class="plan-desc">适合个人研究者</div>
    <ul class="features">
      <li>3次API调用/天</li>
      <li>基础实体查询</li>
      <li>14站浏览</li>
      <li>摘要字段可见</li>
      <li>MCP免费层接入</li>
    </ul>
    <a href="https://genetech-tools.pages.dev" class="btn btn-secondary">开始使用</a>
  </div>

  <div class="card featured">
    <div class="badge">推荐</div>
    <div class="plan-name">Pro</div>
    <div class="plan-price">$19<small>/月</small></div>
    <div class="plan-desc">适合专业用户</div>
    <ul class="features">
      <li>不限次API调用</li>
      <li>全字段解锁</li>
      <li>知识图谱可视化</li>
      <li>AI预测分析</li>
      <li>跨域洞察</li>
      <li>拐点预警</li>
      <li>每日情报简报</li>
    </ul>
    <a href="https://www.creem.io/product/prod_22YhSbYonX9hiC0OppnXTn" class="btn btn-primary">订阅Pro</a>
  </div>

  <div class="card">
    <div class="plan-name">Team</div>
    <div class="plan-price">$99<small>/月</small></div>
    <div class="plan-desc">适合团队/企业</div>
    <ul class="features">
      <li>所有Pro功能</li>
      <li>5个团队成员席位</li>
      <li>API Key管理</li>
      <li>优先技术支持</li>
      <li>定制报告</li>
      <li>数据导出</li>
      <li>SLA保障</li>
    </ul>
    <a href="https://www.creem.io/product/prod_5IooNCEQoCyqp758oeVPGT" class="btn btn-primary">订阅Team</a>
  </div>
</div>

<div class="addons">
  <h3>一次性购买</h3>
  <div class="addon">
    <div>
      <div class="addon-name">Full Database Download</div>
      <div style="color:#64748b;font-size:13px;">14站全部6,354实体完整数据包下载</div>
    </div>
    <div class="addon-price">$499</div>
    <a href="https://www.creem.io/product/prod_5OFcAcJeXzfTMkDDt6woBh" class="btn btn-primary" style="padding:8px 16px;">购买</a>
  </div>
  <div class="addon">
    <div>
      <div class="addon-name">Single Domain Data Package</div>
      <div style="color:#64748b;font-size:13px;">单个领域知识库完整下载</div>
    </div>
    <div class="addon-price">$49</div>
    <a href="https://www.creem.io/product/prod_44o1TOBce0Zt00X4E5ACET" class="btn btn-primary" style="padding:8px 16px;">购买</a>
  </div>
</div>
</div>
</body>
</html>`;

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(GENETECH_PRICING_HTML);
};
