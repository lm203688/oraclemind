"""
示例2: 知识库引用与分润
其他用户引用你的验证结果，你获得积分
"""
from swarm_sdk import SwarmClient

client = SwarmClient(base_url="http://8.217.147.255:8450")

# Alice的验证结果已入库
# Bob搜索并引用

BOB = "user_bob"

# 搜索知识库
results = client.search_kb(query="logP")
print(f"搜索到{results['count']}条")
print(f"引用价: {results['cite_cost']}积分 (自跑验证: {results['self_verify_cost']}积分)")

# 引用
if results["results"]:
    item = results["results"][0]
    print(f"\n引用: {item['claim']}")
    print(f"信任: {item['trust_label']}")
    print(f"已被引{item['citations']}次")
    
    cite_result = client.cite_knowledge(item["id"], user_id=BOB, research_id="res_bob")
    print(f"\n引用成功!")
    print(f"消耗: {cite_result['cite_cost']}积分")
    print(f"原作者获得: {cite_result['author_reward']}积分")
    print(f"Bob余额: {cite_result['balance']}")
