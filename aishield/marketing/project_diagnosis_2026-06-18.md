# AIShield 项目全面诊断报告
## 2026-06-18 | 基于GitHub竞品扫描 + 行业调研

---

## 一、项目运行现状

### 服务状态 ✅ 正常
| 指标 | 数值 |
|------|------|
| 服务状态 | healthy |
| 版本 | v2.0.0 |
| 总审计次数 | 127次 |
| 已扫描工具 | 14个 |
| 平均安全评分 | 79.4分 |
| 徽章分布 | 6 Gold / 8 Silver |
| 风险分布 | 5 Safe / 9 Medium |
| 工具类型 | 12 MCP / 2 Skill |

### 商业化状态 ⚠️ 零收入
| 指标 | 数值 |
|------|------|
| 付费用户 | **0** |
| 免费用户 | 3（全是测试账号） |
| 订单数 | 4（全是测试订单，pending） |
| 实际收入 | **¥0** |
| 上架渠道 | **0个** |
| 内容营销 | **0篇** |

### 扫描引擎现状
| 维度 | 现状 |
|------|------|
| 检测规则数 | **~30条**正则 |
| 分析维度 | 4维（静态/依赖/密钥/语义） |
| 扫描方式 | GitHub源码拉取 + 正则匹配 |
| OWASP MCP Top 10 | **未对齐** |
| MCP Trust Framework | **未实现** |
| Tool Poisoning检测 | **未实现** |
| Rug Pull检测 | **未实现** |
| 污点分析 | **未实现** |

---

## 二、GitHub竞品全景（8个核心项目）

### 🔴 直接竞品（MCP安全扫描）

#### 1. Snyk agent-scan
- **GitHub**: github.com/snyk/agent-scan
- **License**: Apache 2.0 | **Stars**: ~1900
- **核心能力**:
  - 自动发现本地MCP配置
  - 标准化issue codes（类似CVE编号体系）
  - 检测：compromised MCP、tool poisoning、hardcoded credentials、malicious tool descriptions
  - 支持YARA自定义规则
  - 供应链分析（agent组件清单）
- **商业模式**: 开源免费（Snyk企业版引流）
- **我们可学**: issue code体系、YARA规则引擎、自动发现机制

#### 2. Invariant Labs MCP-Scan
- **GitHub**: invariantlabs.ai
- **核心能力**:
  - Tool poisoning深度检测（隐藏指令注入）
  - 实时监控MCP工具行为
  - 发现GitHub MCP漏洞（通过issue劫持agent）
- **商业模式**: 开源免费（咨询/企业版）
- **我们可学**: 行为分析、实时监控、漏洞研究发布

#### 3. Cisco mcp-scanner
- **GitHub**: github.com/cisco-ai-defense/mcp-scanner
- **核心能力**: 企业级扫描，Cisco AI Defense生态
- **商业模式**: 开源（企业版收费）
- **我们可学**: 企业级合规框架

#### 4. AgentAuditKit（GitHub Action）
- **位置**: GitHub Marketplace
- **核心能力**:
  - **221条规则**（我们只有30条）
  - 覆盖13个agent平台
  - 检测：tool poisoning、rug pulls、trust boundary violations、tainted data flows
  - CI/CD原生集成
- **商业模式**: GitHub Action（免费+企业版）
- **⚠️ 最大威胁**: 规则数是我们的7倍，已占据GitHub Action渠道

#### 5. BuildWithAbid/mcp-audit
- **GitHub**: github.com/BuildWithAbid/mcp-audit
- **核心能力**: Python扫描器，检测prompt injection/over-broad permissions/weak input validation/credential leaks
- **我们可学**: 4个检测维度名称就是我们的差距

### 🟡 相关安全项目

#### 6. slowmist/MCP-Security-Checklist
- **GitHub**: github.com/slowmist/MCP-Security-Checklist
- **核心价值**: 全面MCP安全检查清单
- **覆盖**: UI交互层、客户端组件、服务端插件、多MCP协作机制
- **我们可学**: 安全检查清单作为扫描框架

