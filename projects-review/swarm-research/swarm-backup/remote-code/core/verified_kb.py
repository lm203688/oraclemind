"""
蜂群科研平台 — 验证知识库
存储经验证的科研成果，支持入库奖励、引用分润

数据结构:
  verified_kb.json:
  {
    "items": {
      "kb_xxx": {
        "id": "kb_xxx",
        "user_id": "原验证者",
        "research_id": "来源研究",
        "claim": "声明内容",
        "claim_type": "molecular_property/lipinski/...",
        "smiles": "分子SMILES(可选)",
        "expected_value": "预期值",
        "actual_value": "实际值",
        "verification_engine": "RDKit/ML",
        "trust_label": "🟡计算验证",
        "trust_score": 75,
        "tags": ["化学", "药物相似性"],
        "citations": 0,          # 被引用次数
        "cited_by": [],          # 引用者列表[{user_id, time, research_id}]
        "created": "2026-06-20",
        "status": "active"       # active/withdrawn
      }
    },
    "cite_log": [
      # 引用日志，用于防刷(24h内同一用户对同一条目上限3次)
      {"user_id":"", "kb_id":"", "time":""}
    ]
  }
"""
import json
import os
import time
from datetime import datetime, timedelta
from core.config import (
    VERIFIED_KB_FILE, CREDIT_COSTS, KNOWLEDGE_REVENUE_SPLIT,
    KNOWLEDGE_CITE_DAILY_LIMIT,
)


def _load_kb():
    if os.path.exists(VERIFIED_KB_FILE):
        try:
            with open(VERIFIED_KB_FILE) as f:
                return json.load(f)
        except:
            pass
    return {"items": {}, "cite_log": []}


def _save_kb(data):
    os.makedirs(os.path.dirname(VERIFIED_KB_FILE), exist_ok=True)
    tmp = VERIFIED_KB_FILE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, VERIFIED_KB_FILE)


def deposit_knowledge(user_id, research_id, claim, claim_type,
                      smiles="", expected_value=None, actual_value=None,
                      verification_engine="", trust_label="🟡计算验证",
                      trust_score=0, tags=None):
    """
    将验证结果入库
    返回入库ID和奖励积分
    """
    kb = _load_kb()
    kb_id = f"kb_{int(time.time()*1000)}"
    
    item = {
        "id": kb_id,
        "user_id": user_id,
        "research_id": research_id,
        "claim": claim,
        "claim_type": claim_type,
        "smiles": smiles,
        "expected_value": expected_value,
        "actual_value": actual_value,
        "verification_engine": verification_engine,
        "trust_label": trust_label,
        "trust_score": trust_score,
        "tags": tags or [],
        "citations": 0,
        "cited_by": [],
        "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "active",
    }
    
    kb["items"][kb_id] = item
    _save_kb(kb)
    
    return kb_id, item


def search_knowledge(query="", claim_type="", smiles="", tags=None, limit=20):
    """
    搜索知识库
    支持关键词搜索、类型筛选、SMILES精确匹配、标签筛选
    """
    kb = _load_kb()
    results = []
    
    for item in kb["items"].values():
        if item.get("status") != "active":
            continue
        
        # 类型筛选
        if claim_type and item.get("claim_type") != claim_type:
            continue
        
        # SMILES精确匹配
        if smiles and item.get("smiles", "").lower() != smiles.lower():
            continue
        
        # 标签筛选
        if tags:
            item_tags = set(item.get("tags", []))
            if not set(tags).intersection(item_tags):
                continue
        
        # 关键词搜索
        if query:
            searchable = f"{item.get('claim','')} {item.get('smiles','')} {' '.join(item.get('tags',[]))}".lower()
            if query.lower() not in searchable:
                continue
        
        results.append(item)
    
    # 按引用次数排序（热门优先）
    results.sort(key=lambda x: x.get("citations", 0), reverse=True)
    return results[:limit]


def get_knowledge(kb_id):
    """获取单条知识"""
    kb = _load_kb()
    return kb["items"].get(kb_id)


