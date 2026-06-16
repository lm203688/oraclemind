# Credits System Architecture

## Flow
```
User → Payment Platform (LemonSqueezy/Bekena/Alipay)
         ↓ webhook
      API Gateway (Cloudflare Worker)
         ↓ verify signature
      Credits Service
         ↓ add credits
      User Account (KV store)
         ↓
      Platform Services (API calls, data export, Pro features)
```

## Payment Channels
1. **LemonSqueezy** (global, credit card/PayPal/Apple Pay)
   - Money held by LS, withdraw monthly
   - Webhook: order_created, subscription_created
   - Fee: ~8.4%

2. **Bekena** (crypto, USDT/USDC)
   - Money goes to your wallet directly
   - Webhook: payment_confirmed
   - Fee: 1%

3. **Alipay** (China, manual)
   - Direct to your account
   - Manual confirmation via email
   - Fee: 0.6%

## Credits Pricing
- 1 credit = $0.01 (1美分)
- API call: 1 credit
- Entity detail: 1 credit
- Data export (JSON): 10 credits
- Full category export: 50 credits
- Pro monthly: 990 credits ($9.90)
- Pro annual: 9900 credits ($99)

## Withdrawal Schedule
- LemonSqueezy: monthly auto-payout
- Bekena: instant to your wallet
- Alipay: instant to your account
