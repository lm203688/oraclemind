"""
Agent Swarm 配置文件
"""

# ============ 模型配置 ============
MODELS = {
    "supervisor": {
        "name": "gemma4:26b",
        "role": "意图理解 + 任务路由",
        "vram_est": "6GB",
        "priority": "随系统启动加载"
    },
    "search": {
        "name": "gemma4:e4b",
        "role": "知识检索 + MCP WebSearch",
        "vram_est": "2GB",
        "priority": "按需加载"
    },
    "analysis": {
        "name": "deepseek-r1:32b",
        "role": "深度分析 + 推理",
        "vram_est": "8GB",
        "priority": "按需加载，任务结束后卸载"
    },
    "code": {
        "name": "qwen3-coder:30b",
        "role": "代码生成 + 审查",
        "vram_est": "8GB",
        "priority": "按需加载，任务结束后卸载"
    },
    "vision": {
        "name": "llama3.2-vision:11b",
        "role": "图像理解 + OCR",
        "vram_est": "4GB",
        "priority": "按需加载"
    }
}

# ============ Ollama 配置 ============
OLLAMA_CONFIG = {
    "host": "http://localhost:11434",
    "timeout": 120,
    "num_ctx": 4096,       # 上下文长度
    "num_predict": 2048,   # 最大生成长度
    "temperature": 0.7
}

# ============ 复杂度门控 ============
COMPLEXITY_THRESHOLD = 0.3  # 低于此分数视为简单任务

# ============ APScheduler 定时任务 ============
SCHEDULED_JOBS = [
    {
        "name": "weekly_knowledge_update",
        "cron": "0 0 * * 1",  # 每周一凌晨
        "task": "更新行业知识库：爬取arXiv/RSS/机器人行业新闻"
    },
    {
        "name": "weekly_project_audit",
        "cron": "0 9 * * 1",  # 每周一早9点
        "task": "项目状态审计：输出周报"
    }
]

# ============ MCP 工具注册 ============
MCP_TOOLS = {
    "web_search": {"enabled": True, "provider": "builtin"},
    "web_fetch":  {"enabled": True, "provider": "builtin"},
    "file_read":  {"enabled": True, "provider": "native"},
    "file_write": {"enabled": True, "provider": "native"},
    "code_exec":  {"enabled": True, "provider": "native"},
    "email":      {"enabled": False, "provider": "connector"}
}

# ============ 硬件约束 ============
GPU_CONFIG = {
    "vram_total_gb": 24,
    "max_concurrent_models": 3,
    "safety_margin_gb": 2,
    "model_loading_strategy": "serial"  # 串行加载，避免OOM
}
