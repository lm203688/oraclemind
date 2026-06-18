# 🛡️ AIShield MCP Server

AI工具安全审计与认证平台 — 让AI工具值得信任

[![AIShield](https://aishield.ai/api/v1/badge-name/AIShield)](https://aishield.ai)

## 功能

- **🔍 安全扫描** — 扫描MCP/GPT/Skill/Prompt的安全风险
- **📊 四维评分** — 安全/隐私/质量/性能四维打分
- **🏷️ 认证徽章** — 生成可嵌入README的安全认证徽章
- **📦 批量扫描** — 一次扫描多个工具（Pro/Enterprise）
- **🤖 MCP原生** — 直接在Claude等AI Agent中使用

## 安装

### Claude Desktop

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "aishield": {
      "command": "python",
      "args": ["/path/to/aishield/mcp/server.py"]
    }
  }
}
```

### Smithery

```bash
npx @smithery/cli install aishield
```

## 使用示例

在Claude中直接说：

> "帮我扫描 https://github.com/anthropics/claude-code 这个MCP工具的安全风险"

> "查看MCP Python SDK的安全评分"

> "批量扫描这些MCP工具：[URL列表]"

## 工具列表

| 工具 | 说明 |
|------|------|
| `scan_ai_tool` | 扫描AI工具安全风险，返回四维评分 |
| `get_security_badge` | 获取安全徽章信息 |
| `batch_scan` | 批量扫描（最多10个） |

## 评分体系

| 徽章 | 分数 | 含义 |
|------|------|------|
| 🥇 Gold | 85-100 | 安全可信，推荐使用 |
| 🥈 Silver | 70-84 | 基本安全，需关注部分问题 |
| 🥉 Bronze | 50-69 | 存在风险，谨慎使用 |
| ⚠️ None | <50 | 严重风险，不建议使用 |

## 定价

| 版本 | 价格 | 每日扫描 | 认证徽章 | 批量扫描 |
|------|------|----------|----------|----------|
| 免费版 | ¥0/月 | 3次 | ❌ | ❌ |
| Pro版 | ¥99/月 | 100次 | ✅ | ✅ |
| 企业版 | ¥499/月 | 无限 | ✅ | ✅ |

## API接入

```bash
# 申请API Key
curl -X POST https://aishield.ai/api/v1/keys \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","tier":"free"}'

# 提交扫描
curl -X POST https://aishield.ai/api/v1/audit \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"tool_type":"mcp","source_url":"https://github.com/user/mcp-server"}'
```

## License

MIT
