"""
蜂群科研平台 — 核心配置
"""
import os

# ============ LLM配置 ============
# 先用agnes API（免费），后续可切换
LLM_API_URL = os.environ.get("LLM_API_URL", "http://150.158.119.19:8431/v1/chat/completions")
LLM_API_KEY = os.environ.get("LLM_API_KEY", "test")  # agnes无需真实key
LLM_MODEL = os.environ.get("LLM_MODEL", "bit-assistant-v2")

# BYOK模式：用户可在设置里覆盖
# BYOK_LLM_API_URL / BYOK_LLM_API_KEY / BYOK_LLM_MODEL

# ============ 跨模型评审配置 ============
# 平台默认评审角色（用不同system prompt模拟不同视角）
REVIEW_ROLES = [
    {
        "id": "methodologist",
        "name": "方法论审查者",
        "system": "你是一位严格的学术方法论审查者，专注于实验设计、统计方法、逻辑严密性。你的评审风格是挑毛病，找出方法论漏洞。",
        "focus": "方法论、实验设计、统计可靠性",
    },
    {
        "id": "innovator",
        "name": "创新性审查者",
        "system": "你是一位关注创新性的审稿人，评估研究的新颖性、突破性、与现有工作的差异。你的评审风格是对比文献，判断创新程度。",
        "focus": "创新性、新颖性、学术贡献",
    },
    {
        "id": "practitioner",
        "name": "实用性审查者",
        "system": "你是一位关注实用价值的工业界/临床审稿人，评估研究的落地潜力、应用前景、可重复性。你的评审风格是从实际应用角度审视。",
        "focus": "实用价值、应用前景、可重复性",
    },
]

# BYOK跨模型评审：用户可配置多个模型
# 格式: [{"name":"GPT-4","url":"...","key":"...","model":"gpt-4"}, ...]
# 留空则用角色模拟模式

# ============ 积分系统 ============
# 积分包（积分单位已×100）
CREDIT_PACKS = {
    "basic":     {"price": 39,  "bonus": 0.10, "credits": 110000,  "valid_days": 365, "name": "基础包"},
    "research":  {"price": 69,  "bonus": 0.15, "credits": 230000,  "valid_days": 365, "name": "研究包", "byok": True},
    "lab":       {"price": 199, "bonus": 0.25, "credits": 500000,  "valid_days": 365, "name": "实验室包", "byok": True},
    "enterprise":{"price": 499, "bonus": 0.35, "credits": 1350000, "valid_days": 365, "name": "企业包", "byok": True},
}

# 免费额度
FREE_DAILY_CREDITS = 2000
REGISTER_BONUS = 10000
GITHUB_STAR_BONUS = 20000

# 积分消耗规则（×100）
CREDIT_COSTS = {
    "literature_bee": 500,       # 文献蜂(标准)
    "literature_deep": 1500,     # 文献蜂(深度调研)
    "literature_precise": 800,   # 文献蜂(精读)
    "hypothesis_bee": 300,       # 假设蜂
    "writing_bee": 800,          # 写作蜂
    "chemistry_bee": 1000,       # 化学蜂
    "chem_fast": 1000,           # 化学蜂-快速(别名)
    "chem_deep": 3000,           # 化学蜂-深度
    "chem_retro": 1500,          # 逆合成
    "ml_experiment_bee": 5000,   # ML实验蜂
    "ml_cpu": 5000,              # ML实验(CPU)(别名)
    "ml_gpu": 10000,             # ML实验(GPU)
    "mol_sim": 2000,             # 分子模拟
    "analysis_bee": 500,         # 分析蜂
    "review_bee": 1000,          # 评审蜂
    "verification_bee": 1000,    # 验证蜂
    "full_research": 8000,       # 完整科研流程
    # 知识库相关
    "knowledge_deposit": 300,    # 入库奖励(平台给用户)
    "knowledge_referral": 300,   # 被引用奖励(每次)
    "knowledge_cite": 800,       # 引用已有结果(用户消耗)
    "knowledge_cite_self": 1000, # 超过24h上限后按自跑价
    "cross_domain_advice": 300,  # AI跨领域发现
}

# BYOK用户积分减半
BYOK_DISCOUNT = 0.5

# 模块解锁费（×100）
MODULE_UNLOCK = {
    "chem_lab": {"credits": 20000, "name": "化学实验室"},
    "physics_lab": {"credits": 30000, "name": "物理实验室"},
    "bio_lab": {"credits": 50000, "name": "生物实验室"},
    "gpu": {"credits": 0, "name": "GPU加速"},
    "knowledge_graph": {"credits": 10000, "name": "知识图谱"},
    "review_bee": {"credits": 15000, "name": "评审蜂"},
    "verification_bee": {"credits": 15000, "name": "验证蜂"},
}

# 知识库引用分润比例
KNOWLEDGE_REVENUE_SPLIT = {
    "original_author": 300,   # 原验证者分成(积分)
    "platform": 500,          # 平台分成(积分)
    # 引用总价800 = 300 + 500
}

# 知识库防刷：同一用户对同一知识条目24h内引用上限
KNOWLEDGE_CITE_DAILY_LIMIT = 3

# ============ 引擎配置 ============
# 化学引擎（开源）
CHEM_ENGINES = {
    "rdkit": {"type": "local", "module": "rdkit"},
    "openmm": {"type": "local", "module": "openmm"},
    "pyscf": {"type": "local", "module": "pyscf"},
    "ibm_rxn": {"type": "api", "url": "https://rxn.app.accelerate.science/rxn/api/v1"},
}

# 文献API（免费）
LITERATURE_APIS = {
    "semantic_scholar": "https://api.semanticscholar.org/graph/v1",
    "pubchem": "https://pubchem.ncbi.nlm.nih.gov/rest/pug",
    "crossref": "https://api.crossref.org",
}

# ============ 数据存储 ============
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
CREDITS_FILE = os.path.join(DATA_DIR, "credits.json")
TASKS_FILE = os.path.join(DATA_DIR, "tasks.json")
KNOWLEDGE_FILE = os.path.join(DATA_DIR, "knowledge.json")
VERIFIED_KB_FILE = os.path.join(DATA_DIR, "verified_kb.json")  # 验证知识库

# ============ 平台信息 ============
PLATFORM_NAME = "蜂群科研"
PLATFORM_VERSION = "0.1.0"
API_PORT = 8460
