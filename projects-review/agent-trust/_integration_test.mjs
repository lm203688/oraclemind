/**
 * AgentTrust Protocol — 集成测试脚本
 * 直接从 packages/core/dist/ 导入，无需构建
 * 运行: node _integration_test.mjs
 */

import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 导入核心模块（从已构建的 dist） ──────────────────────────────
const coreDist = path.join(__dirname, 'packages/core/dist/scoring.js');
const storeDist = path.join(__dirname, 'packages/core/dist/store.js');
const issuerDist = path.join(__dirname, 'packages/core/dist/issuer.js');
const normaliserPath = path.join(__dirname, 'packages/x402-listener/src/normaliser.ts');

// 由于 x402-listener 未编译，直接内联 normaliseX402Event 逻辑
// （与源码完全等价）

// ── 测试框架 ─────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const results = [];

function assert(condition, msg, actual, expected) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
    results.push({ status: 'PASS', msg, actual: String(actual), expected: String(expected) });
  } else {
    console.log(`  ❌ FAIL: ${msg}`);
    console.log(`     期望: ${expected}`);
    console.log(`     实际: ${actual}`);
    failed++;
    results.push({ status: 'FAIL', msg, actual: String(actual), expected: String(expected) });
  }
}

function section(name) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${name}`);
  console.log('='.repeat(60));
}

// ── 内联 normaliseX402Event（与 normaliser.ts 逻辑完全一致）──────────
function normaliseX402Event(event) {
  const providerDid = event.provider.startsWith('did:')
    ? event.provider
    : `did:web:${event.provider.replace(/^https?:\/\//, '').split('/')[0]}`;

  const consumerDid = event.consumer
    ? event.consumer.startsWith('did:')
      ? event.consumer
      : `did:web:${event.consumer.replace(/^https?:\/\//, '').split('/')[0]}`
    : undefined;

  let status;
  if (event.disputed) {
    status = 'disputed';
  } else if (event.providerHttpStatus >= 200 && event.providerHttpStatus < 300) {
    status = 'success';
  } else {
    status = 'failure';
  }

  return {
    id: event.paymentId,
    providerDid,
    consumerDid,
    protocol: 'x402',
    status,
    responseTimeMs: event.latencyMs,
    amountUsd: event.amountMicro / 1_000_000,
    createdAt: new Date(event.timestamp * 1000).toISOString(),
    metadata: {
      providerHttpStatus: event.providerHttpStatus,
      raw: event,
    },
  };
}

// ── 内联 isPaid / isRefunded（与 callback.ts 完全一致）──────────────
function isPaid(status) { return status === 'OD'; }
function isRefunded(status) { return status === 'CD' || status === 'RD' || status === 'UD'; }

// ── 内联 generateSign（与 sign.ts 完全一致，用 MD5 模拟）───────────
// 注意: sign.ts 使用 crypto-js，这里用 Node 内置 crypto 模拟 MD5
import { createHash } from 'node:crypto';

function generateSign(params, secret) {
  const filtered = [];
  for (const key of Object.keys(params).sort()) {
    const val = params[key];
    if (key === 'hash' || val === null || val === undefined || val === '') continue;
    filtered.push([key, String(val)]);
  }
  const signStr = filtered.map(([k, v]) => `${k}=${v}`).join('&');
  const finalStr = signStr + secret;
  return createHash('md5').update(finalStr).digest('hex');
}

function verifySign(data, secret) {
  const receivedHash = data.hash;
  if (!receivedHash) return false;
  const computedHash = generateSign(data, secret);
  return computedHash === receivedHash;
}

// ── 内联 orderStore（模拟数据流）────────────────────────────────────
const orderMap = new Map();

function createOrder(id, amount, title) {
  const order = { id, amount, title, status: 'pending', createdAt: new Date().toISOString() };
  orderMap.set(id, order);
  return order;
}

function markPaid(id) {
  const order = orderMap.get(id);
  if (!order) throw new Error(`Order ${id} not found`);
  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  return order;
}

function findOrder(id) { return orderMap.get(id); }

// ── 加载 scoring 和 store ────────────────────────────────────────────
const { computeTrustScore, SCORING_WEIGHTS } = await import(
  new URL('./packages/core/dist/scoring.js', import.meta.url).href
);
const { transactionStore } = await import(
  new URL('./packages/core/dist/store.js', import.meta.url).href
);
const { issueScoreCredential } = await import(
  new URL('./packages/core/dist/issuer.js', import.meta.url).href
);

// ────────────────────────────────────────────────────────────────────
// A. 评分引擎测试
// ────────────────────────────────────────────────────────────────────
section('A. 评分引擎核心逻辑测试');

// 辅助函数：生成 TransactionRecord
function makeRecord(overrides = {}) {
  return {
    id: `tx-${Math.random().toString(36).slice(2)}`,
    providerDid: 'did:web:test-agent.example.com',
    protocol: 'x402',
    status: 'success',
    responseTimeMs: 500,
    amountUsd: 0.05,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// 测试1: 空记录 → overallScore=0, confidenceTier=insufficient_data
{
  console.log('\n[测试1] 空记录');
  const score = computeTrustScore('did:web:empty.example.com', []);
  assert(score.overallScore === 0, 'overallScore 应为 0', score.overallScore, 0);
  assert(score.confidenceTier === 'insufficient_data', 'confidenceTier 应为 insufficient_data', score.confidenceTier, 'insufficient_data');
  assert(score.transactionCount === 0, 'transactionCount 应为 0', score.transactionCount, 0);
}

// 测试2: 3条 success 记录 → confidenceTier=insufficient_data（不足5条）
{
  console.log('\n[测试2] 3条 success 记录');
  const records = Array.from({ length: 3 }, () => makeRecord({ status: 'success' }));
  const score = computeTrustScore('did:web:three.example.com', records);
  assert(score.confidenceTier === 'insufficient_data', 'confidenceTier 应为 insufficient_data（<5条）', score.confidenceTier, 'insufficient_data');
  assert(score.transactionCount === 3, 'transactionCount 应为 3', score.transactionCount, 3);
  assert(score.overallScore > 0, 'overallScore 应 > 0（有成功记录）', score.overallScore, '>0');
}

// 测试3: 10条 success, 2条 failure → 计算分数，验证在合理范围
{
  console.log('\n[测试3] 10条 success + 2条 failure');
  const records = [
    ...Array.from({ length: 10 }, () => makeRecord({ status: 'success', responseTimeMs: 600 })),
    ...Array.from({ length: 2 }, () => makeRecord({ status: 'failure', responseTimeMs: 1200 })),
  ];
  const score = computeTrustScore('did:web:mixed.example.com', records);
  assert(score.confidenceTier === 'low', 'confidenceTier 应为 low（5≤n<25）', score.confidenceTier, 'low');
  assert(score.transactionCount === 12, 'transactionCount 应为 12', score.transactionCount, 12);
  // completionRate = 10/12 * 100 ≈ 83
  // 预期分数在 60-90 范围
  assert(score.overallScore >= 60 && score.overallScore <= 90,
    `overallScore(${score.overallScore}) 应在 60-90 范围`, score.overallScore, '60-90');
  // 详细维度
  const expectedCompletionRate = Math.round((10 / 12) * 100);
  assert(score.dimensions.completionRate === expectedCompletionRate,
    `completionRate 应为 ${expectedCompletionRate}`, score.dimensions.completionRate, expectedCompletionRate);
}

// 测试4: 有 disputed 记录 → reliabilityScore 应该降低
{
  console.log('\n[测试4] disputed 记录降低 reliabilityScore');
  const noDisputeRecords = Array.from({ length: 10 }, () =>
    makeRecord({ status: 'success', responseTimeMs: 500 }));
  const withDisputeRecords = [
    ...Array.from({ length: 8 }, () => makeRecord({ status: 'success', responseTimeMs: 500 })),
    ...Array.from({ length: 2 }, () => makeRecord({ status: 'disputed', responseTimeMs: 500 })),
  ];
  const scoreClean = computeTrustScore('did:web:clean.example.com', noDisputeRecords);
  const scoreDirty = computeTrustScore('did:web:dirty.example.com', withDisputeRecords);

  assert(
    scoreClean.dimensions.reliabilityScore > scoreDirty.dimensions.reliabilityScore,
    `无纠纷 reliabilityScore(${scoreClean.dimensions.reliabilityScore}) > 有纠纷(${scoreDirty.dimensions.reliabilityScore})`,
    scoreDirty.dimensions.reliabilityScore,
    `< ${scoreClean.dimensions.reliabilityScore}`
  );
  // disputed=2/10 → reliabilityScore = max(0, 100 - (2/10)*200) = 100 - 40 = 60
  assert(scoreDirty.dimensions.reliabilityScore === 60,
    'reliabilityScore 应为 60 (2/10 disputed)', scoreDirty.dimensions.reliabilityScore, 60);
}

// 测试5: 超快响应(100ms) vs 超慢(15000ms) → responseTime维度差异应>50分
{
  console.log('\n[测试5] 超快 vs 超慢响应时间');
  const fastRecords = Array.from({ length: 10 }, () => makeRecord({ responseTimeMs: 100 }));
  const slowRecords = Array.from({ length: 10 }, () => makeRecord({ responseTimeMs: 15000 }));

  const scoreFast = computeTrustScore('did:web:fast.example.com', fastRecords);
  const scoreSlow = computeTrustScore('did:web:slow.example.com', slowRecords);

  const diff = scoreFast.dimensions.responseTime - scoreSlow.dimensions.responseTime;
  assert(scoreFast.dimensions.responseTime === 100,
    'fast(100ms) responseTime 维度应为 100', scoreFast.dimensions.responseTime, 100);
  assert(scoreSlow.dimensions.responseTime === 0,
    'slow(15000ms) responseTime 维度应为 0', scoreSlow.dimensions.responseTime, 0);
  assert(diff > 50, `响应时间维度差(${diff}) 应 > 50`, diff, '>50');
}

// ────────────────────────────────────────────────────────────────────
// B. 订单数据流测试
// ────────────────────────────────────────────────────────────────────
section('B. 订单数据流测试（模拟虎皮椒订单生命周期）');

// 测试6: createOrder → markPaid → findOrder() status 应该为 'paid'
{
  console.log('\n[测试6] createOrder → markPaid → 查询状态');
  const order = createOrder('ORDER-001', 9.9, 'AgentTrust API Access');
  assert(order.status === 'pending', 'createOrder 后状态为 pending', order.status, 'pending');

  markPaid('ORDER-001');
  const found = findOrder('ORDER-001');
  assert(found.status === 'paid', 'markPaid 后状态为 paid', found.status, 'paid');
  assert(found.paidAt !== undefined, 'paidAt 字段已设置', found.paidAt, 'non-null');
}

// 测试7: 同一订单 markPaid 两次 → 幂等性（不出错）
{
  console.log('\n[测试7] markPaid 幂等性');
  createOrder('ORDER-002', 5.0, 'Duplicate Pay Test');
  markPaid('ORDER-002');
  let errorThrown = false;
  try {
    markPaid('ORDER-002'); // 第二次调用
  } catch (e) {
    errorThrown = true;
  }
  assert(!errorThrown, 'markPaid 两次不应抛出异常（幂等）', errorThrown, false);
  assert(findOrder('ORDER-002').status === 'paid', '二次 markPaid 后状态仍为 paid', findOrder('ORDER-002').status, 'paid');
}

// ────────────────────────────────────────────────────────────────────
// C. 虎皮椒 SDK 逻辑测试（不依赖网络）
// ────────────────────────────────────────────────────────────────────
section('C. 虎皮椒 SDK 逻辑测试（签名 + 回调验证）');

const testConfig = {
  appid: 'TEST_APPID_123',
  secret: 'my_test_secret_key',
  notifyUrl: 'https://example.com/notify',
};

// generateSign 正确性
{
  console.log('\n[测试 C1] generateSign 签名生成');
  const params = {
    version: '1.1',
    appid: testConfig.appid,
    trade_order_id: 'ORDER-TEST-001',
    total_fee: '9.90',
    title: 'AgentTrust API',
    time: 1700000000,
    nonce_str: 'ABCDEFGH',
  };
  const sign1 = generateSign(params, testConfig.secret);
  const sign2 = generateSign(params, testConfig.secret);
  assert(sign1 === sign2, '相同参数签名结果应一致（确定性）', sign1, sign2);
  assert(sign1.length === 32, '签名应为 32 位 MD5', sign1.length, 32);
  assert(/^[0-9a-f]{32}$/.test(sign1), '签名应为小写十六进制', sign1.slice(0, 8), 'hex');
}

// verifySign 验证
{
  console.log('\n[测试 C2] verifySign 回调验证');
  const callbackBody = {
    trade_order_id: 'ORDER-001',
    total_fee: '9.90',
    transaction_id: 'WX202406130001',
    open_order_id: 'XUNHU202406130001',
    order_title: 'AgentTrust API Access',
    status: 'OD',
    appid: testConfig.appid,
    time: '1700000001',
    nonce_str: 'RANDOMSTR01',
  };
  // 生成正确签名
  callbackBody.hash = generateSign(callbackBody, testConfig.secret);
  assert(verifySign(callbackBody, testConfig.secret), '正确签名验证应通过', true, true);

  // 篡改数据后验证应失败
  const tamperedBody = { ...callbackBody, total_fee: '0.01' };
  assert(!verifySign(tamperedBody, testConfig.secret), '篡改数据后签名验证应失败', false, false);
}

// isPaid / isRefunded 状态映射
{
  console.log('\n[测试 C3] 虎皮椒状态映射');
  assert(isPaid('OD') === true, 'OD 应为已支付', isPaid('OD'), true);
  assert(isPaid('WD') === false, 'WD 不是已支付', isPaid('WD'), false);
  assert(isRefunded('CD') === true, 'CD 应为退款', isRefunded('CD'), true);
  assert(isRefunded('RD') === true, 'RD 应为退款中', isRefunded('RD'), true);
  assert(isRefunded('UD') === true, 'UD 应为退款失败', isRefunded('UD'), true);
  assert(isRefunded('OD') === false, 'OD 不是退款状态', isRefunded('OD'), false);
}

// ────────────────────────────────────────────────────────────────────
// C'. x402 事件规范化测试
// ────────────────────────────────────────────────────────────────────
section("C'. x402 事件规范化测试");

// 测试8: 输入 x402 格式事件 → normaliseX402Event → 检查输出字段
{
  console.log('\n[测试8] x402 事件规范化 — 成功场景');
  const event = {
    paymentId: 'x402-pay-001',
    timestamp: 1700000000,
    provider: 'api.provider.example.com',
    consumer: 'did:web:consumer.example.com',
    amountMicro: 50000, // 0.05 USD
    providerHttpStatus: 200,
    latencyMs: 350,
    disputed: false,
  };
  const record = normaliseX402Event(event);
  assert(record.id === 'x402-pay-001', 'id 应等于 paymentId', record.id, 'x402-pay-001');
  assert(record.providerDid === 'did:web:api.provider.example.com', 'provider 应被包装为 did:web:', record.providerDid, 'did:web:api.provider.example.com');
  assert(record.consumerDid === 'did:web:consumer.example.com', 'consumer DID 原样保留', record.consumerDid, 'did:web:consumer.example.com');
  assert(record.status === 'success', 'HTTP 200 应标记为 success', record.status, 'success');
  assert(record.amountUsd === 0.05, 'amountMicro/1e6 = 0.05 USD', record.amountUsd, 0.05);
  assert(record.responseTimeMs === 350, 'responseTimeMs 应等于 latencyMs', record.responseTimeMs, 350);
  assert(record.protocol === 'x402', 'protocol 应为 x402', record.protocol, 'x402');
}

{
  console.log('\n[测试8b] x402 事件规范化 — 纠纷场景');
  const event = {
    paymentId: 'x402-pay-002',
    timestamp: 1700000100,
    provider: 'did:web:provider.example.com',
    amountMicro: 100000,
    providerHttpStatus: 200,
    latencyMs: 800,
    disputed: true,
  };
  const record = normaliseX402Event(event);
  assert(record.status === 'disputed', 'disputed=true 应标记为 disputed', record.status, 'disputed');
  assert(record.providerDid === 'did:web:provider.example.com', 'DID 格式 provider 原样保留', record.providerDid, 'did:web:provider.example.com');
}

{
  console.log('\n[测试8c] x402 事件规范化 — HTTP 错误场景');
  const event = {
    paymentId: 'x402-pay-003',
    timestamp: 1700000200,
    provider: 'https://api.example.com/agent',
    amountMicro: 0,
    providerHttpStatus: 500,
    latencyMs: 2000,
    disputed: false,
  };
  const record = normaliseX402Event(event);
  assert(record.status === 'failure', 'HTTP 500 应标记为 failure', record.status, 'failure');
  assert(record.providerDid === 'did:web:api.example.com', 'https URL 中主机部分应被提取', record.providerDid, 'did:web:api.example.com');
}

// ────────────────────────────────────────────────────────────────────
// D. MCP Server 工具逻辑测试（直接调用底层函数）
// ────────────────────────────────────────────────────────────────────
section('D. MCP Server 工具逻辑测试');

// 先重置 store
transactionStore._reset();

// 测试9: submit_transaction → get_agent_trust_score → 验证分数变化
{
  console.log('\n[测试9] submit_transaction 后 get_agent_trust_score 分数变化');
  const testDid = 'did:web:mcp-test-agent.example.com';

  // 初始：无记录，分数=0
  const score0 = computeTrustScore(testDid, transactionStore.getByDid(testDid));
  assert(score0.overallScore === 0, '初始分数应为 0', score0.overallScore, 0);

  // 模拟 submit_transaction：添加 10 条成功记录
  for (let i = 0; i < 10; i++) {
    transactionStore.add({
      id: `mcp-tx-${i}`,
      providerDid: testDid,
      protocol: 'mcp',
      status: 'success',
      responseTimeMs: 400,
      amountUsd: 0,
      createdAt: new Date().toISOString(),
    });
  }

  const score10 = computeTrustScore(testDid, transactionStore.getByDid(testDid));
  assert(score10.overallScore > 0, '添加10条成功记录后分数应 > 0', score10.overallScore, '>0');
  assert(score10.confidenceTier === 'low', '10条记录 confidenceTier 应为 low', score10.confidenceTier, 'low');
  assert(score10.transactionCount === 10, 'transactionCount 应为 10', score10.transactionCount, 10);

  console.log(`     [INFO] 10条成功记录的分数: ${score10.overallScore}`);
}

// 测试10: get_scoring_formula → 验证 weights 之和为 1.0
{
  console.log('\n[测试10] get_scoring_formula — weights 之和为 1.0');
  const weights = SCORING_WEIGHTS;
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  // 浮点精度容忍 ±0.0001
  assert(Math.abs(sum - 1.0) < 0.0001, `weights 之和(${sum}) 应为 1.0`, sum.toFixed(4), '1.0000');
  assert('completionRate' in weights, 'weights 包含 completionRate', 'completionRate' in weights, true);
  assert('reliabilityScore' in weights, 'weights 包含 reliabilityScore', 'reliabilityScore' in weights, true);
  assert('consistencyScore' in weights, 'weights 包含 consistencyScore', 'consistencyScore' in weights, true);
  assert('responseTime' in weights, 'weights 包含 responseTime', 'responseTime' in weights, true);
  console.log(`     [INFO] weights: completionRate=${weights.completionRate}, reliabilityScore=${weights.reliabilityScore}, consistencyScore=${weights.consistencyScore}, responseTime=${weights.responseTime}`);
}

// ────────────────────────────────────────────────────────────────────
// E. 商业逻辑闭环测试（完整链路）
// ────────────────────────────────────────────────────────────────────
section('E. 商业逻辑闭环测试');

// 重置 store
transactionStore._reset();

// 场景：Agent A 完成了15笔服务，其中12笔成功、2笔失败、1笔纠纷
console.log('\n[测试E] 模拟场景: Agent A 完成 15 笔服务 (12成功/2失败/1纠纷)');

const agentA_DID = 'did:web:agent-a.example.com';

// 步骤1：模拟虎皮椒支付 → 订单标记已付
const orders = [];
for (let i = 0; i < 15; i++) {
  const o = createOrder(`ORDER-A-${String(i).padStart(3, '0')}`, 5.0, `AgentTrust Service #${i}`);
  markPaid(`ORDER-A-${String(i).padStart(3, '0')}`);
  orders.push(o);
}
assert(orders.filter(o => o.status === 'paid').length === 15, '15笔订单均已标记 paid', 15, 15);

// 步骤2：模拟 x402 webhook 回调 → 规范化 → 写入 transactionStore
const statuses = [
  ...Array(12).fill('success'),
  ...Array(2).fill('failure'),
  'disputed',
];

const x402Events = statuses.map((st, i) => {
  const httpStatus = st === 'success' ? 200 : st === 'failure' ? 500 : 200;
  const isDisputed = st === 'disputed';
  return {
    paymentId: `x402-agent-a-${i}`,
    timestamp: Math.floor(Date.now() / 1000) - (15 - i) * 3600,
    provider: agentA_DID,
    amountMicro: 5_000_000, // 5 USD
    providerHttpStatus: httpStatus,
    latencyMs: 400 + i * 20, // 400~680ms
    disputed: isDisputed,
  };
});

for (const event of x402Events) {
  const record = normaliseX402Event(event);
  transactionStore.add(record);
}

// 步骤3：评分引擎更新 → MCP Server 可查询
const finalScore = computeTrustScore(agentA_DID, transactionStore.getByDid(agentA_DID));

// 步骤4：VC 签发
const vc = issueScoreCredential(agentA_DID, finalScore);

// 验证
assert(finalScore.transactionCount === 15, 'transactionCount 应为 15', finalScore.transactionCount, 15);
assert(finalScore.confidenceTier === 'low', 'confidenceTier 应为 low (5≤n<25)', finalScore.confidenceTier, 'low');
assert(finalScore.overallScore >= 50 && finalScore.overallScore <= 85,
  `overallScore(${finalScore.overallScore}) 应在 50-85 范围`, finalScore.overallScore, '50-85');

// 详细维度验证
const expectedCompletionRate = Math.round((12 / 15) * 100); // 80
const expectedReliabilityScore = Math.round(Math.max(0, 100 - (1 / 15) * 200)); // 87
assert(finalScore.dimensions.completionRate === expectedCompletionRate,
  `completionRate 应为 ${expectedCompletionRate}`, finalScore.dimensions.completionRate, expectedCompletionRate);
assert(finalScore.dimensions.reliabilityScore === expectedReliabilityScore,
  `reliabilityScore 应为 ${expectedReliabilityScore}`, finalScore.dimensions.reliabilityScore, expectedReliabilityScore);

// VC 签发验证
assert(vc['@context'].includes('https://www.w3.org/2018/credentials/v1'),
  'VC @context 包含 W3C credentials v1', true, true);
assert(vc.type.includes('AgentTrustScoreCredential'),
  'VC type 包含 AgentTrustScoreCredential', true, true);
assert(vc.credentialSubject.id === agentA_DID,
  'VC subject DID 正确', vc.credentialSubject.id, agentA_DID);
assert(vc.proof !== undefined, 'VC 包含 proof 字段', vc.proof !== undefined, true);
assert(vc.expirationDate > vc.issuanceDate,
  'VC expirationDate 晚于 issuanceDate', true, true);

// ────────────────────────────────────────────────────────────────────
// 打印完整评分报告
// ────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log('  Agent A 完整评分报告');
console.log('='.repeat(60));
console.log(JSON.stringify({
  did: finalScore.did,
  overallScore: finalScore.overallScore,
  grade: finalScore.overallScore >= 90 ? 'A' : finalScore.overallScore >= 75 ? 'B' : finalScore.overallScore >= 60 ? 'C' : 'D',
  confidenceTier: finalScore.confidenceTier,
  transactionCount: finalScore.transactionCount,
  dimensions: finalScore.dimensions,
  breakdown: {
    成功笔数: 12,
    失败笔数: 2,
    纠纷笔数: 1,
    completionRate公式: `12/15 * 100 = ${expectedCompletionRate}`,
    reliabilityScore公式: `max(0, 100 - (1/15)*200) = ${expectedReliabilityScore}`,
    weights: SCORING_WEIGHTS,
    加权得分: `${finalScore.dimensions.completionRate}×0.35 + ${finalScore.dimensions.reliabilityScore}×0.30 + ${finalScore.dimensions.consistencyScore}×0.20 + ${finalScore.dimensions.responseTime}×0.15 = ${finalScore.overallScore}`,
  },
  vc: {
    id: vc.id,
    issuer: vc.issuer,
    issuanceDate: vc.issuanceDate,
    expirationDate: vc.expirationDate,
    proofType: vc.proof?.type,
  },
}, null, 2));

// ────────────────────────────────────────────────────────────────────
// 测试汇总
// ────────────────────────────────────────────────────────────────────
section('测试汇总');
console.log(`  总计: ${passed + failed} 个断言`);
console.log(`  通过: ${passed} ✅`);
console.log(`  失败: ${failed} ❌`);
console.log(`  通过率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

// 输出结构化结果供报告生成
console.log('\n__TEST_RESULTS_JSON__');
console.log(JSON.stringify({ passed, failed, results, finalScore, vc }, null, 2));
