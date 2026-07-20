/**
 * 虎皮椒支付服务器
 *
 * 启动:  npx tsx server/index.ts
 *
 * 环境变量:
 *   PORT          端口 (默认 3210)
 *   XUNHUPAY_APPID     虎皮椒 AppID
 *   XUNHUPAY_SECRET    虎皮椒 Secret
 */

import express from 'express';
import path from 'path';
import { setNotifyUrl } from './routes';
import { initOrders } from './order-store';

const app = express();
const PORT = Number(process.env.PORT) || 3210;

// ============================================================
// 中间件
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件（支付页面）
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 初始化
// ============================================================

// 设置回调地址（基于实际端口）
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production'
  ? 'https://your-domain.com'  // 生产环境替换为你的域名
  : 'https://occasions-appraisal-tennis-cottage.trycloudflare.com');  // Cloudflare Tunnel 地址
setNotifyUrl(`${HOST}/api/payment/callback`);
console.log(`[配置] 回调地址: ${HOST}/api/payment/callback`);

// 加载订单数据
initOrders();

// ============================================================
// API 路由
// ============================================================
import paymentRoutes from './routes';

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/payment', paymentRoutes);

// 默认：跳转到支付页面
app.get('/', (_req, res) => {
  res.redirect('/pay.html');
});

// ============================================================
// 启动
// ============================================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║    🐯 虎皮椒支付服务已启动              ║');
  console.log('╠═══════════════════════════════════════╣');
  console.log(`║  本地地址: http://localhost:${PORT}        `);
  console.log(`║  支付页面: http://localhost:${PORT}/pay.html`);
  console.log(`║  订单列表: http://localhost:${PORT}/api/payment/orders`);
  console.log(`║  回调地址: ${HOST}/api/payment/callback`);
  console.log('╚═══════════════════════════════════════╝');
  console.log('');

  if (!process.env.XUNHUPAY_APPID || process.env.XUNHUPAY_APPID === '201906181178') {
    console.log('⚠️  使用默认 AppID，生产环境请设置环境变量 XUNHUPAY_APPID');
  }
});
