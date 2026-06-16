# GeneTech Knowledge Engine — 完整设计文档

> 项目基石：数据采集 → 交叉验证 → 体系化入库 → 定期核查
> 没有这个引擎，工具站就是无源之水。

---

## 一、整体架构

```
┌──────────────────────────────────────────────────────────┐
│                    Cron 调度层                            │
│  每日采集 → 每周核查 → 每月审计 → 每季度体系重构            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐              │
│  │ 采集层   │──▶│ 验证层    │──▶│ 入库层    │              │
│  │Collect  │   │Validate  │   │Ingest    │              │
│  └─────────┘   └──────────┘   └──────────┘              │
│       │              │              │                     │
│       ▼              ▼              ▼                     │
│  ┌─────────────────────────────────────────┐             │
│  │           知识库 (Knowledge Base)         │             │
│  │  ┌────────┐ ┌────────┐ ┌────────────┐  │             │
│  │  │实体库   │ │关系库   │ │来源溯源库   │  │             │
│  │  │Entities│ │Relations│ │Provenance │  │             │
│  │  └────────┘ └────────┘ └────────────┘  │             │
│  │  ┌────────┐ ┌────────┐ ┌────────────┐  │             │
│  │  │置信度库 │ │变更日志 │ │核查任务队列 │  │             │
│  │  │Confid. │ │Changelog│ │Audit Queue│  │             │
│  │  └────────┘ └────────┘ └────────────┘  │             │
│  └─────────────────────────────────────────┘             │
│                      │                                   │
│                      ▼                                   │
│  ┌─────────────────────────────────────────┐             │
│  │           核查层 (Audit Layer)            │             │
│  │  过期检测 → 矛盾检测 → 孤儿检测 → 修复    │             │
│  └─────────────────────────────────────────┘             │
│                      │                                   │
│                      ▼                                   │
│  ┌─────────────────────────────────────────┐             │
│  │           输出层 (Output Layer)           │             │
│  │  工具API → 内容生成 → 数据可视化          │             │
│  └─────────────────────────────────────────┘             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 二、数据采集层 (Collect)

### 2.1 数据源清单

| 数据源 | 类型 | 采集频率 | 内容 | 可信度等级 |
|--------|------|---------|------|-----------|
| PubMed / NCBI | API | 每日 | 论文摘要、MeSH词 | A (同行评审) |
| arXiv (q-bio) | API | 每日 | 预印本 | B (未评审) |
| ClinicalTrials.gov | API | 每日 | 临床试验数据 | A (官方注册) |
| FDA | 网页抓取 | 每周 | 审批公告 | A+ (官方) |
| EMA | 网页抓取 | 每周 | 欧洲审批 | A+ (官方) |
| Nature/Science/Cell | RSS | 每日 | 顶级期刊新闻 | A (编辑筛选) |
| Gene Therapy News | RSS | 每日 | 行业新闻 | B (行业媒体) |
| CRISPR Journal | RSS | 每周 | CRISPR专刊 | A (同行评审) |
| 公司新闻稿 | 搜索 | 每周 | 产品/管线更新 | C (利益相关) |
| Wikipedia | API | 每月 | 基础概念校准 | B (众包验证) |

### 2.2 采集流程

```
06:00  PubMed新论文 (关键词: gene therapy, CRISPR, gene editing, AAV, mRNA)
06:15  arXiv预印本 (q-bio分类)
06:30  ClinicalTrials.gov 更新
06:45  行业新闻聚合 (RSS + 搜索)
07:00  AI提取实体和关系
07:15  初步去重
```

### 2.3 采集脚本设计

每个采集任务输出统一格式：

```json
{
  "source": "pubmed",
  "fetch_time": "2026-05-24T06:00:00Z",
  "raw_items": [
    {
      "source_id": "PMID:39123456",
      "source_url": "https://pubmed.ncbi.nlm.nih.gov/39123456/",
      "title": "...",
      "abstract": "...",
      "authors": ["..."],
      "pub_date": "2026-05-23",
      "journal": "Nature Biotechnology",
      "doi": "10.1038/xxx",
      "mesh_terms": ["Gene Therapy", "AAV", "..."],
      "raw_text": "完整摘要文本..."
    }
  ]
}
```

---

## 三、验证层 (Validate) — 核心中的核心

### 3.1 三级验证体系

```
Level 1: 自动验证 (AI + 规则) — 即时完成
Level 2: 交叉验证 (多源比对) — 批量完成  
Level 3: 人工验证 (专家审核) — 仅关键条目
```

### 3.2 Level 1: 自动验证

**规则引擎：**
- ✅ 来源可信度 ≥ B → 通过
- ✅ 有DOI/注册号 → 通过
- ⚠️ 来源可信度 = C → 标记"待交叉验证"
- ❌ 无可追溯来源 → 拒绝入库

**AI验证：**
- 提取声明(claim)：论文/新闻中的核心断言
- 内部一致性检查：是否与已有知识矛盾
- 逻辑合理性检查：数据是否在合理范围内

```json
{
  "claim": "AAV9-LacZ gene therapy achieved 85% transduction efficiency in mouse liver",
  "auto_validation": {
    "source_credibility": "A",
    "has_doi": true,
    "internal_consistency": "pass",
    "range_check": "pass (85% within 0-100%)",
    "contradicts_existing": false,
    "result": "pass"
  }
}
```

### 3.3 Level 2: 交叉验证

**核心原则：一个事实至少需要2个独立来源确认。**

交叉验证场景：

| 场景 | 处理方式 |
|------|---------|
| 2+独立来源一致 | ✅ 置信度=high |
| 1个来源，无矛盾 | ⚠️ 置信度=medium，加入核查队列 |
| 多个来源矛盾 | 🔴 置信度=low，标记争议，保留所有版本 |
| 来源是利益相关方(公司新闻稿) | ⚠️ 降级，需独立来源确认 |

**交叉验证流程：**

```
新事实入库
    │
    ├─▶ 搜索已有知识库：是否有相同/相关条目？
    │     ├─ 无 → confidence=medium, 加入"待确认"队列
    │     ├─ 有且一致 → confidence=high, 合并来源
    │     └─ 有但矛盾 → confidence=low, 创建争议记录
    │
    └─▶ 搜索外部：能否找到第二来源？
          ├─ 找到且一致 → confidence=high
          ├─ 找到但矛盾 → confidence=low, 标记争议
          └─ 找不到 → confidence=medium, 30天后重新搜索
