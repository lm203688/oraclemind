/**
 * 虎皮椒支付签名工具
 *
 * 签名算法（来自官方文档）：
 * 1. 所有非空参数按参数名 ASCII 码升序排序
 * 2. 用 URL 键值对格式拼接: key1=value1&key2=value2
 * 3. 在末尾直接拼接 AppSecret（无连接符）
 * 4. 对结果做 MD5，取 32 位小写
 */

import type { XunhupayConfig } from './types';
import cryptoJS from 'crypto-js';

/**
 * 生成签名
 */
export function generateSign(params: Record<string, string | number | undefined>, secret: string): string {
  // 1. 过滤空值和 hash 字段
  const filtered: [string, string][] = [];
  for (const key of Object.keys(params).sort()) {
    const val = params[key];
    if (key === 'hash' || val === null || val === undefined || val === '') continue;
    filtered.push([key, String(val)]);
  }

  // 2. 拼接成 key=value&... 格式
  const signStr = filtered.map(([k, v]) => `${k}=${v}`).join('&');

  // 3. 追加 Secret
  const finalStr = signStr + secret;

  // 4. MD5 → 32位小写
  return cryptoJS.MD5(finalStr).toString();
}

/**
 * 验证回调/响应签名
 * @returns true=签名合法, false=签名非法
 */
export function verifySign(data: Record<string, any>, config: XunhupayConfig): boolean {
  const receivedHash = data.hash;
  if (!receivedHash) return false;

  const computedHash = generateSign(data, config.secret);
  return computedHash === receivedHash;
}

/**
 * 生成随机字符串
 */
export function nonceStr(length = 16): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
