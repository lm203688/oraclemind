# AgentTrust 生态目标项目分析报告

> 分析 5 个高潜力开源 Agent 项目的架构适配性，判断是否支持嵌入 Trust Layer 插件或中间件。
> 生成时间: 2026-06-18

---

## 1. obra/superpowers — Agentic Skills Framework

### 项目概况
- **GitHub:** https://github.com/obra/superpowers
- **定位:** 为编码 Agent（Claude Code、Codex、Cursor、OpenCode）提供可组合的技能框架
- **核心机制:** 将软件开发方法论封装为 14+ 可复用的"技能"（skills），通过自然语言指令让 Agent 遵循严格的开发流程
- **技术栈:** 基于 Markdown 和 JSON 配置文件，无特定编程语言依赖

### 架构分析
- **插件系统:** 纯基于自然语言指令（prompt-based）和文件系统约定，没有严格的 API/插件接口
- **技能加载:** 通过读取 `.skills/` 目录下的 Markdown 文件动态加载
- **中间件注入点:** ⚠️ 有限。Superpowers 是"方法论的容器"而非"代码框架"，没有传统意义上的中间件或钩子系统
- **信任验证需求:** 高。每个技能文件可能来自外部来源，需要验证其安全性和可靠性

### 集成建议
| 方案 | 可行性 | 说明 |
|------|--------|------|
| 技能安全验证插件 | 🟡 中等 | 在技能加载前，通过 AgentTrust 查询技能提供者的 DID 信任分，阻止低分技能执行 |
| 技能来源签名验证 | 🟡 中等 | 为每个技能文件添加 W3C VC 签名，确保未被篡改 |
| 方法论执行审计 | 🟢 高 | 在执行每个技能步骤时，记录到 AgentTrust 作为交易事件 |

### 最佳接触策略
**定位:** 安全验证插件提供者
**话术:** "Superpowers 让 Agent 遵循方法论，AgentTrust 确保这些方法论本身是可信的。我们可以为您的技能市场提供基于 DID 的提供者信誉系统。"
**PoC 方向:** 开发一个 Superpowers 的"信任技能"（trust-check skill），在加载任何外部技能前自动查询其发布者的信任分。

---

## 2. affaan-m/ECC — Agent Harness

### 项目概况
- **GitHub:** https://github.com/affaan-m/ECC
- **定位:** 开源 Agent Harness 性能优化系统（Claude Code、Codex、OpenCode、Cursor 等）
- **核心机制:** 28 个专用工具/改装套件，提升 Agent 的编码能力
- **规模:** 198K+ Stars，Anthropic x Forum Ventures 黑客松冠军项目
- **技术栈:** 混合技术栈，支持多种 IDE 和 CLI 工具

### 架构分析
- **插件系统:** 支持多种 Agent Harness（Claude Code、Codex、Cursor、OpenCode、Gemini、Zed、GitHub Copilot）
- **模块化程度:** 高。每个工具/功能独立可插拔
- **中间件注入点:** 🟢 高。作为"Harness"（马具），天然支持包裹和拦截 Agent 行为
- **安全模块:** 已有"安全"相关功能，与 Trust Protocol 核心目标（安全、记忆、研究）高度重合

### 集成建议
| 方案 | 可行性 | 说明 |
|------|--------|------|
| Harness 安全中间件 | 🟢 高 | 在 ECC 的"安全"模块中集成 AgentTrust 的签名验证，作为标准安全层 |
| 工具调用审计 | 🟢 高 | 拦截所有工具调用，在调用外部工具前查询提供者信任分 |
| 跨 Agent 身份验证 | 🟢 高 | ECC 支持多 Agent，AgentTrust 可为跨 Agent 协作提供身份和信任基础设施 |

### 最佳接触策略
**定位:** 安全模块增强合作伙伴
**话术:** "ECC 已经关注安全，AgentTrust 提供标准的、可审计的、跨 Agent 的信任基础设施。不是替代，是增强。"
**PoC 方向:** 为 ECC 开发一个"trust-guard"模块，在调用任何外部 API 或工具前，自动查询并验证其 AgentTrust 评分。

---

## 3. anthropics/skills — Anthropic 官方技能库

### 项目概况
- **GitHub:** https://github.com/anthropics/skills
- **定位:** Anthropic 官方开源的 Claude Agent 技能仓库
- **核心机制:** 17+ 预构建技能，标准化技能开发体系
- **规模:** 138K+ Stars（2026年5月数据），GitHub Trending 榜首
- **技术栈:** 基于 Claude 的 Skill 系统，支持自定义技能上传

### 架构分析
- **插件系统:** 官方 Skill 框架，有严格的 Skill 定义格式和加载机制
- **生态性质:** 闭源生态（Claude）的公开技能库，Anthropic 官方维护
- **中间件注入点:** 🔴 低。作为官方仓库，架构控制权在 Anthropic 手中，第三方难以直接修改
- **标准化程度:** 极高。Anthropic 定义了 Skill 标准，是事实上的行业标准之一

### 集成建议
| 方案 | 可行性 | 说明 |
|------|--------|------|
| 第三方信任验证标准提案 | 🟡 中等 | 提交 Issue 或 Discussion，建议 Anthropic 考虑开放第三方信任验证标准 |
| Skill 可信度标注 | 🟡 中等 | 为 Skill 市场提供"Verified by AgentTrust"徽章系统 |
| 社区倡导 | 🟢 高 | 在 Anthropic 社区中倡导信任验证的重要性，积累共识 |

