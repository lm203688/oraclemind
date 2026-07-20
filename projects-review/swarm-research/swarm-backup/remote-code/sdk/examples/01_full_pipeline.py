"""
示例1: 完整科研流程
从文献检索到验证入库的完整流程
"""
from swarm_sdk import SwarmClient

client = SwarmClient(base_url="http://8.217.147.255:8450")
USER_ID = "demo_user"

# 1. 注册
client.register(USER_ID, "demo@example.com")
print(f"积分余额: {client.get_credits(USER_ID)['balance']}")

# 2. 启动研究
research = client.start_research(
    topic="AI辅助药物发现中的分子生成模型评估",
    user_id=USER_ID,
    description="评估几种AI分子生成模型在药物发现中的表现"
)
rid = research["research_id"]
print(f"研究ID: {rid}")

# 3. 文献蜂
result = client.run_bee(rid, "literature_bee", user_id=USER_ID)
print(f"文献蜂完成: {result.get('summary', '')[:80]}")

# 4. 假设蜂
result = client.run_bee(rid, "hypothesis_bee", user_id=USER_ID)
print(f"假设蜂完成: {result.get('summary', '')[:80]}")

# 5. 化学蜂 — 计算阿司匹林性质
result = client.run_bee(rid, "chemistry_bee", user_id=USER_ID,
                        mode="property", smiles="CC(=O)OC1=CC=CC=C1C(=O)O")
print(f"化学蜂完成: 分子量={result.get('properties', {}).get('molecular_weight')}")

# 6. 写作蜂
result = client.run_bee(rid, "writing_bee", user_id=USER_ID)
print(f"写作蜂完成: {result.get('word_count', 0)}字")

# 7. 验证蜂
result = client.verify_research(rid, user_id=USER_ID)
print(f"验证蜂完成: 可信度{result.get('trust_score', 0)}%")

# 8. 入库
result = client.deposit_verified(rid, user_id=USER_ID)
print(f"入库: {result.get('deposited_count', 0)}条, 获得{result.get('reward_credits', 0)}积分")

# 9. AI跨领域发现
stats = client.get_kb_stats()
if stats["total_items"] > 0:
    items = client.search_kb(query="logP")
    if items["results"]:
        analysis = client.cross_domain_analysis(
            items["results"][0]["id"], user_id=USER_ID
        )
        print(f"跨领域分析: {analysis.get('analysis', '')[:200]}...")
