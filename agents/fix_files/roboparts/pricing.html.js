// ==========================================
// RoboParts 定价页面
// /pricing — 展示3档定价方案
// ==========================================

const PLANS_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RoboParts 定价 — 机器人零件兼容性平台</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif; background:#f0f4f8; color:#1e293b; padding:40px 20px; }
.container { max-width:900px; margin:0 auto; }
h1 { text-align:center; font-size:32px; margin-bottom:8px; }
.subtitle { text-align:center; color:#64748b; margin-bottom:40px; }
.plans { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
.card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:32px; position:relative; transition:transform 0.2s,box-shadow 0.2s; }
.card:hover { transform:translateY(-4px); box-shadow:0 8px 30px rgba(0,0,0,0.1); }
.card.featured { border:2px solid #1a56db; }
.badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#1a56db; color:#fff; padding:4px 16px; border-radius:20px; font-size:13px; }
.plan-name { font-size:20px; font-weight:600; margin-bottom:8px; }
.plan-price { font-size:36px; font-weight:700; margin-bottom:4px; }
.plan-price small { font-size:14px; font-weight:400; color:#64748b; }
.plan-desc { color:#64748b; font-size:14px; margin-bottom:24px; }
.features { list-style:none; margin-bottom:24px; }
.features li { padding:8px 0; font-size:14px; border-bottom:1px solid #f1f5f9; }
.features li:before { content:"✓ "; color:#057a55; font-weight:bold; }
.btn { display:block; text-align:center; padding:12px; border-radius:8px; text-decoration:none; font-weight:600; transition:background 0.2s; }
.btn-primary { background:#1a56db; color:#fff; }
.btn-primary:hover { background:#1e40af; }
.btn-secondary { background:#e2e8f0; color:#1e293b; }
.btn-secondary:hover { background:#cbd5e1; }
.api-info { margin-top:40px; padding:24px; background:#fff; border-radius:12px; }
.api-info h3 { margin-bottom:12px; }
.api-info code { background:#f1f5f9; padding:2px 8px; border-radius:4px; font-size:13px; }
@media(max-width:768px) { .plans { grid-template-columns:1fr; } }
</style>
</head>
<body>
<div class="container">
<h1>RoboParts 定价方案</h1>
<p class="subtitle">免费开始用，按需付费，3D打印代打含15%平台佣金</p>

<div class="plans">
  <div class="card">
    <div class="plan-name">免费版</div>
    <div class="plan-price">¥0<small>/永久</small></div>
    <div class="plan-desc">适合个人创客体验</div>
    <ul class="features">
      <li>5次/天兼容性检查</li>
      <li>12款STL转接件免费下载</li>
      <li>3D模型在线预览</li>
      <li>社区浏览和发帖</li>
      <li>基础技术参数查询</li>
    </ul>
    <a href="/" class="btn btn-secondary">开始使用</a>
  </div>

  <div class="card featured">
    <div class="badge">推荐</div>
    <div class="plan-name">按次付费</div>
    <div class="plan-price">¥50<small>/100次</small></div>
    <div class="plan-desc">适合中小集成商</div>
    <ul class="features">
      <li>100次API调用（¥0.5/次）</li>
      <li>无限兼容性检查</li>
      <li>自然语言兼容查询</li>
      <li>零件推荐引擎</li>
      <li>3D打印代打（含15%佣金）</li>
      <li>优先社区支持</li>
    </ul>
    <a href="/api/v1/purchase-key?plan=pay-per-use" class="btn btn-primary">购买API Key</a>
  </div>

  <div class="card">
    <div class="plan-name">月度不限</div>
    <div class="plan-price">¥99<small>/月</small></div>
    <div class="plan-desc">适合频繁使用者</div>
    <ul class="features">
      <li>不限次API调用</li>
      <li>所有按次付费功能</li>
      <li>批量零件对比</li>
      <li>定制STL需求提交</li>
      <li>3D打印代打（含15%佣金）</li>
      <li>1对1技术支持</li>
    </ul>
    <a href="/api/v1/purchase-key?plan=monthly" class="btn btn-primary">订阅月度</a>
  </div>
</div>

<div class="api-info">
  <h3>API接入方式</h3>
  <p>购买后获取API Key，在请求头中传入：</p>
  <p style="margin:12px 0;"><code>x-api-key: rpk_xxxxxxxxxxxxxxxx</code></p>
  <p>调用示例：</p>
  <p style="margin:12px 0;"><code>curl https://roboparts.cc/api/v1/compat-check -H "x-api-key: rpk_xxx" -d '{"arm":"dobot-magician","gripper":"robotiq-2f85"}'</code></p>
</div>
</div>
</body>
</html>`;

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(PLANS_HTML);
};
