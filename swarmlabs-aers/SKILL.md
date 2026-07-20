---
name: swarmlabs-research-router
description: Auto-Empirical Research Skills Router - 根据研究任务路由到合适的虚拟实验引擎或科研技能
version: 1.0.0
author: swarmlabs
license: MIT
---

# Swarmlabs AERS Router

## 整仓作为一个Skill导入
本仓支持整仓根目录作为一个整体skill导入Codex、CodeBuddy、Claude Code或类似IDE，
根目录的SKILL.md会注册为 `swarmlabs-research-router`，
作用为根据你的研究任务路由到合适的子skill，而不是把156个引擎全部加载。

## 路由规则

### 1. 虚拟实验引擎 (145个)
当用户需要"模拟/预测/优化实验参数"时，路由到对应物理领域的引擎：

#### 催化动力学 (5个引擎)
- suzuki → 钯催化交叉偶联反应
- heck → Heck烯烃芳基化
- hydrogenation → 加氢催化
- enzyme → 酶催化动力学
- ammonia → 合成氨催化

#### 电化学 (5个引擎)
- battery → 锂电池容量预测
- co2 → CO2电催化还原
- electrolysis → 水电解
- electroplating → 电镀厚度
- corrosion → 腐蚀速率

#### 传质分离 (4个引擎)
- distillation → 精馏
- extraction → 液液萃取
- gas_absorption → 气体吸收
- leaching → 浸出

#### 膜分离 (3个引擎)
- membrane → 反渗透膜
- electrodialysis → 电渗析
- membrane_distillation → 膜蒸馏

#### 颗粒工程 (4个引擎)
- crystal → 结晶动力学
- granulation → 造粒
- filtration → 过滤
- flocculation → 絮凝

#### 传热传质 (3个引擎)
- drying → 干燥
- evaporation → 蒸发
- calcination → 煅烧

#### 材料科学 (2个引擎)
- perovskite → 钙钛矿太阳能电池
- polymer → 高分子聚合

#### 其他 (119个引擎)
- 完整列表见 swarmlabs_*_result.json

### 2. 科研技能 (5个)
当用户需要"论文分析/引文核验/统计分析/文献综述/论文写作"时：
- paperspine → 论文深度拆解(输入DOI→研究问题/方法/结果/边界)
- citation_verify → 引文核验(DOI/卷期页码逐项核对, 93.3%准确率)
- stats_sanity → 统计分析(变量类型/异常值/正态检验/效应量)
- literature_survey → 文献综述(Crossref API检索→纳入排除→跨文献比较)
- scientific_writing → 智能排版(IMRAD/CONSORT/STROBE/PRISMA)

### 3. 营销技能 (5个)
当用户需要"增长分析/SEO/内容/竞品/发布"时：
- growth_pulse → 增长分析(GitHub竞品star/fork + LTV/CAC)
- seo_pulse → SEO分析(14站HTTP状态 + IndexNow日志)
- content_forge → 内容营销(SEO文章 + Twitter + 博客)
- competitor_radar → 竞品雷达(GitHub API真实数据)
- launch_kit → 发布工具(17渠道 + 6 KPI + 新闻稿)

### 4. 技术壁垒模块 (1个)
当用户需要"不确定性量化/可靠性分析"时：
- uncertainty_quantification → UQ(蒙特卡洛/Sobol/贝叶斯/Weibull)

## 使用示例

```
用户: "帮我优化Suzuki偶联反应的参数"
→ 路由到: suzuki引擎 + optimize工具

用户: "核验这篇论文的引文是否正确"
→ 路由到: citation_verify

用户: "分析我的实验数据是否正态分布"
→ 路由到: stats_sanity

用户: "这个反应的不确定性有多大"
→ 路由到: uncertainty_quantification
```

## 数据覆盖
- 145个虚拟实验引擎
- 13473组真实验证数据 (99.8%有Crossref DOI)
- 24类物理体系
- 5个科研技能 + 5个营销技能 + 1个UQ模块
- 全局均值误差: 4.19%
- 可靠性(误差<15%): 99.4%
