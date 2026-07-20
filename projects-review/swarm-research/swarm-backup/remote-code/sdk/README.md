# 蜂群科研 Python SDK

AI科研验证平台 — 不是AI论文生成器，是AI科研验证平台。

## 安装

```bash
pip install swarm-sdk
```

## 快速开始

```python
from swarm_sdk import SwarmClient

# 注册（获得10000免费积分）
client = SwarmClient(base_url="http://8.217.147.255:8450")
client.register("my_user_id", "me@example.com")

# 启动研究
research = client.start_research(
    topic="阿司匹林分子性质研究",
    user_id="my_user_id"
)

# 运行化学蜂 — RDKit真实计算分子性质
result = client.run_bee(
    research["research_id"], 
    "chemistry_bee",
    user_id="my_user_id",
    mode="property",
    smiles="CC(=O)OC1=CC=CC=C1C(=O)O"  # 阿司匹林
)

# 运行写作蜂 — 生成论文
paper = client.run_bee(
    research["research_id"],
    "writing_bee",
    user_id="my_user_id"
)

# 运行验证蜂 — 验证论文中的声明
verification = client.verify_research(
    research["research_id"],
    user_id="my_user_id"
)
print(f"可信度: {verification['trust_score']}%")

# 入库验证结果 — 获得积分奖励
deposit = client.deposit_verified(
    research["research_id"],
    user_id="my_user_id"
)
print(f"入库{deposit['deposited_count']}条，获得{deposit['reward_credits']}积分")

# 搜索知识库
results = client.search_kb(query="logP")

# AI跨领域发现
analysis = client.cross_domain_analysis(
    kb_id=results["results"][0]["id"],
    user_id="my_user_id"
)
print(analysis["analysis"])
```

## 核心能力

### 8种科研蜂

| 蜂 | 功能 | 积分 |
|----|------|------|
| 📚 文献蜂 | 论文检索+4层引用验证 | 500 |
| 💡 假设蜂 | 生成可验证假设 | 300 |
| ✍️ 写作蜂 | 生成论文草稿 | 800 |
| 🧪 化学蜂 | RDKit真实分子计算 | 1000 |
| 🔬 ML实验蜂 | Docker沙箱训练评估 | 5000 |
| 📊 分析蜂 | 数据分析+统计检验 | 500 |
| 🔍 评审蜂 | 跨模型同行评审 | 1000 |
| ✅ 验证蜂 | RDKit验证论文声明 | 1000 |

### 验证知识库

- **入库奖励**: 300积分/条
- **被引用收益**: 300积分/次
- **引用成本**: 800积分（比自跑验证1000便宜200）

### 三板块飞轮

```
知识库+引用分润 → AI跨领域发现 → 新研究方向 → 新验证结果 → 回到知识库
```

## 文档

- [API文档](https://github.com/lm203688/swarm-sdk/blob/main/docs/api.md)
- [Skill YAML格式](https://github.com/lm203688/swarm-sdk/blob/main/docs/skill-format.md)
- [示例代码](https://github.com/lm203688/swarm-sdk/tree/main/examples)

## License

MIT
