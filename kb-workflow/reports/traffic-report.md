# Cloudflare Pages 周报

**报告周期：** 2026-06-15 ~ 2026-06-21  
**生成时间：** 2026-06-22 11:20 (Asia/Shanghai)

---

## 1. 部署状态

全部 **12/12** 知识库站点部署成功 ✅

| # | 站点目录 | 项目名 | 自定义域名 | 部署日期 | 状态 |
|---|---------|--------|-----------|----------|------|
| 1 | genetech-tools | genetech-tools | genetech.tools | 2026-06-22 | ✅ |
| 2 | tcm-tools | tcm-tools | tcm.genetech.tools | 2026-06-22 | ✅ |
| 3 | agent-ecosystem | agentecosystem | agent.genetech.tools | 2026-06-22 | ✅ |
| 4 | robot-parts | robotparts | robot.genetech.tools | 2026-06-22 | ✅ |
| 5 | quantum-computing | quantumcomputing | quantum.genetech.tools | 2026-06-22 | ✅ |
| 6 | brain-science | brainscience | brain.genetech.tools | 2026-06-22 | ✅ |
| 7 | nuclear-energy | nuclearenergy | nuclear.genetech.tools | 2026-06-22 | ✅ |
| 8 | exo-science | exoscience | exo.genetech.tools | 2026-06-22 | ✅ |
| 9 | alien-minerals | alienminerals | mineral.genetech.tools | 2026-06-22 | ✅ |
| 10 | deep-sea-tech | deepseatech | deepsea.genetech.tools | 2026-06-22 | ✅ |
| 11 | new-energy | newenergy | energy.genetech.tools | 2026-06-21 | ✅ |
| 12 | life-science | lifescience | life.genetech.tools | 2026-06-21 | ✅ |

---

## 2. ATEX 平台健康检查

**端点：** http://150.158.119.19:8420

### 基本状态
| 指标 | 值 |
|------|-----|
| 平台版本 | 6.0 |
| 注册用户 | 46 |
| 服务数 | 23 |
| 挂单数 | 3 |
| 总交易数 | 2 |
| 总佣金 | ¥66.87 |
| 最新价格 | ¥1.5 |
| 日交易量 | 0 |
| 佣金费率 | maker 3.0% / taker 5.0% |

### 端点检查
| 端点 | 状态 |
|------|------|
| `/api/v1/status` | ✅ 正常 |
| `/llms.txt` | ✅ 正常（含4个合规工具 + 12个AI能力） |
| `/.well-known/ai-plugin.json` | ✅ 正常（schema v1） |

---

## 3. Cloudflare 流量数据

> ⚠️ 注意：当前API Token缺少 Zone Analytics Read 权限，无法获取域名级HTTP请求统计。以下为 Pages Functions 调用数据。

### Pages Functions 调用（近7天）

| 日期 | 请求数 |
|------|--------|
| 2026-06-15 ~ 06-19 | 0（无数据） |
| 2026-06-20 | 263 |
| 2026-06-21 | 34 |
| **合计** | **297** |

### 自定义域名清单
12个站点全部绑定 `*.genetech.tools` 子域名：
- genetech.tools（主站）
- tcm / agent / robot / quantum / brain / nuclear / exo / mineral / deepsea / energy / life .genetech.tools

---

## 4. 总结

- **部署：** 12/12 站点全部部署成功，10个于本周日更新，2个保持上周部署
- **ATEX：** 平台运行正常，46用户，23个服务在线，合规工具+AI能力均可用
- **流量：** 本周Pages Functions调用297次（6/20-6/21有数据），流量较低
- **建议：** 
  - 为API Token添加 `Zone Analytics Read` 权限以获取完整流量数据
  - 本周流量偏低，可考虑增加内容更新频率和SEO优化
