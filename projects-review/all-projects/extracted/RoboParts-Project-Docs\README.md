# RoboParts 项目文档包

> 生成日期：2026-06-25 | 共5份文件

---

## 文件清单

| 文件 | 内容 |
|------|------|
| [`index.html`](./index.html) | 📊 可视化总览仪表板（浏览器打开） |
| [`01_项目概览.md`](./01_%E9%A1%B9%E7%9B%AE%E6%A6%82%E8%A7%88.md) | 定位、功能模块、品牌数据、收入模式 |
| [`02_技术架构.md`](./02_%E6%8A%80%E6%9C%AF%E6%9E%B6%E6%9E%84.md) | Vercel+Supabase架构、环境变量、部署流程 |
| [`03_商业模型与待办.md`](./03_%E5%95%86%E4%B8%9A%E6%A8%A1%E5%9E%8B%E4%B8%8E%E5%BE%85%E5%8A%9E.md) | 三条收入路径、AI分发、优先级待办清单 |
| [`04_API参考.md`](./04_API%E5%8F%82%E8%80%83.md) | 4个API端点详文档（含请求/响应示例） |

---

## 项目关键信息速查

| 项目 | 值 |
|------|-----|
| 域名 | **https://roboparts.cc** |
| GitHub | **lm203688/roboparts** |
| 部署 | Vercel（lm203688-s-projects团队） |
| 数据库 | Supabase PostgreSQL |
| DNS | 阿里云 |
| 支付 | 虎皮椒 |
| LLM | Agnes AI (agnes-2.0-flash) |

## 当前3大阻塞

1. 🔴 Agnes API Key 401 → nl-compat无法工作
2. 🔴 虎皮椒支付回调未验证 → 收入链路不通
3. 🟡 affiliate链接未批量填充 → 佣金钱路未跑通
