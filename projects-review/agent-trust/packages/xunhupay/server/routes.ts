/**
 * 支付路由
 * - POST /api/payment/create   创建订单
 * - POST /api/payment/callback  虎皮椒回调
 * - GET  /api/payment/query/:id 查询订单
 * - GET  /api/orders            订单列表
 */

import { Router, Request, Response } from 'express';
import { XunhupayClient, verifyCallback, CALLBACK_SUCCESS, isPaid, isRefunded } from '../src/index';
import type { XunhupayConfig } from '../src/types';
import {
  createOrder as storeOrder,
  findOrder,
  markPaid,
  markRefunded,
  updatePayUrls,
  getAllOrders,
} from './order-store';

const router = Router();

// ============================================================
// 配置（从环境变量或硬编码）
// ============================================================

const config: XunhupayConfig = {
  appid: process.env.XUNHUPAY_APPID || '201906181178',
  secret: process.env.XUNHUPAY_SECRET || 'd856af3cab45ce0b0ae5d491a2ac94b0',
  notifyUrl: process.env.XUNHUPAY_NOTIFY_URL || '', // 启动时自动设置
  returnUrl: process.env.XUNHUPAY_RETURN_URL || '',
};

const client = new XunhupayClient(config);

/** 设置动态回调地址（基于实际启动端口） */
export function setNotifyUrl(url: string): void {
  config.notifyUrl = url;
}

// ============================================================
// POST /api/payment/create — 创建支付订单
// ============================================================
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { title, totalFee, attach } = req.body;

    if (!title || !totalFee) {
      return res.status(400).json({ errcode: 400, errmsg: '缺少 title 或 totalFee' });
    }

    const fee = Number(totalFee);
    if (isNaN(fee) || fee <= 0) {
      return res.status(400).json({ errcode: 400, errmsg: '金额必须大于 0' });
    }

    // 生成唯一订单号
    const tradeOrderId = `XH_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 先存入本地数据库
    storeOrder({ tradeOrderId, title, totalFee: fee, attach });

    // 调虎皮椒 API
    const result = await client.createOrder({
      tradeOrderId,
      totalFee: fee,
      title,
      attach,
      plugins: 'agent-trust-xunhupay',
    });

    // 更新支付链接
    updatePayUrls(tradeOrderId, result.url, result.urlQrcode);

    // 返回给前端
    res.json({
      errcode: 0,
      errmsg: 'success',
      data: {
        tradeOrderId,
        payUrl: result.url,
        qrcodeUrl: result.urlQrcode,
      },
    });
  } catch (err: any) {
    console.error('[创建订单失败]', err.message);
    res.status(500).json({ errcode: 500, errmsg: err.message || '创建订单失败' });
  }
});

// ============================================================
// POST /api/payment/callback — 虎皮椒支付回调
// ============================================================
router.post('/callback', (req: Request, res: Response) => {
  console.log('--- 收到虎皮椒支付回调 ---');
  console.log('Body:', JSON.stringify(req.body));

  try {
    // 验证签名 + 解析数据
    const callback = verifyCallback(req.body, config);
    const { trade_order_id, status, transaction_id, total_fee } = callback;

    console.log(`[回调] 订单=${trade_order_id}, 状态=${status}, 金额=${total_fee}`);

    if (isPaid(status)) {
      markPaid(trade_order_id, transaction_id);
      console.log(`✅ 订单 ${trade_order_id} 已支付！`);
    } else if (isRefunded(status)) {
      markRefunded(trade_order_id);
      console.log(`⚠️  订单 ${trade_order_id} 已退款`);
    }

    // 必须返回 success，否则虎皮椒会重试 6 次
    res.send(CALLBACK_SUCCESS);
  } catch (err: any) {
    console.error('[回调验证失败]', err.message);
    res.status(400).send(err.message);
  }
});

// ============================================================
// GET /api/payment/query/:id — 查询订单状态
// ============================================================
router.get('/query/:tradeOrderId', async (req: Request, res: Response) => {
  try {
    const { tradeOrderId } = req.params;

    // 先查本地
    let local = findOrder(tradeOrderId);
    if (local && local.status === 'paid') {
      return res.json({ errcode: 0, data: local });
    }

    // 本地未支付 → 去虎皮椒查
    const remote = await client.queryOrder(tradeOrderId);
    if (remote.errcode === 0 && remote.status === 'OD') {
      markPaid(tradeOrderId, remote.transaction_id);
      local = findOrder(tradeOrderId);
    }

    res.json({
      errcode: 0,
      data: local || { tradeOrderId, status: 'unknown', remote },
    });
  } catch (err: any) {
    res.status(500).json({ errcode: 500, errmsg: err.message });
  }
});

// ============================================================
// GET /api/orders — 管理后台：查看所有订单
// ============================================================
router.get('/orders', (_req: Request, res: Response) => {
  res.json({ errcode: 0, data: getAllOrders() });
});

export default router;
