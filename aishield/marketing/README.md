# 🛡️ 你的MCP工具安全吗？AIShield免费帮你查

> 腾讯朱雀实验室扫描发现**4000+个MCP安全风险**，Palo Alto Unit42确认MCP存在Prompt注入数据窃取攻击向量，WhatsApp MCP已被利用泄露聊天记录。

## MCP安全事件时间线

| 时间 | 事件 | 影响 |
|------|------|------|
| 2025.04 | WhatsApp MCP被利用 | 聊天记录外泄 |
| 2025.05 | GitHub MCP Prompt注入 | 数据窃取 |
| 2025.06 | Asana MCP漏洞 | 项目数据泄露 |
| 2025.09 | 腾讯朱雀实验室报告 | 4000+ MCP安全风险 |

**你的MCP工具可能正在泄露数据，而你不知道。**

## AIShield — 一键扫描，5秒出报告

```bash
# 免费扫描你的MCP工具
curl -X POST https://aishield.ai/api/v1/audit \
  -H "Content-Type: application/json" \
  -d '{"tool_type":"mcp","source_url":"你的GitHub仓库地址"}'
```

### 四维评分体系

- 🔒 **安全分** — Prompt注入、数据外传、命令注入检测
- 🛡️ **隐私分** — 数据收集、敏感信息泄露、隐私合规
- ⚙️ **质量分** — 代码质量、错误处理、依赖安全
- 🚀 **性能分** — 资源使用、超时风险、并发安全

### 安全认证徽章

扫描通过后获得可嵌入README的认证徽章：

```markdown
![AIShield](https://aishield.ai/api/v1/badge-name/你的工具名)
```

🥇 Gold (85-100分) | 🥈 Silver (70-84分) | 🥉 Bronze (50-69分)

## 在Claude中直接使用

AIShield已发布为MCP Server，在Claude Desktop中添加：

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

然后直接说："帮我扫描这个MCP工具的安全风险"

## 定价

| 版本 | 价格 | 每日扫描 | 认证徽章 | 批量扫描 |
|------|------|----------|----------|----------|
| 免费版 | ¥0 | 3次/天 | ❌ | ❌ |
| **Pro版** | **¥99/月** | 100次/天 | ✅ | ✅ |
| 企业版 | ¥499/月 | 无限 | ✅ | ✅+自定义规则 |

👉 [立即免费扫描](https://aishield.ai) | [申请API Key](https://aishield.ai/pricing)

---

*AIShield — 让AI工具值得信任 🌐*
