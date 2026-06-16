# ATEX MCP Server — 合规工具 + AI能力平台

> 让每个AI Agent都能调用中国合规检测和AI能力。MCP协议，按次计费，支付宝充值。

[![MCP](https://img.shields.io/badge/MCP-2025--03--26-blue)](http://150.158.119.19:8420/mcp)
[![Smithery](https://img.shields.io/badge/Smithery-Submit-green)](https://smithery.ai)
[![Services](https://img.shields.io/badge/Services-27-orange)](http://150.158.119.19:8420/api/v1/services)

## 🎯 为什么需要ATEX？

当你的AI Agent遇到这些场景时，ATEX可以立即解决：

| 用户说... | ATEX工具 | 价格 |
|-----------|---------|------|
| "帮我检查小红书文案有没有违禁词" | `cn_banned_word_check` | ¥0.1/次 |
| "我的品牌在DeepSeek里搜不到" | `ai_search_visibility` | ¥2.0/次 |
| "产品想出海，合规风险大吗" | `global_compliance_check` | ¥8.0/次 |
| "这篇文章SEO合规吗" | `seo_compliance_check` | ¥1.0/次 |
| "帮我把这段文字转成语音" | `tts_synthesis` | ¥2.0/次 |
| "识别这张图片里的文字" | `vlm_understand` | ¥3.0/次 |
| "生成一张营销配图" | `image_generate` | ¥5.0/次 |
| "搜索一下最新的AI新闻" | `web_search_ai` | ¥5.0/次 |

## 🔧 27个MCP工具

### 合规工具（4个）
- **cn_banned_word_check** — 当用户要发布小红书/抖音/微信内容时，检测文案中的违禁词和敏感词，避免被限流或封号。支持6大平台，返回法律条文+罚款金额+替换建议。
- **ai_search_visibility** — 当用户关心品牌在AI搜索引擎中的曝光时，检测品牌在DeepSeek/Kimi/豆包等AI搜索中的排名和可见度。
- **global_compliance_check** — 当用户的产品要出海时，7维度评估合规风险（数据隐私/内容审核/支付/知识产权/税务/本地化/安全）。
- **seo_compliance_check** — 当用户担心网页被搜索引擎惩罚时，检测SEO合规性（关键词堆砌/隐藏文本/虚假描述）。

### AI能力（8个）
- **tts_synthesis** — 当用户需要配音/口播/有声读物时，将文本转为自然语音。
- **asr_recognition** — 当用户需要语音转文字时，支持WAV/MP3。
- **vlm_understand** — 当用户需要分析图片/OCR/物体检测时。
- **image_generate** — 当用户需要AI生成图片时。
- **image_edit** — 当用户需要编辑/修改现有图片时。
- **video_generate** — 当用户需要生成短视频片段时（5秒/片段）。
- **web_search_ai** — 当用户需要搜索实时信息时。
- **web_reader** — 当用户需要提取网页正文内容时。

### 知识引擎（3个）
- **knowledge_engines_list** — 列出12个前沿科技知识引擎（免费）。
- **knowledge_search** — 搜索基因技术/中医药/量子计算/脑科学等12个领域。
- **knowledge_entity_detail** — 获取特定实体的详细信息。

### 其他工具（12个）
- chat, check_balance, list_models, list_services, book_distill, skill_query, vector_optimize, token_slim, browser_act, cyber_skill_lookup, cyber_skill_generate, web_search

## 🚀 快速接入

### 方式1：MCP协议（推荐）

ATEX MCP端点：`http://150.158.119.19:8420/mcp`

**Claude Desktop** 配置：
```json
{
  "mcpServers": {
    "atex": {
      "url": "http://150.158.119.19:8420/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_ATEX_API_KEY"
      }
    }
  }
}
```

**Cursor** 配置：
```json
{
  "mcpServers": {
    "atex": {
      "url": "http://150.158.119.19:8420/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_ATEX_API_KEY"
      }
    }
  }
}
```

### 方式2：REST API

```bash
# 违禁词检测
curl -X POST http://150.158.119.19:8420/api/v1/services/svc_046/call \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "这个产品最牛逼全网第一", "platform": "douyin"}'

# AI搜索可见度
curl -X POST http://150.158.119.19:8420/api/v1/services/svc_047/call \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"brand": "你的品牌名", "queries": ["你的品牌 推荐", "你的品牌 怎么样"]}'
```

### 方式3：OpenAI Plugin

ATEX已兼容OpenAI Plugin协议：
- Plugin清单：`http://150.158.119.19:8420/.well-known/ai-plugin.json`
- OpenAPI规范：`http://150.158.119.19:8420/api/v1/openapi.json`

## 💰 定价

- **免费额度**：每天5次免费检测
- **违禁词检测**：¥0.1/次（最便宜的中国合规检测）
- **AI能力**：¥1-10/次
- **充值方式**：支付宝扫码，1 ATEX = ¥1

## 🏢 关于ATEX

ATEX是GeneTech生态的合规+AI能力平台，提供4个中国合规工具和8大AI能力，按次计费，MCP协议兼容。

- 🌐 官网：https://atex.genetech.tools
- 📖 文档：http://150.158.119.19:8420/llms.txt
- 🔌 MCP端点：http://150.158.119.19:8420/mcp
- 🤖 AI Plugin：http://150.158.119.19:8420/.well-known/ai-plugin.json

---

*Part of [GeneTech Ecosystem](https://genetech.tools) — 12个前沿科技知识引擎*
