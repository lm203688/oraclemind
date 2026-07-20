/**
 * 虎皮椒支付客户端
 * 负责创建订单和查询订单
 */

import type { XunhupayConfig, CreateOrderRequest, CreateOrderResponse, QueryOrderResponse } from './types';
import { generateSign, nonceStr } from './sign';

/** 默认 API 地址 */
const DEFAULT_API_URL = 'https://api.xunhupay.com/payment/do.html';
const DEFAULT_QUERY_URL = 'https://api.xunhupay.com/payment/query.html';

/**
 * 虎皮椒支付客户端
 */
export class XunhupayClient {
  private config: XunhupayConfig;

  constructor(config: XunhupayConfig) {
    this.config = config;
  }

  /**
   * 创建支付订单
   *
   * @param order 订单参数
   * @returns 包含支付 URL / 二维码 URL 的响应
   */
  async createOrder(order: CreateOrderRequest): Promise<CreateOrderResponse> {
    const timestamp = Math.floor(Date.now() / 1000);
    const randomStr = nonceStr(16);

    const params: Record<string, string | number> = {
      version: '1.1',
      appid: this.config.appid,
      trade_order_id: order.tradeOrderId,
      total_fee: String(order.totalFee),
      title: order.title,
      time: timestamp,
      notify_url: this.config.notifyUrl,
      nonce_str: randomStr,
    };

    // 可选参数
    if (this.config.returnUrl) params.return_url = this.config.returnUrl;
    if (this.config.callbackUrl) params.callback_url = this.config.callbackUrl;
    if (order.attach) params.attach = order.attach;
    if (order.plugins) params.plugins = order.plugins;

    // 签名
    params.hash = generateSign(params, this.config.secret);

    // 发起请求
    const apiUrl = this.config.apiUrl || DEFAULT_API_URL;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: CreateOrderResponse = await response.json();

    if (data.errcode !== 0) {
      throw new Error(`虎皮椒下单失败 [${data.errcode}]: ${data.errmsg}`);
    }

    return data;
  }

  /**
   * 查询订单状态
   *
   * @param tradeOrderId 商户订单号
   * @returns 订单状态信息
   */
  async queryOrder(tradeOrderId: string): Promise<QueryOrderResponse> {
    const timestamp = Math.floor(Date.now() / 1000);
    const randomStr = nonceStr(16);

    const params: Record<string, string | number> = {
      version: '1.1',
      appid: this.config.appid,
      trade_order_id: tradeOrderId,
      time: timestamp,
      nonce_str: randomStr,
    };

    params.hash = generateSign(params, this.config.secret);

    const response = await fetch(DEFAULT_QUERY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
