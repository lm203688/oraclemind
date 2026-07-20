/**
 * 虎皮椒支付回调验证
 * 处理支付成功/退款通知
 */

import type { XunhupayConfig, CallbackData } from './types';
import { verifySign } from './sign';

/**
 * 解析并验证回调数据
 *
 * @param body 回调 POST body（form-data 或 JSON）
 * @param config 虎皮椒配置
 * @returns 验证后的回调数据，签名不合法时抛异常
 */
export function verifyCallback(body: Record<string, any>, config: XunhupayConfig): CallbackData {
  // 1. 签名校验
  if (!verifySign(body, config)) {
    throw new Error('回调签名验证失败！可能被篡改或不是来自虎皮椒的请求');
  }

  // 2. 基本字段校验
  if (!body.trade_order_id) throw new Error('缺少 trade_order_id');
  if (!body.status) throw new Error('缺少 status');

  return body as CallbackData;
}

/** 回调响应：通知虎皮椒服务器已收到 */
export const CALLBACK_SUCCESS = 'success';

/**
 * 判断是否为已支付状态
 */
export function isPaid(status: string): boolean {
  return status === 'OD';
}

/**
 * 判断是否为退款状态
 */
export function isRefunded(status: string): boolean {
  return status === 'CD' || status === 'RD' || status === 'UD';
}
