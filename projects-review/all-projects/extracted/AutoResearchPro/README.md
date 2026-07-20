# 🔬 AutoResearchPro — 科研自动化系统

> 合并约12个GitHub开源项目，打造端到端科研自动化流水线

---

## 一、项目定位

将学术研究中最耗时的环节——**文献检索 → 筛选 → 研读 → 综述撰写**——全自动化。

## 二、整合的开源项目

| # | 项目 | 用途 | 来源 |
|---|------|------|------|
| 1 | LangManus | 多Agent框架 | GitHub |
| 2 | OpenManus | AI Agent开发框架 | GitHub |
| 3 | Semantic Scholar API | 学术论文检索 | API |
| 4 | arXiv API | 预印本检索 | API |
| 5 | PaperQA2 | 论文QA系统 | GitHub |
| 6 | ChatPaper | 论文解读 | GitHub |
| 7 | gpt_academic | 学术写作辅助 | GitHub |
| 8 | zotero-better-bibtex | 文献管理 | GitHub |
| 9 | paper-qa | 论文问答 | GitHub |
| 10 | DocArray | 文档向量检索 | GitHub |
| 11 | Haystack | NLP Pipeline | GitHub |
| 12 | LlamaIndex | 知识索引 | GitHub |

## 三、核心 Pipeline

```
用户输入研究主题
        │
┌───────▼────────┐
│ 1. 文献检索     │  Semantic Scholar + arXiv API
│   关键词→论文列表│  去重、排序
└───────┬────────┘
        │
┌───────▼────────┐
│ 2. 智能筛选     │  LLM摘要筛选 (标题+摘要→打分)
│   200篇→20篇   │  保留Top-20高相关度
└───────┬────────┘
        │
┌───────▼────────┐
│ 3. 深度研读     │  PaperQA2 全文解析
│   PDF解析+QA   │  提取：方法、结论、数据集、baseline
└───────┬────────┘
        │
┌───────▼────────┐
│ 4. 综述撰写     │  LLM结构化生成
│   综述+引用    │  含BibTeX引用，格式可选APA/GB/T
└───────┬────────┘
        │
    输出：综述.md + references.bib + 摘要列表.csv
```

## 四、AI平台评估（Agent Pipeline）

| 平台 | 定位 | 优势 | 劣势 | 评分 |
|------|------|------|------|------|
| **Dify** | 开源LLMOps | 可视化编排、丰富模板、自部署 | RAG复杂度高时性能下降 | ⭐⭐⭐⭐ |
| **Coze** | 字节系Agent平台 | 插件生态好、中文优化 | 闭源、海外版功能受限 | ⭐⭐⭐ |
| **Bailian(百炼)** | 阿里云AI平台 | 通义千问深度、企业级 | 与阿里云深度绑定 | ⭐⭐⭐ |
| **LangGraph** | 框架级 | 灵活度最高、零成本 | 需要编码、无可视化 | ⭐⭐⭐⭐⭐ |

> **结论**：AutoResearchPro 推荐 LangGraph（零成本+最大灵活度），Dify 作为备选可视化前端。

## 五、状态

| 阶段 | 状态 |
|------|------|
| 项目规划 | ✅ 完成 |
| 开源项目fork | 🔲 待执行 |
| Pipeline原型 | 🔲 待开发 |
| 实际运行测试 | 🔲 待测试 |