```

### 3.4 Level 3: 人工验证（关键条目）

以下情况触发人工验证请求（发飞书通知你）：
- 新的基因疗法获批（FDA/EMA公告）
- 现有知识被推翻（重大更正）
- 置信度=low但影响工具输出
- 用户反馈数据错误

**你只需要回复"确认"或"修正为xxx"，我来执行。**

---

## 四、体系化入库层 (Ingest)

### 4.1 知识库数据模型

#### 实体类型

```typescript
// 核心实体
interface Gene {
  id: string;                    // HGNC标准ID
  symbol: string;                // 基因符号，如 "RPE65"
  full_name: string;             // 全名
  chromosome: string;            // 染色体位置
  function_summary: string;      // 功能概述
  associated_diseases: string[]; // 关联疾病ID
  last_updated: string;
  confidence: 'high' | 'medium' | 'low';
}

interface Disease {
  id: string;                    // MeSH/OMIM ID
  name: string;
  mesh_terms: string[];
  target_genes: string[];        // 相关基因ID
  gene_therapies: string[];      // 相关疗法ID
  prevalence: string;            // 流行率
  last_updated: string;
  confidence: 'high' | 'medium' | 'low';
}

interface GeneTherapy {
  id: string;                    // 内部ID: GT-YYYY-NNN
  name: string;                  // 疗法名称
  target_gene: string;           // 靶基因ID
  target_disease: string;        // 靶疾病ID
  therapy_type: 'gene_replacement' | 'gene_editing' | 'gene_silencing' | 'mRNA' | 'cell_therapy';
  vector: string;                // AAV2, AAV9, lentivirus, lipid_nanoparticle...
  delivery_route: string;        // IV, intravitreal, intrathecal...
  development_stage: 'preclinical' | 'phase1' | 'phase2' | 'phase3' | 'approved' | 'withdrawn';
  sponsor: string;               // 开发公司/机构
  clinical_trial_ids: string[];  // NCT号
  regulatory_status: {           // 监管状态
    region: string;              // FDA, EMA, NMPA...
    status: string;
    date: string;
  }[];
  key_findings: {                // 关键发现
    claim: string;
    source_ids: string[];        // 来源ID列表
    confidence: 'high' | 'medium' | 'low';
  }[];
  last_updated: string;
  confidence: 'high' | 'medium' | 'low';
}

