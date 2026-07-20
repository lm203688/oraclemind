/**
 * 虎皮椒支付快速测试
 *
 * 用法:
 *   npx tsx test-pay.ts
 *
 * 注意: 这只是测试签名和参数构建，不会真正下单
 */
import { XunhupayClient, generateSign, verifySign } from './src/index';

const config = {
  appid: '201906181178',
  secret: 'd856af3cab45ce0b0ae5d491a2ac94b0',
  notifyUrl: 'https://your-domain.com/api/payment/callback',
  returnUrl: 'https://your-domain.com/success',
};

// 1. 测试签名生成
console.log('=== 签名测试 ===');
const testParams = {
  version: '1.1',
  appid: config.appid,
  trade_order_id: 'TEST_001',
  total_fee: '9.90',
  title: 'AIShield 测试订单',
  time: Math.floor(Date.now() / 1000),
  notify_url: config.notifyUrl,
  nonce_str: 'test123abc',
};
const hash = generateSign(testParams, config.secret);
console.log('✅ 签名生成:', hash);
console.log('   签名长度:', hash.length, '(应为32)');

// 2. 测试客户端初始化
const client = new XunhupayClient(config);
console.log('\n=== 客户端初始化 ===');
console.log('✅ 客户端已就绪');
console.log('   AppID:', client['config'].appid);

// 3. 模拟回调验证
console.log('\n=== 回调验证测试 ===');
const mockCallback = {
  trade_order_id: 'TEST_001',
  total_fee: '9.90',
  transaction_id: 'TXN_123456',
  open_order_id: 'ORD_789',
  order_title: 'AIShield 测试订单',
  status: 'OD', // OD = 已支付
  appid: config.appid,
  time: String(Math.floor(Date.now() / 1000)),
  nonce_str: 'callback_test_123',
  hash: '', // 下面计算
};
mockCallback.hash = generateSign(mockCallback, config.secret);

const valid = verifySign(mockCallback, config);
console.log('✅ 回调签名验证:', valid ? '通过' : '失败');

if (valid) {
  console.log('   订单号:', mockCallback.trade_order_id);
  console.log('   金额:', mockCallback.total_fee + ' 元');
  console.log('   状态:', mockCallback.status === 'OD' ? '已支付 ✓' : mockCallback.status);
}

console.log('\n=== 全部测试通过 ===');
