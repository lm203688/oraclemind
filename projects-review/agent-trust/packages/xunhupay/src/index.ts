/**
 * agent-trust-xunhupay
 *
 * 虎皮椒支付 (Xunhupay) SDK
 * 微信/支付宝个人收款，统一接口，自动判断终端类型
 *
 * @example 基本用法
 * ```ts
 * import { XunhupayClient, verifyCallback } from 'agent-trust-xunhupay';
 *
 * // 初始化客户端
 * const client = new XunhupayClient({
 *   appid: '201906181178',
 *   secret: 'd856af3cab45ce0b0ae5d491a2ac94b0',
 *   notifyUrl: 'https://your-domain.com/api/payment/callback',
 *   returnUrl: 'https://your-domain.com/success',
 * });
 *
 * // 创建订单
 * const result = await client.createOrder({
 *   tradeOrderId: 'ORDER_' + Date.now(),
 *   totalFee: 9.9,
 *   title: 'AIShield 会员',
 * });
 * console.log(result.url);       // 手机端跳转 URL
 * console.log(result.urlQrcode); // PC 端二维码 URL
 *
 * // 验证回调 (在 Express/Fastify 路由中)
 * const callback = verifyCallback(req.body, config);
 * if (callback.status === 'OD') {
 *   // 支付成功！处理业务逻辑
 * }
 * ```
 */

// 核心类和函数
export { XunhupayClient } from './client';
export { verifyCallback, CALLBACK_SUCCESS, isPaid, isRefunded } from './callback';
export { generateSign, nonceStr, verifySign } from './sign';

// 类型导出
export type {
  XunhupayConfig,
  CreateOrderRequest,
  CreateOrderResponse,
  CallbackData,
  QueryOrderResponse,
} from './types';