interface CRISPRApplication {
  id: string;                    // CR-YYYY-NNN
  target_gene: string;
  target_disease: string;
  editing_type: 'knockout' | 'knockin' | 'base_editing' | 'prime_editing' | 'epigenetic';
  delivery_method: string;
  model_organism: string;
  development_stage: string;
  key_findings: {
    claim: string;
    source_ids: string[];
    confidence: 'high' | 'medium' | 'low';
  }[];
  last_updated: string;
  confidence: 'high' | 'medium' | 'low';
}

// 辅助实体
interface Source {
  id: string;                    // PMID:xxx / NCT:xxx / URL
  type: 'peer_reviewed' | 'preprint' | 'clinical_trial' | 'regulatory' | 'news' | 'company_pr';
  title: string;
  url: string;
  authors: string[];
  pub_date: string;
  credibility: 'A+' | 'A' | 'B' | 'C';
  accessed_date: string;
}

interface Controversy {
  id: string;
  entity_id: string;             // 涉及的实体
  conflicting_claims: {
    claim: string;
    source_ids: string[];
  }[];
  resolution: 'unresolved' | 'resolved' | 'superseded';
  resolution_note: string;
  created_date: string;
  last_reviewed: string;
}
```

#### 关系类型

```typescript
interface Relation {
  id: string;
  from_entity: string;           // 实体ID
  to_entity: string;             // 实体ID
  relation_type: 
    | 'targets'                   // 疗法→靶基因
    | 'treats'                    // 疗法→疾病
    | 'associated_with'           // 基因→疾病
    | 'improves_upon'             // 疗法→疗法（迭代关系）
    | 'contradicts'               // 发现→发现
    | 'validates'                 // 来源→声明
    | 'derived_from';             // 疗法→前代疗法
  evidence: string[];            // 来源ID
  confidence: 'high' | 'medium' | 'low';
  last_updated: string;
}
```

### 4.2 入库流程

```
验证通过的事实
    │
    ├─▶ 实体识别：涉及哪些基因/疾病/疗法？
    │     └─ 新实体 → 创建（confidence=medium）
    │     └─ 已有实体 → 更新
    │
    ├─▶ 关系提取：实体间的关系是什么？
    │     └─ 新关系 → 创建（需验证）
    │     └─ 已有关系 → 确认/更新/标记矛盾
    │
    ├─▶ 来源绑定：每条事实绑定来源
    │     └─ 来源溯源：可追溯到原始论文/注册号
    │
    └─▶ 变更记录：所有变更写入changelog
          └─ 不可删除，只能标记为superseded