#### 7. skill-scanner
- **GitHub**: github.com/topics/skill-scanner
- **核心能力**: 25+检测规则，专扫SKILL.md文件
- **检测**: 恶意代码、prompt injection、数据外传、供应链威胁
- **我们可学**: SKILL.md专项扫描规则

#### 8. MCPSafetyScanner（学术论文）
- **来源**: arXiv 2504.03767
- **核心**: 第一个agent化MCP安全审计工具
- **我们可学**: agent化扫描（用AI审计AI工具）

### 🟢 行业标准与框架

#### OWASP MCP Top 10（已发布）
- 官方安全风险榜单，类似Web版的OWASP Top 10
- **关键**: 对齐这个标准 = 权威性

#### MCP Trust Framework (MTF)
- **5个信任维度**: Provenance（来源）、Behavior（行为）、Security（安全）、Compliance（合规）、Reliability（可靠性）
- mpak.dev已强制MTF评分
- **关键**: 实现MTF = 可以认证评估机构定位

#### Official MCP Registry
- registry.modelcontextprotocol.io
- 实时握手验证 + 可靠性评分 + 持续监控
- **关键**: 上架官方Registry = 权威背书

---

## 三、关键行业数据（内容营销弹药）

| 数据 | 来源 | 用途 |
|------|------|------|
| 36.7% MCP服务器有SSRF风险 | MCP Trust Registry | 制造紧迫感 |
| 43% MCP服务器有命令执行路径 | MCP Trust Registry | 突出严重性 |
| 36% AI Agent Skills含prompt injection | Snyk ToxicSkills | 扩展到Skill赛道 |
| 1467个恶意payload在ClawHub | Snyk ToxicSkills | 数据可视化 |
| 13-26% ClawHub Skills有安全问题 | arXiv论文 | 学术背书 |
| 8000+ MCP服务器已被扫描 | Reddit | 竞品已走量 |
| 13000+ Skills在ClawHub | arXiv论文 | 市场规模 |

---

## 四、AIShield的7大差距 + 改进方案

### 差距1：检测规则太少（30 vs 221）
**现状**: ~30条正则，AgentAuditKit有221条
**影响**: 漏报率高，权威性不足
**改进**:
- [ ] 新增OWASP MCP Top 10映射规则（10类×5条=50条）
- [ ] 新增tool poisoning检测模式（20条）
- [ ] 新增rug pull检测（git diff对比）
- [ ] 新增tainted data flow追踪（污点分析）
- [ ] 新增trust boundary violation检测
- [ ] 总规则数目标：150+（3个月内追到200）

### 差距2：无OWASP MCP Top 10对齐
**现状**: 完全未对齐
**影响**: 无法声称"合规扫描"
**改进**:
- [ ] 研究OWASP MCP Top 10完整列表
- [ ] 每个风险类别映射到检测规则
- [ ] 报告中展示OWASP合规矩阵
- [ ] 首页标注"OWASP MCP Top 10 Aligned"

### 差距3：无Tool Poisoning深度检测
**现状**: 仅靠正则匹配"ignore previous instruction"
**影响**: 漏掉隐藏在工具描述中的注入攻击
**改进**:
- [ ] 用比特助手(agnes-2.0-flash)做语义级tool poisoning检测
- [ ] 检测工具描述中的隐藏指令（unicode字符、零宽字符、HTML注释）
- [ ] 对比工具描述与实际代码行为的一致性
- [ ] 参考Invariant Labs的检测方法

### 差距4：无Rug Pull检测
**现状**: 只扫描当前版本
**影响**: 工具更新后植入恶意代码无法发现
**改进**:
- [ ] 记录每次扫描的commit hash
- [ ] 对比历史版本，检测新增的危险代码
- [ ] 持续监控已认证工具的代码变更
- [ ] 变更告警 → 这就是持续订阅的价值

### 差距5：无实时握手验证
**现状**: 只做静态分析
**影响**: 无法验证工具实际运行行为
**改进**:
- [ ] 对远程MCP服务器做live handshake测试
- [ ] 验证声明的工具列表与实际暴露的工具一致
- [ ] 检测运行时行为（网络请求、文件访问）
- [ ] 参考Official MCP Registry的验证方式