def cite_knowledge(kb_id, citing_user_id, research_id=""):
    """
    引用知识条目
    扣积分 + 分润给原验证者 + 平台
    
    Returns:
        {"success": bool, "spent": int, "original_author_earned": int,
         "platform_earned": int, "item": dict, "error": str}
    """
    from core.credits import spend_credits, add_credits
    
    kb = _load_kb()
    item = kb["items"].get(kb_id)
    
    if not item:
        return {"success": False, "error": "知识条目不存在"}
    
    if item.get("status") != "active":
        return {"success": False, "error": "知识条目已下架"}
    
    # 自己不能引用自己的
    if item["user_id"] == citing_user_id:
        return {"success": False, "error": "不能引用自己的验证结果"}
    
    # 防刷：24h内同一用户对同一条目上限3次
    now = datetime.now()
    cite_log = kb.get("cite_log", [])
    recent_cites = [
        c for c in cite_log
        if c["user_id"] == citing_user_id
        and c["kb_id"] == kb_id
        and (now - datetime.strptime(c["time"], "%Y-%m-%d %H:%M:%S")) < timedelta(hours=24)
    ]
    
    if len(recent_cites) >= KNOWLEDGE_CITE_DAILY_LIMIT:
        # 超过上限，按自跑价
        cite_cost = CREDIT_COSTS["knowledge_cite_self"]
    else:
        cite_cost = CREDIT_COSTS["knowledge_cite"]
    
    # 扣积分
    spend_result = spend_credits(citing_user_id, "knowledge_cite", amount=cite_cost)
    if not spend_result.get("success"):
        return {"success": False, "error": spend_result["error"]}
    
    # 分润
    author_earn = KNOWLEDGE_REVENUE_SPLIT["original_author"]
    platform_earn = KNOWLEDGE_REVENUE_SPLIT["platform"]
    
    # 给原验证者加积分
    add_credits(item["user_id"], author_earn,
                f"验证结果被引用(+{author_earn})",
                extra={"kb_id": kb_id, "cited_by": citing_user_id})
    
    # 更新知识条目
    item["citations"] += 1
    item["cited_by"].append({
        "user_id": citing_user_id,
        "time": now.strftime("%Y-%m-%d %H:%M:%S"),
        "research_id": research_id,
    })
    
    # 记录引用日志
    cite_log.append({
        "user_id": citing_user_id,
        "kb_id": kb_id,
        "time": now.strftime("%Y-%m-%d %H:%M:%S"),
    })
    # 只保留最近30天的日志
    cutoff = (now - timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S")
    kb["cite_log"] = [c for c in cite_log if c["time"] > cutoff]
    
    _save_kb(kb)
    
    return {
        "success": True,
        "spent": cite_cost,
        "original_author_earned": author_earn,
        "platform_earned": platform_earn,
        "item": {
            "id": item["id"],
            "claim": item["claim"],
            "trust_label": item["trust_label"],
            "actual_value": item.get("actual_value"),
            "citations": item["citations"],
        },
        "balance": spend_result["balance"],
    }


def get_user_deposits(user_id, limit=50):
    """获取用户入库的所有知识条目"""
    kb = _load_kb()
    items = [v for v in kb["items"].values() if v["user_id"] == user_id]
    items.sort(key=lambda x: x["created"], reverse=True)
    return items[:limit]


def get_user_citations(user_id, limit=50):
    """获取用户被引用记录"""
    kb = _load_kb()
    results = []
    for item in kb["items"].values():
        if item["user_id"] != user_id:
            continue
        for cite in item.get("cited_by", []):
            results.append({
                "kb_id": item["id"],
                "claim": item["claim"][:80],
                "cited_by": cite["user_id"],
                "time": cite["time"],
                "earned": KNOWLEDGE_REVENUE_SPLIT["original_author"],
            })
    results.sort(key=lambda x: x["time"], reverse=True)
    return results[:limit]


def get_kb_stats():
    """知识库统计"""
    kb = _load_kb()
    items = [v for v in kb["items"].values() if v.get("status") == "active"]
    
    total_citations = sum(i.get("citations", 0) for i in items)
    
    # 按类型统计
    by_type = {}
    for item in items:
        t = item.get("claim_type", "other")
        by_type[t] = by_type.get(t, 0) + 1
    
    # 按信任等级统计
    by_trust = {}
    for item in items:
        t = item.get("trust_label", "未知")
        by_trust[t] = by_trust.get(t, 0) + 1
    
    # Top贡献者
    contributors = {}
    for item in items:
        uid = item["user_id"]
        if uid not in contributors:
            contributors[uid] = {"deposits": 0, "citations": 0}
        contributors[uid]["deposits"] += 1
        contributors[uid]["citations"] += item.get("citations", 0)
    
    top_contributors = sorted(
        contributors.items(),
        key=lambda x: x[1]["citations"],
        reverse=True
    )[:10]
    
    return {
        "total_items": len(items),
        "total_citations": total_citations,
        "by_type": by_type,
        "by_trust": by_trust,
        "top_contributors": [
            {"user_id": uid, **stats} for uid, stats in top_contributors
        ],
    }
