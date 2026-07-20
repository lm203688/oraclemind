# Agent能力增强方案

## 借鉴的4个参考项目

| 项目 | 核心设计 | 蜂群科研借鉴点 |
|---|---|---|
| CL4R1T4S | 27个AI agent的系统提示词合集 | Devin的Planning模式、Manus的Agent Loop、Claude Code的工具使用 |
| claude-code-cli | Claude Code CLI的状态管理+命令系统 | 状态持久化、命令路由、MCP集成 |
| claude-code | Claude Code的插件系统 | 插件架构、slash命令、记忆管理 |
| awesome-claude-fable | 94个Claude用例 | 架构review、PR审查、调试triage、迁移规划 |

## 5个Agent增强要点

### 1. Eve总管
- **Planning模式**（Devin）：复杂任务先制定计划再执行
- **Agent Loop**（Manus）：分析→选择工具→执行→迭代→提交→待机
- **渐进式披露**：简单任务直接执行，复杂任务先给计划
- **任务分解**：按依赖关系排序，独立任务并行

### 2. Builder工程师
- **编码最佳实践**（Devin）：不添加注释、遵循现有约定、不假设库可用
- **工具使用**（Claude Code）：独立调用放同一块、不主动commit
- **编辑前先看上下文**：修改代码前先理解周围import和依赖
- **Git规则**：不用git add .、不force push、不修改git config

### 3. Scout情报员
- **信息采集**（Manus）：不假设链接内容、必须实际访问
- **中间结果保存**：采集数据先存文件
- **多源验证**：重要信息从多个来源验证
- **批量采集**：使用批量工具提高效率

### 4. Operator运营官
- **简洁直接**（Claude Code）：不超过4行、不废话
- **结构化报告**：统一格式、标红异常
- **异常分级**：5xx/下架/PR合并/Error标红

### 5. Guardian审计师
- **安全规则**（Devin）：数据安全、不外泄、外部操作需授权
- **风险分级**：critical→Bark推送、medium→正常报告
- **修复建议**：不只报告问题，给修复方案

## 代码层面增强

### BaseAgent增强
```python
class BaseAgent:
    # 新增：Planning模式
    def plan(self, task: str, params: dict) -> dict:
        """先分析任务，返回执行计划"""
        # 1. 理解意图
        # 2. 查找相关记忆
        # 3. 确定需要的工具
        # 4. 排序执行步骤
        # 5. 定义成功条件
    
    # 新增：Agent Loop
    def loop(self, task: str, params: dict) -> dict:
        """Agent循环：分析→执行→验证→迭代"""
        # 1. 分析当前状态
        # 2. 选择下一步操作
        # 3. 执行
        # 4. 验证结果
        # 5. 未完成则继续循环
    
    # 新增：记忆管理
    def recall(self, query: str) -> list:
        """从记忆中检索相关信息"""
        # 搜索decisions表 + tasks表 + growth_log + project_memory
```

### LLM调用增强
- **多模型对比**：重要决策用多模型串行验证
- **温度控制**：分析任务temperature=0.3，创意任务0.7
- **重试机制**：429错误自动等待重试
- **超时处理**：60秒超时，长任务分段执行

## 实施步骤
1. 更新BaseAgent——添加plan()和loop()方法
2. 更新各Agent的execute()——集成Planning模式
3. 更新LLM客户端——添加重试和温度控制
4. 更新Eve调度器——添加Agent Loop
5. 测试验证——每个agent跑一次daily任务
