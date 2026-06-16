# ATEX 快速上手指南（用户版）

## 30秒上手 ATEX

### 第1步：获取API Key

1. 打开 https://lm203688.github.io/atex/
2. 点击「开始使用」
3. 点击「创建账户」，获得你的API Key
4. 记住你的Key，后面都要用

### 第2步：充值

1. 打开 https://genetech.tools/credits.html
2. 选择金额，支付宝扫码支付
3. 余额永不过期，用多少扣多少

### 第3步：开始使用

---

## 🛡️ 违禁词检测

**网页版：**
1. 打开 https://lm203688.github.io/atex/
2. 点击「中文违禁词检测」
3. 输入你的文案，选择平台
4. 点击检测，1毛钱出结果

**API版：**
```bash
curl -X POST http://150.158.119.19:8420/api/v1/services/buy \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "svc_046",
    "args": {
      "text": "全网最低价！限时抢购！",
      "platform": "douyin"
    }
  }'
```

---

## 🔍 AI搜索可见度检测

**API版：**
```bash
curl -X POST http://150.158.119.19:8420/api/v1/services/buy \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "svc_047",
    "args": {
      "brand": "你的品牌名",
      "keywords": ["相关关键词1", "关键词2"]
    }
  }'
```

---

## 🎙️ TTS语音合成

```bash
curl -X POST http://150.158.119.19:8420/api/v1/services/buy \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "svc_049",
    "args": {
      "text": "大家好，欢迎来到我的频道",
      "voice": "xiaochen"
    }
  }'
```

---

## 🔬 知识库搜索

```bash
curl -X POST http://150.158.119.19:8420/mcp \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "knowledge_search",
      "arguments": {
        "query": "CRISPR基因编辑",
        "engine": "genetech"
      }
    }
  }'
```

---

## 🤖 MCP接入（Claude/Cursor用户）

### Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`（Mac）
或 `%APPDATA%\Claude\claude_desktop_config.json`（Windows）

添加：
```json
{
  "mcpServers": {
    "atex": {
      "command": "npx",
      "args": ["-y", "github:lm203688/atex/mcp-server"],
      "env": {
        "ATEX_API_KEY": "你的API Key"
      }
    }
  }
}
```

重启Claude Desktop，你的AI助手就拥有了23个工具+12个知识库。

### Cursor / Windsurf

在MCP设置中添加同样的配置即可。

---

## 💬 AI对话（OpenAI兼容）

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://150.158.119.19:8420/v1",
    api_key="YOUR_API_KEY"
)

# 用DeepSeek
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "你好"}]
)

# 切换到GPT-4o
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}]
)
```

---

## 💰 价格速查

| 工具 | 价格 | 说明 |
|------|------|------|
| 违禁词检测 | ¥0.1/次 | 最便宜，1毛钱 |
| SEO合规 | ¥1/次 | |
| AI搜索可见度 | ¥2/次 | |
| TTS/ASR | ¥2/次 | |
| VLM图像理解 | ¥3/次 | |
| Web搜索 | ¥5/次 | |
| 图片生成/编辑 | ¥5/次 | |
| 视频生成 | ¥10/次 | |
| 出海合规 | ¥8/次 | |
| 知识库搜索 | ¥0.5/次 | |
| AI对话 | 按token | |

**核心：按次计费，无月费，余额永不过期**

---

有问题？发邮件到 61960005@qq.com