```

### 4.3 变更日志

```json
{
  "changelog": [
    {
      "id": "CL-20260524-001",
      "timestamp": "2026-05-24T07:30:00Z",
      "action": "update",
      "entity_id": "GT-2026-001",
      "field": "development_stage",
      "old_value": "phase3",
      "new_value": "approved",
      "source_ids": ["FDA-2026-xxx"],
      "confidence_change": "medium → high",
      "triggered_by": "cron_daily_collect"
    }
  ]
}
```

---

## 五、核查层 (Audit) — 知识库的健康保障

### 5.1 每日自动核查

```
08:00  过期检测：标记 >90天未更新的实体
08:15  孤儿检测：无来源绑定的实体
08:30  矛盾检测：同一实体存在冲突的声明
08:45  置信度衰减：>60天无新来源确认的high→medium
09:00  生成核查报告
```

### 5.2 每周深度核查

```
周一    来源有效性：检查所有URL是否可访问
        数据完整性：必填字段是否完整
        重复检测：是否有重复实体（不同ID但内容相同）
```

### 5.3 每月体系核查

```
每月1日  知识图谱完整性：
        - 是否有"孤立节点"（无任何关系的实体）
        - 核心实体（top 50高频基因）是否覆盖完整
        - 疾病-基因-疗法链条是否闭环
        
        趋势分析：
        - 哪些领域新增实体最多（热点方向）
        - 哪些实体长期无更新（可能过时）
        - 矛盾最多的领域（需要重点关注）
        
        质量报告：
        - 各置信度分布
        - 来源类型分布
        - 待人工处理条目数
```

### 5.4 每季度体系重构

```
Q末     Schema演进：是否需要新增实体类型/关系类型？
        知识图谱重构：合并相似实体，清理过时关系
        优先级调整：根据用户使用数据调整采集重点
        工具适配：知识库变更是否影响工具输出？