### 差距6：扫描规模太小（14 vs 8000+）
**现状**: 只扫了14个工具
**影响**: 数据不足以做行业报告
**改进**:
- [ ] 批量拉取Smithery/PulseMCP上的MCP服务器列表
- [ ] 自动批量扫描，积累数据库
- [ ] 目标：3个月内扫描1000+工具
- [ ] 发布"AIShield MCP安全报告"（内容营销核武器）

### 差距7：无Skill/ClawHub赛道覆盖
**现状**: 只扫了2个Skill
**影响**: 错过13000+ Skill市场
**改进**:
- [ ] 接入ClawHub API批量扫描Skills
- [ ] 专项SKILL.md检测规则（参考skill-scanner的25+规则）
- [ ] 发布"AI Skill安全报告"
- [ ] 定位：唯一同时覆盖MCP + Skill的扫描器

---

## 五、4个可立即参考集成的新项目

### 1. OWASP MCP Top 10 → 扫描框架升级
**价值**: 权威标准对齐，差异化卖点
**行动**: 
- 研究完整Top 10列表
- 重构扫描引擎为OWASP分类
- 报告模板加入OWASP合规矩阵

### 2. MCP Trust Framework → 认证体系升级
**价值**: 成为MTF认证评估机构
**行动**:
- 实现5维评分（Provenance/Behavior/Security/Compliance/Reliability）
- 与mpak.dev对接，互认评分
- 徽章系统升级为MTF认证徽章

### 3. Snyk ToxicSkills研究 → 内容营销
**价值**: 借势Snyk研究，做中文版报告
**行动**:
- 复现Snyk的36% prompt injection发现
- 扫描国内Skill市场（如果有的话）
- 发布"AI Skill安全白皮书"

### 4. AgentAuditKit → GitHub Action升级
**价值**: 正面竞争，差异化定位
**行动**:
- 我们的GitHub Action需要强调：SaaS API + 徽章认证 + 持续监控
- AgentAuditKit是纯CI/CD，我们是CI/CD + SaaS + 认证
- 定位："不仅扫一次，还持续监控"

---

## 六、优先级排序

### 🔴 P0（本周必须做）
1. **上架Smithery** — 流量入口，零成本
2. **上架MCP官方Registry** — 权威背书
3. **发布知乎长文** — "我们扫描了XXX个MCP工具，36%有安全风险"
4. **OWASP MCP Top 10对齐** — 首页标注，报告展示

### 🟡 P1（2周内）
5. **Tool Poisoning语义检测** — 用比特助手做
6. **规则数扩到100+** — 参考AgentAuditKit
7. **批量扫描Smithery TOP 100工具** — 积累数据
8. **GitHub Action发布到Marketplace** — CI/CD渠道

### 🟢 P2（1个月内）
9. **Rug Pull检测** — 持续监控
10. **MTF评分体系** — 5维认证
11. **批量扫描1000+工具** — 发布行业报告
12. **ClawHub Skill扫描** — 扩展赛道

---

## 七、核心结论

### 好消息
- 服务运行稳定，基础架构OK
- 支付链路已打通
- 定价已调整到合理区间
- 4维评分框架可扩展

### 坏消息
- **零收入零用户**，8天没有真实增长
- 检测规则数只有竞品的1/7
- 没有任何分发渠道在运作
- 竞品已经扫描了8000+，我们只扫了14个

### 转机
- OWASP MCP Top 10刚发布，对齐就能获得权威性
- MTF框架出现，认证评估机构定位空白
- Snyk的ToxicSkills研究是免费的内容营销弹药
- ClawHub Skill赛道几乎无人做中文版

### 行动建议
**停止开发新功能，全力做两件事：**
1. **上架所有渠道**（Smithery/Registry/Glama/mcp.so/PulseMCP）
2. **批量扫描+发报告**（先扫100个，发知乎/V2EX文章）

代码层面的改进（OWASP对齐、规则扩展、tool poisoning）跟上，但不是首要任务。**先有用户，再迭代产品。**
