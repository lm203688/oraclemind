# 流量周报 2026-06-29

## Cloudflare Analytics

**状态**: 无法获取 — CF API Token (`cfut_j3cJdlzdFbPI2DdVodTncAJuNI8CvgcV6p5D3dXU8cf6b00b`) 仅有 Pages 部署权限，缺少 `zone.analytics.read` 权限。

**错误信息**: `Actor does not have permission 'com.cloudflare.api.account.zone.analytics.read' for zone af8613036b8aedcac17933ce230f30fd`

**解决方案**: 需在 Cloudflare Dashboard 创建包含 Zone Analytics Read 权限的新 API Token。

## 部署验证

| 站点 | Pages URL | 实体数 | 状态 |
|------|-----------|--------|------|
| genetech-tools | genetech-tools.pages.dev | 643 | ✅ 已部署 |
| tcm-tools | tcm-tools.pages.dev | 294 | ✅ 已部署 |

## AIShield 服务状态

| 服务 | 端点 | HTTP | 状态 |
|------|------|------|------|
| API Gateway | http://150.158.119.19:8420/api/v1/status | 200 | ⚠️ 品牌仍显示"ATEX" |
| 合规服务 | http://150.158.119.19:8450/api/v1/health | 200 | ✅ healthy (135 audits, 21 tools, v2.0.0) |
| llms.txt | http://150.158.119.19:8420/llms.txt | 200 | ✅ |
| ai-plugin.json | http://150.158.119.19:8420/.well-known/ai-plugin.json | 200 | ✅ |
| MCP dist | /home/z/my-project/aishield/mcp/dist/index.js | — | ✅ 文件存在 |

## SEO IndexNow 提交

| 项目 | 数量 |
|------|------|
| 14站GET提交 | 13站×2URL×3端点 = 78 |
| AIShield POST提交 | 6URL×3端点 = 18 |
| AIShield GET提交 | 3URL×3端点 = 9 |
| POST批量提交 | ~43 |
| **总计** | **148条** |
| 成功 (200/202) | 141 (95.3%) |
| 失败 (Yandex 403) | 7 (4.7%) |

## 渠道收录状态

| 渠道 | 状态 | 备注 |
|------|------|------|
| Smithery | 404 | 未收录 @aishield/mcp-server |
| Glama | 404 | 未收录 |
| mcp.so | 403 | Cloudflare封锁 |
| npm | Not found | @aishield/mcp-server 未发布 |
| GitHub lm203688/aishield | 0 stars, 0 forks | 仓库存在，无社区互动 |
| Bing site:genetech.tools | 无数据 | 未显示收录数 |

## 待修复项

1. **AIShield API 8420 品牌未更新**: status返回 `"exchange": "ATEX"`，应改为 `"aishield"`
2. **CF Analytics Token权限不足**: 需创建新Token含analytics读取权限
3. **npm包未发布**: @aishield/mcp-server 仍未发布到npm registry
4. **渠道收录全空白**: Smithery/Glama/mcp.so均未收录AIShield MCP
5. **Bing收录不可见**: 需手动在Bing Webmaster Tools查看