### 最佳接触策略
**定位:** 标准倡导者 + 兼容证明者
**话术:** "Anthropic 定义了 Skill 标准，AgentTrust 可以证明您的 Skill 生态系统与第三方信任验证标准的兼容性。"
**PoC 方向:** 创建一个开源的"Anthropic Skill Trust Validator"工具，展示 AgentTrust 如何为任意 Skill 提供独立的可信度验证，然后向 Anthropic 社区展示。

---

## 4. langgenius/dify — LLM App 开发平台

### 项目概况
- **GitHub:** https://github.com/langgenius/dify
- **定位:** 生产级 LLM 应用开发平台（Dify = Define + Modify）
- **核心机制:** 可视化工作流设计器 + RAG + Agent 能力 + 模型管理
- **规模:** 生产级平台，被广泛部署
- **技术栈:** React 前端 + Python 后端，前后端分离架构

### 架构分析
- **插件系统:** 🟢 强大。支持自定义工具、模型、工作流节点
- **工作流节点:** 可视化拖拽组件，每个节点可以是一个自定义功能模块
- **中间件注入点:** 🟢 极高。作为"平台"，天然支持第三方扩展
- **用户基数:** 大。非技术用户也能使用，是推广 Trust Protocol 的绝佳渠道

### 集成建议
| 方案 | 可行性 | 说明 |
|------|--------|------|
| Trust Check 工作流节点 | 🟢 极高 | 开发 Dify 自定义节点，拖拽即可添加"信任验证"步骤 |
| Agent 身份验证插件 | 🟢 高 | 为 Dify 的 Agent 模块添加 DID 身份验证和信任分展示 |
| 工具市场信任徽章 | 🟢 高 | 在 Dify 的工具市场中为每个工具显示 AgentTrust 评分 |

### 最佳接触策略
**定位:** 平台插件开发者
**话术:** "Dify 让非技术用户构建 AI 应用，AgentTrust 让这些应用中的 Agent 和工具是可信赖的。一个拖拽节点，一键信任验证。"
**PoC 方向:** 开发一个 Dify 的"Trust Check"自定义节点，允许用户在任意工作流中插入"验证下一个 Agent/工具的 DID 信任分"步骤。提供完整的安装和使用文档。

---

## 5. anomalyco/opencode — 开源编码 Agent

### 项目概况
- **GitHub:** https://github.com/anomalyco/opencode
- **定位:** 开源 AI 编码 Agent（终端原生、模型无关）
- **核心机制:** Agent 编排层与底层模型解耦，支持切换 Claude、GPT、Gemini 等
- **规模:** 160K+ Stars，900+ 贡献者，13K+ 提交，750万+ 月活开发者
- **技术栈:** TypeScript，终端原生架构

### 架构分析
- **插件系统:** 🟢 有。支持扩展和中间件模式
- **模型无关设计:** 核心优势，Agent 编排层与模型解耦
- **中间件注入点:** 🟢 高。终端原生架构支持拦截和修改 Agent 行为
- **开发者社区:** 极活跃。750万月活开发者，是展示 Trust Protocol 的最佳用例
- **安全场景:** 代码生成场景中的恶意注入防护是天然需求

### 集成建议
| 方案 | 可行性 | 说明 |
|------|--------|------|
| 安全编码中间件 | 🟢 极高 | 在代码执行前，验证所有外部依赖和工具的 AgentTrust 评分 |
| 模型切换信任验证 | 🟢 高 | 当用户切换底层模型时，验证新模型的可信度和安全性评分 |
| 开源贡献者信誉 | 🟢 高 | 为 OpenCode 的开源贡献者提供基于 DID 的信誉系统 |

### 最佳接触策略
**定位:** 安全编码合作伙伴
**话术:** "OpenCode 每月被 750 万开发者使用，AgentTrust 可以确保这些开发者使用的 Agent 和工具是安全的。'安全编码'是最佳卖点。"
**PoC 方向:** 提供一个预配置的 OpenCode 模板，内置 AgentTrust 中间件，自动拦截所有外部工具调用和代码执行请求，验证其信任评分。强调"零配置安全编码"。

---

## 总结对比

| 项目 | 插件系统 | 中间件注入 | 用户基数 | 集成难度 | 优先级 |
|------|----------|------------|----------|----------|--------|
| **superpowers** | 🟡 有限 | 🟡 有限 | 🟡 中小 | 中等 | P2 |
| **ECC** | 🟢 强 | 🟢 高 | 🟢 大 (198K⭐) | 低 | **P0** |
| **anthropics/skills** | 🟢 官方 | 🔴 低 | 🟢 极大 | 高 | P1 |
| **dify** | 🟢 极强 | 🟢 极高 | 🟢 大 | 低 | **P0** |
| **opencode** | 🟢 有 | 🟢 高 | 🟢 极大 (750万/月) | 低 | **P0** |

### 建议接触顺序
1. **P0: ECC** — 安全模块天然契合，黑客松冠军背景，技术团队容易沟通
2. **P0: Dify** — 平台插件模式最成熟，非技术用户是 Trust Protocol 的绝佳受众
3. **P0: OpenCode** — 月活最大，"安全编码"卖点最直观，社区极活跃
4. **P1: anthropics/skills** — 官方标准影响力大，但集成难度高，先建立社区共识
5. **P2: superpowers** — 方法论容器，信任验证需求存在但技术集成点有限

---

*报告由 AgentTrust 生态分析系统自动生成*
