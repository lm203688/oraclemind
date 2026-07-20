/**
 * 订单数据存储（JSON 文件持久化）
 */

import * as fs from 'fs';
import * as path from 'path';

export interface OrderRecord {
  /** 商户订单号 */
  tradeOrderId: string;
  /** 订单标题 */
  title: string;
  /** 金额（元） */
  totalFee: string | number;
  /** 状态: created=已创建, paid=已支付, refunded=已退款 */
  status: 'created' | 'paid' | 'refunded';
  /** 创建时间 */
  createdAt: string;
  /** 支付时间 */
  paidAt?: string;
  /** 虎皮椒交易单号 */
  transactionId?: string;
  /** 支付链接 */
  payUrl?: string;
  /** 二维码链接 */
  qrcodeUrl?: string;
  /** 备注 */
  attach?: string;
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

/** 内存缓存 + 文件持久化 */
let orders: OrderRecord[] = [];

/** 初始化：从文件加载订单 */
export function initOrders(): void {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      orders = JSON.parse(raw);
    }
  } catch {
    orders = [];
  }
}

/** 持久化到文件 */
function save(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

/** 创建订单记录 */
export function createOrder(order: Omit<OrderRecord, 'status' | 'createdAt'>): OrderRecord {
  const record: OrderRecord = {
    ...order,
    status: 'created',
    createdAt: new Date().toISOString(),
  };
  orders.push(record);
  save();
  return record;
}

/** 根据商户订单号查找 */
export function findOrder(tradeOrderId: string): OrderRecord | undefined {
  return orders.find((o) => o.tradeOrderId === tradeOrderId);
}

/** 标记为已支付 */
export function markPaid(tradeOrderId: string, transactionId?: string): OrderRecord | undefined {
  const order = findOrder(tradeOrderId);
  if (order) {
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    order.transactionId = transactionId;
    save();
  }
  return order;
}

/** 标记为已退款 */
export function markRefunded(tradeOrderId: string): OrderRecord | undefined {
  const order = findOrder(tradeOrderId);
  if (order) {
    order.status = 'refunded';
    save();
  }
  return order;
}

/** 更新支付链接 */
export function updatePayUrls(tradeOrderId: string, payUrl?: string, qrcodeUrl?: string): void {
  const order = findOrder(tradeOrderId);
  if (order) {
    order.payUrl = payUrl;
    order.qrcodeUrl = qrcodeUrl;
    save();
  }
}

/** 获取所有订单 */
export function getAllOrders(): OrderRecord[] {
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