```

### 5.5 核查任务队列

```json
{
  "audit_queue": [
    {
      "id": "AQ-20260524-001",
      "type": "stale_entity",
      "entity_id": "GT-2025-089",
      "description": "Gene therapy entry not updated in 95 days",
      "severity": "medium",
      "auto_action": "confidence: high→medium",
      "requires_human": false,
      "status": "auto_resolved",
      "created": "2026-05-24T08:00:00Z",
      "resolved": "2026-05-24T08:01:00Z"
    },
    {
      "id": "AQ-20260524-002",
      "type": "contradiction",
      "entity_id": "CR-2026-012",
      "description": "Conflicting efficacy claims: 85% vs 62%",
      "severity": "high",
      "auto_action": "confidence: high→low, create controversy",
      "requires_human": true,
      "status": "pending_human",
      "created": "2026-05-24T08:30:00Z"
    }
  ]
}
```

---

## 六、置信度体系

### 6.1 置信度评分规则

| 因素 | 加分 | 减分 |
|------|------|------|
| 同行评审来源 | +2 | — |
| 2+独立来源确认 | +2 | — |
| 官方监管数据 | +3 | — |
| 公司新闻稿（利益相关） | — | -1 |
| 预印本（未评审） | +1 | — |
| 无第二来源 | — | -1 |
| >90天未更新 | — | -1 |
| 存在矛盾来源 | — | -2 |
| 用户反馈错误 | — | -3 |

**评分映射：**
- 5+ → high
- 3-4 → medium  
- 0-2 → low
- <0 → 标记为"待验证"，不进入工具输出

### 6.2 置信度衰减机制

```
新入库（有2+来源）: high
30天无新确认:        high → high（不变）
60天无新确认:        high → medium
90天无新确认:        medium → medium（不变）
180天无新确认:       medium → low
有新来源确认:        重置衰减计时器
```

**目的：知识库不会"腐烂"而不自知。**

---

## 七、Cron任务总表

| 任务 | 频率 | 时间(CST) | 说明 |
|------|------|-----------|------|
| pubmed_collect | 每日 | 06:00 | PubMed新论文采集 |
| arxiv_collect | 每日 | 06:15 | arXiv预印本采集 |
| clinical_trials_collect | 每日 | 06:30 | 临床试验更新 |
| news_collect | 每日 | 06:45 | 行业新闻聚合 |
| ai_extract | 每日 | 07:00 | AI实体/关系提取 |
| cross_validate | 每日 | 07:15 | 交叉验证+入库 |
| daily_audit | 每日 | 08:00 | 每日自动核查 |
| content_generate | 每日 | 09:00 | 生成SEO内容 |
| weekly_deep_audit | 每周一 | 10:00 | 深度核查 |
| monthly_review | 每月1日 | 10:00 | 体系核查+报告 |
| quarterly_restructure | 每季首日 | 10:00 | 体系重构 |

---

## 八、输出层 — 知识库如何驱动工具

### 8.1 工具API映射

| 工具 | 使用的知识库数据 | 置信度过滤 |
|------|----------------|-----------|
| Primer Designer | gene实体 + primer数据库 | high only |
| CRISPR gRNA Finder | gene实体 + CRISPR应用库 | high + medium |
| Gene Therapy Tracker | gene_therapies + diseases + relations | high + medium（标注来源） |
| 实验方案生成器 | 全库 | 按置信度排序，标注来源 |

### 8.2 输出规范

工具输出必须包含：
1. **数据来源**：每条结果标注来源论文/注册号
2. **置信度**：high/medium/low 可视化标识
3. **更新时间**：数据最后更新日期
4. **免责声明**：仅供参考，不构成医学建议

---

## 九、文件结构

```
genetech-tools/
├── docs/
│   └── KNOWLEDGE_ENGINE.md          # 本文档
├── knowledge-base/
│   ├── entities/
│   │   ├── genes.json               # 基因实体库
│   │   ├── diseases.json            # 疾病实体库
│   │   ├── gene_therapies.json      # 基因疗法库
│   │   └── crispr_applications.json # CRISPR应用库
│   ├── relations/
│   │   └── relations.json           # 实体关系库
│   ├── sources/
│   │   └── sources.json             # 来源溯源库
│   ├── controversies/
│   │   └── controversies.json       # 争议记录
│   ├── audit/
│   │   ├── audit_queue.json         # 核查任务队列
│   │   ├── daily_reports/           # 每日核查报告
│   │   ├── weekly_reports/          # 每周核查报告
│   │   └── monthly_reports/         # 每月体系报告
│   ├── changelog/
│   │   └── changelog.json           # 变更日志
│   └── metadata/
│       ├── confidence_scores.json   # 置信度评分
│       └── collection_log.json      # 采集日志
├── scripts/
│   ├── collect/
│   │   ├── pubmed_collector.ts      # PubMed采集
│   │   ├── arxiv_collector.ts       # arXiv采集
│   │   ├── clinical_trials.ts       # 临床试验采集
│   │   └── news_collector.ts        # 新闻采集
│   ├── validate/
│   │   ├── auto_validator.ts        # 自动验证
│   │   ├── cross_validator.ts       # 交叉验证
│   │   └── confidence_scorer.ts     # 置信度评分
│   ├── ingest/
│   │   ├── entity_extractor.ts      # 实体提取
│   │   ├── relation_extractor.ts    # 关系提取
│   │   └── knowledge_ingest.ts      # 入库主流程
│   ├── audit/
│   │   ├── daily_audit.ts           # 每日核查
│   │   ├── weekly_audit.ts          # 每周深度核查
│   │   ├── monthly_review.ts        # 每月体系核查
│   │   └── confidence_decay.ts      # 置信度衰减
│   └── output/
│       ├── tool_api.ts              # 工具API
│       └── content_generator.ts     # 内容生成
├── website/                          # Next.js网站
└── config/
    ├── sources.json                 # 数据源配置
    ├── keywords.json                # 采集关键词
    └── audit_rules.json             # 核查规则配置
```

---

## 十、第一步行动计划

1. 初始化知识库JSON结构（空库）
2. 编写第一个采集器（PubMed）
3. 编写验证+入库流程
4. 编写每日核查脚本
5. 设置cron任务
6. 跑通完整pipeline后再开始建站

**先让知识引擎转起来，再盖房子。**
