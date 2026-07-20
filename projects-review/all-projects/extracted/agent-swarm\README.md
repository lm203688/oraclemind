# 🧠 Agent Swarm — 本地零成本多智能体系统

> 架构版本：v2.0 (5-Agent精简版) | 硬件：RTX 3090/4090 (24GB VRAM)

---

## 系统架构

```
                       ┌────────────────┐
                       │   Supervisor   │
                       │  gemma4:26b    │
                       │  复杂度门控     │
                       └───────┬────────┘
                               │
          ┌────────────────────┼────────────────────┐
    简单任务              复杂任务委派
          │           ┌──────┼──────┬──────┐
    直接处理        Search  Analysis  Code  Vision
                  gemma4:e4b deepseek  qwen3   llama3.2
                             r1:32b  coder:30b  vision:11b
```

## Agent职责

| Agent | 模型 | 显存估算 | 职责 |
|-------|------|---------|------|
| Supervisor | gemma4:26b | ~6GB | 意图理解、任务路由、复杂度判断 |
| Search | gemma4:e4b | ~2GB | 知识检索、文档查询、MCP WebSearch |
| Analysis | deepseek-r1:32b | ~8GB | 深度分析、文档解读、推理 |
| Code | qwen3-coder:30b | ~8GB | 代码生成、审查、重构 |
| Vision | llama3.2-vision:11b | ~4GB | 图像理解、OCR、截图分析 |

> **总计峰值约 28GB**（串行加载，同时只跑2-3个模型）

## 复杂度门控策略

```python
# ComplexityGate — 判断任务是否委派到专业Agent
COMPLEXITY_THRESHOLD = {
    "search":  ["检索", "查找", "搜索", "资料"],
    "deep_analysis": ["分析", "评估", "对比", "研究", "论文"],
    "code":     ["开发", "修改", "重构", "写代码", "API"],
    "vision":   ["图片", "图像", "截图", "识别", "OCR"]
}

def complexity_gate(user_input: str) -> str:
    """简单任务 → Supervisor直接处理；复杂任务 → 委派专业Agent"""
    if any(kw in user_input for kw in COMPLEXITY_THRESHOLD["code"]):
        return "delegate:code"
    elif any(kw in user_input for kw in COMPLEXITY_THRESHOLD["deep_analysis"]):
        return "delegate:analysis"
    elif any(kw in user_input for kw in COMPLEXITY_THRESHOLD["vision"]):
        return "delegate:vision"
    elif any(kw in user_input for kw in COMPLEXITY_THRESHOLD["search"]):
        return "delegate:search"
    else:
        return "direct"  # Supervisor直接回答
```

## 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 模型运行时 | Ollama | 本地推理，零API成本 |
| 编排框架 | LangGraph | Agent状态图编排 |
| 工具协议 | MCP (Model Context Protocol) | 标准化工具调用 |
| 通信方式 | LangGraph StateGraph + Task Queue | Agent间数据传递 |
| 调度器 | APScheduler | 定时任务、知识更新 |
| 硬件 | RTX 3090/4090 (24GB VRAM) | Windows + CUDA |

## 核心文件结构

```
agent-swarm/
├── main.py              # 入口：初始化Ollama + 启动Supervisor
├── supervisor.py        # 核心路由 + 复杂度门控
├── agents/
│   ├── search_agent.py  # Search Agent (MCP WebSearch调用)
│   ├── analysis_agent.py # Analysis Agent (deepseek-r1)
│   ├── code_agent.py    # Code Agent (qwen3-coder)
│   └── vision_agent.py  # Vision Agent (llama3.2-vision)
├── tools/
│   ├── mcp_tools.py     # MCP工具注册表
│   └── native_tools.py  # 原生函数（替代原Tool Agent）
├── scheduler.py         # APScheduler定时任务配置
├── config.py            # 模型配置、阈值
├── deploy_windows.bat   # Windows一键部署脚本
└── requirements.txt     # Python依赖
```

## 部署步骤

```bash
# 1. 安装Ollama
winget install ollama

# 2. 拉取模型
ollama pull gemma4:26b
ollama pull gemma4:e4b
ollama pull deepseek-r1:32b
ollama pull qwen3-coder:30b
ollama pull llama3.2-vision:11b

# 3. 安装依赖
pip install langgraph langchain-community mcp apscheduler

# 4. 启动
python main.py
```

## 版本历史

| 版本 | 变更 |
|------|------|
| v1.0 | 初版7-Agent架构 |
| v2.0 | 精简为5-Agent，移除冗余工具Agent（由原生函数替代），引入APScheduler |
