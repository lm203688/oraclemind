/**
 * 虎皮椒支付 (Xunhupay) 类型定义
 * 文档: https://www.xunhupay.com/doc/api/pay.html
 */

// ============================================================
// 配置
// ============================================================

export interface XunhupayConfig {
  /** 虎皮椒 AppID */
  appid: string;
  /** 虎皮椒 AppSecret */
  secret: string;
  /** 支付成功回调地址 (notify_url) */
  notifyUrl: string;
  /** 支付成功前端跳转地址 (return_url) */
  returnUrl?: string;
  /** 用户取消支付后跳转地址 (callback_url) */
  callbackUrl?: string;
  /** 正式环境 API 地址 */
  apiUrl?: string;
  /** 备用 API 地址 */
  backupApiUrl?: string;
}

// ============================================================
// 创建订单
// ============================================================

/** 创建订单请求参数 */
export interface CreateOrderRequest {
  /** 商户订单号，全局唯一（数字/大小写字母/_-*) */
  tradeOrderId: string;
  /** 订单金额（人民币元） */
  totalFee: number | string;
  /** 订单标题（≤127字符/42汉字，无表情符号和%） */
  title: string;
  /** 支付成功后备注，回调时原样返回 */
  attach?: string;
  /** 标识对接程序名称 */
  plugins?: string;
}

// ============================================================
// 订单创建响应
// ============================================================

export interface CreateOrderResponse {
  /** 订单 ID */
  openid: number;
  /** PC端：二维码地址（有效期5分钟），直接展示给用户扫码 */
  urlQrcode?: string;
  /** 手机端：跳转此 URL，系统自动判断微信/支付宝并最终跳转 return_url */
  url: string;
  /** 错误码，0=成功 */
  errcode: number;
  /** 错误信息 */
  errmsg: string;
  /** 响应签名 */
  hash: string;
}

// ============================================================
// 回调通知
// ============================================================

/** 虎皮椒 POST 回调通知数据 */
export interface CallbackData {
  /** 商户订单号 */
  trade_order_id: string;
  /** 实际支付金额（元） */
  total_fee: string;
  /** 平台内部交易单号 */
  transaction_id: string;
  /** 虎皮椒内部订单号 */
  open_order_id: string;
  /** 订单标题 */
  order_title: string;
  /** 订单状态: OD=已支付, CD=已退款, RD=退款中, UD=退款失败 */
  status: 'OD' | 'CD' | 'RD' | 'UD';
  /** 插件ID */
  plugins?: string;
  /** 备注原样返回 */
  attach?: string;
  /** AppID */
  appid: string;
  /** 时间戳 */
  time: string;
  /** 随机字符串 */
  nonce_str: string;
  /** 签名 */
  hash: string;
}

// ============================================================
// 查询订单响应
// ============================================================

export interface QueryOrderResponse {
  /** 错误码 */
  errcode: number;
  /** 错误信息 */
  errmsg: string;
  /** 订单状态: OD=已支付, CD=已退款, WD=等待支付 */
  status: string;
  /** 商户订单号 */
  trade_order_id: string;
  /** 总金额 */
  total_fee: string;
  /** 平台交易单号 */
  transaction_id: string;
  /** 签名 */
  hash: string;
}
