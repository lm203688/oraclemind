# agent-trust-xunhupay

> WeChat Pay & Alipay SDK for Chinese individual developers — accept payments without a business license. No merchant account needed.

[![npm version](https://img.shields.io/npm/v/agent-trust-xunhupay.svg)](https://www.npmjs.com/package/agent-trust-xunhupay) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**个人开发者微信支付宝收款 SDK** — 无需企业资质，无需对公账户，个人即可接入微信支付和支付宝收款。

## The Problem

Chinese indie developers need to accept WeChat Pay & Alipay, but they can't get business licenses. Official payment APIs require company registration (企业资质), bank merchant accounts (对公账户), and months of review. For solo developers building SaaS, bots, or agent services, this is a dealbreaker.

**agent-trust-xunhupay** solves this: a single SDK + optional full payment service that lets any individual developer start collecting payments in minutes — not months.

---

## Part A: SDK (npm library)

Lightweight SDK for creating orders, verifying callbacks, and querying status. Zero framework dependency — works with Express, Koa, Next.js, or any Node.js project.

### Install

```bash
npm install agent-trust-xunhupay
```

### Quick Start

```typescript
import { XunhupayClient } from 'agent-trust-xunhupay';

const client = new XunhupayClient({
  appid: '201906181178',
  secret: 'your-secret-key',
  notifyUrl: 'https://your-domain.com/api/payment/callback',
  returnUrl: 'https://your-domain.com/success',
});
```

### createOrder

Create a payment order — returns both QR-code URL (for desktop) and redirect URL (for mobile). The SDK auto-detects WeChat vs Alipay based on user agent.

```typescript
const result = await client.createOrder({
  tradeOrderId: 'ORDER_' + Date.now(),
  totalFee: 9.9,
  title: 'AI Agent Pro 月度订阅',
  type: 'alipay',          // optional: 'wechat' | 'alipay' | auto-detect
  nonce: 'custom-nonce',   // optional
});

// Desktop: show QR code
console.log(result.urlQrcode);  // https://qr.xunhupay.com/...

// Mobile: redirect
console.log(result.url);        // https://api.xunhupay.com/...
```

### verifyCallback

Verify and parse the payment callback from Xunhupay server. Returns decoded data if signature is valid; throws otherwise.

```typescript
import { verifyCallback, CALLBACK_SUCCESS } from 'agent-trust-xunhupay';

app.post('/api/payment/callback', (req, res) => {
  try {
    const callback = verifyCallback(req.body, {
      appid: '201906181178',
      secret: 'your-secret-key',
    });

    if (callback.status === 'OD') {
      // Payment confirmed
      console.log(`Paid: ${callback.total_fee} CNY for ${callback.trade_order_id}`);
      // ... fulfill order ...
    }

    res.send(CALLBACK_SUCCESS);  // "success" — required by Xunhupay
  } catch (err) {
    res.status(400).send(err.message);
  }
});
```

### queryOrder

Query order status by trade order ID.

```typescript
const order = await client.queryOrder('ORDER_1718083200000');
console.log(order.status);    // 'OD' = paid, 'WP' = waiting
console.log(order.totalFee);  // amount in CNY
```

---

## Part B: Full Service (Express + Pay Page)

A complete, ready-to-run payment service with Express server and a mobile-friendly payment page. One command to start collecting payments.

### Start

```bash
cd packages/xunhupay
npm run serve
# → Payment service running at http://localhost:3210
# → Pay page: http://localhost:3210/pay.html
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payment/create` | POST | Create order, returns pay URL + QR code |
| `/api/payment/callback` | POST | Xunhupay async callback (server-to-server) |
| `/api/payment/query/:id` | GET | Query order status by trade order ID |
| `/api/payment/orders` | GET | List all orders (dev mode) |

### Pay Page

Open `http://localhost:3210/pay.html` on any device — it auto-detects WeChat / Alipay / browser and renders the correct payment flow.

---

## Why Xunhupay?

| | WeChat Pay Official | Other Aggregators | **Xunhupay (this SDK)** |
|---|---|---|---|
| 个人可接入 | No (需企业资质) | Varies | **Yes** |
| 接入周期 | 1-3 个月 | 1-2 周 | **当天** |
| 微信 + 支付宝 | 需分别接入 | 大多支持 | **统一接口** |
| 前端页面 | 自行开发 | 自行开发 | **内置** |
| 最低费率 | 0.6% | 1-2% | **1%** |
| 技术文档 | 复杂 | 一般 | **简洁** |

Xunhupay (虎皮椒) is the most mature individual-payment gateway in China, serving 100k+ developers since 2017. It's the de facto standard for indie developers who need payment acceptance without a business license.

## Configuration Guide

### Step 1: Register

Sign up at [Xunhupay](https://www.xunhupay.com) with your personal WeChat account — no company needed.

### Step 2: Get Credentials

After registration, find your **AppID** and **AppSecret** in the dashboard:

```dotenv
XUNHUPAY_APPID=201906181178
XUNHUPAY_SECRET=your-secret-key
```

### Step 3: Configure Callback URL

Set your `notifyUrl` to a publicly accessible HTTPS endpoint (e.g., via ngrok during development):

```dotenv
XUNHUPAY_NOTIFY_URL=https://your-domain.com/api/payment/callback
XUNHUPAY_RETURN_URL=https://your-domain.com/success
```

### Full Config Reference

| Parameter | Required | Description | Default |
|-----------|----------|-------------|---------|
| `appid` | Yes | Xunhupay AppID | — |
| `secret` | Yes | Xunhupay AppSecret | — |
| `notifyUrl` | Yes | Server callback URL (must be HTTPS) | — |
| `returnUrl` | No | User redirect URL after payment | — |
| `apiUrl` | No | Xunhupay API endpoint | `https://api.xunhupay.com/payment/do.html` |

### Signature Algorithm

```
1. Sort all non-empty params by key (ASCII ascending)
2. Concatenate as key1=value1&key2=value2
3. Append AppSecret (no separator)
4. MD5 → 32-char lowercase hex
```

## Related Projects

| Package | Description |
|---------|-------------|
| [agent-trust-core](https://www.npmjs.com/package/agent-trust-core) | Core trust scoring & verification engine |
| [agent-trust-mcp-server](https://www.npmjs.com/package/agent-trust-mcp-server) | MCP server for agent trust queries |
| [agent-trust-x402-listener](https://www.npmjs.com/package/agent-trust-x402-listener) | x402 payment webhook → trust score pipeline |

## License

[MIT](https://opensource.org/licenses/MIT)
